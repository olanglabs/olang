'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDownAZ, ArrowUpAZ, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortButtonProps {
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
}

export default function SortButton({
  sortOrder,
  onSortChange,
}: SortButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span>Sort</span>
          {sortOrder === 'desc' ? (
            <ArrowDownAZ className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ArrowUpAZ className="h-3.5 w-3.5 ml-1" />
          )}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 ml-0.5 transition-transform duration-200',
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem
          className={cn(
            'flex items-center gap-2',
            sortOrder === 'desc' && 'font-medium',
          )}
          onClick={() => onSortChange('desc')}
        >
          <ArrowDownAZ className="h-4 w-4" />
          <span>Newest first</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            'flex items-center gap-2',
            sortOrder === 'asc' && 'font-medium',
          )}
          onClick={() => onSortChange('asc')}
        >
          <ArrowUpAZ className="h-4 w-4" />
          <span>Oldest first</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
