import * as React from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';

// Root wrapper
export const TabsRoot = RadixTabs.Root;

// List wrapper
export const TabsList = React.forwardRef<
    React.ElementRef<typeof RadixTabs.List>,
    React.ComponentPropsWithoutRef<typeof RadixTabs.List>
>(({ className = '', ...props }, ref) => (
    <RadixTabs.List
        ref={ref}
        className={`flex gap-1 bg-white border-b border-stone-200 ${className}`}
        {...props}
    />
));
TabsList.displayName = 'TabsList';

// Trigger (tab button)
export const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof RadixTabs.Trigger>,
    React.ComponentPropsWithoutRef<typeof RadixTabs.Trigger>
>(({ className = '', ...props }, ref) => (
    <RadixTabs.Trigger
        ref={ref}
        className={` tracking-wider uppercase border-b-2 border-transparent px-5 pt-3 pb-2.5 text-sm font-semibold flex items-center bg-transparent transition-colors
      data-[state=active]:border-orange-500 data-[state=active]:text-orange-600
      data-[state=inactive]:text-stone-600 hover:data-[state=inactive]:text-stone-900
      rounded-none shadow-none data-[state=active]:shadow-none ${className}`}
        {...props}
    />
));
TabsTrigger.displayName = 'TabsTrigger';

// Content
export const TabsContent = React.forwardRef<
    React.ElementRef<typeof RadixTabs.Content>,
    React.ComponentPropsWithoutRef<typeof RadixTabs.Content>
>(({ className = '', ...props }, ref) => (
    <RadixTabs.Content
        ref={ref}
        className={`w-full h-full ${className}`}
        {...props}
    />
));
TabsContent.displayName = 'TabsContent';