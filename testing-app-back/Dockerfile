FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/testing-app-back-0.0.1-SNAPSHOT.jar /app/testing-app-back.jar
ENTRYPOINT ["java", "-jar", "/app/testing-app-back.jar"]
