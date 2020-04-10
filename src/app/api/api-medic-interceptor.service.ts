import { HttpInterceptor, HttpRequest, HttpHandler, HttpEventType, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ApiMedicService } from './api-medic.service';
import { Injectable } from '@angular/core';

@Injectable()
export default class ApiMedicInterceptor implements HttpInterceptor {

  constructor(public api: ApiMedicService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(catchError(err => {
      if(err instanceof HttpErrorResponse) {
        if(err.status === 400 || err.error === "Invalid token")
          this.api.generateToken();
      }
      return new Observable<HttpEvent<any>>();
    }));
  }
  
  replaceWithNewToken = async (req: HttpRequest<any>) => {
    localStorage.clear();
    await this.api.generateToken();
    let url = req.url;
    let newToken = localStorage.getItem('token');
    url = url.replace(/token=[ A-Za-z0-9.{},-]*&/gi, `token=${newToken}&`);
    return url;
  }

}