import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Contact — Biz Development CRM',
  description: 'Submit a new investor lead or contact',
};

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
