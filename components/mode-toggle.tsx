'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <SwitchPrimitive.Root
      checked={isDark}
      onCheckedChange={handleToggle}
      className={cn(
        'inline-flex relative items-center h-9 rounded-full border border-transparent transition-all duration-200 w-18',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isDark ? 'bg-muted-foreground/20' : 'bg-muted'
      )}
      aria-label="Toggle theme">
      {/* Moon Icon - positioned on the right side */}
      <Moon
        className={cn(
          'absolute right-[0.5625rem] top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10'
        )}
      />

      {/* Sun Icon - positioned on the left side */}
      <Sun
        className={cn(
          'absolute left-[0.5625rem] top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10'
        )}
      />

      {/* Thumb - moves to cover inactive icon */}
      <SwitchPrimitive.Thumb
        className={cn(
          'absolute top-1/2 -translate-y-1/2 inline-block h-7 w-7 rounded-full bg-background shadow-lg transition-transform duration-200 ease-in-out z-20',
          'ring-0',
          'data-[state=checked]:translate-x-[0.1875rem] data-[state=unchecked]:translate-x-[2.4375rem]'
        )}
      />
    </SwitchPrimitive.Root>
  );
}
