import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../api/Models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseFirestore {

  uid: string;
  email: string;
  isEmailVerified: boolean;
  userRef;
  user: User = <User> {
    name: "",
    birthdate: "",
    profilePicture: "",
    yearOfBirth: "",
    gender: "",
    isAdult: true,
    chats: []
  };
  onGetUserData: Subject<boolean> = new Subject<boolean>();
  public isLoading: boolean = true;

  constructor(private af: AngularFireAuth, private firestore: AngularFirestore) {
    this.af.authState.subscribe(auth => {
      if(!auth) return;
      this.uid = auth.uid;
      this.email = auth.email;
      this.isEmailVerified = auth.emailVerified;

      this.userRef = this.firestore.collection("users").doc(auth.uid);
      this.userRef.snapshotChanges().subscribe(action => {
        if(action.payload.exists === false) {
          // console.log("USER DOEST NOT EXISTS ON FIRESTORE ");
          // console.log("SO CREATING USER ");
          this.userRef.set(this.user)
        }
      })
      this.userRef.valueChanges().subscribe(res => {
        this.user = res;
        this.isLoading = false;
        this.onGetUserData.next(true);
      }, console.error);
    });
  }

  getUserData = () => this.onGetUserData.next(true);
  updateData = (data) => this.userRef.update(data);
  updateChats = (chats) => this.userRef.update({chats});

  // updateFirestore(data) {
  //   this.userRef.update(data) {

  //   }
  // }
}
