'use client';

import { useState } from 'react';
import { Check, CaretUpDown } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { HappyRobotLogo } from '@/components/happy-robot-logo';

// Picker placeholder. The take-home demo only has one account, but the
// dropdown is wired up so that switching to a multi-tenant model later is a
// matter of populating this list and routing on selection.
const ACCOUNTS = [{ id: 'acme-logistics', name: 'Acme Logistics' }];

export function AccountSwitcher() {
  const [active, setActive] = useState(ACCOUNTS[0]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <HappyRobotLogo />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{active.name}</span>
          </div>
          <CaretUpDown className="ml-auto size-4 opacity-60" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">Accounts</DropdownMenuLabel>
        {ACCOUNTS.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onClick={() => setActive(a)}
            className="gap-2"
          >
            <HappyRobotLogo className="h-6 w-6 text-xs" />
            <span className="flex-1">{a.name}</span>
            {a.id === active.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-muted-foreground">
          Add account (coming soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
