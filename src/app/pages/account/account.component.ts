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
    this.firestore.onGetUserData.subscribe(received => {
      if(!this.firestore.user) return;
      let { birthdate, gender, name, profilePicture } = this.firestore.user;
      if(birthdate.length) this.dob = birthdate;
      if(gender.length) this.gender = gender;
      if(name.length) this.name = name;
      if (profilePicture.length) this.profilePictureSrc = profilePicture;
      this.crop.bind({ url: this.profilePictureSrc }).catch(err => {});;
      this.isLoading = false;
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
    this.ref.detectChanges();
  }

  openDatePicker(dobPicker: any) {
    dobPicker.open();
  }

  imageSelected(event) {
    this.crop.bind({
      url: URL.createObjectURL(event.target.files[0]),
      points: [77, 469, 280, 739]
    }).catch(err => {});
  }

  updateImage() {
    this.crop.result({type:'base64',circle:false}).then(base64 => 
      this.firestore.updateData({profilePicture:base64}));
  }

}
