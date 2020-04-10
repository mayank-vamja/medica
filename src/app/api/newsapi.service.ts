import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { throwError } from 'rxjs';

const NEWSAPI_KEY = "77012abcd3b047beba19d9cf6a9467b5";
const NEWSAPI_URL =
  "https://newsapi.org/v2/top-headlines?country=in&category=health&apiKey=77012abcd3b047beba19d9cf6a9467b5";

@Injectable({ providedIn: "root" })
export class NewsApiService {
  constructor(private http: HttpClient) {}

  getHealthNews<T>() {
    return this.http
      .get(NEWSAPI_URL)
      .pipe(map((response: T) => response));
  }

}
