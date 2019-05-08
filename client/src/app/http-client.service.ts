import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable()
export class HttpClientService {

    constructor(private http: HttpClient) {
    }

    call(apiObj, apiParam) {
        if (apiObj.method == "GET") {
            return this.http.get(environment.baseUrl + apiObj.url, {
                headers: apiObj.headers,
                params: apiParam
            })
        }
        else if (apiObj.method == "POST") {
            return this.http.post(environment.baseUrl + apiObj.url, apiParam)
        }
        else if (apiObj.method == "PUT") {
            return this.http.put(environment.baseUrl + apiObj.url, apiParam);
        }
        else if (apiObj.method == "DELETE") {
            return this.http.delete(environment.baseUrl + apiObj.url, apiParam);
        }
    }
}


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let token = localStorage.getItem('token');
        if (token) {
            request = request.clone({
                setHeaders: {
                    'x-access-token': token
                }
            });
        }

        return next.handle(request);
    }
}

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

/**
 * Generated class for the SafeHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}

import { Subject } from 'rxjs';

@Injectable()
export class ReloadIssuesGrid {
    private _listners = new Subject<any>();

    listen(): Observable<any> {
        return this._listners.asObservable();
    }

    filter(filterBy: string) {
        this._listners.next(filterBy);
    }
}