import { Iframe } from '@/components/ui/iframe';
import { PropsWithChildren } from 'react';

export default async function MainLayout({ children }: PropsWithChildren) {
  const protocol = process.env.NEXT_PUBLIC_HTTP_PROTOCOL;

  const openwebuiDomain = process.env.NEXT_PUBLIC_OPENWEBUI_DOMAIN;
  const n8nDomain = process.env.NEXT_PUBLIC_N8N_DOMAIN;
  const supabaseStudioDomain = process.env.NEXT_PUBLIC_SUPABASE_STUDIO_DOMAIN;
  const langflowDomain = process.env.NEXT_PUBLIC_LANGFLOW_DOMAIN;

  console.log(`
    - openwebui: ${openwebuiDomain}
    - n8n: ${n8nDomain}
    - supabase: ${supabaseStudioDomain}
    - langflow: ${langflowDomain}
  `);

  return (
    <div className="relative size-full">
      {protocol && (
        <>
          {openwebuiDomain && (
            <Iframe
              className="absolute inset-0 size-full"
              iframePathname="/chat"
              src={protocol + openwebuiDomain}
              loading="eager"
            />
          )}
          {n8nDomain && (
            <Iframe
              className="absolute inset-0 size-full"
              iframePathname="/workflows"
              src={protocol + n8nDomain}
              loading="eager"
            />
          )}
          {supabaseStudioDomain && (
            <Iframe
              className="absolute inset-0 size-full"
              iframePathname="/data"
              src={protocol + supabaseStudioDomain}
              loading="eager"
            />
          )}
          {langflowDomain && (
            <Iframe
              className="absolute inset-0 size-full"
              iframePathname="/langflow"
              src={protocol + langflowDomain}
              loading="eager"
            />
          )}
        </>
      )}
      {children}
    </div>
  );
}
