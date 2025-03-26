import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET handler for serving documentation files from the /docs directory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    // Get the file path from the URL
    const paramsValue = await params;
    const filePath = paramsValue.path.join('/');

    // Construct the full path to the file
    const fullPath = path.join(process.cwd(), 'docs', filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Documentation file not found' },
        { status: 404 },
      );
    }

    // Read the file content
    const fileContent = fs.readFileSync(fullPath, 'utf8');

    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'text/plain';

    if (ext === '.md') {
      contentType = 'text/markdown';
    } else if (ext === '.json') {
      contentType = 'application/json';
    } else if (ext === '.html') {
      contentType = 'text/html';
    }

    // Return the file content with appropriate content type
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error serving documentation file:', error);
    return NextResponse.json(
      {
        error: 'Failed to serve documentation file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
