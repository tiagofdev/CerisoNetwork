import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {DynamicChildLoaderDirective} from "./loadComponent.directive";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";

import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';
import {NgOptimizedImage} from "@angular/common";
import {PopupComponent} from "./components/popup.component";
import {RestapiComponent} from "./components-api/restapi.component";



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    DynamicChildLoaderDirective,
    PopupComponent,
    RestapiComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgOptimizedImage,

  ],
  exports: [
    RouterModule
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
