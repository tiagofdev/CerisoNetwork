import {
  AfterViewInit,
  Component, HostListener,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {NgForm} from "@angular/forms";
import {DynamicChildLoaderDirective} from "./loadComponent.directive";
import {Observable, Subscription} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";
import {WebSocketService} from './controller/webScoketService';
import {SharedData} from "./interface/sharedData";
import {LoginComponent} from "./components/login.component";
import {DashboardComponent} from "./components/dashboard.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {

  title = 'CerisoNet';
  showMenu: boolean = true;
  @ViewChild(DynamicChildLoaderDirective, {static: true})
  dynamicChild!: DynamicChildLoaderDirective;
  public bandeau: string = "";

  public username: string = "";

  // **************************************************************************************************
  // CONSTRUCTOR
  // **************************************************************************************************
  constructor(
              public router: Router,
              public webSocket: WebSocketService,
              public sharedData: SharedData,
              private loginComponent: LoginComponent,
              private dashboardComponent: DashboardComponent
              ) { }

  // **************************************************************************************************
  ngAfterViewInit(): void {

  }

  // **************************************************************************************************
  // OnInit
  // **************************************************************************************************
  ngOnInit(): void {

    // Bandeau Subscription
    this.sharedData.data$.subscribe((data) => {
      if (data) { // Check if data is not null
        this.username = data.username;
        this.bandeau = data.message;

      }
    });

    // Login and Redirect Management

    // THIS IS WORKING - DO NOT DELETE
    // DISABLED TEMPORARILY TO BYPASS LOGIN
    if (localStorage.getItem('sessionId') != null) {
      const user = localStorage.getItem('email');
      const pass = localStorage.getItem('password');
      if (user && pass) {
        // There is a redirect inside login already
        this.loginComponent.login(user, pass);
      }
    } else {
      this.router.navigate(['app-root/login']);
    }

    // AND THEN ERASE THE FOLLOWING LINE:
    // this.router.navigate(['/app-root/dashboard']);

  }

  // **************************************************************************************************
  // onLogout
  // **************************************************************************************************
  onLogout() {
    this.webSocket.emit('logout', localStorage.getItem('sessionId'));

    // Remove data from local storage or cookies
    localStorage.clear();
    this.bandeau = "";
    this.username = "";
    this.dashboardComponent.filtered_list = [];
  }


  // Browser Window min size




}

