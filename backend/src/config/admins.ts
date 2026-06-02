// backend/src/config/admins.ts
export const ADMIN_EMAILS = [
  "anujmhatre125@gmail.com",
  "nehapatil0045@gmail.com",
  "khushalp1729@gmail.com"
] as const;

export const isAdmin = (email: string): boolean =>
  ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number]);
