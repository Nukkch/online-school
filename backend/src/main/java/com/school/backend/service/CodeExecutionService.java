package com.school.backend.service;

import com.school.backend.dto.CodeExecutionResponse;
import com.school.backend.dto.CodeSubmissionRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class CodeExecutionService {

    @Value("${jdoodle.client.id}")
    private String clientId;

    @Value("${jdoodle.client.secret}")
    private String clientSecret;

    // Маппинг наших языков на JDoodle
    private static final Map<String, String> JDoodle_LANGUAGES = new HashMap<>();
    private static final Map<String, String> JDoodle_VERSIONS = new HashMap<>();

    static {
        JDoodle_LANGUAGES.put("java", "java");
        JDoodle_VERSIONS.put("java", "3"); // Java 11/17
        
        JDoodle_LANGUAGES.put("python", "python3");
        JDoodle_VERSIONS.put("python", "3");
        
        JDoodle_LANGUAGES.put("javascript", "nodejs");
        JDoodle_VERSIONS.put("javascript", "4");
        
        JDoodle_LANGUAGES.put("cpp", "cpp14");
        JDoodle_VERSIONS.put("cpp", "4");
    }

    public CodeExecutionResponse executeCode(CodeSubmissionRequest request) {
        String language = JDoodle_LANGUAGES.get(request.getLanguage().toLowerCase());
        String version = JDoodle_VERSIONS.get(request.getLanguage().toLowerCase());

        if (language == null) {
            throw new RuntimeException("Язык " + request.getLanguage() + " не поддерживается JDoodle");
        }

        log.info("Отправка кода в JDoodle: язык={}, версия={}", language, version);

        try {
            // 1. Собираем JSON вручную (безопасно экранируя спецсимволы)
            String jsonBody = String.format(
                "{" +
                "\"clientId\":\"%s\"," +
                "\"clientSecret\":\"%s\"," +
                "\"script\":\"%s\"," +
                "\"language\":\"%s\"," +
                "\"versionIndex\":\"%s\"," +
                "\"stdin\":\"%s\"" +
                "}",
                clientId,
                clientSecret,
                escapeJson(request.getSourceCode()),
                language,
                version,
                escapeJson(request.getStdin() != null ? request.getStdin() : "")
            );

            // 2. Отправляем запрос стандартным HttpClient
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.jdoodle.com/v1/execute"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            log.info("Ответ от JDoodle: статус={}, тело={}", response.statusCode(), response.body());

            if (response.statusCode() != 200) {
                throw new RuntimeException("JDoodle вернул ошибку HTTP " + response.statusCode() + ": " + response.body());
            }

            // 3. Простой парсинг ответа JDoodle (без Jackson)
            String output = extractJsonValue(response.body(), "output");
            String statusCode = extractJsonValue(response.body(), "statusCode");
            String cpuTime = extractJsonValue(response.body(), "cpuTime");
            String memory = extractJsonValue(response.body(), "memory");

            // В JDoodle statusCode "200" = успех. Мапим на наш формат (3 = Accepted)
            int finalStatus = "200".equals(statusCode) ? 3 : 6;

            // Безопасный парсинг чисел (JDoodle может вернуть "null" строкой)
                double executionTime = 0.0;
                int memoryUsage = 0;

            try {
                if (cpuTime != null && !"null".equals(cpuTime)) {
                    executionTime = Double.parseDouble(cpuTime);
                }
            } catch (NumberFormatException e) {
                log.warn("Не удалось распарсить cpuTime: {}", cpuTime);
            }

            try {
                if (memory != null && !"null".equals(memory)) {
                    memoryUsage = Integer.parseInt(memory);
                }
            } catch (NumberFormatException e) {
                log.warn("Не удалось распарсить memory: {}", memory);
            }

            return CodeExecutionResponse.builder()
                    .output(output != null ? output : "")
                    .stderr(finalStatus == 6 ? "Ошибка выполнения кода" : "")
                    .status(finalStatus)
                    .time(executionTime)
                    .memory(memoryUsage)
                    .build();

        } catch (Exception e) {
            log.error("Ошибка при выполнении кода в JDoodle", e);
            throw new RuntimeException("Ошибка выполнения кода: " + e.getMessage());
        }
    }

    // Экранирование спецсимволов для корректного JSON
    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

    // Простое извлечение строкового значения из JSON по ключу
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":\"";
        int startIndex = json.indexOf(searchKey);
        if (startIndex == -1) {
            // Пробуем найти числовое значение (без кавычек)
            searchKey = "\"" + key + "\":";
            startIndex = json.indexOf(searchKey);
            if (startIndex == -1) return null;
            startIndex += searchKey.length();
            int endIndex = json.indexOf(",", startIndex);
            if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
            return json.substring(startIndex, endIndex).trim();
        }
        
        startIndex += searchKey.length();
        int endIndex = json.indexOf("\"", startIndex);
        if (endIndex == -1) return null;
        
        // Раскодируем экранированные символы обратно
        return json.substring(startIndex, endIndex)
                .replace("\\n", "\n")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }
}