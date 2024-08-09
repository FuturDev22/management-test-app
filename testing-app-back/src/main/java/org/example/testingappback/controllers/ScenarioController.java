package org.example.testingappback.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.example.testingappback.entities.Scenario;
import org.example.testingappback.entities.Schedule;
import org.example.testingappback.services.ScenarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/scenarios")
@CrossOrigin(origins = "http://localhost:4200")
public class ScenarioController {

    private static final String JENKINS_URL = "http://192.168.1.14:8090/job/test_module_authentification/allure/data/suites.json";
    private static final String TEST_CASES_URL_TEMPLATE = "http://192.168.1.14:8090/job/test_module_authentification/allure/data/test-cases/%s.json";
    private static final String USERNAME = "admin";
    private static final String API_TOKEN = "11124f99f024655981e5410844946fa5be";

    @Autowired
    private ScenarioService scenarioService;

    @GetMapping
    public List<Scenario> getAllScenarios() {
        return scenarioService.getAllScenarios();
    }

    @GetMapping("/{id}")
    public Scenario getScenarioById(@PathVariable Long id) {
        return scenarioService.getScenarioById(id);
    }

    @GetMapping("/module/{moduleId}")
    public List<Scenario> getScenariosByModuleId(@PathVariable Long moduleId) {
        return scenarioService.getScenariosByModuleId(moduleId);
    }

    @PostMapping
    public Scenario createScenario(@RequestBody Scenario scenario) {
        return scenarioService.createScenario(scenario);
    }

    @PutMapping("/{id}")
    public Scenario updateScenario(@PathVariable Long id, @RequestBody Scenario scenario) {
        return scenarioService.updateScenario(id, scenario);
    }

    @DeleteMapping("/{id}")
    public void deleteScenario(@PathVariable Long id) {
        scenarioService.deleteScenario(id);
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<String> triggerJenkinsJob(@PathVariable Long id) {
        try {
            Optional<String> optionalJobPath = scenarioService.getJobPathById(id);
            if (optionalJobPath.isPresent()) {
                String jobPath = optionalJobPath.get();
                String jenkinsUrl = jobPath+"/build?token="+ API_TOKEN;
                String authHeader = getAuthHeader();

                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(new URI(jenkinsUrl))
                        .header("Authorization", authHeader)
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 201) {
                    return ResponseEntity.ok("{\"message\":\"Le travail Jenkins a été déclenché avec succès.\"}");
                } else {
                    return ResponseEntity.status(response.statusCode())
                            .body("{\"message\":\"Erreur : " + response.statusCode() + " - " + response.body() + "\"}");
                }
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\":\"Le scénario avec ID " + id + " n'a pas été trouvé.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\":\"Erreur lors du déclenchement du job Jenkins.\"}");
        }
    }


    // Méthodes pour gérer Allure
    private String getAuthHeader() {
        String auth = USERNAME + ":" + API_TOKEN;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        return "Basic " + encodedAuth;
    }

    private HttpResponse<String> sendRequest(String url) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(url))
                .header("Authorization", getAuthHeader())
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> getAllureData() throws Exception {
        return sendRequest(JENKINS_URL);
    }

    private HttpResponse<String> getTestCaseData(String uid) throws Exception {
        String url = String.format(TEST_CASES_URL_TEMPLATE, uid);
        return sendRequest(url);
    }

    @GetMapping("/allure-result")
    public ResponseEntity<String> getAllAllureResults() {
        try {
            HttpResponse<String> response = getAllureData();

            if (response.statusCode() == 200) {
                return ResponseEntity.ok(response.body());
            } else {
                return ResponseEntity.status(response.statusCode()).body("Erreur : " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la récupération des résultats Allure.");
        }
    }

    @GetMapping("/allure-uid")
    public ResponseEntity<String> getThirdLevelUids() {
        try {
            HttpResponse<String> response = getAllureData();

            if (response.statusCode() == 200) {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode rootNode = objectMapper.readTree(response.body());

                List<String> thirdLevelUids = new ArrayList<>();
                for (JsonNode childNode : rootNode.get("children")) {
                    for (JsonNode secondLevelChild : childNode.get("children")) {
                        for (JsonNode thirdLevelChild : secondLevelChild.get("children")) {
                            String uid = thirdLevelChild.get("uid").asText();
                            thirdLevelUids.add(uid);
                        }
                    }
                }

                // Créer un ArrayNode pour contenir les résultats des test cases
                ArrayNode allTestCases = objectMapper.createArrayNode();

                // Récupérer les détails pour chaque UID
                for (String uid : thirdLevelUids) {
                    HttpResponse<String> testCaseResponse = getTestCaseData(uid);
                    if (testCaseResponse.statusCode() == 200) {
                        JsonNode testCaseNode = objectMapper.readTree(testCaseResponse.body());
                        allTestCases.add(testCaseNode);
                    } else {
                        return ResponseEntity.status(testCaseResponse.statusCode())
                                .body("Erreur lors de la récupération des détails du test case avec UID : " + uid);
                    }
                }

                return ResponseEntity.ok(allTestCases.toString());
            } else {
                return ResponseEntity.status(response.statusCode()).body("Erreur : " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la récupération des UIDs.");
        }
    }

    @PostMapping("/{id}/create-job")
    public ResponseEntity<String> createJobAndSaveScript(@PathVariable Long id, @RequestParam String jobScript) {
        return scenarioService.createJobAndSaveScript(id, jobScript);
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<Schedule> scheduleScenario(@PathVariable Long id, @RequestBody ScheduleRequest scheduleRequest) {
        try {
            Date scheduledTime = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").parse(scheduleRequest.getScheduledTime());
            Schedule schedule = scenarioService.scheduleScenario(id, scheduledTime);
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
