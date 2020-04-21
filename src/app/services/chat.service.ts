import { Injectable, ChangeDetectorRef } from '@angular/core';
import { ApiMedicService } from '../api/api-medic.service';
import { SYMPTOMS, GET_ALL_SYMPTOMS, BODY_LOCATIONS, BODY_SUB_LOCATIONS, SYMPTOMS_IN_LOCATION, SPECIALISATIONS, DIAGNOSIS, ISSUES, ISSUE_INFO } from 'src/app/api/api-medic-endpoints';
import { BodyLocation } from 'src/app/api/Models/body-location.model';
import { BodySubLocation } from 'src/app/api/Models/body-sub-location.model';
import { LocationSymptom } from 'src/app/api/Models/location-symptom.model';
import { Specialisation } from 'src/app/api/Models/specialisation.model';
import { Diagnosis } from 'src/app/api/Models/diagnosis.model';
import { IssueInfo } from 'src/app/api/Models/issue-info.model';
import { Issue } from 'src/app/api/Models/issue.model';
import Tribute from 'tributejs';
import { Subject } from 'rxjs';
import { Message } from '../api/Models/user.model';
import { FirebaseFirestore } from './firebase-firestore.service';

const features = [{ key: "GET_STARTED", name: "Start", value: "" }];
const SERVER_ERROR_MSG = "I'm getting errro from server. Please try again or visit after some time."

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  isAdult:boolean = true;
  yearOfBirth: string = "2000";
  gender: string = "Male";
  tribute: Tribute<any>;
  allMessages: Array<Message> = [];
  isGettingMessage: boolean = false;
  autocomplete: Array<any> = features;
  onChange: Subject<boolean> = new Subject<boolean>();
  onError: Subject<any> = new Subject<any>();
  isLoading: boolean = false;
  chatSubscription;

  constructor(private api: ApiMedicService, private firestore: FirebaseFirestore) {
    this.isLoading = true;
    firestore.getUserData();
    this.chatSubscription = firestore.onGetUserData.subscribe(received => {
      this.isLoading = false;
      if(!firestore.user) return;
      if (firestore.user.chats && this.allMessages.length === 0) 
        this.allMessages = firestore.user.chats;
      this.isAdult = firestore.user.isAdult;
      this.yearOfBirth = firestore.user.yearOfBirth;
      this.gender = firestore.user.gender;
      this.onChange.next(true);
    }, console.error);
  }

  sendMedicaMessage = (message: string) => {
    this.allMessages = [...this.allMessages, {message, from: "MEDICA", date: new Date()}];
    this.firestore.updateChats(this.allMessages);
    this.onChange.next(true);
  }

  sendUserMessage = (message: string) => {
    this.allMessages = [...this.allMessages, { message, from: "USER", date: new Date() }]
    this.firestore.updateChats(this.allMessages);
    this.onChange.next(true);
  }

  dispatch(item) {
    let yearOfBirth = this.yearOfBirth;
    let gender = this.gender.toLowerCase();
    let selectorStatus = this.isAdult ? 
      gender === "male" ? "man" : "woman" :
      gender === "male" ? "boy" : "girl";
      
    let token = localStorage.getItem("token");
    let language = "en-gb";

    switch (item.key) {
      case "GET_STARTED":
        this.isGettingMessage = false;
        this.autocomplete = [
          { key: "BODY_LOCATIONS", name: "Body Locations", value: "" },
          { key: "LOCATION_SYMPTOMS", name: "Skip", value: "0" },
        ];
        this.sendMedicaMessage("Get started by typing # to see available options from list. Select or type 'Skip' to skip to next option.");
        this.initializeAutocomplete(this.autocomplete);
        break;

      case "BODY_LOCATIONS":
        this.api
          .get<BodyLocation[]>(BODY_LOCATIONS, { token, language })
          .subscribe((data) => {
            this.isGettingMessage = false;
            let newAutocomplete = data.map((i) => ({
              key: "BODY_SUB_LOCATIONS",
              name: i.Name,
              value: i.ID,
            }));
            this.autocomplete = [
              ...newAutocomplete,
              { key: "LOCATION_SYMPTOMS", name: "Skip", value: 0 },
            ];
            this.sendMedicaMessage("Please let me know part of body or location in which you have issue. You can also skip choosing 'Skip' if you are confused. But it'll make more difficult for me to help you.");
            this.initializeAutocomplete(this.autocomplete);
          }, err => {
            this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.onError.next(err);
          });
        break;

      case "BODY_SUB_LOCATIONS":
        this.api
          .get<BodySubLocation[]>(BODY_SUB_LOCATIONS, { token, language, locationId: item.value })
          .subscribe((data) => {
            this.isGettingMessage = false;
            let newAutocomplete = data.map((i) => ({key: "LOCATION_SYMPTOMS",name: i.Name,value: i.ID}));
            this.autocomplete = [...newAutocomplete,{ key: "LOCATION_SYMPTOMS", name: "Skip", value: 0 }];
            this.sendMedicaMessage("Great ! Now it would be nice if you could specify sub-part or sublocation in your body part. You can skip it anytime by choosing or sending 'Skip'.");
            this.initializeAutocomplete(this.autocomplete);
          }, err => {
            this.isGettingMessage = false;
            this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.onError.next(err);
          });
        break;

      case "LOCATION_SYMPTOMS":
        this.api
          .get<LocationSymptom[]>(SYMPTOMS_IN_LOCATION, {
            token,
            language,
            selectorStatus,
            locationId: item.value,
          })
          .subscribe((data) => {
            this.isGettingMessage = false;
            let newAutocomplete = data.map((i) => ({
              key: "SYMPTOM_SELECTED",
              name: i.Name,
              value: i.ID,
            }));
            if(newAutocomplete.length <= 0) {
              this.dispatch({key: "LOCATION_SYMPTOMS", name: "All Symptoms", value: 0})
            } else {
              this.autocomplete = [...newAutocomplete];
              this.sendMedicaMessage("Which symptoms do you find ?");
              this.sendMedicaMessage("Search through the list by typing # as always. Go ahead and tell me.");
              this.initializeAutocomplete(this.autocomplete);
            }
          }, err => {
              this.isGettingMessage = false;
              this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.onError.next(err);
          });
        break;

      case "SYMPTOM_SELECTED":
        this.api
          .get<Specialisation[]>(SPECIALISATIONS, {
            token,
            language,
            gender,
            yearOfBirth,
            symptoms: `[${item.value}]`,
          })
          .subscribe((data) => {
            let dataHtml = `<p>Most probably you are looking for is from following: </p>
              ${data
                .sort((a, b) => b.Accuracy - a.Accuracy)
                .map(
                  (i, id) => `
                  <h6><span class="badge badge-pill badge-light">${id + 1}</span>${i.Name}</h6>
                  <div class="progress">
                    <div class="progress-bar w-${Math.round(i.Accuracy)}" 
                    role="progressbar" aria-valuenow="${Math.round(i.Accuracy)}" 
                    aria-valuemin="0" aria-valuemax="100"></div>
                  </div>`
                )
                .join("")}`;
            this.sendMedicaMessage("Don't know which type of specialist Doctor you should meet?");
            this.sendMedicaMessage(dataHtml);

            this.api
              .get<Diagnosis[]>(DIAGNOSIS, {
                token,
                language,
                gender,
                yearOfBirth,
                symptoms: `[${item.value}]`,
              })
              .subscribe((data) => {
                this.isGettingMessage = false;
                let newAutocomplete = data.map((i) => ({
                  key: "ISSUE_INFO",
                  name: i.Issue.Name,
                  value: i.Issue.ID,
                }));
                this.autocomplete = [
                  ...newAutocomplete,
                  { key: "NO_ISSUES_FOUND", name: "Skip", value: "0" },
                ];
                this.sendMedicaMessage("I've found some issues you might be or might not be facing. Let me know issue so that I can provide you more information on that. (Type # to see.)");
                this.initializeAutocomplete(this.autocomplete);
              }, err => {
                  this.isGettingMessage = false;
                  this.sendMedicaMessage(SERVER_ERROR_MSG);
                this.onError.next(err);
              });
          }, err => {
            this.isGettingMessage = false;
            this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.onError.next(err);
          });
        break;

      case "NO_ISSUE_FOUND":
        this.api
          .get<Issue[]>(ISSUES, {
            token,
            language,
            locationId: item.value,
          })
          .subscribe((data) => {
            this.isGettingMessage = false;
            let newAutocomplete = data.map((i) => ({
              key: "ISSUE_INFO",
              name: i.Name,
              value: i.ID,
            }));
            this.autocomplete = [...newAutocomplete];
            this.sendMedicaMessage("Don't worry. Please search through all available issues and ask me regarding that.");
            this.initializeAutocomplete(this.autocomplete);
          }, err => {
            this.isGettingMessage = false;
            this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.onError.next(err);
          });
        break;

      case "ISSUE_INFO":
        this.api
          .get<IssueInfo>(ISSUE_INFO, {
            token,
            language,
            issueId: item.value,
          })
          .subscribe((data) => {
            this.isGettingMessage = false;
            let newAutocomplete = features;
            this.autocomplete = [...newAutocomplete];
            this.sendMedicaMessage(`Here is sosendMedicaMessagee information regarding your issue.`);
            this.sendMedicaMessage(
              `<div class="card">
                <div class="card-header">
                   ${data.Name} 
                </div>
                <div class="card-body">
                  <h5 class="card-title">Special title treatment</h5>
                  <blockquote class="blockquote mb-0">
                    <p>${data.Description}</p>
                    <p>${data.MedicalCondition}</p>
                    <footer class="blockquote-footer"> ${data.TreatmentDescription} </footer>
                  </blockquote>
                </div>
              </div>`);
            this.sendMedicaMessage("I hope that this will help you. You can start again to get my help again.");
            this.initializeAutocomplete(this.autocomplete);
          }, err => {
            this.isGettingMessage = false;
            this.sendMedicaMessage(SERVER_ERROR_MSG);
            this.onError.next(err);
          });
        break;
      default:
        this.isGettingMessage = false;
        this.sendMedicaMessage("Sorry! Can't respond to that");

    }
  }

  initializeAutocomplete(values: Array<any>) {
    this.tribute && this.tribute.detach(document.getElementById("query"));
    this.tribute = new Tribute({
      values: values,
      trigger: "#",
      lookup: "name",
      fillAttr: "name",
      positionMenu: false,
      menuContainer: document.getElementById("autocomplete-menu"),
      containerClass: "autocomplete-container",
      itemClass: "autocomplete-item",
      selectTemplate: (item) => item.original["name"],
      menuItemTemplate: (item) => item.original["name"],
    });
    this.tribute.attach(document.getElementById("query"));
  }
}
