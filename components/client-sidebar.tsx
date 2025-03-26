'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MessageSquare,
  Code,
  Database,
  FileText,
  Share2,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLoading } from './loading-provider';

interface RouteItem {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
  allowedGroups: string[];
}

interface SidebarProps {
  className?: string;
  userInfo: {
    email: string | null;
    name: string | null;
    username: string | null;
    groups: string[];
    isAdmin: boolean;
    isDeveloper: boolean;
    isUser: boolean;
  };
}

export function ClientSidebar({ className, userInfo }: SidebarProps) {
  const pathname = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const { isLoading } = useLoading();

  // Get user groups directly from props
  const userGroups = userInfo.groups || [];

  // Check if audit log is enabled
  const isAuditLogEnabled =
    process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGS === 'true';

  const mainRoutes: RouteItem[] = [
    {
      label: 'Chat',
      description: 'Interact with the AI assistant',
      icon: MessageSquare,
      href: '/chat',
      active: pathname === '/chat' || pathname.startsWith('/chat/'),
      allowedGroups: ['admins', 'developers', 'users'],
    },
    {
      label: 'Workflows',
      description: 'Manage your automation workflows',
      icon: Code,
      href: '/workflows',
      active: pathname === '/workflows' || pathname.startsWith('/workflows/'),
      allowedGroups: ['admins', 'developers'],
    },
    {
      label: 'Data',
      description: 'View and manage your data sources',
      icon: Database,
      href: '/data',
      active: pathname === '/data' || pathname.startsWith('/data/'),
      allowedGroups: ['admins'],
    },
    {
      label: 'Langflow',
      description: 'Build LLM flows visually',
      icon: Share2,
      href: '/langflow',
      active: pathname === '/langflow' || pathname.startsWith('/langflow/'),
      allowedGroups: ['admins'],
    },
  ];

  const bottomRoutes: RouteItem[] = [
    ...(isAuditLogEnabled
      ? [
          {
            label: 'Audit',
            description: 'View activity logs and audit trails',
            icon: FileText,
            href: '/audit',
            active: pathname === '/audit' || pathname.startsWith('/audit/'),
            allowedGroups: ['admins'],
          },
        ]
      : []),
    /*{
      label: 'Settings',
      description: 'Configure application settings',
      icon: Settings,
      href: '/settings',
      active: pathname === '/settings' || pathname.startsWith('/settings/'),
      allowedGroups: ['admins'],
    },*/
  ];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (activeItemRef.current && indicatorRef.current) {
      const activeItem = activeItemRef.current;
      const indicator = indicatorRef.current;

      indicator.style.top = `${activeItem.offsetTop}px`;
      indicator.style.height = `${activeItem.offsetHeight}px`;
    }
  }, [pathname, hasMounted]);

  // Check if user has access to a route
  const hasAccessToRoute = (route: RouteItem) => {
    // If user is in admins group, they can access everything
    if (userGroups.includes('admins')) {
      return true;
    }

    // Check if user has any of the allowed groups for this route
    return userGroups.some((group) => route.allowedGroups.includes(group));
  };

  const renderNavItem = (route: RouteItem, index: number) => {
    // Only render the nav item if user has access to it
    if (!hasAccessToRoute(route)) {
      return null;
    }

    return (
      <Tooltip key={route.href}>
        <TooltipTrigger asChild>
          <Link
            ref={route.active ? activeItemRef : null}
            href={route.href}
            className={cn(
              'flex justify-center items-center rounded-xl p-3 text-sm font-medium relative group z-10',
              'hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]',
              route.active ? 'text-white' : 'text-[#94a3b8] hover:text-white',
            )}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <route.icon className="h-5 w-5 absolute top-0 left-0" />
            </div>
            {route.active && (
              <div className="absolute inset-0 z-[-1] rounded-xl bg-white/10"></div>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[#1e293b]/90 backdrop-blur-md border-0 shadow-[0_0_25px_rgba(15,23,42,0.5)] rounded-xl p-3 animate-in slide-in-from-left-3 duration-300 z-50"
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-white tracking-wide">
              {route.label}
            </span>
            <span className="text-xs text-[#94a3b8] opacity-90">
              {route.description}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      className={cn(
        'relative size-full flex flex-col bg-[#111827] py-4 shadow-md bg-gradient-to-b from-[#111827] to-[#0f172a] overflow-hidden',
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-purple-500/5" />

      <div className="relative flex justify-center py-2">
        <h2 className="text-lg font-semibold text-white [text-shadow:0_0_15px_rgba(255,255,255,0.3)]">
          AI
        </h2>
      </div>
      <Separator className="bg-gradient-to-r from-transparent via-[#34d399]/20 to-transparent backdrop-blur-sm relative" />

      <div className="relative mt-4 flex-1 flex flex-col">
        <div
          ref={indicatorRef}
          className={cn(
            'absolute left-0 w-1.5 rounded-r-md transition-all duration-700 ease-in-out backdrop-blur-sm',
            isLoading
              ? 'animate-pulse-indicator'
              : 'before:absolute before:inset-0 before:animate-pulse-glow before:opacity-60 before:rounded-r-md before:blur-sm',
          )}
          style={{
            background: isLoading
              ? 'linear-gradient(180deg, #9f8bfa, #8b74fa)'
              : 'linear-gradient(180deg, #8b5cf6 0%, #6366f1 45%, #3b82f6 100%)',
            backgroundSize: isLoading ? '100% 200%' : '100% 100%',
            boxShadow: isLoading
              ? '0 0 15px 2px rgba(139, 92, 246, 0.6)'
              : '0 0 15px 1px rgba(139, 92, 246, 0.5)',
          }}
        />

        <TooltipProvider>
          {/* Main navigation items */}
          <nav className="grid gap-4 px-2">
            {mainRoutes.map((route, index) => renderNavItem(route, index))}
          </nav>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Bottom navigation items */}
          <nav className="grid gap-4 px-2 mb-4">
            {bottomRoutes.map((route, index) => renderNavItem(route, index))}
          </nav>
        </TooltipProvider>
      </div>
    </div>
  );
}
