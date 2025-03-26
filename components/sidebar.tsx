import { ClientSidebar } from '@/components/client-sidebar';
import { getUserInfo } from '@/actions/user';
import { ComponentProps } from 'react';

export async function Sidebar(
  props: Omit<ComponentProps<typeof ClientSidebar>, 'userInfo'>,
) {
  const userInfo = await getUserInfo();

  return <ClientSidebar userInfo={userInfo} {...props} />;
}
