import { Component, OnInit } from "@angular/core";
import {  Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  constructor(private router: Router, public af: AngularFireAuth) {
    this.af.authState.subscribe(auth => {
      if(auth) {
        this.isLoggedIn = true;
      }
    })
  }

  ngOnInit(): void {}

  route(path: string) {
    this.router.navigateByUrl(path);
  }

  logout() {
    this.af.signOut().then(success => {
      this.isLoggedIn = false;
      this.router.navigateByUrl("/login");
    }).catch(err => console.log(err));
  }
}
