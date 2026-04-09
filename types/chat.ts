/**
 * Types relacionados ao Chat do Assistente Mecânico
 */

export interface ChatSession {
  id: string;
  user_id: string;
  vehicle_id: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface ChatLimitInfo {
  used: number;
  limit: number | null;
  remaining: number | null;
  isAtLimit: boolean;
}

export interface SendMessagePayload {
  session_id: string | null;
  vehicle_id: string;
  message: string;
}

export interface SendMessageResponse {
  session_id: string;
  message: ChatMessage;
}

export interface ChatRateLimitError {
  error: string;
  code: "RATE_LIMIT";
  limit: number;
  used: number;
}
