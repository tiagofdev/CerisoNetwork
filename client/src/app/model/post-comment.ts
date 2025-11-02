
export interface PostComment {

  _id: string; // Keeping _id as a string for comments
  text: string;
  commentedBy: string | number; // Refers to the user who commented
  date: string;
  hour: string;




}
