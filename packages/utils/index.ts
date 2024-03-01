import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomAvatar(seed: string) {
  return `https://api.dicebear.com/6.x/lorelei/svg?seed=${seed}&backgroundColor=E8E8E8&translateY=4`;
}

export const getBackendBaseUrl = (prod: boolean) => {
  if (prod) return '';
  return `http://localhost:3000`;
};
