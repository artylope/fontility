'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Cog } from 'lucide-react'
import { FontSelector } from './font-selector'
import { useFontPairStore, FontLockType } from '@/lib/store'

export function SettingsPopover() {
  const [open, setOpen] = useState(false)
  const {
    fontPairs,
    fontLock,
    canAccessFontLocking,
    setFontLockEnabled,
    setFontLockType,
    setGlobalHeadingFont,
    setGlobalBodyFont,
    updateFontPair,
  } = useFontPairStore()

  const handleFontLockToggle = (enabled: boolean) => {
    if (!canAccessFontLocking()) return
    setFontLockEnabled(enabled)
  }

  const handleFontLockTypeChange = (value: string) => {
    if (!canAccessFontLocking()) return
    setFontLockType(value as FontLockType)
  }

  const handleGlobalHeadingFontChange = (family: string, weight: string, category?: string, isCustom?: boolean) => {
    setGlobalHeadingFont(family, weight, category, isCustom)
    // Update all pairs to use this font for headings
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        headingFont: { family, weight, category, lineHeight: 1.25, letterSpacing: -0.025, isCustom }
      })
    })
  }

  const handleGlobalBodyFontChange = (family: string, weight: string, category?: string, isCustom?: boolean) => {
    setGlobalBodyFont(family, weight, category, isCustom)
    // Update all pairs to use this font for body text
    fontPairs.forEach(pair => {
      updateFontPair(pair.id, {
        bodyFont: { family, weight, category, lineHeight: 1.625, letterSpacing: 0, isCustom }
      })
    })
  }

  const isHeadingLocked = fontLock.enabled && fontLock.lockType === 'headings' && canAccessFontLocking()
  const isBodyLocked = fontLock.enabled && fontLock.lockType === 'body' && canAccessFontLocking()

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
            <p className="text-sm text-muted-foreground">
              Configure font locking behavior
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 w-full">
                <div className="flex flex-col gap-1 w-full">
                  <Label htmlFor="font-lock" className="text-sm font-medium">
                    Lock one font type across all styles
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use a single font for all headings or body text
                  </p>
                </div>
                <div className="h-5 flex items-center">
                  <Switch
                    id="font-lock"
                    checked={fontLock.enabled && canAccessFontLocking()}
                    onCheckedChange={handleFontLockToggle}
                    disabled={!canAccessFontLocking()}
                  />
                </div>
              </div>
            </div>

            {fontLock.enabled && canAccessFontLocking() && (
              <div className="space-y-4 border border-border rounded-lg p-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Choose which font type to lock</p>
                  <RadioGroup
                    value={fontLock.lockType}
                    onValueChange={handleFontLockTypeChange}
                    className="-space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="headings" id="headings" />
                      <Label htmlFor="headings" className="text-sm">
                        Headings
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="body" id="body" />
                      <Label htmlFor="body" className="text-sm">
                        Body
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {(isHeadingLocked || isBodyLocked) && (
              <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
                <h5 className="text-sm font-medium text-foreground">Global Font Selection</h5>

                {isHeadingLocked && (
                  <div>
                    <div className="text-xs font-medium text-foreground mb-2">Global Heading Font</div>
                    <FontSelector
                      label=""
                      fontFamily={fontLock.globalHeadingFont?.family || 'Inter'}
                      fontWeight={fontLock.globalHeadingFont?.weight || '700'}
                      onFontChange={handleGlobalHeadingFontChange}
                    />
                  </div>
                )}

                {isBodyLocked && (
                  <div>
                    <div className="text-xs font-medium text-foreground mb-2">Global Body Font</div>
                    <FontSelector
                      label=""
                      fontFamily={fontLock.globalBodyFont?.family || 'Inter'}
                      fontWeight={fontLock.globalBodyFont?.weight || '400'}
                      onFontChange={handleGlobalBodyFontChange}
                    />
                  </div>
                )}
              </div>
            )}

            {!canAccessFontLocking() && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Font locking is a Pro feature. Upgrade to unlock this functionality.
                </p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}