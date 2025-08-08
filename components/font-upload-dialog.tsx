'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Upload, X, FileText, Plus } from 'lucide-react'

import { useFontPairStore, CustomFont, CustomFontVariant } from '@/lib/store'
import { nanoid } from 'nanoid'

interface FontUploadDialogProps {
  trigger: React.ReactNode
  onFontUploaded?: (fontFamily: string) => void
}

interface FontFile {
  id: string
  file: File
  weight: string
  style: 'normal' | 'italic'
  preview?: string
}

export function FontUploadDialog({ trigger, onFontUploaded }: FontUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [fontFamily, setFontFamily] = useState('')
  const [fontFiles, setFontFiles] = useState<FontFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addCustomFont } = useFontPairStore()

  const resetForm = () => {
    setFontFamily('')
    setFontFiles([])
    setDragOver(false)
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    setOpen(false)
  }

  const acceptedFormats = ['.ttf', '.otf', '.woff', '.woff2']
  const isValidFontFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return acceptedFormats.includes(extension)
  }

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const validFiles = files.filter(isValidFontFile)

    if (validFiles.length === 0) {
      alert('Please select valid font files (.ttf, .otf, .woff, .woff2)')
      return
    }

    const newFontFiles: FontFile[] = await Promise.all(
      validFiles.map(async (file) => {
        // Generate preview text by loading the font temporarily
        const url = URL.createObjectURL(file)

        return {
          id: nanoid(),
          file,
          weight: '400', // Default weight
          style: 'normal' as const,
          preview: url
        }
      })
    )

    setFontFiles(prev => [...prev, ...newFontFiles])

    // Auto-generate font family name from first file if not set
    if (!fontFamily && validFiles.length > 0) {
      const baseName = validFiles[0].name
        .replace(/\.(ttf|otf|woff|woff2)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      setFontFamily(baseName)
    }
  }, [fontFamily])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFilesSelected(files)
  }, [handleFilesSelected])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFilesSelected(files)
    }
  }, [handleFilesSelected])

  const removeFontFile = (fileId: string) => {
    setFontFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const updateFontFile = (fileId: string, updates: Partial<FontFile>) => {
    setFontFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates } : f))
  }

  const loadCustomFont = async (fontFamily: string, variants: CustomFontVariant[]) => {
    // Create font face declarations for each variant
    for (const variant of variants) {
      const fontFace = new FontFace(
        fontFamily,
        `url(${variant.url})`,
        {
          weight: variant.weight,
          style: variant.style
        }
      )

      try {
        await fontFace.load()
        document.fonts.add(fontFace)
      } catch (error) {
        console.warn(`Failed to load custom font variant: ${fontFamily} ${variant.weight} ${variant.style}`, error)
      }
    }
  }

  const handleUpload = async () => {
    if (!fontFamily.trim() || fontFiles.length === 0) {
      alert('Please provide a font family name and select at least one font file.')
      return
    }

    setLoading(true)

    try {
      // Create custom font object
      const variants: CustomFontVariant[] = fontFiles.map(fontFile => ({
        weight: fontFile.weight,
        style: fontFile.style,
        file: fontFile.file,
        url: URL.createObjectURL(fontFile.file)
      }))

      const customFont: CustomFont = {
        id: nanoid(),
        family: fontFamily.trim(),
        variants,
        category: 'custom',
        uploadedAt: Date.now()
      }

      // Load the font into the document
      await loadCustomFont(customFont.family, variants)

      // Add to store
      addCustomFont(customFont)

      // Cleanup preview URLs
      fontFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })

      // Callback to parent component
      onFontUploaded?.(customFont.family)

      // Close dialog and reset
      handleClose()
    } catch (error) {
      console.error('Error uploading font:', error)
      alert('Failed to upload font. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const weightOptions = [
    { value: '100', label: 'Thin (100)' },
    { value: '200', label: 'Extra Light (200)' },
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
    { value: '900', label: 'Black (900)' }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="!w-full !max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Custom Font</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Font Family Name */}
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family Name</Label>
            <Input
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              placeholder="e.g. My Custom Font"
            />
          </div>



          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Font Files</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors space-y-4 ${dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
                }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mt-4" />
              <div >
                <p className="font-semibold">
                  Drop font files here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: {acceptedFormats.join(', ')}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded Files */}
          {fontFiles.length > 0 && (
            <>

              <div className="space-y-3">

                <div className="space-y-2">
                  {fontFiles.map((fontFile) => (
                    <div key={fontFile.id} className="px-4 py-2 bg-muted rounded-lg">
                      <div className='flex gap-2'>
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">{fontFile.file.name}</span>
                          </div>
                          <div className="flex gap-2 flex-1 items-center">
                            <div className="flex-1">
                              {/* <Label className="text-xs">Weight</Label> */}
                              <Select
                                value={fontFile.weight}
                                onValueChange={(value) => updateFontFile(fontFile.id, { weight: value })}
                              >
                                <SelectTrigger className='w-36'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {weightOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex-1">
                              {/* <Label className="text-xs">Style</Label> */}
                              <Select
                                value={fontFile.style}
                                onValueChange={(value: 'normal' | 'italic') => updateFontFile(fontFile.id, { style: value })}
                              >
                                <SelectTrigger className='w-24'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="italic">Italic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFontFile(fontFile.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>


                      </div>
                      {/* Font Preview */}
                      {/* {fontFile.preview && (
                        <div className="mt-3 p-3 bg-muted rounded">
                          <style>{`
                          @font-face {
                            font-family: 'preview-${fontFile.id}';
                            src: url(${fontFile.preview});
                            font-weight: ${fontFile.weight};
                            font-style: ${fontFile.style};
                          }
                        `}</style>
                          <p
                            className="text-lg"
                            style={{
                              fontFamily: `preview-${fontFile.id}`,
                              fontWeight: fontFile.weight,
                              fontStyle: fontFile.style
                            }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </p>
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!fontFamily.trim() || fontFiles.length === 0 || loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Font
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}