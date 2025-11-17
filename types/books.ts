export type BookFormat = "ebook" | "paperback" | "hardcover" | "audiobook";

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  format: BookFormat;
  status: "draft" | "scheduled" | "live";
  launchDate?: string;
  platforms: string[];
}

