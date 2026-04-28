'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBar, PhoneCall, Truck } from '@phosphor-icons/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { AccountSwitcher } from '@/components/account-switcher';

const NAV = [
  { href: '/calls',     label: 'Calls',     icon: PhoneCall },
  { href: '/loads',     label: 'Loads',     icon: Truck },
  { href: '/analytics', label: 'Analytics', icon: ChartBar },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar
      // `offcanvas` keeps the sidebar visible on desktop and turns it into
      // a slide-in Sheet on mobile (controlled by the SidebarTrigger in
      // PageHeader).
      collapsible="offcanvas"
      className="h-screen border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          FDE - Alex LaPointe
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
