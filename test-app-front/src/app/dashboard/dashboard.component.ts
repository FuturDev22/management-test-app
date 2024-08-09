import { Component, OnInit } from '@angular/core';
import { ScenarioService } from '../services/scenario.service';
import { Chart, PieController, ArcElement, Tooltip, Legend, BarController, CategoryScale, LinearScale, BarElement, LineController, PointElement, LineElement, DoughnutController } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  testResults: any[] = [];
  statusPieChart: any;
  durationBarChart: any;
  durationLineChart: any;
  stepsDoughnutChart: any;

  constructor(private scenarioService: ScenarioService) { }

  ngOnInit(): void {
    this.loadTestResults();
  }

  loadTestResults(): void {
    this.scenarioService.getTestResults().subscribe(data => {
      this.testResults = data;
      this.createStatusPieChart();
      this.createDurationBarChart();
      this.createDurationLineChart();
      this.createStepsDoughnutChart();
    });
  }

  createStatusPieChart(): void {
    // Register the required chart components
    Chart.register(PieController, ArcElement, Tooltip, Legend);

    // Prepare data for the pie chart
    const passed = this.testResults.filter(result => result.status === 'passed').length;
    const failed = this.testResults.filter(result => result.status === 'failed').length;
    const pieChartData = {
      labels: ['Passed', 'Failed'],
      datasets: [{
        label: 'Test Status',
        data: [passed, failed],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#1e7e34', '#c82333'],
        borderWidth: 1
      }]
    };

    // Configure the pie chart
    this.statusPieChart = new Chart('statusPieChart', {
      type: 'pie',
      data: pieChartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw}`;
              }
            }
          }
        }
      }
    });
  }

  createDurationBarChart(): void {
    // Register the required chart components
    Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

    // Extract test names and durations
    const testNames = this.testResults.map(result => result.name);
    const durations = this.testResults.map(result => result.time.duration / 1000); // Convert to seconds

    // Prepare data for the bar chart
    const barChartData = {
      labels: testNames,
      datasets: [{
        label: 'Durée des Tests (secondes)',
        data: durations,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };

    // Configure the bar chart
    this.durationBarChart = new Chart('durationBarChart', {
      type: 'bar',
      data: barChartData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw} sec`;
              }
            }
          }
        }
      }
    });
  }

  createDurationLineChart(): void {
    // Register the required chart components
    Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

    // Extract test dates and durations
    const testDates = this.testResults.map(result => new Date(result.time.start).toLocaleDateString());
    const durations = this.testResults.map(result => result.time.duration / 1000); // Convert to seconds

    // Prepare data for the line chart
    const lineChartData = {
      labels: testDates,
      datasets: [{
        label: 'Durée des Tests (secondes)',
        data: durations,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: false,
      }]
    };

    // Configure the line chart
    this.durationLineChart = new Chart('durationLineChart', {
      type: 'line',
      data: lineChartData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw} sec`;
              }
            }
          }
        }
      }
    });
  }

  createStepsDoughnutChart(): void {
    // Register the required chart components
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    // Extract the number of steps for each test
    const testNames = this.testResults.map(result => result.name);
    const stepsCounts = this.testResults.map(result => result.testStage.steps.length);

    // Prepare data for the doughnut chart
    const doughnutChartData = {
      labels: testNames,
      datasets: [{
        label: 'Nombre d\'Étapes',
        data: stepsCounts,
        backgroundColor: [
          '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#343a40'
        ],
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    };

    // Configure the doughnut chart
    this.stepsDoughnutChart = new Chart('stepsDoughnutChart', {
      type: 'doughnut',
      data: doughnutChartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw} steps`;
              }
            }
          }
        }
      }
    });
  }
}
