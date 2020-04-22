import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, DoCheck, OnDestroy, AfterViewInit } from "@angular/core";
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth/';
import { ApiMedicService } from 'src/app/api/api-medic.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';

const features = [{key: "GET_STARTED", name: "Start", value: ""}];

@Component({
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  encapsulation: ViewEncapsulation.None,
})

export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  token: string;
  queryForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    public af: AngularFireAuth,
    public router: Router,
    private api: ApiMedicService,
    private ref: ChangeDetectorRef,
    public chat: ChatService,
  ) { }

  ngOnInit(): void {
    this.queryForm = new FormGroup({ query: new FormControl(null, Validators.required) });
    this.chat.initializeAutocomplete(this.chat.autocomplete);
    
    this.chat.onChange.subscribe(changed => {
      this.ref.detectChanges();
      this.scrollToBottomChat();
    });
    this.chat.onError.subscribe(err => {
      if(err.error === "Invalid token")
        this.api.generateToken();
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottomChat();
  }

  ngOnDestroy(): void {
    // this.chat.onChange.unsubscribe();
    // this.chat.onError.unsubscribe();
  }

  sendData() {
    if (this.queryForm.valid) {
      let query = this.queryForm.value.query;
      let item = this.chat.autocomplete.filter(i => query.includes(i.name));

      this.chat.sendUserMessage(query);
      this.queryForm.reset();

      if (item && item[0]) {
        item = item[0];
        this.chat.isGettingMessage = true;
        this.ref.detectChanges();
        this.scrollToBottomChat();
        this.chat.dispatch(item);
      } else {
        this.chat.sendMedicaMessage("I am not getting you. Please try again.")
      }
    }
  }

  getStarted() {
    this.chat.sendUserMessage("Start");
    this.chat.dispatch(features[0]);
  }

  scrollToBottomChat() {
    const objDiv = document.getElementById("chats");
    objDiv.scrollTop = objDiv.scrollHeight;
  }
}
