import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define access control rules for different paths
const ACCESS_RULES = {
  // Chat routes can be accessed by admins, developers, and users
  '/chat': ['admins', 'developers', 'users'],

  // N8N workflows can be accessed by admins and developers
  '/workflows': ['admins', 'developers'],

  // Data management can be accessed by admins only
  '/data': ['admins'],

  // Langflow can be accessed by admins only
  '/langflow': ['admins'],

  // Audit can be accessed by admins only
  '/audit': ['admins'],
};

export function middleware(request: NextRequest) {
  // Get the path from the URL
  const path = request.nextUrl.pathname;

  // Get the user's groups from the Remote-Groups header
  const groupsHeader = request.headers.get('Remote-Groups');
  const userGroups = groupsHeader
    ? groupsHeader.split(',').map((g) => g.trim())
    : [];

  // Check if the user is an admin (admins can access everything)
  if (userGroups.includes('admins')) {
    return NextResponse.next();
  }

  // Find which rule applies to this path
  const matchingPath = Object.keys(ACCESS_RULES).find(
    (rulePath) => path === rulePath || path.startsWith(`${rulePath}/`),
  );

  // If no matching rule, allow access (default allow for non-protected routes)
  if (!matchingPath) {
    return NextResponse.next();
  }

  // Get the allowed groups for this path
  const allowedGroups = ACCESS_RULES[matchingPath as keyof typeof ACCESS_RULES];

  // Check if the user has any of the allowed groups
  const hasAccess = userGroups.some((group) => allowedGroups.includes(group));

  // If user doesn't have access, redirect to the chat page (default accessible page)
  if (!hasAccess) {
    // Redirect to chat page, which all authenticated users can access
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Allow access
  return NextResponse.next();
}

// Configure which paths should be checked by the middleware
export const config = {
  matcher: [
    '/chat/:path*',
    '/workflows/:path*',
    '/data/:path*',
    '/langflow/:path*',
    '/audit/:path*',
  ],
};
