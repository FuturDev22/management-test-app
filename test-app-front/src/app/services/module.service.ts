import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Module } from '../models/module.model';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private apiUrl = 'http://localhost:8085/modules';

  constructor(private http: HttpClient) {}

  getAllModules(): Observable<Module[]> {
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map(response => {
        try {
          return JSON.parse(response) as Module[];
        } catch (e) {
          console.error('JSON parsing error:', e);
          throw new Error('JSON parsing error');
        }
      }),
      catchError(error => {
        console.error('HTTP error:', error);
        return throwError(error);
      })
    );
  }

  getModuleById(id: number): Observable<Module> {
    return this.http.get<Module>(`${this.apiUrl}/${id}`);
  }

  createModule(module: Module): Observable<Module> {
    return this.http.post<Module>(this.apiUrl, module);
  }

  updateModule(id: number, module: Module): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/${id}`, module);
  }

  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
