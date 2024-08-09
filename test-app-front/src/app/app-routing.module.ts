import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUtilsateursComponent } from './list-utilsateurs/list-utilsateurs.component';
import { ModulesComponent } from './modules/modules.component';
import { TestResultsComponent } from './test-results/test-results.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

const routes: Routes =[
  { path: 'utilisateurs',  component: ListUtilsateursComponent },
  { path: 'modules',  component: ModulesComponent },
  { path: 'tests',  component: TestResultsComponent },
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'login',  component: LoginComponent },

]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
