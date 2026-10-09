# Tourism Backend Service

REST API backend for the Tourism & Travel management platform built with **Spring Boot 4.1.1** and **Java 25**.

## Features

- **Authentication & Security**: User registration, login, and stateless JWT token authentication.
- **Trip Planning**: Itinerary generation, day-by-day scheduling, and budget calculations.
- **Destination Management**: Tourist spots, categories, ratings, and reviews.
- **Fare Estimation**: Transport mode distance and price calculation.
- **Map Geocoding**: Reverse-geocoding and location search proxy.

## Prerequisites

- Java Development Kit (JDK) 25
- PostgreSQL database instance
- Apache Maven (or use included `./mvnw`)

## Configuration

Update `src/main/resources/application.properties` or set the corresponding environment variables:

| Property | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `spring.datasource.url` | - | `jdbc:postgresql://localhost:5432/tourism_db` | PostgreSQL JDBC connection URL |
| `spring.datasource.username` | - | `postgres` | Database username |
| `spring.datasource.password` | `DB_PASSWORD` | *(empty - set your password)* | Database password |
| `app.jwt.secret` | `JWT_SECRET` | *(empty - must be set)* | Secret key for signing JWT tokens (min 32 bytes) |
| `app.jwt.expiration-seconds` | `JWT_EXPIRATION_SECONDS` | `3600` | JWT token validity in seconds |
| `app.cors.allowed-origin` | `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed CORS origin for frontend |

## Getting Started

1. **Create Database**:
   ```sql
   CREATE DATABASE tourism_db;
   ```

2. **Run Backend Application**:
   Using Maven Wrapper (Linux / macOS):
   ```bash
   ./mvnw spring-boot:run
   ```
   Using Maven Wrapper (Windows PowerShell):
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. **Compile & Test**:
   ```bash
   .\mvnw.cmd compile
   .\mvnw.cmd test
   ```

The backend starts on `http://localhost:8080`.
