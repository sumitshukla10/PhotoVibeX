export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface Image {
  id: string;
  title: string;
  description: string;
  price: number;
  url: string;
  cloudinaryId: string;
  createdAt: Date;
  likes: number;
}

export interface Comment {
  id: string;
  imageId: string;
  userId: string;
  userEmail: string;
  content: string;
  createdAt: Date;
}

export interface Like {
  id: string;
  imageId: string;
  userId: string;
}