# ---- Stage 1: Build Frontend (Vite) ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: Build Backend (Maven + Spring Boot) ----
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Copy built static frontend files into Spring Boot static resources
COPY --from=frontend-builder /app/dist ./src/main/resources/static/
RUN mvn clean package -DskipTests

# ---- Stage 3: Lightweight Production JRE Runtime ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

ENV PORT=8080
EXPOSE 8080

COPY --from=backend-builder /app/target/*.war app.war

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.war"]

