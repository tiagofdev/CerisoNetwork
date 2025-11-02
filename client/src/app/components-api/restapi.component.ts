
import {Component, EventEmitter, HostListener, Injectable, Output} from '@angular/core';
import {NgForm} from "@angular/forms";
import {HttpClient, HttpClientModule, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from "rxjs";
import {Post} from "../model/post";

@Component({
  selector: 'restapi',
  templateUrl: './restapi.component.html',
})
export class RestapiComponent {

  posts: any[] = [];
  singlePost: any = {};
  message: string | null = null;
  userPseudo: any;
  postId: number = 0;
  postIdToDelete: number = 0;
  postBody: any;

  private urlGetPostByUser = 'https://pedago.univ-avignon.fr:3566/postsByUser';
  private urlresetLikes = 'https://pedago.univ-avignon.fr:3566/resetLikes';
  private urlDelete = 'https://pedago.univ-avignon.fr:3566/delete';
  private urlNewPost = 'https://pedago.univ-avignon.fr:3566/newpost';

  constructor(private http: HttpClient) {  }



  getPostsByUser(pseudoInput: string): Observable<any> {
    console.log("pseudo: " , pseudoInput);
    return this.http.get(`${this.urlGetPostByUser}/${pseudoInput}`);
  }

  putResetLikes(postId: number): Observable<any> {
    return this.http.put(`${this.urlresetLikes}/${postId}`, {});
  }

  deletePosts(postId: number): Observable<any> {
    return this.http.delete(`${this.urlDelete}/${postId}`, {});
  }

  postNewPost(userId: number, bodyInput: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const pseudo = localStorage.getItem("username") || '';

    console.log("body: ", bodyInput);

    const formData = new HttpParams()
      .set('userId', userId.toString())
      .set('body', bodyInput)
      .set('pseudo', pseudo);

    return this.http.post(this.urlNewPost, formData.toString(), { headers });

  }

  // ************************************************************************************************************
  //
  // ************************************************************************************************************

  fetchPosts(pseudoInput: string) {
    this.reset();

    console.log("this singlepost: ", this.singlePost.body)

    this.getPostsByUser(pseudoInput).subscribe(
      (data) => {
        this.posts = data;
        this.message = null;
      },
      (error) => {
        this.message = error.error?.error || 'An error occurred';
        this.posts = [];
      }
    );
  }

  resetLikes(postId: number) {
    this.reset();
    this.putResetLikes(postId).subscribe(
      (data) => {
        this.singlePost = data;
        this.message = null;
        console.log("data: ", data._id)
        console.log("data: ", data.body)
        console.log("data: ", data.likes)
      },
      (error) => {
        this.message = error.error?.error || 'An error occurred';
        this.singlePost = {} as Post;
      }
    );
  }

  delete(postId: number) {
    this.reset();

    this.deletePosts(postId).subscribe(
      (data) => {
        this.message = data.message;
      },
      (error) => {
        this.message = error.error?.error || 'An error occurred';
        this.singlePost = {} as Post;
      }
    );
  }

  newPost(body: string) {
    console.log("body; ", body);
    console.log("thisbody: ", this.postBody);

    this.reset();

    let user_id = localStorage.getItem("user_id");

    if (user_id) {
      this.postNewPost(parseInt(user_id), body).subscribe({
        next: response => this.singlePost = response,
        error: err => console.error('Error:', err)
      });
    }
  }

  reset() {
    this.posts = [];
    this.singlePost = {};
    this.message = "";
  }



}
