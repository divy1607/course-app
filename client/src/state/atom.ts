// client/src/state/atoms.ts
import { atom } from 'recoil';
import { Course, User } from '../types';

export const userState = atom<User | null>({
  key: 'userState',
  default: null
});

export const coursesState = atom<Course[]>({
  key: 'coursesState',
  default: []
});