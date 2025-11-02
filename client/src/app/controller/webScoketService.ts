
// Service mettant en place la connexion et la gestion de l’envoi et réception des messages avec le serveur
import { Injectable } from "@angular/core";
import { Observable, throwError } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket;
  constructor(){
    // Connexion au serveur pour mise en place webSocket

    // Angular App deployed directly at Univ
    this.socket = io('https://pedago01c.univ-avignon.fr:3123');

    // I'm working remotely, so I'm not running angular on localhost anymore
    // this.socket = io('https://127.0.0.1:3123');

    // this.socket = io('/');
  }

  // Méthode d’écoute des événements venant du serveur (utilisation des observables pour activation dès réception
  //  d’un événement!) en s’appuyant sur socket.io-client
  listen(eventname : string) : Observable<any> {
    return new Observable((subscribe) => {
      this.socket.on(eventname, (data) => {
        subscribe.next(data);
      })
    })
  }

  // Méthode d’envoi au serveur d’un événement et données associées en s’appuyant sur socket.io-client
  emit(eventname: string, data: any){
    this.socket.emit(eventname, data);
  }

  disconnect(post_list: any): void {
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from the server. Reason:', reason);
      post_list = [];
    });
  }



}
