export interface User {
  name: string;
  birthdate: string;
  gender: string;
  profilePicture: string;
  isAdult: boolean;
  yearOfBirth: string;
  chats: Message[];
}

export interface Message {
  from: string;
  message: string;
  date: any;
}