export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  loading?: boolean;
  error?: boolean;
}
