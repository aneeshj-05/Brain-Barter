import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";  // ← Correct package name

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}