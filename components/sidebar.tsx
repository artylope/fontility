'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useFontPairStore, FontCategory } from '@/lib/store'
import { GoogleFont, fetchGoogleFonts } from '@/lib/google-fonts'

export function Sidebar() {
  const { 
    globalText, 
    headingFontFilters, 
    bodyFontFilters,
    setGlobalText,
    setHeadingFontFilters,
    setBodyFontFilters
  } = useFontPairStore()
  
  const [allFonts, setAllFonts] = useState<GoogleFont[]>([])

  useEffect(() => {
    fetchGoogleFonts().then(setAllFonts)
  }, [])

  const getCategoryCount = (category: FontCategory): number => {
    return allFonts.filter(font => font.category === category).length
  }

  const getWeightCount = (weight: string): number => {
    return allFonts.filter(font => 
      font.variants.some(variant => 
        variant === weight || (variant === 'regular' && weight === '400')
      )
    ).length
  }

  const handleCategoryToggle = (category: FontCategory, isHeading: boolean) => {
    const currentFilters = isHeading ? headingFontFilters : bodyFontFilters
    const newCategories = currentFilters.categories.includes(category)
      ? currentFilters.categories.filter(c => c !== category)
      : [...currentFilters.categories, category]
    
    if (isHeading) {
      setHeadingFontFilters({ categories: newCategories })
    } else {
      setBodyFontFilters({ categories: newCategories })
    }
  }

  const handleWeightToggle = (weight: string, isHeading: boolean) => {
    const currentFilters = isHeading ? headingFontFilters : bodyFontFilters
    const newWeights = currentFilters.weights.includes(weight)
      ? currentFilters.weights.filter(w => w !== weight)
      : [...currentFilters.weights, weight]
    
    if (isHeading) {
      setHeadingFontFilters({ weights: newWeights })
    } else {
      setBodyFontFilters({ weights: newWeights })
    }
  }

  const handleSelectAllCategories = (isHeading: boolean) => {
    const currentFilters = isHeading ? headingFontFilters : bodyFontFilters
    const allSelected = categoryOrder.every(category => currentFilters.categories.includes(category))
    
    if (isHeading) {
      setHeadingFontFilters({ categories: allSelected ? [] : categoryOrder })
    } else {
      setBodyFontFilters({ categories: allSelected ? [] : categoryOrder })
    }
  }

  const handleSelectAllWeights = (isHeading: boolean) => {
    const currentFilters = isHeading ? headingFontFilters : bodyFontFilters
    const allSelected = weightOrder.every(weight => currentFilters.weights.includes(weight))
    
    if (isHeading) {
      setHeadingFontFilters({ weights: allSelected ? [] : weightOrder })
    } else {
      setBodyFontFilters({ weights: allSelected ? [] : weightOrder })
    }
  }

  const categoryOrder: FontCategory[] = ['sans-serif', 'serif', 'monospace', 'handwriting', 'display']
  const weightOrder = ['100', '200', '300', '400', '500', '600', '700', '800', '900']

  const isAllCategoriesSelected = (isHeading: boolean) => {
    const filters = isHeading ? headingFontFilters : bodyFontFilters
    return categoryOrder.every(category => filters.categories.includes(category))
  }

  const isAllWeightsSelected = (isHeading: boolean) => {
    const filters = isHeading ? headingFontFilters : bodyFontFilters
    return weightOrder.every(weight => filters.weights.includes(weight))
  }

  return (
    <div className="w-88 border-r border-border flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent">
        <div className="space-y-6 py-4 px-4">
          {/* Global Text Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Text Content</h3>
            
            <div className="space-y-2">
              <Label htmlFor="heading-text" className="text-sm font-medium">Heading Text</Label>
              <Input
                id="heading-text"
                value={globalText.headingText}
                onChange={(e) => setGlobalText(e.target.value, globalText.bodyText)}
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body-text" className="text-sm font-medium">Body Text</Label>
              <Textarea
                id="body-text"
                value={globalText.bodyText}
                onChange={(e) => setGlobalText(globalText.headingText, e.target.value)}
                className="text-sm min-h-[80px] resize-none"
              />
            </div>
          </div>

          {/* Heading Font Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Heading Font Filters</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllCategories(true)}
                    className="h-6 px-2 text-xs"
                  >
                    {isAllCategoriesSelected(true) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="flex flex-col space-y-2">
                  {categoryOrder.map(category => (
                    <div key={`heading-${category}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`heading-${category}`}
                        checked={headingFontFilters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category, true)}
                      />
                      <Label htmlFor={`heading-${category}`} className="text-sm cursor-pointer">
                        {category} ({getCategoryCount(category)})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Weights</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllWeights(true)}
                    className="h-6 px-2 text-xs"
                  >
                    {isAllWeightsSelected(true) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="flex flex-col space-y-2">
                  {weightOrder.map(weight => (
                    <div key={`heading-${weight}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`heading-${weight}`}
                        checked={headingFontFilters.weights.includes(weight)}
                        onCheckedChange={() => handleWeightToggle(weight, true)}
                      />
                      <Label htmlFor={`heading-${weight}`} className="text-sm cursor-pointer">
                        {weight} ({getWeightCount(weight)})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Body Font Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Body Font Filters</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllCategories(false)}
                    className="h-6 px-2 text-xs"
                  >
                    {isAllCategoriesSelected(false) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="flex flex-col space-y-2">
                  {categoryOrder.map(category => (
                    <div key={`body-${category}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`body-${category}`}
                        checked={bodyFontFilters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category, false)}
                      />
                      <Label htmlFor={`body-${category}`} className="text-sm cursor-pointer">
                        {category} ({getCategoryCount(category)})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Weights</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAllWeights(false)}
                    className="h-6 px-2 text-xs"
                  >
                    {isAllWeightsSelected(false) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="flex flex-col space-y-2">
                  {weightOrder.map(weight => (
                    <div key={`body-${weight}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`body-${weight}`}
                        checked={bodyFontFilters.weights.includes(weight)}
                        onCheckedChange={() => handleWeightToggle(weight, false)}
                      />
                      <Label htmlFor={`body-${weight}`} className="text-sm cursor-pointer">
                        {weight} ({getWeightCount(weight)})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}