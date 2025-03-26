import { getUserInfo } from '@/actions/user';
import { Sidebar } from '@/components/sidebar';
import { PropsWithChildren } from 'react';

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const userInfo = await getUserInfo();

  // If user is only in the 'users' group (and not in admins or developers),
  // we hide the sidebar completely.
  const showSidebar = userInfo.isAdmin || userInfo.isDeveloper;

  return (
    <div className="flex w-full h-full">
      {showSidebar && (
        <div className="w-16 h-full hidden md:block shrink-0 grow-0">
          <Sidebar />
        </div>
      )}
      <main className="relative shrink grow overflow-auto">{children}</main>
    </div>
  );
}
