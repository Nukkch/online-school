Веб-приложение онлайн-школы программирования с интерактивной песочницей для выполнения кода.


Технологический стек

Java 17, Spring Boot, Spring Security, PostgreSQL
React, Vite, Monaco Editor (VS Code engine)
JDoodle API (Cloud)
Docker 

---------------------------------------------------------

Запуск проекта

!!!Перед запуском убедитесь, что у вас установлен PostgreSQL!!!

в корне проекта:    docker-compose up -d 
         
cd backend:         Для Windows:
                    .\gradlew.bat bootRun
                    Для macOS/Linux:
                    ./gradlew bootRun

cd frontend:        npm install
                    npm run dev

http://localhost:5173/

---------------------------------------------------------

Аккаунты

Преподаватель:  teacher@test.com : password123

Ученик:         student@test.com : password123

---------------------------------------------------------

примечание по выполнению кода: у апишки лимит на 20 выполнений в день, не злоупотрбляйте пж ;Р
если по каким то причинам лимит кончился, зарегайтесь на https://www.jdoodle.com/compiler-api?spm=a2ty_o01.29997173.0.0.24b5c9215vCREg, получите ключи в профиле и замените их в файле online-school\backend\src\main\resources\application.properties(Обязательно заменить ОБА ключа)