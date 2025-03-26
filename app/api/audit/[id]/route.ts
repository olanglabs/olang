import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/actions/audit';

/**
 * GET /api/audit/[id] - Retrieve a specific audit log entry by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 },
      );
    }

    // Get all logs and find the specific one by ID
    const auditData = await getAuditLogs();
    const logEntry = auditData.logs.find((log) => log.id === id);

    if (!logEntry) {
      return NextResponse.json(
        { error: 'Log entry not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(logEntry);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve log entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
