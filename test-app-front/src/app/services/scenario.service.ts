import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scenario } from '../models/scenario.model';
import { Schedule } from '../models/Schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private apiUrl = 'http://localhost:8085/scenarios';
  private triggerUrl = 'http://localhost:8085/scenarios/trigger';


  constructor(private http: HttpClient) {}

  getAllScenarios(): Observable<Scenario[]> {
    return this.http.get<Scenario[]>(this.apiUrl);
  }

  getScenarioById(id: number): Observable<Scenario> {
    return this.http.get<Scenario>(`${this.apiUrl}/${id}`);
  }

  getScenariosByModuleId(moduleId: number): Observable<Scenario[]> {
    return this.http.get<Scenario[]>(`${this.apiUrl}/module/${moduleId}`);
  }
  

  createScenario(scenario: Scenario): Observable<Scenario> {
    return this.http.post<Scenario>(this.apiUrl, scenario);
  }

  updateScenario(id: number, scenario: Scenario): Observable<Scenario> {
    return this.http.put<Scenario>(`${this.apiUrl}/${id}`, scenario);
  }

  deleteScenario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  triggerJob(scenarioId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${scenarioId}/trigger`, {});
}


  getTestResults(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8085/scenarios/allure-uid');
  }

  schedulePipeline(jenkinsUrl: string, date: Date): Observable<any> {
    const params = new HttpParams()
      .set('datetime', date.toISOString());

    return this.http.post(jenkinsUrl, params);
  }

  createScenarioJob(scenarioId: number, jobScript: string): Observable<Scenario> {
    const url = `${this.apiUrl}/${scenarioId}/create-job`;
    const params = { jobScript };
    return this.http.post<Scenario>(url, null, { params });
  }

  scheduleScenario(scenarioId: number, date: Date): Observable<Schedule> {
    const url = `${this.apiUrl}/${scenarioId}/schedule`;
    const body = {
      scheduledTime: date.toISOString(),
    };
    return this.http.post<Schedule>(url, body);
  }
}
