package com.school.backend.service;

import com.school.backend.dto.CourseCreateRequest;
import com.school.backend.dto.CourseResponse;
import com.school.backend.dto.CourseStatisticsResponse;
import com.school.backend.entity.Course;
import com.school.backend.entity.Enrollment;
import com.school.backend.entity.LessonProgress;
import com.school.backend.entity.Module;
import com.school.backend.entity.User;
import com.school.backend.repository.CourseRepository;
import com.school.backend.repository.EnrollmentRepository;
import com.school.backend.repository.LessonProgressRepository;
import com.school.backend.repository.LessonRepository;
import com.school.backend.repository.ModuleRepository;
import com.school.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    // Создание курса при пост запросе
    public CourseResponse createCourse(CourseCreateRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .teacher(teacher)
                .build();

        Course savedCourse = courseRepository.save(course);
        return mapToResponse(savedCourse);
    }

    // Получить все курсы (для главной страницы)
    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Получить только мои курсы (для кабинета преподавателя)
    @Transactional(readOnly = true)
    public List<CourseResponse> getMyCourses() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
                
        return courseRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }
        @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Курс не найден"));
        return mapToResponse(course);
    }

    // Вспомогательный метод для конвертации Entity в DTO
        private CourseResponse mapToResponse(Course course) {
        String teacherName = course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName();
        
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .teacherName(teacherName)
                .build();
    }
            @Transactional
    public void deleteCourse(Long courseId) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        // Проверяем, что курс принадлежит текущему преподавателю
        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Вы не можете удалить этот курс");
        }

        // Сначала удаляем все записи о записях студентов на этот курс
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        enrollmentRepository.deleteAll(enrollments);

        // Теперь удаляем сам курс (модули и уроки удалятся каскадно, если настроено)
        courseRepository.delete(course);
    }
        @Transactional(readOnly = true)
    public CourseStatisticsResponse getCourseStatistics(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        // Получаем всех студентов, записанных на курс
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        
        // Получаем все уроки курса и считаем их количество
        List<Module> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        int totalLessons = 0;
        for (Module module : modules) {
            totalLessons += lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId()).size();
        }
        // Теперь totalLessons не изменяется — она effectively final
        
        final int finalTotalLessons = totalLessons; // На всякий случай создаем финальную копию

        // Для каждого студента считаем прогресс
        List<CourseStatisticsResponse.StudentProgressDTO> studentProgressList = enrollments.stream()
                .map(enrollment -> {
                    User student = enrollment.getStudent();
                    List<LessonProgress> progress = lessonProgressRepository
                            .findByStudentIdAndCourseId(student.getId(), courseId);
                    int completedLessons = (int) progress.stream()
                            .filter(LessonProgress::getCompleted)
                            .count();
                    double progressPercentage = finalTotalLessons > 0 
                            ? (completedLessons * 100.0 / finalTotalLessons) 
                            : 0;

                    return CourseStatisticsResponse.StudentProgressDTO.builder()
                            .studentId(student.getId())
                            .studentName(student.getFirstName() + " " + student.getLastName())
                            .studentEmail(student.getEmail())
                            .completedLessons(completedLessons)
                            .progressPercentage(Math.round(progressPercentage * 10.0) / 10.0)
                            .build();
                })
                .toList();

        return CourseStatisticsResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalStudents(enrollments.size())
                .totalLessons(finalTotalLessons)
                .students(studentProgressList)
                .build();
    }
        @Transactional
    public CourseResponse updateCourse(Long courseId, CourseCreateRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Курс не найден"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Вы не можете редактировать этот курс");
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());

        return mapToResponse(courseRepository.save(course));
    }
}