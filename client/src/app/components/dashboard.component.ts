import {AfterViewInit, Component, ElementRef, HostListener, Injectable, Input, OnInit, ViewChild} from "@angular/core";

import {Router} from "@angular/router";
import {BehaviorSubject, combineLatest, map, Observable, of, startWith, Subscription} from "rxjs";
import {catchError} from "rxjs/operators";
import {SharedData} from "../interface/sharedData";
import { Post } from "../model/post";
import {WebSocketService} from "../controller/webScoketService";
import { ChangeDetectorRef } from '@angular/core';
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";


@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  // Cette liste contient les messages a montrer sur le dashboard
  // Quand on scroll down, on les rattrape de la BD et les ajoute a cette liste


  post_set: Set<number> = new Set(); // THE IS SO I DON'T REPEAT POSTS IN MY LIST
  filtered_list: Post[] = []; // THIS IS THE FINAL EDITED LIST SHOWN IN THE TEMPLATE
  post_list: Post[] = [];
  active_users: any;
  page: number = 0;
  user_id: number;
  comment_input: string = "";
  show_sorting_menu: boolean = false;
  show_filter_menu: boolean = false;
  filter_value: string = "";
  filter_user: boolean = false;
  filter_hashtag: boolean = false;

  avatars: Map<number, String> = new Map();

  static isPopupVisible = false;

  @Input() router: Router;
  constructor(router: Router,
              private sharedData: SharedData,
              private socket: WebSocketService,
              ) {

    this.router = router;
    this.user_id = 0;
  }

  ngOnInit(): void {

    // this.sharedData.data$.subscribe((data) => {
    //   this.session = data;
    //   console.log("session data: ", this.session)
    // })


    // Montrer N derinères messages
    this.socket.emit('get_posts', { page: this.page });

    this.getPosts();

    this.socket.listen('active_users').subscribe((data) => {
      this.active_users = data;
      // console.log("active: ", this.active_users);

    });

    this.socket.listen("update_post").subscribe((post) => {

      if ( !this.post_set.has(post._id) ) {
        console.log(`new -> id ${post._id} - likedBy ${post.likedBy}`);
        this.post_set.add(post._id);
        this.post_list.push(post);
      } else {
        console.log(`update -> id ${post._id} - likedBy ${post.likedBy}`);
        this.overwritePost(post._id, post)
      }
      this.applyFilter();
    });

    this.socket.disconnect(this.post_list);

  }

  // **************************************************************************************************

  ngAfterViewInit(): void {
    // console.log("sessionId: ", localStorage.getItem('sessionId'));
    // si le client n'est pas authentifié, redirigez-le vers login

    // THIS IS WORKING - DO NOT DELETE
    // DISABLED TEMPORARILY TO BYPASS LOGIN
    if (localStorage.getItem('sessionId') == null) {
      this.router.navigate(['app-root/login']).then(r => {});
    }
    this.user_id = parseInt(<string>localStorage.getItem('user_id'), 10);
    console.log("this user: ", localStorage.getItem('user_id'));
  }

  // ***************************************************************************************************



  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= docHeight - 1) {
      // Scrolled to the bottom
      this.page += 1;
      this.socket.emit('get_posts', this.page);
    }
  }

  getPosts() {
    // Listen to Server
    this.socket.listen('get_posts').subscribe((data) => {

      let received_posts: Post[] = data.posts;
      let additional_posts_to_pull: number[] = [];

      received_posts.forEach((post: Post) => {
        if (post.sharedBy != null) {
          if ( !this.post_set.has(post._id)) {
            additional_posts_to_pull.push(post.sharedBy);
          }
        }
      });

      additional_posts_to_pull!.forEach((post_id: number) => {
        this.socket.emit("get_single_post", post_id);
      });

      received_posts!.forEach((post: Post) => {
        if ( !this.post_set.has(post._id) ) {
          this.post_set.add(post._id);
          this.post_list.push(post);
          this.assignAvatar(post.createdBy);
        }
      });
      this.applyFilter();

    });
  }



  likePost(clickedPostId: number) {

    let post = this.getPostById(clickedPostId);
    if (!post) return;

    // If user is already included in the list of likedBy
    if (post.likedBy.includes(this.user_id)) {
      console.log("unLiked Post id: ", post._id);
      this.socket.emit("unlike_post", clickedPostId);

    } else {
      console.log("liked Post id: ", post._id);
      this.socket.emit("like_post", clickedPostId);
    }
    this.bandeauMsg(`Vous avez liké le post de ${post.pseudo}!`);
  }


  addComment(id: number) {

    if (this.comment_input !== "") {
      console.log("comment to post: ", id);
      const payload = {
        "post_id": id,
        "commentedBy": this.user_id,
        "text": this.comment_input
      }
      this.socket.emit("add_comment", payload);
      this.bandeauMsg("Commentaire posté!");
    }
  }

  sharePost(clickedPostId: number) {
    console.log("share post: ");

    let post = this.getPostById(clickedPostId);
    if (!post) return;
    let new_post = {
      body: "Je vous partage ce Post!",
      createdBy: this.user_id,
      hashtags: [],
      images: null,
      sharedBy: clickedPostId,
      shares: 0,
      comments: [],
      likedBy: [],
      likes: 0,
      pseudo: localStorage.getItem("username")
    }

    this.socket.emit("add_post", new_post);
    this.bandeauMsg("Partage réussi!");
  }

  getPostById(post_id: number): Post | undefined {
    return this.post_list.find(post => post._id === post_id);
  }

  overwritePost(postId: number, newPost: Post): void {

    const index = this.post_list.findIndex(post => post._id === postId);

    if (index !== -1) {
      this.post_list[index] = newPost; // Overwrite the post at the found index
    } else {
      console.error(`Post with _id ${postId} not found`);
    }
    // Force Angular to detect changes
    // this.cdr.detectChanges();
  }

  get staticPopup() {
    return DashboardComponent.isPopupVisible
  }

  showPopup() {
    DashboardComponent.isPopupVisible = true; // Display the popup
  }

  hidePopup() {
    DashboardComponent.isPopupVisible = false; // Hide the popup when clicked
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Sorting

  sortByDate() {
    this.post_list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  sortByUser() {
    this.post_list.sort((a, b) => a.pseudo.localeCompare(b.pseudo));
  }

  sortByLikes() {
    this.post_list.sort((a, b) => b.likes - a.likes);
  }

  // Filter

  applyFilter() {

    console.log("filter value: ", this.filter_value);
    console.log("filter user: ", this.filter_user);
    console.log("filter hash: ", this.filter_hashtag);
    if ( this.filter_value != "" && this.filter_user) {
      this.filtered_list = this.post_list.filter(post => post.pseudo === this.filter_value);
      this.bandeauMsg("Filtré par Utilisateur!");
    }
    else if ( this.filter_value != "" && this.filter_hashtag) {
      this.filtered_list = this.post_list.filter(post => post.hashtags.includes(this.filter_value));
      this.bandeauMsg("Filtré par Hashtag!");
    } else {
      this.filtered_list = this.post_list;

    }
  }

  removeFilter() {
    this.filter_value = "";
    this.filter_hashtag = false;
    this.filter_user = false;
    this.applyFilter();
    this.bandeauMsg("Filtre supprimé");
  }


  click_filter_user(user: HTMLElement, hash: HTMLElement) {

    if (this.filter_user) {
      this.filter_user = false;
      user.style.backgroundColor = "#fafafa";
    } else {
      this.filter_user = true;
      user.style.backgroundColor = "#74cc8b";
    }
    this.filter_hashtag = false;
    hash.style.backgroundColor = "#fafafa";
  }

  click_filter_hashtag(user: HTMLElement, hash: HTMLElement) {
    if (this.filter_hashtag) {
      this.filter_hashtag = false;
      hash.style.backgroundColor = "#fafafa";
    } else {
      this.filter_hashtag = true;
      hash.style.backgroundColor = "#74cc8b";
    }
    this.filter_user = false;
    user.style.backgroundColor = "#fafafa";
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.show_filter_menu = false;
    this.show_sorting_menu = false;
  }

  bandeauMsg(msg: string) {
    const sharedMsg = {
      username: localStorage.getItem("username"),
      message: msg
    }
    this.sharedData.updateData(sharedMsg);
  }


  fileNames: string[] = [
    "thumbnail_01.png",
    "thumbnail_02.png",
    "thumbnail_03.png",
    "thumbnail_04.png",
    "thumbnail_05.png",
    "thumbnail_06.png",
    "thumbnail_07.png",
    "thumbnail_08.png",
    "thumbnail_09.png",
    "thumbnail_10.png",
    "thumbnail_11.png",
    "thumbnail_12.png"
  ];

  getRandomFilePath(): string {
    const randomIndex = Math.floor(Math.random() * this.fileNames.length);
    return `assets/avatars/${this.fileNames[randomIndex]}`;
  }

  assignAvatar(user_id: number) {
    if ( !this.avatars.has(user_id)) {
      this.avatars.set(user_id, this.getRandomFilePath());
    }
  }

  getAvatar(user_id: number) {
    return this.avatars.get(user_id);
  }

  // Test and debug

  showList() {
    console.log("# posts: ", this.post_list.length);
    // this.post_list.forEach((post: Post) => {
    //   console.log("p: ", post._id, post.createdBy, post.body );
    // });
  }




}
