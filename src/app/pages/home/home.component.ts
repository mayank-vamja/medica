import {
  Component,
  OnInit,
  ViewEncapsulation,
  // ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { RouterOutlet, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth/';
import { HttpClient } from '@angular/common/http';
import { ApiMedicService } from 'src/app/api/api-medic.service';
import { SYMPTOMS, GET_ALL_SYMPTOMS, BODY_LOCATIONS, BODY_SUB_LOCATIONS, SYMPTOMS_IN_LOCATION, SPECIALISATIONS, DIAGNOSIS, ISSUES, ISSUE_INFO } from 'src/app/api/api-medic-endpoints';
import { map, toArray } from 'rxjs/operators';
import { Symptoms } from 'src/app/api/Models/symptoms.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Tribute from "tributejs";
import { BodyLocation } from 'src/app/api/Models/body-location.model';
import { BodySubLocation } from 'src/app/api/Models/body-sub-location.model';
import { LocationSymptom } from 'src/app/api/Models/location-symptom.model';
import { Specialisation } from 'src/app/api/Models/specialisation.model';
import { Diagnosis } from 'src/app/api/Models/diagnosis.model';
import { IssueInfo } from 'src/app/api/Models/issue-info.model';
import { Issue } from 'src/app/api/Models/issue.model';

// const features = [
//   { key : "SYMPTOMS", name: "Symptoms" },
//   { key : "ISSUES", name: "Issues" },
//   { key : "ANALYZE", name: "Analyze" },
//   { key : "BODY_LOCATION", name: "Body Location" },
//   { key : "BODY_SUB_LOCATION", name: "Body Sub-Location" },
// ]

const features = [{key: "GET_STARTED", name: "Start", value: ""}];

@Component({
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  encapsulation: ViewEncapsulation.None,
})

export class HomeComponent implements OnInit {
  token: string;
  allSymptoms: Symptoms[] = [];
  queryForm: FormGroup;
  autocomplete: Array<any> = features;
  tribute: Tribute<any>;
  allMessages: Array<any> = [];

  constructor(
    public af: AngularFireAuth,
    public router: Router,
    private api: ApiMedicService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.queryForm = new FormGroup({
      query: new FormControl(null, Validators.required),
    });
    this.api.generateToken();
    // let lsToken = localStorage.getItem("token");
    // if (!(lsToken && lsToken.length > 0)) {
    //   this.api.generateToken();
    // }

    this.initializeAutocomplete(this.autocomplete);
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

  sendData() {
    if(this.queryForm.valid) {
      let query = this.queryForm.value.query;
      let item = this.autocomplete.filter(i => query.includes(i.name));

      this.sendMessage(query, "USER", new Date());

      if (item && item[0]) {
        item = item[0];
        this.startNextAutoComplete(item);
      }
    }
  }

  startNextAutoComplete(item) {

    /*********************************************
     * FAKE DATA TO START WITH                   *
     * TODO add fields in firebase for real data *
     *********************************************/
    let yearOfBirth = "1999";
    let gender = "male";
    let selectorStatus = "man";
    /*********************************************/

    let token = localStorage.getItem("token");
    let language = "en-gb";

    switch (item.key) {
      case "GET_STARTED":
        this.autocomplete = [
          { key: "BODY_LOCATIONS", name: "Body Locations", value: "" },
          { key: "LOCATION_SYMPTOMS", name: "Skip", value: "0" },
        ];
        this.sendMessage(
          "Get started by typing # to select available options from list. Select ot type 'Skip' to skip to next option. (Please type # to see.)",
          "MEDICA",
          new Date()
        );
        this.initializeAutocomplete(this.autocomplete);
        break;

      case "BODY_LOCATIONS":
        this.api
          .get<BodyLocation[]>(BODY_LOCATIONS, { token, language })
          .subscribe((data) => {
            let newAutocomplete = data.map((i) => ({
              key: "BODY_SUB_LOCATIONS",
              name: i.Name,
              value: i.ID,
            }));
            this.autocomplete = [
              ...newAutocomplete,
              { key: "LOCATION_SYMPTOMS", name: "Skip", value: 0 },
            ];
            this.sendMessage(
              "Please let me know part of body or location in which you have issue from list type # to see list. You can also skip choosing it if you are confused. But it'll make more difficult for me to help you.",
              "MEDICA",
              new Date()
            );
            this.initializeAutocomplete(this.autocomplete);
          });
        break;

      case "BODY_SUB_LOCATIONS":
        this.api
          .get<BodySubLocation[]>(BODY_SUB_LOCATIONS, {
            token,
            language,
            locationId: item.value,
          })
          .subscribe((data) => {
            let newAutocomplete = data.map((i) => ({
              key: "LOCATION_SYMPTOMS",
              name: i.Name,
              value: i.ID,
            }));
            this.autocomplete = [
              ...newAutocomplete,
              { key: "LOCATION_SYMPTOMS", name: "Skip", value: 0 },
            ];
            this.sendMessage(
              "Great ! Now it would be nice if you could specify sub-part or sublocation in your body part. You can skip it anytime by choosing or sending 'Skip'.",
              "MEDICA",
              new Date()
            );
            this.initializeAutocomplete(this.autocomplete);
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
            let newAutocomplete = data.map((i) => ({
              key: "SYMPTOM_SELECTED",
              name: i.Name,
              value: i.ID,
            }));
            this.autocomplete = [...newAutocomplete];
            this.sendMessage(
              "Which symptoms do you find ?",
              "MEDICA",
              new Date()
            );
            this.sendMessage(
              "Search through the list by typing #. Go ahead and tell me.",
              "MEDICA",
              new Date()
            );
            this.initializeAutocomplete(this.autocomplete);
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
            this.sendMessage(
              "Don't know which type of specialist Doctor you should meet?",
              "MEDICA",
              new Date()
            );
            this.sendMessage(
              `Most probably you are looking for is from following: \n
              ${data
                .sort((a, b) => b.Accuracy - a.Accuracy)
                .map((i, id) => `${i.Name}\n`)}`,
              "MEDICA",
              new Date()
            );

            this.api
              .get<Diagnosis[]>(DIAGNOSIS, {
                token,
                language,
                gender,
                yearOfBirth,
                symptoms: `[${item.value}]`,
              })
              .subscribe((data) => {
                let newAutocomplete = data.map((i) => ({
                  key: "ISSUE_INFO",
                  name: i.Issue.Name,
                  value: i.Issue.ID,
                }));
                this.autocomplete = [
                  ...newAutocomplete,
                  { key: "NO_ISSUES_FOUND", name: "Skip", value: "0" },
                ];
                this.sendMessage(
                  "I've found some issues you might be or might not be facing. Let me know issue so that I can provide you more information on that. (Type # to see.)",
                  "MEDICA",
                  new Date()
                );
                this.initializeAutocomplete(this.autocomplete);
              });
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
            let newAutocomplete = data.map((i) => ({
              key: "ISSUE_INFO",
              name: i.Name,
              value: i.ID,
            }));
            this.autocomplete = [...newAutocomplete];
            this.sendMessage(
              "Don't worry. Please search through all available issues and ask me regarding that.",
              "MEDICA",
              new Date()
            );
            this.initializeAutocomplete(this.autocomplete);
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
            let newAutocomplete = features;
            this.autocomplete = [ ...newAutocomplete ];
            this.sendMessage(
              `Here is some information regarding that issue.`,
              "MEDICA",
              new Date()
            );
            this.sendMessage(
              `Name: ${data.Name} \n
              Description: ${data.Description} \n
              Medical condition: ${data.MedicalCondition} \n
              Treatment: ${data.TreatmentDescription} \n`,
              "MEDICA",
              new Date()
            );
            this.sendMessage(
              "I hope that this will help you. Start again to get my help again",
              "MEDICA",
              new Date()
            );
            this.initializeAutocomplete(this.autocomplete);
          });
        break;
    }

  }

  sendMessage(message, from, date) {
    let newMessages = [...this.allMessages, { message, from, date }];
    this.allMessages= newMessages;
    this.ref.detectChanges();
    const objDiv = document.getElementById("chats");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  getStarted() {
    this.sendMessage("Start", "USER", new Date());
    this.startNextAutoComplete(features[0]);
  }
}
