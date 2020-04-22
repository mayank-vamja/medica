import { HttpInterceptor, HttpRequest, HttpHandler, HttpEventType, HttpErrorResponse, HttpEvent, HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiMedicService } from './api-medic.service';
import { Injectable } from '@angular/core';
import { GET_AUTH_TOKEN_URL } from './api-medic-endpoints';

@Injectable()
export default class ApiMedicInterceptor implements HttpInterceptor {

  constructor(public api: ApiMedicService, private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    if(req.url.includes("login"))
      return next.handle(req);

    return next.handle(req).pipe(catchError(err => {
      if(err instanceof HttpErrorResponse) {
        if(err.status === 400 || err.error === "Invalid token") {
          let headers = new HttpHeaders({ 'Authorization': 'Bearer mnkvmj@gmail.com:UdIh/BLgL1gkkmBgXWPZ8w==' });
          let options: Object = { headers };
          // GEBERATE NEW TOKEN IF TOKEN IS INVALID
          return this.http.post(GET_AUTH_TOKEN_URL, null, options)
            .pipe(mergeMap(response => {
              let token: string = response["Token"];
              localStorage.setItem("token", response["Token"]);
              let newReq = this.getRequestWithNewToken(req, token);
              // REDIRECT ORIGINAL REQUEST WITH NEW TOKEN
              return next.handle(newReq);
            }));
        }
      }
      return new Observable<HttpEvent<any>>();
    }));
  }
  
  getRequestWithNewToken = (req: HttpRequest<any>, newToken: string) => {
    let url = req.url;
    url = url.replace(/token=[ A-Za-z0-9.{},-]*&/gi, `token=${newToken}&`);
    let newRequest = req.clone({url});
    return newRequest;
  }

}