import {WebSocketService} from "../controller/webScoketService";
import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import {NgForm} from "@angular/forms";
import {SharedData} from "../interface/sharedData";

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  @Output() close = new EventEmitter<void>();

  post_input: any;


  constructor(private socket: WebSocketService,
              private sharedData: SharedData) {
  }

  closePopup() {
    this.close.emit(); // Notify the parent component to remove the popup
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscKey(event: KeyboardEvent) {
    console.log('ESC key pressed');
    this.closePopup();
  }


  addPost(form: NgForm) {
    console.log("add post");
    if (this.post_input == "" || this.post_input == undefined) {
      return;
    }

    let hashtags;
    if ( form.value.hashtag_input !== "") {
      hashtags = form.value.hashtag_input.split(",");
    }

    let image;
    if (form.value.image_input !== "") {
      image= {
        url: form.value.image_input,
        title: 'Image du Post'
      }
    } else {
      image = null;
    }



    console.log("hastags: ", hashtags);

    let new_post = {
      body: this.post_input,
      createdBy: localStorage.getItem("user_id"),
      hashtags: hashtags,
      images: image,
      sharedBy: null,
      shares: 0,
      comments: [],
      likedBy: [],
      likes: 0,
      pseudo: localStorage.getItem("username")
    }
    this.socket.emit("add_post", new_post);
    this.post_input = "";
    const sharedMsg = {
      username: localStorage.getItem("username"),
      message: "Nouveau message postulé"
    }
    this.sharedData.updateData(sharedMsg);
    this.closePopup();
  }


}
