import { Component, OnInit } from '@angular/core';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { AppService } from '../app.service'
import { Router } from '@angular/router'

declare var window: any;
declare var iziToast: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private appService: AppService, private rout: Router) { }
  userName: any;
  password: any;
  ngOnInit() {
  }

  login() {
    if (!this.userName || !this.password)
      return iziToast.error({
        title: 'Error',
        message: 'Please Enter the Credential'
      });
    this.appService.login({
      password: this.password,
      username: this.userName
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
