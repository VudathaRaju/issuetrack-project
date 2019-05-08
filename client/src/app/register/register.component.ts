import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service'
import { Router } from '@angular/router'
declare var iziToast: any;
declare var window: any;
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  email: any;
  password: any;
  cnfPassword: any;
  constructor(private appService: AppService, private rout: Router) { }

  ngOnInit() {
  }

  signUp() {
    if (!this.email || !this.password || !this.cnfPassword) {
      return iziToast.error({
        title: "Error",
        message: "Please Enter All Credential  to Register"
      });

    }
    if (this.password != this.cnfPassword) {
      return iziToast.error({
        title: "Error",
        message: "Please Enter same Password"
      });
    }
    this.appService.signup({
      email: this.email,
      password: this.password,
      username: this.email,
      firstname: this.email,
      lastname: this.email
    })
      .subscribe(
        (data: any) => {
          localStorage.setItem('token', data.token)
          window.location = '/dashboard';
        },
        err => {
          return iziToast.error({
            title: "Error",
            message: err.error ? err.error.message : err.message
          });
        }
      )

  }
}
