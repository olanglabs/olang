'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';

interface IframeProps extends ComponentProps<'iframe'> {
  iframePathname: string;
}

export function Iframe({
  iframePathname,
  className,
  ...restProps
}: IframeProps) {
  const pathname = usePathname();
  const isActive =
    pathname === iframePathname || pathname.startsWith(`${iframePathname}/`);

  return (
    <iframe
      className={cn(
        'border-0 border-none',
        className,
        !isActive && 'invisible pointer-events-none z-[-9999]',
      )}
      {...restProps}
    />
  );
}
