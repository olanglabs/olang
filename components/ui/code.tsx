import React from 'react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeProps {
  children: string | React.ReactNode;
  language?: string;
  className?: string;
  inline?: boolean;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
}

export const Code = ({
  children,
  language = 'text',
  className,
  inline = false,
  showLineNumbers = false,
  wrapLines = true,
}: CodeProps) => {
  const [copied, setCopied] = React.useState(false);

  const code = React.useMemo(() => {
    if (typeof children === 'string') {
      return children.trim();
    }

    return '';
  }, [children]);

  const copyToClipboard = React.useCallback(() => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code, children]);

  if (inline) {
    return (
      <code
        className={cn(
          'px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 font-mono text-sm inline-block',
          className,
        )}
      >
        {children}
      </code>
    );
  }

  if (className) {
    const match = /language-(\w+)/.exec(className);
    if (match) {
      language = match[1];
    }
  }

  return (
    <div className="relative group m-1 overflow-hidden rounded-lg border border-gray-700 shadow-md bg-[#1E1E1E]">
      <div className="absolute right-2 top-2">
        <button
          onClick={copyToClipboard}
          className={cn(
            'p-1.5 rounded-md transition-all duration-200',
            'bg-gray-800/90 hover:bg-gray-700',
            'border border-gray-600',
            'text-gray-400 hover:text-gray-200',
            'opacity-90 hover:opacity-100',
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
        wrapLongLines={wrapLines}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          textAlign: 'right',
          userSelect: 'none',
          opacity: 0.5,
          borderRight: '1px solid rgba(128, 128, 128, 0.2)',
          marginRight: '0.75em',
          fontSize: '0.8em',
        }}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
          padding: '1.5rem 1rem',
          backgroundColor: '#1E1E1E',
          overflow: 'auto',
          color: '#e6e6e6',
        }}
        codeTagProps={{
          className: 'font-mono text-sm',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
