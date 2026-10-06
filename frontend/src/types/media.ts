export type MediaSection =
  | "hero"
  | "about"
  | "services"
  | "login"
  | "register";

export interface MediaResponseData {
  id: string;
  originalName: string;
  fileKey: string;
  url : string
  mimeType: string;
  mediaType: "image" | "video";
  size: number;
  section: MediaSection;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse {
  success: boolean;
  message: string;
  data: MediaResponseData[];
}