export type Theme = "light" | "dark" | "system";
export type Width = "narrow" | "normal" | "wide";
export type FontSize = "s" | "m" | "l";

export interface Preferences {
  theme: Theme;
  width: Width;
  font: FontSize;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  width: "normal",
  font: "m",
};

export interface FileMeta {
  name: string;
  content: string;
  sizeKB: number;
}

export interface Heading {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export type ToastVariant = "info" | "error";

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  text: string;
}
