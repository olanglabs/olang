import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import Code from '@/components/ui/code';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none markdown-content',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code: ({ node, className, children }) => {
            const isInline =
              node &&
              node.position &&
              node.position.start.line === node.position.end.line;

            if (isInline) {
              return (
                <Code inline className={className}>
                  {children}
                </Code>
              );
            }

            const match = /language-(\w+)/.exec(className || '');
            return (
              <Code
                language={match ? match[1] : undefined}
                className={className}
                showLineNumbers={true}
              >
                {String(children).replace(/\n$/, '')}
              </Code>
            );
          },
          pre: ({ children }: any) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default Markdown;
