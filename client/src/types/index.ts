export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    instructorId: string;
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'instructor';
  }