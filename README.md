# Folio Library Manager

Folio is split into an independent React frontend and Spring Boot backend.

## Project structure

```text
frontend/                 Vite + React user interface
  public/icons/           3D clay interface assets
  src/                    React and CSS source
  package.json            frontend scripts and dependencies
  vercel.json             frontend deployment configuration

backend/                  Spring Boot REST API
  src/main/java/          application source
  src/main/resources/     MySQL configuration and SQL initialization
  src/test/               integration tests
  pom.xml                 Maven configuration
  Dockerfile              backend container build

docs/presentation/        project presentation and source assets
```

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

The development site runs at `http://localhost:5173`.

## Backend

Requirements: Java 21 and MySQL 8 or later.

Configure MySQL in PowerShell:

```powershell
$env:MYSQL_URL = "jdbc:mysql://localhost:3306/librarydb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "your-mysql-password"
```

For the first run only, initialize the schema and demo data:

```powershell
$env:SPRING_SQL_INIT_MODE = "always"
```

Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`.

After the first successful initialization, remove `SPRING_SQL_INIT_MODE` or set
it to `never` to avoid inserting the demo records again.

## Verification

```powershell
cd frontend
npm run build

cd ..\backend
$env:TEST_MYSQL_URL = "jdbc:mysql://localhost:3306/librarydb_test?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:TEST_MYSQL_USER = "root"
$env:TEST_MYSQL_PASSWORD = "your-mysql-password"
.\mvnw.cmd test
```

The backend tests use the dedicated `librarydb_test` MySQL database and never
reuse `MYSQL_URL`. MySQL must be running, and backend commands require
`JAVA_HOME` to point to a Java 21 JDK.
