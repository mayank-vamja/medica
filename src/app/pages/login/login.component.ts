import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  constructor(public af: AngularFireAuth, public router: Router) {
    this.af.authState.subscribe(auth => {
      if(auth) {
        this.router.navigateByUrl("/");
      }
    })
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  onSubmit() {
    if(this.loginForm.valid) {
      let email = this.loginForm.value.email;
      let password = this.loginForm.value.password;
      this.af.signInWithEmailAndPassword(email, password).then(success => {
        this.router.navigateByUrl("/");
      }).catch(console.error)
    }
  }

}
