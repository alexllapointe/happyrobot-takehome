import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardStoreProvider } from '@/lib/dashboard-store';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Carrier Sales Dashboard',
  description: 'HappyRobot inbound carrier-call performance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans h-screen overflow-hidden bg-background text-foreground antialiased">
        <TooltipProvider>
          <DashboardStoreProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="flex h-screen flex-col overflow-hidden">
                {children}
              </SidebarInset>
            </SidebarProvider>
          </DashboardStoreProvider>
        </TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
