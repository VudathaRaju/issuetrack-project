import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { RedirectToHomeGuard } from './core/auth.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateComponent } from './create/create.component';
import { IssueDetailComponent } from './issue-detail/issue-detail.component';
import { LogoutComponent } from './logout.component';

const routes: Routes = [
  /*default Rout*/
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'issue-detail/:id', component: IssueDetailComponent, canActivate: [AuthGuard]
  },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'create', component: CreateComponent, canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  /*if any of the above Rout didt match this this rout will work*/
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, RedirectToHomeGuard]
})
export class AppRoutingModule { }
