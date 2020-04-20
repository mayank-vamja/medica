import { Component, Input, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as moment from "moment";

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss'],
  animations: [
    trigger('bubble', [
      state('shrink', style({transform: 'scale(1.1)'})),
      state('normal', style({transform: 'scale(1)'})),
      transition('shrink <=> normal', [ animate('0.3s') ])
    ])
  ]
})
export class ChatBubbleComponent implements OnInit, AfterViewInit {

  @Input() message: string;
  @Input() from: string;
  @Input() date: any;
  dateText: string;
  userText: string;
  animationState: string = "shrink";
  // audio;

  constructor(private ref: ChangeDetectorRef) { }
  
  ngOnInit(): void {
    if(!(this.date instanceof Date))
      this.dateText = moment(this.date.toDate()).fromNow();
    else this.dateText = moment(this.date).fromNow();
    this.userText = this.from == "USER" ? "You" : "Medica";

    // this.audio = new Audio();
    // this.audio.src = this.from == "USER" ? "../../../assets/sounds/sound_out.wav" : "../../../assets/sounds/sound_in.wav";
    // this.audio.load();
    // this.audio.play();
  }

  ngAfterViewInit(): void {
    this.animationState = this.animationState === "shrink" ? "normal" : this.animationState;
    this.ref.detectChanges();
  }

}
