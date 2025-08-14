'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Cog, RotateCcw } from 'lucide-react'

export function SettingsPopover() {
  const [open, setOpen] = useState(false)

  const handleResetApp = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          title="Settings"
        >
          <Cog className="w-4 h-4" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>

          </div>

          <div className="space-y-4">
            <div className="pt-4 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset App Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset App Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your saved font pairs, settings, and preferences. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetApp} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}