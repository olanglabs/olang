import { NextRequest } from 'next/server';
import { getAuditLogs } from '@/actions/audit';
import { AuditLogEntry } from '@/app/(protected)/(settings)/audit/types';

/**
 * GET /api/audit/stream - Stream audit logs in real-time using SSE
 */
export async function GET(request: NextRequest) {
  // Create a readableStream to emit Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      // Initial data load - get current logs as starting point
      const initialData = await getAuditLogs();

      // Track the most recent timestamp to filter future logs
      let lastTimestamp = Math.max(
        ...initialData.logs.map((log) => log.timestamp),
        0,
      );

      // Send initial message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'Stream connected successfully',
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // Poll for new logs every 5 seconds
      const interval = setInterval(async () => {
        try {
          // Get latest logs
          const latestData = await getAuditLogs();

          // Filter for new logs since the last check
          const newLogs = latestData.logs.filter(
            (log) => log.timestamp > lastTimestamp,
          );

          if (newLogs.length > 0) {
            // Update lastTimestamp
            lastTimestamp = Math.max(
              ...newLogs.map((log) => log.timestamp),
              lastTimestamp,
            );

            // Send each new log as a separate event
            for (const log of newLogs) {
              const message = `data: ${JSON.stringify(log)}\n\n`;
              controller.enqueue(new TextEncoder().encode(message));
            }
          }

          // Send heartbeat to keep connection alive
          const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeat));
        } catch (error) {
          console.error('Error polling for new logs:', error);
          const errorMessage = `data: ${JSON.stringify({
            type: 'error',
            message: 'Error fetching logs',
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorMessage));
        }
      }, 5000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  // Return the stream with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
