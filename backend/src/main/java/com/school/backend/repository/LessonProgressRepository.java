package com.school.backend.repository;

import com.school.backend.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    
    // JOIN через Lesson -> Module -> Course
    @Query("SELECT lp FROM LessonProgress lp JOIN lp.lesson l JOIN l.module m JOIN m.course c WHERE lp.student.id = :studentId AND c.id = :courseId")
    List<LessonProgress> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    
    Optional<LessonProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);
}