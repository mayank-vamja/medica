import { Component } from "@angular/core";
import { 
  Router, 
  RouterEvent, 
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { slideInAnimation } from './routin-animation';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  animations: [slideInAnimation]
})
export class AppComponent {
  title = "MEDICA";
  loading: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe((e: RouterEvent) => {
      this.navigationInterceptor(e);
    })
  }

  navigationInterceptor(event: RouterEvent): void {
    this.loading = (event instanceof NavigationStart) ?
      true : (event instanceof NavigationEnd) ?
      false : (event instanceof NavigationCancel) ?
      false : (event instanceof NavigationError) ?
      false : false;
    // console.log("ROUTING EVENT STATUS : ", this.loading);
      
  }
}
