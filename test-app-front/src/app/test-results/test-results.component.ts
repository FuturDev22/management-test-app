// src/app/test-results/test-results.component.ts
import { Component, OnInit } from '@angular/core';
import { ScenarioService } from '../services/scenario.service';

@Component({
  selector: 'app-test-results',
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.css']
})
export class TestResultsComponent implements OnInit {

  testResults: any[] = [];
  selectedTest: any;

  constructor( private scenarioService: ScenarioService) { }

  ngOnInit(): void {
    this.scenarioService.getTestResults().subscribe((data: any[]) => {
      this.testResults = data;
    });
  }

  onSelect(test: any): void {
    this.selectedTest = test;
  }
}
