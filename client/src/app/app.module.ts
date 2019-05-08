import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { TimeagoModule } from 'ngx-timeago';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateComponent } from './create/create.component';
import { FormsModule } from '@angular/forms';
import { AppService } from './app.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientService, JwtInterceptor, SafeHtmlPipe, ReloadIssuesGrid } from './http-client.service';
import { AuthService } from './core/auth.service';
import { AuthGuard } from './core/auth.guard';
import { IssueDetailComponent } from './issue-detail/issue-detail.component';
import { LogoutComponent } from './logout.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

export function tokenGetter() {
  return localStorage.getItem('token');
}

export function jwtOptionsFactory() {
  return {
    tokenGetter: () => {
      return tokenGetter();
    },
    headerName: 'x-access-token',
    authScheme: ''
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CreateComponent,
    IssueDetailComponent,
    SafeHtmlPipe,
    LogoutComponent
  ],
  imports: [FormsModule, HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
      }
    }),
    TimeagoModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    AppService,
    HttpClientService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    AuthService,
    AuthGuard,
    ReloadIssuesGrid
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
