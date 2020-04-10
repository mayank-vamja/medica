import { Component, Input, OnInit } from '@angular/core';
import * as moment from "moment";

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss']
})
export class ChatBubbleComponent implements OnInit {

  @Input() message: string;
  @Input() from: string;
  @Input() date: Date;
  dateText: string;
  userText: string;

  constructor() { }
  
  ngOnInit(): void {
    this.dateText = moment(this.date).fromNow();
    console.log(this.from);
    this.userText = this.from == "USER" ? "You" : "Medica";
  }

}
