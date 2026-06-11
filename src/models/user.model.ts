export interface User {
  id_document: string;
  name: string;
  email: string;
  password: string;
  nationality: string;
  role: "user" | "admin";
  image_path?: string;
}
