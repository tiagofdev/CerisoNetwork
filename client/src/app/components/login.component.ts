
import {Component, EventEmitter, Injectable, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";

import {SharedData} from "../interface/sharedData";
import {WebSocketService} from "../controller/webScoketService";


@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'login',
  templateUrl: './login.component.html'

})
export class LoginComponent {

  loginMessage: { message: string,
                  username: string,
                   } | null = null;


  constructor(
              private router: Router,
              private sharedData: SharedData,
              private webSocket: WebSocketService
              ) { }

  goTo(page: any) {
    // debug
    // console.log("child click")
    // this.router.navigate(['app-root/create-account']);
  }

  shareAuthentication() {
    this.sharedData.updateData(this.loginMessage);
  }

  onLogin(form: NgForm): void {
    const email = form.value.email;
    const motpasse = form.value.password;

    this.login(email, motpasse);
  }

  login(email: string, password: string) {
    // Create payload to websocket
    const payload = {
      email: email,
      motpasse: password
    };

    // Emit login data to the server
    this.webSocket.emit('login', payload);

    // Listen for login process
    this.webSocket.listen('login').subscribe((data) => {

      // Get session details from server
      // Successful Login
      if (data.sessionId != null) {

        // last session
        this.loginMessage = {

          username: data.username,
          message: `Bienvenue, ${data.username}!\nDernière connexion: ${data.lastDate} à ${data.lastTime}`
        };

        // current session save to local storage
        // localStorage is scoped only to my website domain
        localStorage.setItem('date', new Date().toDateString());
        localStorage.setItem('time', new Date().toLocaleTimeString());
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', password);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('email', email);

        // reroute to dashboard
        this.router.navigate(['/app-root/dashboard']);

      // Connexion échouée
      } else {

        this.loginMessage = {

          username: "",
          message: data.message
        };
      }

      this.shareAuthentication();

    });
  }


}


