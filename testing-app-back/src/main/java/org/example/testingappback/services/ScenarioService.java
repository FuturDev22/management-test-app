package org.example.testingappback.services;
import org.example.testingappback.entities.Schedule;
import org.example.testingappback.repositories.ScheduleRepository;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;

import org.example.testingappback.entities.Module;
import org.example.testingappback.entities.Scenario;
import org.example.testingappback.repositories.ModuleRepository;
import org.example.testingappback.repositories.ScenarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.*;

@Service
public class ScenarioService {

    @Autowired
    private ScenarioRepository scenarioRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    private final String jenkinsUrl = "http://192.168.1.14:8090";
    private final String jenkinsUser = "admin";
    private final String jenkinsToken = "11124f99f024655981e5410844946fa5be";
    private RestTemplate restTemplate = new RestTemplate();


    public Scenario createScenario(Scenario scenario) {
        if (scenario.getModule() != null && scenario.getModule().getId() != null) {
            // Récupérer le module à partir de l'ID
            Module module = moduleRepository.findById(scenario.getModule().getId()).orElse(null);
            if (module != null) {
                scenario.setModule(module);
            } else {
                throw new RuntimeException("Module not found");
            }
        }
        return scenarioRepository.save(scenario);
    }

    public List<Scenario> getAllScenarios() {
        return scenarioRepository.findAll();
    }

    public Scenario getScenarioById(Long id) {
        return scenarioRepository.findById(id).orElse(null);
    }

    public List<Scenario> getScenariosByModuleId(Long moduleId) {
        return scenarioRepository.findByModuleId(moduleId);
    }

//    public Scenario createScenario(Scenario scenario) {
//        return scenarioRepository.save(scenario);
//    }

    public Scenario updateScenario(Long id, Scenario scenario) {
        Scenario existingScenario = scenarioRepository.findById(id).orElse(null);
        if (existingScenario != null) {
            existingScenario.setName(scenario.getName());
            existingScenario.setDescription(scenario.getDescription());
            existingScenario.setModule(scenario.getModule());
            return scenarioRepository.save(existingScenario);
        }
        return null;
    }

    public void deleteScenario(Long id) {
        scenarioRepository.deleteById(id);
    }

    @Transactional
    public ResponseEntity<String> createJobAndSaveScript(Long scenarioId, String jobScript) {
        try {
            // Rechercher le scénario dans la base de données
            Scenario scenario = scenarioRepository.findById(scenarioId)
                    .orElseThrow(() -> new RuntimeException("Scenario not found"));

            // Préparation du nom du job Jenkins
            String jobName = scenario.getName();

            // Construction du fichier XML pour Jenkins
            String xmlConfig = "<flow-definition plugin=\"workflow-job@2.40\">"
                    + "<description></description>"
                    + "<keepDependencies>false</keepDependencies>"
                    + "<properties/>"
                    + "<definition class=\"org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition\" plugin=\"workflow-cps@2.92\">"
                    + "<script><![CDATA[" + jobScript + "]]></script>"
                    + "<sandbox>true</sandbox>"
                    + "</definition>"
                    + "<triggers/>"
                    + "<disabled>false</disabled>"
                    + "</flow-definition>";

            // Appel à l'API Jenkins pour créer le job
            String createJobUrl = jenkinsUrl + "/createItem?name=" + jobName;

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(jenkinsUser, jenkinsToken);
            headers.setContentType(MediaType.APPLICATION_XML);

            HttpEntity<String> entity = new HttpEntity<>(xmlConfig, headers);
            ResponseEntity<String> response = restTemplate.exchange(createJobUrl, HttpMethod.POST, entity, String.class);

            // Mise à jour du script et du chemin dans le scénario
            String jobPath = jenkinsUrl + "/job/" + jobName;
            scenario.setJobScript(jobScript);
            scenario.setJobPath(jobPath);

            // Sauvegarde du scénario mis à jour
            scenarioRepository.save(scenario);

            // Retourner une réponse JSON
            return ResponseEntity.ok("{\"message\":\"Le job Jenkins a été créé avec succès.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\":\"Erreur lors de la création du job Jenkins.\"}");
        }
    }


    public Optional<String> getJobPathById(Long id) {
        Optional<Scenario> scenario = scenarioRepository.findById(id);
        return scenario.map(Scenario::getJobPath);
    }


    public Schedule scheduleScenario(Long scenarioId, Date scheduledTime) {
        Optional<Scenario> scenarioOpt = scenarioRepository.findById(scenarioId);

        if (scenarioOpt.isPresent()) {
            Scenario scenario = scenarioOpt.get();
            Schedule schedule = new Schedule();
            schedule.setScenario(scenario);
            schedule.setScheduledTime(scheduledTime);
            schedule.setExecuted(false);

            scheduleRepository.save(schedule);

            scheduleJob(schedule);

            return schedule;
        } else {
            throw new RuntimeException("Scenario not found");
        }
    }

    private void scheduleJob(Schedule schedule) {
        Timer timer = new Timer();
        Date scheduledTime = schedule.getScheduledTime();
        String jobPath = schedule.getScenario().getJobPath();

        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                try {
                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest jenkinsRequest = HttpRequest.newBuilder()
                            .uri(new URI(jobPath + "/build?token=" + jenkinsToken))
                            .header("Authorization", getAuthHeader())
                            .POST(HttpRequest.BodyPublishers.noBody())
                            .build();

                    HttpResponse<String> response = client.send(jenkinsRequest, HttpResponse.BodyHandlers.ofString());
                    if (response.statusCode() == 201) {
                        schedule.setExecuted(true);
                        schedule.setExecutionStatus("Success");
                    } else {
                        schedule.setExecutionStatus("Failed: " + response.body());
                    }

                    scheduleRepository.save(schedule);

                } catch (Exception e) {
                    e.printStackTrace();
                    schedule.setExecutionStatus("Failed: " + e.getMessage());
                    scheduleRepository.save(schedule);
                }
            }
        };
        timer.schedule(task, scheduledTime);
    }

    private String getAuthHeader() {
        String auth = jenkinsUser + ":" + jenkinsToken;
        return "Basic " + java.util.Base64.getEncoder().encodeToString(auth.getBytes());
    }
}
