import { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
  return <div className="mx-auto max-w-7xl px-8 py-4">{children}</div>;
}
