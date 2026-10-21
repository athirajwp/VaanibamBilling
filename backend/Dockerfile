# Stage 1: Build the Spring Boot application using Maven & Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven POM and source files
COPY pom.xml .
COPY src ./src

# Build production JAR (skip tests during container build)
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Java 21 runtime (glibc-based for SQLite JDBC compatibility)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy packaged JAR from build stage
COPY --from=build /app/target/bizflow-backend-1.0.0.jar app.jar

# Copy seed SQLite database if present
COPY bizflow.db* ./

# Render dynamically sets PORT environment variable (default to 8080)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
