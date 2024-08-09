import { Component, OnInit } from '@angular/core';
import { Module } from '../models/module.model';
import { Scenario } from '../models/scenario.model';
import { ModuleService } from '../services/module.service';
import { ScenarioService } from '../services/scenario.service';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {
  modules: Module[] = [];
  selectedModule: Module | null = null;
  newScenario: Scenario = { name: '', description: '' };
  newModule: Module = { name: '' };
  showScenarioForm: boolean = false;
  showModuleForm: boolean = false;
  message: string = '';
  selectedDate: string = '';
  selectedTime: string = '';
  selectedScenarios: Scenario[] = [];

  scenarios: Scenario[] = [];
  selectedScenario: Scenario | null = null;
  pipelineScript: string = '';

  constructor(private moduleService: ModuleService, private scenarioService: ScenarioService) {}

  ngOnInit() {
    this.loadModules();
  }

  loadModules() {
    this.moduleService.getAllModules().subscribe(
      (data: Module[]) => {
        this.modules = data;
      },
      error => {
        console.error('Failed to load modules:', error);
      }
    );
  }

  selectModule(module: Module) {
    this.selectedModule = module;
    if (module.id !== undefined) {
      this.loadScenarios(module.id);
    }
  }

  loadScenarios(moduleId: number) {
    this.scenarioService.getScenariosByModuleId(moduleId).subscribe(
      data => {
        const module = this.modules.find(m => m.id === moduleId);
        if (module) {
          module.scenarios = data;
        }
      },
      error => {
        console.error('Failed to load scenarios:', error);
      }
    );
  }

  openScenarioModal(module: Module) {
    this.selectedModule = module;
    this.newScenario = { name: '', description: '' };
    this.showScenarioForm = true;
    const modalElement = document.getElementById('scenarioModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  addScenario() {
    if (this.selectedModule && this.newScenario.name.trim() && this.newScenario.description.trim()) {
      this.newScenario.module = this.selectedModule;

      this.scenarioService.createScenario(this.newScenario).subscribe(
        (scenario: Scenario) => {
          if (this.selectedModule) {
            this.selectedModule.scenarios = this.selectedModule.scenarios
              ? [...this.selectedModule.scenarios, scenario]
              : [scenario];
          }
          this.newScenario = { name: '', description: '' };
          this.showScenarioForm = false;
          const modalElement = document.getElementById('scenarioModal');
          if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
          }
        },
        error => {
          console.error('Error adding scenario:', error);
        }
      );
    } else {
      console.error('Please provide valid scenario details and select a module.');
    }
  }

  openModuleModal() {
    this.newModule = { name: '' };
    this.showModuleForm = true;
    const modalElement = document.getElementById('moduleModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  addModule() {
    if (this.newModule.name.trim()) {
      this.moduleService.createModule(this.newModule).subscribe(
        (module: Module) => {
          this.modules.push(module);
          this.newModule = { name: '' };
          this.showModuleForm = false;
          const modalElement = document.getElementById('moduleModal');
          if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
          }
        },
        error => {
          console.error('Error adding module:', error);
        }
      );
    } else {
      console.error('Please provide a valid module name.');
    }
  }

  triggerJob(scenario: Scenario) {
    if (scenario.id) {
        this.scenarioService.triggerJob(scenario.id).subscribe(
            response => {
                console.log(response.message);
                this.message = response.message; // Afficher le message dans le composant
            },
            error => {
                console.error('Erreur lors du déclenchement du job Jenkins:', error);
            }
        );
    } else {
        console.error('ID du scénario manquant.');
    }
}


openScheduleModal(scenario: Scenario) {
  this.selectedScenario = scenario;
  this.selectedDate = '';
  this.selectedTime = '';
  const modalElement = document.getElementById('scheduleModal');
  if (modalElement) {
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }
}

schedulePipeline() {
  if (this.selectedScenario && this.selectedDate && this.selectedTime) {
    const [hours, minutes] = this.selectedTime.split(':').map(Number);
    const date = new Date(this.selectedDate);
    date.setHours(hours, minutes);

    this.scenarioService.scheduleScenario(this.selectedScenario.id!, date).subscribe(
      response => {
        console.log('Pipeline scheduled successfully', response);
        const modalElement = document.getElementById('scheduleModal');
        if (modalElement) {
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.hide();
        }
      },
      error => {
        console.error('Error scheduling pipeline', error);
      }
    );
  }
}

  openJenkinsModal(scenario: Scenario) {
    this.selectedScenario = scenario;
    this.pipelineScript = scenario.jobScript || '';  // Charger le script existant si disponible
    const modalElement = document.getElementById('jenkinsModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.hide();
    }
  }

  createJenkinsJob() {
    if (this.selectedScenario && this.pipelineScript.trim()) {
      this.scenarioService.createScenarioJob(this.selectedScenario.id!, this.pipelineScript).subscribe(
        (updatedScenario: Scenario) => {
          // Mettre à jour le scénario localement avec le nouveau jobScript et jobPath
          const index = this.scenarios.findIndex(s => s.id === updatedScenario.id);
          if (index !== -1) {
            this.scenarios[index] = updatedScenario;
          }


          const modalElement = document.getElementById('jenkinsModal');
          if (modalElement) {
            const modal = new (window as any).bootstrap.Modal(modalElement);
            modal.hide();
          }
        },
        error => {
          console.error('Erreur lors de la création du job Jenkins:', error);
        }
      );
    }
  }
  toggleScenarioSelection(scenario: Scenario) {
    const index = this.selectedScenarios.findIndex(s => s.id === scenario.id);
    if (index === -1) {
      this.selectedScenarios.push(scenario);
    } else {
      this.selectedScenarios.splice(index, 1);
    }
  }

  triggerSelectedScenarios() {
    if (this.selectedScenarios.length > 0) {
      this.selectedScenarios.forEach(scenario => {
        this.scenarioService.triggerJob(scenario.id!).subscribe(
          response => {
            console.log(`Job for scenario ${scenario.name} triggered: ${response.message}`);
          },
          error => {
            console.error(`Failed to trigger job for scenario ${scenario.name}:`, error);
          }
        );
      });
      this.selectedScenarios = []; // Réinitialiser la sélection après exécution
    } else {
      console.warn('No scenarios selected');
    }
  }
}
