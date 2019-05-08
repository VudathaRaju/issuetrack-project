import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {

    authState: any = null;
    helper: any;
    token: string;

    constructor(private http: HttpClient, private router: Router) {
        this.helper = new JwtHelperService();
    }

    public isAuthenticated(): boolean {
        this.token = localStorage.getItem('token');
        // Check whether the token is expired and return
        // true or false
        return !this.helper.isTokenExpired(this.token);
    }

    // Returns current user data
    get currentUser(): any {
        this.token = localStorage.getItem('token');
        return this.helper.decodeToken(this.token);
    }
}
