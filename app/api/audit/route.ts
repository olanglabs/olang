import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/actions/audit';
import { AuditLogEntry } from '@/app/(protected)/(settings)/audit/types';

/**
 * GET /api/audit - Retrieve audit logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startTime = searchParams.get('startTime')
      ? parseInt(searchParams.get('startTime') || '0')
      : undefined;
    const endTime = searchParams.get('endTime')
      ? parseInt(searchParams.get('endTime') || '0')
      : undefined;
    const status = searchParams.get('status')
      ? parseInt(searchParams.get('status') || '0')
      : undefined;
    const method = searchParams.get('method') || undefined;
    const user = searchParams.get('user') || undefined;

    // Validate parameters
    const validatedLimit = Math.min(Math.max(1, limit), 1000); // Limit between 1 and 1000
    const validatedOffset = Math.max(0, offset); // Offset must be non-negative

    // Get all logs from the server action
    const auditData = await getAuditLogs();
    let filteredLogs = [...auditData.logs];

    // Apply filters
    if (startTime) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= startTime);
    }

    if (endTime) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= endTime);
    }

    if (status) {
      filteredLogs = filteredLogs.filter((log) =>
        log.response_status_code.toString().startsWith(status.toString()),
      );
    }

    if (method) {
      filteredLogs = filteredLogs.filter(
        (log) => log.verb.toUpperCase() === method.toUpperCase(),
      );
    }

    if (user) {
      filteredLogs = filteredLogs.filter((log) =>
        log.user?.name?.toLowerCase().includes(user.toLowerCase()),
      );
    }

    // Sort by timestamp descending (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(
      validatedOffset,
      validatedOffset + validatedLimit,
    );

    // Prepare response
    return NextResponse.json({
      logs: paginatedLogs,
      statistics: auditData.statistics,
      pagination: {
        limit: validatedLimit,
        offset: validatedOffset,
        total: filteredLogs.length,
        hasMore: validatedOffset + validatedLimit < filteredLogs.length,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve audit logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
