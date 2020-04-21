import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth/';
import { Router } from '@angular/router';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(public af: AngularFireAuth, public router:Router) {
    this.af.authState.subscribe(auth => {
      if(auth)
        this.router.navigateByUrl("/");
    });
  }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6)]),
      'confirm-password': new FormControl(null, [Validators.required, Validators.minLength(6)])
    }, this.passwordConfirming)
  }

  onSubmit() {
    if(this.signupForm.valid) {
      let email = this.signupForm.value.email;
      let password = this.signupForm.value.password;
      this.af.createUserWithEmailAndPassword(email, password).then(success => {
      }).catch(console.error)
    }
  }

  passwordConfirming(c: AbstractControl): { passwordMissMatch: boolean } {
    if (c.get('password').value !== c.get('confirm-password').value) {
      return { passwordMissMatch: true };
    }
    return null;
  }
}
