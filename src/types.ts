export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1";

export interface GeneratedMedia {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

