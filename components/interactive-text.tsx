'use client'

import { useState, useRef, useCallback, ReactNode, useEffect } from 'react'
import { useFontPairStore } from '@/lib/store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Move, ArrowLeftRight, ArrowUpDown } from 'lucide-react'

interface InteractiveTextProps {
  children: ReactNode
  pairId: string
  textType: 'heading' | 'body'
  className?: string
  style?: React.CSSProperties
}

export function InteractiveText({ children, pairId, textType, className, style }: InteractiveTextProps) {
  const { fontPairs, updateFontPair } = useFontPairStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null)
  const [cursorType, setCursorType] = useState('default')
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayValues, setOverlayValues] = useState({ lineHeight: 0, letterSpacing: 0 })

  const startPos = useRef({ x: 0, y: 0 })
  const initialValues = useRef({ lineHeight: 0, letterSpacing: 0 })
  const hasMovedEnough = useRef(false)
  const currentDirection = useRef<'horizontal' | 'vertical' | null>(null)
  const setCursorTypeRef = useRef(setCursorType)

  // Update the ref when setCursorType changes
  useEffect(() => {
    setCursorTypeRef.current = setCursorType
  }, [setCursorType])

  // Global mouse move tracker for reliable hover detection
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isInside = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      )

      // Only update state when it actually changes
      if (isInside && !isHovering && !isDragging) {
        setIsHovering(true)
        if (font) {
          setOverlayValues({
            lineHeight: font.lineHeight,
            letterSpacing: font.letterSpacing
          })
          setShowOverlay(true)
        }
      } else if (!isInside && isHovering && !isDragging) {
        setIsHovering(false)
        setShowOverlay(false)
      }
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    return () => document.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [isHovering, isDragging, textType, pairId])


  // Get current pair data
  const pair = fontPairs.find(p => p.id === pairId)
  const font = pair ? (textType === 'heading' ? pair.headingFont : pair.bodyFont) : null


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()

    if (!font) {
      return
    }

    startPos.current = { x: e.clientX, y: e.clientY }
    initialValues.current = {
      lineHeight: font.lineHeight,
      letterSpacing: font.letterSpacing
    }

    setOverlayValues({
      lineHeight: font.lineHeight,
      letterSpacing: font.letterSpacing
    })

    setIsDragging(true)
    setShowOverlay(true)
    hasMovedEnough.current = false
    currentDirection.current = null
    setCursorType('grabbing')

    // Add event listeners to document

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y

      // Determine direction based on larger movement
      if (!hasMovedEnough.current && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        hasMovedEnough.current = true
        currentDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
        const cursorValue = currentDirection.current === 'horizontal' ? 'ew-resize' : 'ns-resize'
        setCursorTypeRef.current(cursorValue)
      }

      if (!hasMovedEnough.current) return

      // More sensitive adjustments
      const letterSpacingSensitivity = 0.01 // 0.01px per pixel moved
      const lineHeightSensitivity = 0.005 // 0.005 ratio per pixel moved

      let newLetterSpacing = initialValues.current.letterSpacing
      let newLineHeight = initialValues.current.lineHeight

      if (currentDirection.current === 'horizontal') {
        // Horizontal: adjust letter spacing
        newLetterSpacing = initialValues.current.letterSpacing + (deltaX * letterSpacingSensitivity)
        // Clamp letter spacing between -2px and 5px
        newLetterSpacing = Math.max(-4, Math.min(5, newLetterSpacing))
      } else if (currentDirection.current === 'vertical') {
        // Vertical: adjust line height (up tightens/decreases, down loosens/increases)
        newLineHeight = initialValues.current.lineHeight + (deltaY * lineHeightSensitivity)
        // Clamp line height between 0.8 and 3.0
        newLineHeight = Math.max(0.8, Math.min(3.0, newLineHeight))
      }

      // Round to reasonable precision
      newLetterSpacing = Math.round(newLetterSpacing * 1000) / 1000
      newLineHeight = Math.round(newLineHeight * 1000) / 1000

      setOverlayValues({
        lineHeight: newLineHeight,
        letterSpacing: newLetterSpacing
      })

      // Update the store
      updateFontPair(pairId, {
        [textType === 'heading' ? 'headingFont' : 'bodyFont']: {
          ...font,
          lineHeight: newLineHeight,
          letterSpacing: newLetterSpacing
        }
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setShowOverlay(false)
      hasMovedEnough.current = false
      currentDirection.current = null
      setCursorType('default')

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [font, pairId, textType, updateFontPair])

  const getIconComponent = () => {
    if (isDragging) {
      // Use cursorType instead of currentDirection.current for more reliable state
      if (cursorType === 'ew-resize') return <ArrowLeftRight className="w-4 h-4" />
      if (cursorType === 'ns-resize') return <ArrowUpDown className="w-4 h-4" />
      return <Move className="w-4 h-4" />
    }
    if (isHovering) {
      return <Move className="w-4 h-4" />
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleMouseDown(e)
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={className}
              data-interactive-text="true"
              data-pair-id={pairId}
              data-text-type={textType}
              style={{
                ...style,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: isDragging ? 'none' : 'auto',
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleMouseDown(e)
              }}
              onClick={(e) => {
                // Handle click if needed
              }}
              onMouseUp={(e) => {
                // Handle mouse up if needed
              }}
            >
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Drag to adjust line height and letter spacing</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}