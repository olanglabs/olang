export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  audit_level: string;
  verb: string;
  request_uri: string;
  response_status_code: number;
  source_ip: string;
  user_agent: string;
  request_object: string;
  response_object: string;
  extra: any;
  // Chat content fields
  chat_content?: {
    userMessage?: string;
    aiResponse?: string;
    model?: string;
    messageType?: string;
    messages?: ChatMessage[];
    isChatLog?: boolean; // Flag to indicate if this log should be displayed as chat
  };
}

export interface AuditStatistics {
  totalEntries: number;
  requestsByStatusCode: Record<number, number>;
  requestsByVerb: Record<string, number>;
  requestsByEndpoint: Record<string, number>;
  requestsByModel: Record<string, number>;
  uniqueUsers: number;
  errorRate: number;
}

export interface AuditResponse {
  logs: AuditLogEntry[];
  statistics: AuditStatistics;
}
