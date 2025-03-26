import { redirect } from 'next/navigation';
import ClientAuditPage from './client-page';

export default function AuditPage() {
  // Server-side check for audit log feature
  if (process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGS !== 'true') {
    redirect('/');
  }

  // If audit log is enabled, render the client component
  return <ClientAuditPage />;
}
