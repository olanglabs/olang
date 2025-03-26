'use server';

import fs from 'fs';
import path from 'path';
import {
  AuditLogEntry,
  AuditResponse,
  AuditStatistics,
  ChatMessage,
} from '@/app/(protected)/(settings)/audit/types';

// Type definition for webhook configuration
interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  headers?: Record<string, string>;
}

// Function to get webhook configurations
const getWebhookConfigurations = (): WebhookConfig[] => {
  const configPath = path.join(
    process.cwd(),
    '.data',
    'openwebui',
    'webhooks.json',
  );

  if (!fs.existsSync(configPath)) {
    return [];
  }

  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading webhook configurations:', error);
    return [];
  }
};

// Function to notify webhooks about new audit logs
export async function notifyWebhooks(logs: AuditLogEntry[]): Promise<void> {
  const webhooks = getWebhookConfigurations();

  if (webhooks.length === 0 || logs.length === 0) {
    return;
  }

  // Process each webhook
  for (const webhook of webhooks) {
    try {
      // Filter logs based on webhook event configuration
      let filteredLogs = logs;

      if (!webhook.events.includes('all')) {
        // Apply event-based filtering
        filteredLogs = logs.filter((log) => {
          // Filter for error events
          if (
            webhook.events.includes('error') &&
            log.response_status_code >= 400
          ) {
            return true;
          }

          // Filter for login events
          if (
            webhook.events.includes('login') &&
            log.request_uri.includes('/api/auth') &&
            log.verb === 'POST'
          ) {
            return true;
          }

          // Filter for admin actions
          if (
            webhook.events.includes('admin_action') &&
            log.user?.role === 'admin'
          ) {
            return true;
          }

          return false;
        });
      }

      // Skip if no logs match the filtering criteria
      if (filteredLogs.length === 0) {
        continue;
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Audit-Source': 'openwebui',
        'X-Audit-Signature': webhook.secret,
        ...webhook.headers,
      };

      // Send the webhook notification
      await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          logs: filteredLogs,
          timestamp: Date.now() / 1000, // Current Unix timestamp
          eventCount: filteredLogs.length,
        }),
      });

      console.log(`Successfully notified webhook: ${webhook.url}`);
    } catch (error) {
      console.error(`Error notifying webhook ${webhook.url}:`, error);
    }
  }
}

// Function to get logs since a specific timestamp
export async function getAuditLogsSince(
  timestamp: number,
): Promise<AuditLogEntry[]> {
  try {
    const { logs } = await getAuditLogs();
    return logs.filter((log) => log.timestamp > timestamp);
  } catch (error) {
    console.error('Error getting logs since timestamp:', error);
    return [];
  }
}

export async function getAuditLogs(): Promise<AuditResponse> {
  try {
    // Path to the mirrored audit.log file from the OpenWebUI container
    const auditLogPath = path.join(
      process.cwd(),
      '.data',
      'openwebui',
      'audit.log',
    );

    // Initialize empty log entries array
    let logEntries: AuditLogEntry[] = [];

    // Check if the file exists and read it if it does
    if (fs.existsSync(auditLogPath)) {
      // Read the audit log file
      const auditLogContent = fs.readFileSync(auditLogPath, 'utf8').trim();

      // Parse the log entries (assuming each line is a JSON object)
      logEntries = auditLogContent
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          try {
            const entry = JSON.parse(line);

            // Parse chat content from request and response objects
            try {
              if (entry.request_object) {
                const requestData = JSON.parse(entry.request_object);
                const responseData = entry.response_object
                  ? JSON.parse(entry.response_object)
                  : null;

                // Extract message type
                const messageType = requestData.type || 'chat';

                // Initialize chat content
                let userMessage = '';
                let aiResponse = '';
                let messages: ChatMessage[] = [];
                let isChatLog = true; // Default to true - we'll handle all logs as chat logs

                // Process messages array if it exists
                if (
                  requestData.messages &&
                  Array.isArray(requestData.messages) &&
                  requestData.messages.length > 0
                ) {
                  // Convert messages to our simpler format, directly using the message format provided
                  messages = requestData.messages.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp,
                  }));

                  // Find the latest user message for the summary
                  const userMessages = requestData.messages.filter(
                    (msg: any) => msg.role === 'user',
                  );
                  if (userMessages.length > 0) {
                    userMessage = userMessages[userMessages.length - 1].content;
                  }

                  // Find the latest assistant message for the summary
                  const assistantMessages = requestData.messages.filter(
                    (msg: any) => msg.role === 'assistant',
                  );
                  if (assistantMessages.length > 0) {
                    aiResponse =
                      assistantMessages[assistantMessages.length - 1].content;
                  }
                }
                // Handle simple prompt (if no messages but has prompt)
                else if (requestData.prompt) {
                  userMessage = requestData.prompt;

                  // For search queries or simple prompts, create a user message
                  messages.push({
                    role: 'user',
                    content: userMessage,
                  });

                  // If there's a response, add it as an assistant message
                  if (
                    responseData?.choices &&
                    responseData.choices.length > 0
                  ) {
                    if (responseData.choices[0].message?.content) {
                      aiResponse = responseData.choices[0].message.content;

                      // Check if it's a search result (JSON response)
                      try {
                        const parsedResponse = JSON.parse(
                          aiResponse.replace(/^```json|```$/g, '').trim(),
                        );
                        if (parsedResponse.text) {
                          aiResponse = `Search completion: "${parsedResponse.text}"`;
                        }
                      } catch (e) {
                        // Not valid JSON, use as is
                      }

                      messages.push({
                        role: 'assistant',
                        content: aiResponse,
                      });
                    } else if (responseData.choices[0].text) {
                      aiResponse = responseData.choices[0].text;
                      messages.push({
                        role: 'assistant',
                        content: aiResponse,
                      });
                    }
                  }
                }

                // Set the chat content
                entry.chat_content = {
                  userMessage,
                  aiResponse,
                  model: requestData.model || '',
                  messageType,
                  messages,
                  isChatLog: messages.length > 0, // If we have messages, it's a chat log
                };
              }
            } catch (e) {
              console.error('Error parsing chat content:', e);

              return null;
            }

            return entry;
          } catch (e) {
            console.error('Error parsing line:', e);

            return null;
          }
        })
        .filter((entry): entry is AuditLogEntry => entry !== null);
    }

    // Generate overview statistics
    const statistics: AuditStatistics = {
      totalEntries: logEntries.length,
      requestsByStatusCode: {} as Record<number, number>,
      requestsByVerb: {} as Record<string, number>,
      requestsByEndpoint: {} as Record<string, number>,
      requestsByModel: {} as Record<string, number>,
      uniqueUsers: 0,
      errorRate: 0,
    };

    const uniqueUsersSet = new Set<string>();

    // Process each log entry to extract statistics
    logEntries.forEach((entry) => {
      // Count status codes
      if (entry.response_status_code) {
        statistics.requestsByStatusCode[entry.response_status_code] =
          (statistics.requestsByStatusCode[entry.response_status_code] || 0) +
          1;
      }

      // Count HTTP verbs
      if (entry.verb) {
        statistics.requestsByVerb[entry.verb] =
          (statistics.requestsByVerb[entry.verb] || 0) + 1;
      }

      // Count endpoints
      if (entry.request_uri) {
        const endpoint = new URL(entry.request_uri).pathname;
        statistics.requestsByEndpoint[endpoint] =
          (statistics.requestsByEndpoint[endpoint] || 0) + 1;
      }

      // Track unique users
      if (entry.user && entry.user.id) {
        uniqueUsersSet.add(entry.user.id);
      }

      // Count model usage from parsed chat_content
      if (entry.chat_content?.model) {
        statistics.requestsByModel[entry.chat_content.model] =
          (statistics.requestsByModel[entry.chat_content.model] || 0) + 1;
      }
    });

    // Calculate error rate (status codes >= 400)
    const errorCount = Object.entries(statistics.requestsByStatusCode)
      .filter(([code]) => parseInt(code) >= 400)
      .reduce((sum, [_, count]) => (sum + count) as number, 0);

    statistics.errorRate =
      logEntries.length > 0
        ? Math.round((errorCount / logEntries.length) * 100)
        : 0;

    // Convert Set to number for unique users count
    statistics.uniqueUsers = uniqueUsersSet.size;

    // Return the parsed log entries and statistics
    return {
      logs: logEntries,
      statistics,
    };
  } catch (error) {
    console.error('Error reading audit log:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to read audit logs',
    );
  }
}
