import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, AfterViewChecked } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from "moment";
import { FormGroup, FormControl } from '@angular/forms';
import { FirebaseFirestore } from 'src/app/services/firebase-firestore.service';
import Croppie from "croppie";

@Component({
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit {

  maxDate: Date = new Date();
  dob: string = "Data Not Available";
  gender: string = "Data Not Available";
  name: string = "Unavailable";
  isReadOnly: boolean = true;
  crop;
  profilePictureSrc: string = "../../../assets/images/no-dp-preview.png";
  isLoading: boolean = true;

  constructor(private ref: ChangeDetectorRef, public firestore: FirebaseFirestore){
    this.firestore.onGetUserData.subscribe(user => {
      this.dob = this.firestore.user.birthdate;
      this.gender = this.firestore.user.gender;
      this.name = this.firestore.user.name;
      this.profilePictureSrc = this.firestore.user.profilePicture;
      this.crop.bind({ url: this.profilePictureSrc });
      this.isLoading = false;
      // if (this.firestore.user.birthdate && this.firestore.user.birthdate.length)
      // if (this.firestore.user.gender && this.firestore.user.gender.length)
      // if (this.firestore.user.name)
      // if (this.firestore.user.profilePicture)
    }, err => {
      this.isLoading = false;
    })
  }

  ngOnInit(): void {
    this.crop = new Croppie(document.getElementById("selected-image"), {
      enableExif: true,
      viewport: { width: 200, height: 200, type: 'circle' },
      boundary: { width: 300, height: 300 },
    });

    this.firestore.getUserData();
  }

  dobChange(event: MatDatepickerInputEvent<Date>) {
    this.dob = moment(event.value).format("DD MMM, YYYY");
    let currentYear = +(new Date()).getFullYear();
    let yearOfBirth = +this.dob.slice(-4);
    let age = currentYear - yearOfBirth;
    let isAdult = age >= 18;
    this.firestore.updateData({birthdate: this.dob, yearOfBirth, isAdult});
    // this.ref.detectChanges();
  }

  changeGender(val: string) {
    this.gender = val;
    this.firestore.updateData({gender: val});
  }

  updateName(val: string) {
    this.name = val;
    this.firestore.updateData({name: val});
    this.enableEditName(false);
    this.ref.detectChanges();
  }

  enableEditName(isEnabled) {
    this.isReadOnly = !isEnabled;
    console.log(this.isReadOnly);
    this.ref.detectChanges();
  }

  openDatePicker(dobPicker: any) {
    dobPicker.open();
    // this.ref.detectChanges();
  }

  imageSelected(event) {
    console.log(event.target.files[0]);
    this.crop.bind({
      url: URL.createObjectURL(event.target.files[0]),
      points: [77, 469, 280, 739]
    });
  }

  updateImage() {
    this.crop.result({type:'base64',circle:false}).then(base64 => 
      this.firestore.updateData({profilePicture:base64}));
  }

}
