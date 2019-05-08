import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
declare var window: any;
@Component({
    template: ''
})

export class LogoutComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() {
        localStorage.removeItem('token');
        window.location = '/';
    }

}
