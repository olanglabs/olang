'use server';

import { headers } from 'next/headers';

export async function getUserInfo() {
  const headersList = await headers();

  // Get user information from Authelia headers
  const email = headersList.get('Remote-Email');
  const name = headersList.get('Remote-Name');
  const username = headersList.get('Remote-User');

  // Get groups from header and convert to array
  const groupsHeader = headersList.get('Remote-Groups');

  const groups = groupsHeader
    ? groupsHeader.split(',').map((g: string) => g.trim())
    : [];

  return {
    email,
    name,
    username,
    groups,
    // Include if user is in specific groups for easy access in UI
    isAdmin: groups.includes('admins'),
    isDeveloper: groups.includes('developers'),
    isUser: groups.includes('users'),
  };
}
