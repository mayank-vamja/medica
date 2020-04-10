import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import endpoints, { GET_AUTH_TOKEN_URL, API_MEDIC_BASE_URL, SYMPTOMS } from "./api-medic-endpoints"
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Symptoms } from './Models/symptoms.model';

@Injectable({ providedIn: 'root' })
export class ApiMedicService {

  constructor(private http:HttpClient) { }

  generateToken() {
    // TODO generate token - security issue
    let headers = new HttpHeaders({ 'Authorization': 'Bearer mnkvmj@gmail.com:UdIh/BLgL1gkkmBgXWPZ8w=='});
    let options: Object = { headers };
    
    return this.http.post(GET_AUTH_TOKEN_URL, null, options).toPromise()
      .then(response => {
        let token: string = response["Token"];
        localStorage.setItem("token", response["Token"])
      })
  }

  get<T>(url: string, params: Object) {
    return this.http.get(this.getURL(url, params)).pipe(map((response: T) => response));
  }
  post(url: string, params: Object, data: Object) {
    return this.http.post(this.getURL(url, params), data);
  }

  getURL(endpoint: string, params: Object) {
    return this.getParams(endpoints.API_ENDPOINTS[endpoint], params);
  }

  getParams(url: string, params: Object) {
    for (let key in params) {
      url = url.replace(new RegExp("\\{" + key + "\\}", "gm"), params[key]);
    }
    return API_MEDIC_BASE_URL + url;
  }
}
