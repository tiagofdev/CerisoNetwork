import {PostComment} from "./post-comment";


export interface Post {

  _id: number; // Numeric _id for the post
  body: string; // Main content of the post
  comments: PostComment[]; // Array of embedded comments
  createdBy: number; // User ID of the creator
  date: string; // Creation date of the post
  hashtags: string[]; // Array of hashtags
  hour: string; // Creation hour
  images: {
    url: string, // Image URL
    title: string // Image title
  };
  likedBy: number[]; // Array of user IDs who liked the post
  likes: number; // Count of likes
  pseudo: string;
  showComments: boolean;
  shares: number;
  sharedBy: number;


}

