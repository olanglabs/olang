'use client';

import { useEffect, useState, memo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  ChevronRight,
  Clock,
  Database,
  User,
  Server,
  Code as CodeIcon,
  FileJson,
  Search,
  BarChart4,
  RefreshCcw,
  DownloadCloud,
  Layers,
  Activity,
  Calendar,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Markdown from '@/components/markdown'; // Import our Markdown component
import Code from '@/components/ui/code'; // Import Code for other usage
import SortButton from './components/sort-button';
import { getAuditLogs } from '@/actions/audit';
import {
  AuditLogEntry,
  AuditResponse,
  AuditStatistics,
  ChatMessage,
} from '@/app/(protected)/(settings)/audit/types';
import { PageHeader } from '../components/page-header';

function urlToPathname(url: string) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    return url;
  }
}

// Define props interface for the memoized component
interface LogContentProps {
  log: AuditLogEntry;
  copiedItems: Record<string, boolean>;
  copyToClipboard: (text: string, label: string, itemId: string) => void;
  formatTimestamp: (timestamp: number) => string;
  formatChatTime: (timestamp: number) => string;
  hasDisplayableMessages: (log: AuditLogEntry) => boolean;
  parseJsonString: (jsonString: string) => any;
  formatJsonValue: (value: any, nested?: boolean) => React.ReactNode;
  getStatusColor: (statusCode: number) => string;
}

// Add a memoized collapsible content component to reduce re-renders
const MemoizedLogContent = memo(
  ({
    log,
    copiedItems,
    copyToClipboard,
    formatTimestamp,
    formatChatTime,
    hasDisplayableMessages,
    parseJsonString,
    formatJsonValue,
    getStatusColor,
  }: LogContentProps) => (
    <CollapsibleContent className="px-4 pb-4 pt-2 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50">
      <div className="space-y-3 pt-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/30">
            <div className="flex items-start">
              <User className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 mr-2" />
              <div className="flex-1">
                <div className="font-medium text-sm mb-1.5">User</div>
                <div className="mt-1 text-sm font-medium">
                  {log.user?.name || 'Anonymous'}
                </div>
                {log.user?.email && (
                  <div
                    className="text-xs text-muted-foreground mt-1 truncate border-t border-gray-100 dark:border-gray-700/30 pt-1.5 mt-1.5"
                    title={log.user.email}
                  >
                    {log.user.email}
                  </div>
                )}
                {log.user?.role && (
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {log.user.role}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/30">
            <div className="flex items-start">
              <Server className="h-4 w-4 mt-0.5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <div className="flex-1">
                <div className="font-medium text-sm mb-1.5">Source</div>
                <div className="mt-1 flex items-center">
                  <span className="font-mono text-sm bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                    {log.source_ip}
                  </span>
                </div>
                {log.user_agent && (
                  <div
                    className="text-xs text-muted-foreground mt-2 line-clamp-2 hover:line-clamp-none transition-all cursor-help border-t border-gray-100 dark:border-gray-700/30 pt-1.5"
                    title={log.user_agent}
                  >
                    {log.user_agent}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-700/30">
            <div className="flex items-start">
              <Clock className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 mr-2" />
              <div className="flex-1">
                <div className="font-medium text-sm mb-1.5">Timestamp</div>
                <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                  {formatTimestamp(log.timestamp)}
                </div>
                {log.chat_content?.model && (
                  <div className="text-xs text-muted-foreground mt-2 flex items-center border-t border-gray-100 dark:border-gray-700/30 pt-1.5">
                    <span>Model:</span>
                    <Badge
                      variant="outline"
                      className="text-xs ml-1.5 py-0 px-1.5"
                    >
                      {log.chat_content.model.split('/').pop()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(() => {
            if (!log.request_object) {
              return false;
            }

            try {
              const reqObj = JSON.parse(log.request_object);

              return !!reqObj.prompt;
            } catch {}

            return false;
          })() && (
            <div className="bg-white dark:bg-gray-800/50 p-3 rounded-md shadow-sm col-span-full">
              <div className="flex items-start">
                <Search className="h-4 w-4 mt-0.5 text-blue-500 mr-2" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Query</div>
                  <div className="mt-1 text-sm bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded-md">
                    {JSON.parse(log.request_object).prompt}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Show either chat visualization or JSON data */}
        {(() => {
          // Check if this log has chat content worth displaying
          const hasChatContent = (log: AuditLogEntry) => {
            if (!log.chat_content) return false;

            // Check for messages array
            if (
              log.chat_content.messages &&
              Array.isArray(log.chat_content.messages) &&
              log.chat_content.messages.length > 0
            ) {
              return true;
            }

            // Check for userMessage/aiResponse
            if (log.chat_content.userMessage || log.chat_content.aiResponse) {
              return true;
            }

            // If request_uri contains certain chat-related endpoints
            if (
              log.request_uri.includes('/api/chat') ||
              log.request_uri.includes('/api/completion')
            ) {
              return true;
            }

            return false;
          };

          // Additional check to determine if this is a regular conversation
          const isActualChatConversation = () => {
            if (!log.chat_content) return false;

            // Check if there are messages and they look like a conversation
            if (
              log.chat_content.messages &&
              log.chat_content.messages.length > 1
            ) {
              const hasUserMessage = log.chat_content.messages.some(
                (msg: ChatMessage) => msg.role === 'user',
              );
              const hasAssistantMessage = log.chat_content.messages.some(
                (msg: ChatMessage) => msg.role === 'assistant',
              );
              return hasUserMessage && hasAssistantMessage;
            }

            // Check if there's at least a user message and AI response
            return (
              !!log.chat_content.userMessage && !!log.chat_content.aiResponse
            );
          };

          // Sort messages by timestamp (newest first) and extract the latest two
          const sortedMessages = (log.chat_content?.messages || []).sort(
            (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
          );
          const [firstMessage, secondMessage, ...olderMessages] =
            sortedMessages;

          if (hasChatContent(log)) {
            return (
              <>
                {/* Chat interface */}
                {log.chat_content ? (
                  <div className="rounded-md bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm mt-3">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center font-medium text-sm gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />{' '}
                        Chat
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                          >
                            <CodeIcon className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>JSON Data</DialogTitle>
                            <DialogDescription>
                              Raw request and response data
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <div className="text-sm font-medium mb-1">
                                Request Object
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-md overflow-auto max-h-60">
                                <Code language="json" showLineNumbers={true}>
                                  {JSON.stringify(
                                    parseJsonString(log.request_object),
                                    null,
                                    2,
                                  )}
                                </Code>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">
                                Response Object
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-md overflow-auto max-h-60">
                                <Code language="json" showLineNumbers={true}>
                                  {JSON.stringify(
                                    parseJsonString(log.response_object),
                                    null,
                                    2,
                                  )}
                                </Code>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="p-3">
                      {hasDisplayableMessages(log) &&
                      log.chat_content.messages ? (
                        <div className="space-y-3">
                          {/* View older messages collapsible section first */}
                          {olderMessages.length > 0 && (
                            <Collapsible className="w-full mb-3">
                              <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                                <CollapsibleTrigger className="mx-4 group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all"
                                    asChild
                                  >
                                    <div className="flex items-center px-3 gap-2">
                                      <ChevronDown className="h-3 w-3 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180" />
                                      <span className="text-muted-foreground group-data-[state=open]:text-foreground transition-colors duration-200">
                                        {olderMessages.length} older messages
                                      </span>
                                    </div>
                                  </Button>
                                </CollapsibleTrigger>
                                <div className="flex-grow border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                              </div>

                              <CollapsibleContent className="space-y-3 animate-accordion-down">
                                {olderMessages.map((message, msgIndex) => (
                                  <div
                                    key={`${log.id}-msg-${msgIndex}`}
                                    className="flex gap-2"
                                  >
                                    <div
                                      className={cn(
                                        'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
                                        message.role === 'user'
                                          ? 'bg-blue-100 dark:bg-blue-900'
                                          : message.role === 'assistant'
                                            ? 'bg-purple-100 dark:bg-purple-900'
                                            : message.role === 'function'
                                              ? 'bg-green-100 dark:bg-green-900'
                                              : 'bg-gray-100 dark:bg-gray-900',
                                      )}
                                    >
                                      {message.role === 'user' ? (
                                        <User className="h-3 w-3 text-blue-700 dark:text-blue-300" />
                                      ) : message.role === 'assistant' ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-purple-700 dark:text-purple-300"
                                        >
                                          <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16"></path>
                                          <path d="M9 22h9a2 2 0 0 0 2-2v-5l-9-9"></path>
                                          <path d="m13 13 9 9"></path>
                                        </svg>
                                      ) : message.role === 'function' ? (
                                        <CodeIcon className="h-3 w-3 text-green-700 dark:text-green-300" />
                                      ) : (
                                        <Info className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div
                                        className={cn(
                                          'rounded-md text-sm p-2',
                                          message.role === 'user'
                                            ? 'bg-blue-50 dark:bg-blue-900/30'
                                            : message.role === 'assistant'
                                              ? message.content.startsWith(
                                                  'Search completion:',
                                                )
                                                ? 'bg-amber-50 dark:bg-amber-900/30'
                                                : message.content.startsWith(
                                                      'Function call:',
                                                    )
                                                  ? 'bg-indigo-50 dark:bg-indigo-900/30 font-mono'
                                                  : 'bg-purple-50 dark:bg-purple-900/30'
                                              : message.role === 'function'
                                                ? 'bg-green-50 dark:bg-green-900/30 font-mono'
                                                : 'bg-gray-50 dark:bg-gray-800',
                                        )}
                                      >
                                        {message.role === 'assistant' &&
                                        !message.content.startsWith(
                                          'Search completion:',
                                        ) &&
                                        !message.content.startsWith(
                                          'Function call:',
                                        ) ? (
                                          <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <Markdown
                                              content={message.content}
                                            />
                                          </div>
                                        ) : (
                                          <div className="whitespace-pre-wrap">
                                            {message.content}
                                          </div>
                                        )}
                                      </div>
                                      {message.timestamp && (
                                        <div className="text-xs text-muted-foreground mt-1 text-right">
                                          {formatChatTime(message.timestamp)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {/* Divider line to separate older messages from newer ones */}
                          {olderMessages.length > 0 && (
                            <div className="relative flex items-center py-2 mb-3">
                              <div className="flex-grow border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                              <div className="mx-4 text-xs text-muted-foreground px-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                Recent Messages
                              </div>
                              <div className="flex-grow border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                            </div>
                          )}

                          {/* First message (latest message) */}
                          {firstMessage && (
                            <div className="flex gap-2">
                              <div
                                className={cn(
                                  'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
                                  firstMessage.role === 'user'
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : firstMessage.role === 'assistant'
                                      ? 'bg-purple-100 dark:bg-purple-900'
                                      : firstMessage.role === 'function'
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-gray-100 dark:bg-gray-900',
                                )}
                              >
                                {firstMessage.role === 'user' ? (
                                  <User className="h-3 w-3 text-blue-700 dark:text-blue-300" />
                                ) : firstMessage.role === 'assistant' ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-purple-700 dark:text-purple-300"
                                  >
                                    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16"></path>
                                    <path d="M9 22h9a2 2 0 0 0 2-2v-5l-9-9"></path>
                                    <path d="m13 13 9 9"></path>
                                  </svg>
                                ) : firstMessage.role === 'function' ? (
                                  <CodeIcon className="h-3 w-3 text-green-700 dark:text-green-300" />
                                ) : (
                                  <Info className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div
                                  className={cn(
                                    'rounded-md text-sm p-2',
                                    firstMessage.role === 'user'
                                      ? 'bg-blue-50 dark:bg-blue-900/30'
                                      : firstMessage.role === 'assistant'
                                        ? firstMessage.content.startsWith(
                                            'Search completion:',
                                          )
                                          ? 'bg-amber-50 dark:bg-amber-900/30'
                                          : firstMessage.content.startsWith(
                                                'Function call:',
                                              )
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 font-mono'
                                            : 'bg-purple-50 dark:bg-purple-900/30'
                                        : firstMessage.role === 'function'
                                          ? 'bg-green-50 dark:bg-green-900/30 font-mono'
                                          : 'bg-gray-50 dark:bg-gray-800',
                                  )}
                                >
                                  {firstMessage.role === 'assistant' &&
                                  !firstMessage.content.startsWith(
                                    'Search completion:',
                                  ) &&
                                  !firstMessage.content.startsWith(
                                    'Function call:',
                                  ) ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <Markdown
                                        content={firstMessage.content}
                                      />
                                    </div>
                                  ) : (
                                    <div className="whitespace-pre-wrap">
                                      {firstMessage.content}
                                    </div>
                                  )}
                                </div>
                                {firstMessage.timestamp && (
                                  <div className="text-xs text-muted-foreground mt-1 text-right">
                                    {formatChatTime(firstMessage.timestamp)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Second message (second latest) */}
                          {secondMessage && (
                            <div className="flex gap-2">
                              <div
                                className={cn(
                                  'h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0',
                                  secondMessage.role === 'user'
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : secondMessage.role === 'assistant'
                                      ? 'bg-purple-100 dark:bg-purple-900'
                                      : secondMessage.role === 'function'
                                        ? 'bg-green-100 dark:bg-green-900'
                                        : 'bg-gray-100 dark:bg-gray-900',
                                )}
                              >
                                {secondMessage.role === 'user' ? (
                                  <User className="h-3 w-3 text-blue-700 dark:text-blue-300" />
                                ) : secondMessage.role === 'assistant' ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-purple-700 dark:text-purple-300"
                                  >
                                    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16"></path>
                                    <path d="M9 22h9a2 2 0 0 0 2-2v-5l-9-9"></path>
                                    <path d="m13 13 9 9"></path>
                                  </svg>
                                ) : secondMessage.role === 'function' ? (
                                  <CodeIcon className="h-3 w-3 text-green-700 dark:text-green-300" />
                                ) : (
                                  <Info className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div
                                  className={cn(
                                    'rounded-md text-sm p-2',
                                    secondMessage.role === 'user'
                                      ? 'bg-blue-50 dark:bg-blue-900/30'
                                      : secondMessage.role === 'assistant'
                                        ? secondMessage.content.startsWith(
                                            'Search completion:',
                                          )
                                          ? 'bg-amber-50 dark:bg-amber-900/30'
                                          : secondMessage.content.startsWith(
                                                'Function call:',
                                              )
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 font-mono'
                                            : 'bg-purple-50 dark:bg-purple-900/30'
                                        : secondMessage.role === 'function'
                                          ? 'bg-green-50 dark:bg-green-900/30 font-mono'
                                          : 'bg-gray-50 dark:bg-gray-800',
                                  )}
                                >
                                  {secondMessage.role === 'assistant' &&
                                  !secondMessage.content.startsWith(
                                    'Search completion:',
                                  ) &&
                                  !secondMessage.content.startsWith(
                                    'Function call:',
                                  ) ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <Markdown
                                        content={secondMessage.content}
                                      />
                                    </div>
                                  ) : (
                                    <div className="whitespace-pre-wrap">
                                      {secondMessage.content}
                                    </div>
                                  )}
                                </div>
                                {secondMessage.timestamp && (
                                  <div className="text-xs text-muted-foreground mt-1 text-right">
                                    {formatChatTime(secondMessage.timestamp)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Simple view for non-message content
                        <div className="space-y-3">
                          {/* Show AI response if available */}
                          {log.chat_content.aiResponse && (
                            <div className="flex gap-2">
                              <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-purple-700 dark:text-purple-300"
                                >
                                  <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16"></path>
                                  <path d="M9 22h9a2 2 0 0 0 2-2v-5l-9-9"></path>
                                  <path d="m13 13 9 9"></path>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-md text-sm p-2">
                                  {log.chat_content.aiResponse.startsWith(
                                    'Search completion:',
                                  ) ? (
                                    <div className="whitespace-pre-wrap">
                                      {log.chat_content.aiResponse}
                                    </div>
                                  ) : (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <Markdown
                                        content={log.chat_content.aiResponse}
                                      />
                                    </div>
                                  )}
                                </div>
                                {log.timestamp && (
                                  <div className="text-xs text-muted-foreground mt-1 text-right">
                                    {formatChatTime(log.timestamp)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            );
          } else {
            // Display request/response JSON visualization for non-chat logs
            return (
              <>
                {/* Request Data Visualization */}
                <div className="rounded-md bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm mt-3">
                  <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center font-medium text-sm">
                      <CodeIcon className="h-4 w-4 mr-2 text-green-500" />
                      Request Data
                    </div>
                  </div>
                  <div className="overflow-auto max-h-60">
                    <Code language="json" showLineNumbers={true}>
                      {JSON.stringify(
                        parseJsonString(log.request_object),
                        null,
                        2,
                      )}
                    </Code>
                  </div>
                </div>

                {/* Response Data Visualization */}
                {log.response_object && (
                  <div className="rounded-md bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm mt-3">
                    <div className="flex items-center px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center font-medium text-sm">
                        <FileJson className="h-4 w-4 mr-2 text-purple-500" />
                        Response Data
                      </div>
                    </div>
                    <div className="overflow-auto max-h-60">
                      <Code language="json" showLineNumbers={true}>
                        {JSON.stringify(
                          parseJsonString(log.response_object),
                          null,
                          2,
                        )}
                      </Code>
                    </div>
                  </div>
                )}
              </>
            );
          }
        })()}
      </div>
    </CollapsibleContent>
  ),
);

// Interface for LogCard component
interface LogCardProps {
  log: AuditLogEntry;
  copiedItems: Record<string, boolean>;
  copyToClipboard: (text: string, label: string, itemId: string) => void;
  formatTimestamp: (timestamp: number) => string;
  formatChatTime: (timestamp: number) => string;
  hasDisplayableMessages: (log: AuditLogEntry) => boolean;
  parseJsonString: (jsonString: string) => any;
  formatJsonValue: (value: any, nested?: boolean) => React.ReactNode;
  getStatusColor: (statusCode: number) => string;
  getVerbColor: (verb: string) => string;
  urlToPathname: (url: string) => string;
}

// Create a simple LogCard component with its own local state
const LogCard = memo(
  ({
    log,
    copiedItems,
    copyToClipboard,
    formatTimestamp,
    formatChatTime,
    hasDisplayableMessages,
    parseJsonString,
    formatJsonValue,
    getStatusColor,
    getVerbColor,
    urlToPathname,
  }: LogCardProps) => {
    // Local state for this card only
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="opacity-100 mb-3">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => setIsExpanded((prev) => !prev)}
          className="bg-white dark:bg-gray-800/90 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-md"
        >
          <CollapsibleTrigger asChild>
            <div className="w-full text-left cursor-pointer">
              <div className="flex w-full justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono text-xs py-0.5 px-1.5 rounded-md border',
                        getVerbColor(log.verb),
                      )}
                    >
                      {log.verb}
                    </Badge>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-sm truncate">
                      {urlToPathname(log.request_uri.split('?')[0])}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {log.user?.name || 'Anonymous'} •{' '}
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {log.chat_content?.messageType && (
                    <Badge
                      variant="outline"
                      className="text-xs py-0 px-1.5 rounded-md border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/60"
                    >
                      {log.chat_content.messageType}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-mono text-xs py-0 px-1.5 rounded-md border',
                      getStatusColor(log.response_status_code),
                    )}
                  >
                    {log.response_status_code}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CodeIcon className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Log Data</DialogTitle>
                        <DialogDescription>
                          Complete log entry data
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-1">
                            Full Log Entry
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-md overflow-auto max-h-[60vh]">
                            <Code language="json" showLineNumbers={true}>
                              {JSON.stringify(log, null, 2)}
                            </Code>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      isExpanded && 'rotate-90',
                    )}
                  />
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          {isExpanded && (
            <MemoizedLogContent
              log={log}
              copiedItems={copiedItems}
              copyToClipboard={copyToClipboard}
              formatTimestamp={formatTimestamp}
              formatChatTime={formatChatTime}
              hasDisplayableMessages={hasDisplayableMessages}
              parseJsonString={parseJsonString}
              formatJsonValue={formatJsonValue}
              getStatusColor={getStatusColor}
            />
          )}
        </Collapsible>
      </div>
    );
  },
);

export default function ClientAuditPage() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    statusCode: 'all',
    method: 'all',
    user: '',
    dateRange: 'today',
    severity: 'all',
  });
  // Add state to track filter changes
  const [initialFilterState, setInitialFilterState] = useState({
    statusCode: 'all',
    method: 'all',
    user: '',
    dateRange: 'today',
    severity: 'all',
  });
  // Add state for the API documentation markdown content
  const [apiDocumentation, setApiDocumentation] = useState<string>('');
  const [apiDocLoading, setApiDocLoading] = useState(false);

  // Function to load the API documentation markdown
  const loadApiDocumentation = async () => {
    try {
      setApiDocLoading(true);
      const response = await fetch('/docs/api/audit-logs/index.md');
      if (response.ok) {
        const markdown = await response.text();
        setApiDocumentation(markdown);
      } else {
        console.error('Failed to load API documentation');
      }
    } catch (error) {
      console.error('Error loading API documentation:', error);
    } finally {
      setApiDocLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);

      // Use the server action instead of fetch
      const data = await getAuditLogs();
      setAuditData(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch audit logs',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    // Preload the documentation when component mounts
    loadApiDocumentation();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAuditLogs();
  };

  // Format timestamps for display
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return 'N/A';

    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    return new Intl.DateTimeFormat(
      navigator.language || 'en-US',
      options,
    ).format(date);
  };

  // Format chat message timestamps in a more compact format
  const formatChatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    // For today's messages, show only time
    if (isToday) {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // For older messages, include the date
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode < 200)
      return 'bg-blue-500/10 text-blue-700 border-blue-500/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/60';
    if (statusCode < 300)
      return 'bg-green-500/10 text-green-700 border-green-500/50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60';
    if (statusCode < 400)
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/60';
    if (statusCode < 500)
      return 'bg-red-500/10 text-red-700 border-red-500/50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/60';
    return 'bg-purple-500/10 text-purple-700 border-purple-500/50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/60';
  };

  const getVerbColor = (verb: string) => {
    switch (verb.toUpperCase()) {
      case 'GET':
        return 'bg-green-500/10 text-green-700 border-green-500/50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60';
      case 'POST':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/60';
      case 'PUT':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/60';
      case 'DELETE':
        return 'bg-red-500/10 text-red-700 border-red-500/50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/60';
      case 'PATCH':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/60';
      case 'OPTIONS':
        return 'bg-teal-500/10 text-teal-700 border-teal-500/50 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/60';
      case 'HEAD':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/50 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/60';
      case 'CONNECT':
        return 'bg-pink-500/10 text-pink-700 border-pink-500/50 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/60';
      case 'TRACE':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/50 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/60';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/50 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/60';
    }
  };

  const parseJsonString = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return jsonString;
    }
  };

  // Helper function to check if a log entry has displayable chat messages
  const hasDisplayableMessages = (log: AuditLogEntry) => {
    if (!log.chat_content) return false;

    // Check if there are messages array and it has content
    if (
      log.chat_content.messages &&
      Array.isArray(log.chat_content.messages) &&
      log.chat_content.messages.length > 0 &&
      log.chat_content.messages.every((msg) => msg.content && msg.role)
    ) {
      return true;
    }

    return false;
  };

  const copyToClipboard = (text: string, label: string, itemId: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Set this specific item as copied
        setCopiedItems((prev) => ({ ...prev, [itemId]: true }));

        // Reset the copied state after animation completes
        setTimeout(() => {
          setCopiedItems((prev) => ({ ...prev, [itemId]: false }));
        }, 1500);

        toast({
          title: 'Copied to clipboard',
          description: `${label} has been copied to clipboard`,
          duration: 2000,
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Copy failed',
          description: 'Could not copy to clipboard',
          variant: 'destructive',
          duration: 2000,
        });
      },
    );
  };

  const renderStatisticsOverview = () => {
    if (!auditData?.statistics) return null;

    const stats = auditData.statistics;

    // Sort data for charts
    const sortedStatusCodes = Object.entries(stats.requestsByStatusCode).sort(
      ([codeA], [codeB]) => parseInt(codeA) - parseInt(codeB),
    );

    const sortedModels = Object.entries(stats.requestsByModel).sort(
      ([, countA], [, countB]) => countB - countA,
    );

    const sortedEndpoints = Object.entries(stats.requestsByEndpoint).sort(
      ([, countA], [, countB]) => countB - countA,
    );

    const sortedVerbs = Object.entries(stats.requestsByVerb).sort(
      ([, countA], [, countB]) => countB - countA,
    );

    const MotionCard = motion(Card);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-blue-100 dark:border-blue-900/30 shadow-sm"
          >
            <CardHeader className="pb-2 border-b border-blue-100/50 dark:border-blue-900/30">
              <CardTitle className="text-sm font-medium flex items-center text-blue-800 dark:text-blue-300">
                <Database className="h-4 w-4 mr-2 text-blue-500" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-50">
                {stats.totalEntries.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-blue-600/80 dark:text-blue-400/80 mt-2">
                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>{stats.uniqueUsers} unique users</span>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={cn(
              'overflow-hidden shadow-sm bg-gradient-to-br border',
              stats.errorRate > 20
                ? 'from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-100 dark:border-red-900/30'
                : 'from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900/30',
            )}
          >
            <CardHeader
              className={cn(
                'pb-2 border-b',
                stats.errorRate > 20
                  ? 'border-red-100/50 dark:border-red-900/30'
                  : 'border-green-100/50 dark:border-green-900/30',
              )}
            >
              <CardTitle
                className={cn(
                  'text-sm font-medium flex items-center',
                  stats.errorRate > 20
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-green-800 dark:text-green-300',
                )}
              >
                <Activity
                  className={cn(
                    'h-4 w-4 mr-2',
                    stats.errorRate > 20 ? 'text-red-500' : 'text-green-500',
                  )}
                />
                Error Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div
                  className={cn(
                    'text-3xl font-bold',
                    stats.errorRate > 20
                      ? 'text-red-900 dark:text-red-50'
                      : 'text-green-900 dark:text-green-50',
                  )}
                >
                  {stats.errorRate.toFixed(1)}%
                </div>
                {stats.errorRate > 20 ? (
                  <AlertCircle className="ml-2 h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                )}
              </div>
              <Progress
                value={100 - stats.errorRate}
                className="h-1.5 mt-3"
                indicatorClassName={
                  stats.errorRate > 20 ? 'bg-red-500' : 'bg-green-500'
                }
              />
              <p
                className={cn(
                  'text-xs mt-2',
                  stats.errorRate > 20
                    ? 'text-red-600/80 dark:text-red-400/80'
                    : 'text-green-600/80 dark:text-green-400/80',
                )}
              >
                Based on HTTP status codes
              </p>
            </CardContent>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="overflow-hidden shadow-sm bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border border-purple-100 dark:border-purple-900/30"
          >
            <CardHeader className="pb-2 border-b border-purple-100/50 dark:border-purple-900/30">
              <CardTitle className="text-sm font-medium flex items-center text-purple-800 dark:text-purple-300">
                <Layers className="h-4 w-4 mr-2 text-purple-500" />
                HTTP Verbs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {sortedVerbs.slice(0, 4).map(([verb, count]) => (
                <div
                  key={verb}
                  className="flex items-center justify-between group"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      getVerbColor(verb),
                      'transition-all group-hover:shadow-sm',
                    )}
                  >
                    {verb}
                  </Badge>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-50">
                      {count}
                    </span>
                    <span className="text-xs text-purple-600/80 dark:text-purple-400/80 ml-1">
                      ({Math.round((count / stats.totalEntries) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="overflow-hidden shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border border-amber-100 dark:border-amber-900/30"
          >
            <CardHeader className="pb-2 border-b border-amber-100/50 dark:border-amber-900/30">
              <CardTitle className="text-sm font-medium flex items-center text-amber-800 dark:text-amber-300">
                <BarChart4 className="h-4 w-4 mr-2 text-amber-500" />
                Status Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {sortedStatusCodes.slice(0, 4).map(([code, count]) => (
                <div
                  key={code}
                  className="flex justify-between items-center group"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      getStatusColor(parseInt(code)),
                      'transition-all group-hover:shadow-sm',
                    )}
                  >
                    {code}
                  </Badge>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-50">
                      {count}
                    </span>
                    <span className="text-xs text-amber-600/80 dark:text-amber-400/80 ml-1">
                      ({Math.round((count / stats.totalEntries) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </MotionCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-800/80">
              <CardTitle className="text-base font-medium flex items-center">
                <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                Top Endpoints
              </CardTitle>
              <CardDescription>
                Most frequently accessed API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {sortedEndpoints.slice(0, 5).map(([endpoint, count], index) => (
                  <div key={endpoint} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted w-5 h-5 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span
                          className="text-sm font-medium truncate max-w-[300px]"
                          title={endpoint}
                        >
                          {endpoint}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        {count} requests
                      </Badge>
                    </div>
                    <Progress
                      value={Math.round((count / sortedEndpoints[0][1]) * 100)}
                      className="h-1.5 mt-2"
                      indicatorClassName="bg-blue-500/80"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            {sortedEndpoints.length > 5 && (
              <CardFooter className="border-t border-gray-100 dark:border-gray-800/80 py-2.5 flex justify-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  Show all ({sortedEndpoints.length})
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            )}
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-800/80">
              <CardTitle className="text-base font-medium flex items-center">
                <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                Top Models
              </CardTitle>
              <CardDescription>Most frequently used AI models</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-4">
                {sortedModels.slice(0, 5).map(([model, count], index) => (
                  <div key={model} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted w-5 h-5 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span
                          className="text-sm font-medium truncate max-w-[300px]"
                          title={model}
                        >
                          {model.split('/').pop()}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        {count} requests
                      </Badge>
                    </div>
                    <Progress
                      value={Math.round((count / sortedModels[0][1]) * 100)}
                      className="h-1.5 mt-2"
                      indicatorClassName="bg-purple-500/80"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            {sortedModels.length > 5 && (
              <CardFooter className="border-t border-gray-100 dark:border-gray-800/80 py-2.5 flex justify-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  Show all ({sortedModels.length})
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            )}
          </MotionCard>
        </div>
      </div>
    );
  };

  // Get filtered logs based on search and filter options
  const getFilteredLogs = () => {
    if (!auditData) return [];

    let filtered = [...auditData.logs]; // Make a copy to avoid modifying original

    // Sort logs based on timestamp
    filtered.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.timestamp - a.timestamp;
      } else {
        return a.timestamp - b.timestamp;
      }
    });

    // Apply search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase().trim();

      // Check if this is a field-specific search using syntax field:value
      const fieldSearchMatch = lowerCaseSearch.match(/^([a-z_]+):(.+)$/);

      if (fieldSearchMatch) {
        const [, field, value] = fieldSearchMatch;
        const searchValue = value.trim();

        filtered = filtered.filter((log) => {
          switch (field) {
            case 'status':
            case 'code':
              return String(log.response_status_code).includes(searchValue);
            case 'user':
              return log.user?.name?.toLowerCase().includes(searchValue);
            case 'email':
              return log.user?.email?.toLowerCase().includes(searchValue);
            case 'ip':
              return log.source_ip.toLowerCase().includes(searchValue);
            case 'method':
            case 'verb':
              return log.verb.toLowerCase().includes(searchValue);
            case 'uri':
            case 'endpoint':
            case 'path':
              return log.request_uri.toLowerCase().includes(searchValue);
            case 'message':
              // Search only in message content
              if (
                log.chat_content?.messages &&
                Array.isArray(log.chat_content.messages)
              ) {
                return log.chat_content.messages.some(
                  (msg) =>
                    msg.content &&
                    msg.content.toLowerCase().includes(searchValue),
                );
              }
              return false;
            case 'request':
              // Search in request object
              try {
                const requestObj = JSON.parse(log.request_object);
                return JSON.stringify(requestObj)
                  .toLowerCase()
                  .includes(searchValue);
              } catch {
                return log.request_object.toLowerCase().includes(searchValue);
              }
            case 'response':
              // Search in response object
              try {
                const responseObj = JSON.parse(log.response_object);
                return JSON.stringify(responseObj)
                  .toLowerCase()
                  .includes(searchValue);
              } catch {
                return log.response_object.toLowerCase().includes(searchValue);
              }
            default:
              // If the field doesn't match any known field, do a global search
              return searchInAllFields(log, searchValue);
          }
        });
      } else {
        // Global search across all fields
        filtered = filtered.filter((log) =>
          searchInAllFields(log, lowerCaseSearch),
        );
      }
    }

    // Helper function to search through all relevant fields of a log entry
    function searchInAllFields(
      log: AuditLogEntry,
      searchValue: string,
    ): boolean {
      // Search in basic fields
      if (
        log.request_uri.toLowerCase().includes(searchValue) ||
        String(log.response_status_code).includes(searchValue) ||
        log.verb.toLowerCase().includes(searchValue) ||
        log.source_ip.toLowerCase().includes(searchValue) ||
        log.user_agent?.toLowerCase().includes(searchValue) ||
        log.user?.name?.toLowerCase().includes(searchValue) ||
        log.user?.email?.toLowerCase().includes(searchValue) ||
        log.audit_level?.toLowerCase().includes(searchValue)
      ) {
        return true;
      }

      // Search in chat messages
      if (
        log.chat_content?.messages &&
        Array.isArray(log.chat_content.messages)
      ) {
        if (
          log.chat_content.messages.some(
            (msg) =>
              msg.content && msg.content.toLowerCase().includes(searchValue),
          )
        ) {
          return true;
        }
      }

      // Search in old chat format fields
      if (
        (log.chat_content?.userMessage &&
          log.chat_content.userMessage.toLowerCase().includes(searchValue)) ||
        (log.chat_content?.aiResponse &&
          log.chat_content.aiResponse.toLowerCase().includes(searchValue)) ||
        (log.chat_content?.model &&
          log.chat_content.model.toLowerCase().includes(searchValue))
      ) {
        return true;
      }

      // Search in request object (try to parse JSON)
      try {
        const requestObj = JSON.parse(log.request_object);
        if (JSON.stringify(requestObj).toLowerCase().includes(searchValue)) {
          return true;
        }
      } catch (e) {
        // If parsing fails, search the raw string
        if (log.request_object.toLowerCase().includes(searchValue)) {
          return true;
        }
      }

      // Search in response object (try to parse JSON)
      try {
        const responseObj = JSON.parse(log.response_object);
        if (JSON.stringify(responseObj).toLowerCase().includes(searchValue)) {
          return true;
        }
      } catch (e) {
        // If parsing fails, search the raw string
        if (log.response_object.toLowerCase().includes(searchValue)) {
          return true;
        }
      }

      return false;
    }

    // Apply additional filters
    if (filterOptions.statusCode !== 'all') {
      filtered = filtered.filter((log) =>
        String(log.response_status_code).startsWith(filterOptions.statusCode),
      );
    }

    if (filterOptions.method !== 'all') {
      filtered = filtered.filter(
        (log) => log.verb.toUpperCase() === filterOptions.method,
      );
    }

    if (filterOptions.user) {
      filtered = filtered.filter(
        (log) =>
          (log.user?.name &&
            log.user.name
              .toLowerCase()
              .includes(filterOptions.user.toLowerCase())) ||
          (log.user?.email &&
            log.user.email
              .toLowerCase()
              .includes(filterOptions.user.toLowerCase())),
      );
    }

    if (filterOptions.severity !== 'all') {
      filtered = filtered.filter((log) => {
        if (filterOptions.severity === 'error') {
          return log.response_status_code >= 400;
        } else if (filterOptions.severity === 'warning') {
          return (
            log.response_status_code >= 300 && log.response_status_code < 400
          );
        } else if (filterOptions.severity === 'success') {
          return log.response_status_code < 300;
        }
        return true;
      });
    }

    return filtered;
  };

  // Get the paginated logs
  const getPaginatedLogs = () => {
    const filtered = getFilteredLogs();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const total = getFilteredLogs().length;
    return Math.ceil(total / itemsPerPage);
  };

  // Change page
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // Change items per page
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle sort order change
  const handleSortChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
  };

  // Handle export logs to CSV
  const exportLogs = () => {
    const filteredLogs = getFilteredLogs();

    if (filteredLogs.length === 0) {
      toast({
        title: 'No logs to export',
        description: 'There are no logs matching your filter criteria',
        variant: 'destructive',
      });
      return;
    }

    // Create CSV header
    const headers = [
      'ID',
      'Timestamp',
      'User',
      'Email',
      'Method',
      'Endpoint',
      'Status',
      'Source IP',
      'Audit Level',
    ];

    // Map logs to CSV rows
    const rows = filteredLogs.map((log) => [
      log.id,
      formatTimestamp(log.timestamp),
      log.user?.name || 'Anonymous',
      log.user?.email || 'N/A',
      log.verb,
      log.request_uri,
      log.response_status_code,
      log.source_ip,
      log.audit_level || 'Standard',
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export successful',
      description: `Exported ${filteredLogs.length} logs to CSV`,
      duration: 3000,
    });
  };

  // Reset filters function
  const resetFilters = () => {
    setFilterOptions({
      statusCode: 'all',
      method: 'all',
      user: '',
      dateRange: 'today',
      severity: 'all',
    });
    setSearchTerm('');
  };

  // Count active filters
  const countActiveFilters = () => {
    return [
      filterOptions.statusCode !== 'all' ? 1 : 0,
      filterOptions.method !== 'all' ? 1 : 0,
      filterOptions.user ? 1 : 0,
      filterOptions.severity !== 'all' ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
  };

  const formatJsonValue = (value: any, nested = false) => {
    if (value === null) return <span className="text-gray-500">null</span>;

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-500">[]</span>;
      return (
        <div className={nested ? 'pl-4' : ''}>
          <span className="text-gray-500">[</span>
          <div className="pl-4">
            {value.map((item, index) => (
              <div key={index}>
                {formatJsonValue(item, true)}
                {index < value.length - 1 && (
                  <span className="text-gray-500">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-gray-500">]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0)
        return <span className="text-gray-500">{'{}'}</span>;

      return (
        <div className={nested ? 'pl-4' : ''}>
          <span className="text-gray-500">{'{'}</span>
          <div className="pl-4">
            {entries.map(([key, val], index) => (
              <div key={key}>
                <span className="text-blue-600">"{key}"</span>
                <span className="text-gray-500">: </span>
                {formatJsonValue(val, true)}
                {index < entries.length - 1 && (
                  <span className="text-gray-500">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-gray-500">{'}'}</span>
        </div>
      );
    }

    if (typeof value === 'string')
      return <span className="text-green-600">"{value}"</span>;
    if (typeof value === 'number')
      return <span className="text-orange-600">{value}</span>;
    if (typeof value === 'boolean')
      return (
        <span className="text-purple-600">{value ? 'true' : 'false'}</span>
      );

    return String(value);
  };

  // Check if any filters are active
  const areFiltersActive = () => {
    return (
      filterOptions.statusCode !== 'all' ||
      filterOptions.method !== 'all' ||
      filterOptions.user !== '' ||
      filterOptions.severity !== 'all'
    );
  };

  // Check if any filter values have changed from their initial state
  const haveFiltersChanged = () => {
    return (
      filterOptions.statusCode !== initialFilterState.statusCode ||
      filterOptions.method !== initialFilterState.method ||
      filterOptions.user !== initialFilterState.user ||
      filterOptions.severity !== initialFilterState.severity
    );
  };

  // Update initial filter state when filter panel opens
  useEffect(() => {
    if (isFilterOpen) {
      setInitialFilterState({ ...filterOptions });
    }
  }, [isFilterOpen]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Monitor system activity and track user actions"
        action={{
          icon: (
            <RefreshCcw
              className={cn(
                'h-4 w-4 mr-2 text-blue-600 dark:text-blue-400',
                isRefreshing && 'animate-spin',
              )}
            />
          ),
          label: 'Refresh',
          onClick: handleRefresh,
          disabled: isLoading || isRefreshing,
        }}
        apiDocumentation={{
          content: apiDocumentation,
          isLoading: apiDocLoading,
        }}
      />

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col justify-center items-center h-[60vh] space-y-4"
        >
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-blue-500 animate-spin"></div>
            <div
              className="absolute inset-1 rounded-full border-2 border-transparent border-l-blue-400 dark:border-l-blue-300 animate-spin"
              style={{ animationDuration: '1.5s' }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading audit logs...</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-4 border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/30 shadow-sm">
            <CardContent className="py-4 px-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Failed to load audit logs
                </p>
                <p className="text-red-500/80 dark:text-red-400/80 text-sm">
                  {error}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!isLoading && !error && (!auditData || auditData.logs.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-muted/30 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No audit logs found</h3>
              <p className="text-center text-muted-foreground max-w-md mb-6">
                There are no audit logs to display. Logs will appear here once
                users perform actions in the system.
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-blue-200 dark:border-blue-800"
              >
                <RefreshCcw className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-500" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!isLoading && !error && auditData && auditData.logs.length > 0 && (
        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/50 p-1">
            <TabsTrigger
              value="overview"
              className={cn(
                'flex items-center transition-all',
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-800 shadow-sm'
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50',
              )}
            >
              <BarChart4
                className={cn(
                  'h-4 w-4 mr-2',
                  activeTab === 'overview'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-muted-foreground',
                )}
              />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className={cn(
                'flex items-center transition-all',
                activeTab === 'logs'
                  ? 'bg-white dark:bg-gray-800 shadow-sm'
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50',
              )}
            >
              <Database
                className={cn(
                  'h-4 w-4 mr-2',
                  activeTab === 'logs'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-muted-foreground',
                )}
              />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-3">
            {renderStatisticsOverview()}
          </TabsContent>

          <TabsContent value="logs" className="space-y-3 mt-3">
            <div className="sticky top-0 z-10 bg-white pt-1 pb-2">
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="px-0 py-2">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
                      <div className="relative w-full max-w-md">
                        <div className="absolute left-3 top-2.5 text-muted-foreground">
                          <Search className="h-4 w-4" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Search logs or use field:value syntax..."
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSearchTerm(e.target.value)
                          }
                          className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full focus-visible:ring-blue-500"
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute right-1 top-1 h-7 w-7 bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Search Tips</DialogTitle>
                              <DialogDescription>
                                How to search more effectively
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-2">
                              <div>
                                <h3 className="text-sm font-medium mb-1">
                                  Basic Search
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Enter any text to search across all fields
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium mb-1">
                                  Field Search
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Use <Code inline>field:value</Code> syntax for
                                  more specific searches
                                </p>
                                <div className="bg-muted p-3 rounded-md text-xs space-y-1">
                                  <div>
                                    <Code inline>status:404</Code> - Search by
                                    status code
                                  </div>
                                  <div>
                                    <Code inline>user:admin</Code> - Search by
                                    username
                                  </div>
                                  <div>
                                    <Code inline>method:post</Code> - Search by
                                    HTTP method
                                  </div>
                                  <div>
                                    <Code inline>ip:192.168</Code> - Search by
                                    IP address
                                  </div>
                                  <div>
                                    <Code inline>message:help</Code> - Search in
                                    chat messages
                                  </div>
                                  <div>
                                    <Code inline>request:parameter</Code> -
                                    Search in request data
                                  </div>
                                  <div>
                                    <Code inline>response:error</Code> - Search
                                    in response data
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground hidden md:flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          <span>Today</span>
                        </div>

                        <div className="text-sm font-medium bg-muted/50 py-1 px-2.5 rounded-md">
                          {getFilteredLogs().length} logs
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={isFilterOpen ? 'secondary' : 'outline'}
                                className={cn(
                                  'h-8 transition-all',
                                  isFilterOpen
                                    ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30'
                                    : countActiveFilters() > 0
                                      ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800/60 dark:hover:bg-blue-900/20'
                                      : '',
                                )}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                              >
                                <SlidersHorizontal
                                  className={cn(
                                    'h-4 w-4 mr-2',
                                    (isFilterOpen ||
                                      countActiveFilters() > 0) &&
                                      'text-blue-600 dark:text-blue-400',
                                  )}
                                />
                                <span className="hidden md:inline">Filter</span>
                                {countActiveFilters() > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 h-5 px-1.5 bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-200"
                                  >
                                    {countActiveFilters()}
                                  </Badge>
                                )}
                                <ChevronDown
                                  className={cn(
                                    'h-3.5 w-3.5 ml-1 transition-transform duration-200',
                                    isFilterOpen && 'rotate-180',
                                  )}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Filter logs</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <SortButton
                                  sortOrder={sortOrder}
                                  onSortChange={handleSortChange}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              Sort logs by timestamp
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={exportLogs}
                              >
                                <DownloadCloud className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">Export</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export logs to CSV</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter section */}
            {isFilterOpen && (
              <Card className="mb-3 border-blue-100 dark:border-blue-800/50 shadow-sm sticky top-[60px] z-10 bg-white">
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label
                        htmlFor="status-filter"
                        className="text-sm mb-1.5 block"
                      >
                        Status
                      </Label>
                      <Select
                        value={filterOptions.statusCode}
                        onValueChange={(value) =>
                          setFilterOptions({
                            ...filterOptions,
                            statusCode: value,
                          })
                        }
                      >
                        <SelectTrigger id="status-filter" className="w-full">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="2">2xx (Success)</SelectItem>
                          <SelectItem value="3">3xx (Redirection)</SelectItem>
                          <SelectItem value="4">4xx (Client Error)</SelectItem>
                          <SelectItem value="5">5xx (Server Error)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="method-filter"
                        className="text-sm mb-1.5 block"
                      >
                        Method
                      </Label>
                      <Select
                        value={filterOptions.method}
                        onValueChange={(value) =>
                          setFilterOptions({ ...filterOptions, method: value })
                        }
                      >
                        <SelectTrigger id="method-filter" className="w-full">
                          <SelectValue placeholder="All methods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All methods</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="severity-filter"
                        className="text-sm mb-1.5 block"
                      >
                        Severity
                      </Label>
                      <Select
                        value={filterOptions.severity}
                        onValueChange={(value) =>
                          setFilterOptions({
                            ...filterOptions,
                            severity: value,
                          })
                        }
                      >
                        <SelectTrigger id="severity-filter" className="w-full">
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All levels</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="user-filter"
                        className="text-sm mb-1.5 block"
                      >
                        User
                      </Label>
                      <Input
                        id="user-filter"
                        placeholder="Filter by username or email"
                        value={filterOptions.user}
                        onChange={(e) =>
                          setFilterOptions({
                            ...filterOptions,
                            user: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      disabled={!areFiltersActive()}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        // Apply filters by setting the initial state to the current state
                        setInitialFilterState({ ...filterOptions });
                        setIsFilterOpen(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!haveFiltersChanged()}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logs section */}
            <div className="bg-white dark:bg-gray-900/20 rounded-md py-2 px-2">
              <div className="space-y-2">
                {getPaginatedLogs().map((log, index) => (
                  <LogCard
                    key={`log-${log.id}-${index}`}
                    log={log}
                    copiedItems={copiedItems}
                    copyToClipboard={copyToClipboard}
                    formatTimestamp={formatTimestamp}
                    formatChatTime={formatChatTime}
                    hasDisplayableMessages={hasDisplayableMessages}
                    parseJsonString={parseJsonString}
                    formatJsonValue={formatJsonValue}
                    getStatusColor={getStatusColor}
                    getVerbColor={getVerbColor}
                    urlToPathname={urlToPathname}
                  />
                ))}

                {getFilteredLogs().length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                    <h3 className="text-lg font-medium">No logs found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1">
                      No logs match your current search or filter criteria.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {getFilteredLogs().length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 pb-2 bg-white dark:bg-gray-900/20 rounded-b-md -mt-0.5 px-3">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(
                    currentPage * itemsPerPage,
                    getFilteredLogs().length,
                  )}{' '}
                  of {getFilteredLogs().length} logs
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="h-8 w-[110px] text-sm">
                      <SelectValue placeholder="25 per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 rounded-r-none"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <div className="px-3 h-8 flex items-center justify-center border-y border-x-0 border-input bg-white min-w-[32px] text-sm">
                      {currentPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        changePage(Math.min(getTotalPages(), currentPage + 1))
                      }
                      disabled={currentPage === getTotalPages()}
                      className="h-8 w-8 p-0 rounded-l-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
