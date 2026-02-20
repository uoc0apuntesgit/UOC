import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'UOC Planner — Raul & Miguel Angel',
  description: 'Planificador académico con diagrama de Gantt para seguimiento de PECs, PRAs y exámenes de la UOC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased">
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
