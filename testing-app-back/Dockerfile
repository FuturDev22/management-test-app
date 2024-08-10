FROM maven:3.8.6-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Étape 2: Créer l'image pour exécuter l'application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/testing-app-back-0.0.1-SNAPSHOT.jar testing-app-back-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["java", "-jar", "testing-app-back-0.0.1-SNAPSHOT.jar"]

