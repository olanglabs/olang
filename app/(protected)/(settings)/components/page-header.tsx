import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Markdown from '@/components/markdown';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
  };
  apiDocumentation?: {
    content: string;
    isLoading: boolean;
  };
}

export function PageHeader({
  title,
  description,
  action,
  apiDocumentation,
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 mt-2">
      <div>
        <h1 className="text-xl font-medium">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
          {apiDocumentation && (
            <>
              {' '}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="text-xs text-blue-600 dark:text-blue-400 p-0 h-auto ml-1"
                  >
                    See API documentation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{title} API</DialogTitle>
                    <DialogDescription>
                      Integration details for external monitoring systems
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto pr-1">
                    {apiDocumentation.isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <Markdown content={apiDocumentation.content} />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </p>
      </div>

      {action && (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    'border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors',
                    action.className,
                  )}
                >
                  {action.icon}
                  {action.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
