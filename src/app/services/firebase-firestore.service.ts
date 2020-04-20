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
    yearOfBirth: "1999",
    gender: "Male",
    isAdult: true,
    chats: []
  };
  onGetUserData: Subject<boolean> = new Subject<boolean>();
  public isLoading: boolean = true;

  constructor(private af: AngularFireAuth, private firestore: AngularFirestore) {
    this.af.authState.subscribe(auth => {
      this.uid = auth.uid;
      this.email = auth.email;
      this.isEmailVerified = auth.emailVerified;
      this.userRef = this.firestore.collection("users").doc(auth.uid);
      // this.userRef.snapshotChanges().subscribe(res => {
      //   // TODO: test 
      //   if(!res.payload.exists)
      //     this.userRef.set({name:"", chats: []})
      //     .then(() => {
      //       this.userRef.snapshotChanges().unsubscribe()
      //     });
      // });
      this.userRef.valueChanges().subscribe(res => {
        this.user = res;
        this.isLoading = false;
        this.onGetUserData.next(true);
      }, err => console.log(err))
    });
  }

  getUserData() {
    this.onGetUserData.next(true);
  }

  updateData(data) {
    this.userRef.update(data);
  }

  updateChats(data) {
    this.userRef.update({chats:data});
  }
  
}
