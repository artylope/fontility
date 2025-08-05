'use client'

import { useState, useRef, useCallback, ReactNode, useEffect } from 'react'
import { useFontPairStore } from '@/lib/store'

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
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayValues, setOverlayValues] = useState({ lineHeight: 0, letterSpacing: 0 })

  const startPos = useRef({ x: 0, y: 0 })
  const initialValues = useRef({ lineHeight: 0, letterSpacing: 0 })
  const hasMovedEnough = useRef(false)
  const currentDirection = useRef<'horizontal' | 'vertical' | null>(null)

  // Get current pair data
  const pair = fontPairs.find(p => p.id === pairId)
  const font = pair ? (textType === 'heading' ? pair.headingFont : pair.bodyFont) : null

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('Mouse down on', textType, 'for pair', pairId)
    e.preventDefault()

    if (!font) return

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
    setDragDirection(null)

    // Add event listeners to document

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y

      // Determine direction based on larger movement
      if (!hasMovedEnough.current && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        hasMovedEnough.current = true
        currentDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
        setDragDirection(currentDirection.current)
        console.log('Direction set to:', currentDirection.current)
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
        // Vertical: adjust line height (inverted - up increases, down decreases)
        newLineHeight = initialValues.current.lineHeight + (-deltaY * lineHeightSensitivity)
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
      console.log('Updating values:', { lineHeight: newLineHeight, letterSpacing: newLetterSpacing })
      updateFontPair(pairId, {
        [textType === 'heading' ? 'headingFont' : 'bodyFont']: {
          ...font,
          lineHeight: newLineHeight,
          letterSpacing: newLetterSpacing
        }
      })
    }

    const handleMouseUp = () => {
      console.log('Mouse up')
      setIsDragging(false)
      setDragDirection(null)
      setShowOverlay(false)
      hasMovedEnough.current = false

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [font, pairId, textType, updateFontPair])

  const getCursor = () => {
    if (isDragging && dragDirection) {
      return dragDirection === 'horizontal' ? 'ew-resize' : 'ns-resize'
    }
    if (isDragging) {
      return 'grabbing'
    }
    if (isHovering) {
      return 'grab'
    }
    return 'default'
  }

  return (
    <div className="relative">
      <div
        className={className}
        style={{
          ...style,
          cursor: getCursor(),
          userSelect: isDragging ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => {
          setIsHovering(true)
          if (font) {
            setOverlayValues({
              lineHeight: font.lineHeight,
              letterSpacing: font.letterSpacing
            })
            setShowOverlay(true)
          }
        }}
        onMouseLeave={() => {
          setIsHovering(false)
          if (!isDragging) {
            setShowOverlay(false)
          }
        }}
      >
        {children}
      </div>

      {showOverlay && font && (
        <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none z-10 font-mono">
          <div>line-height: {overlayValues.lineHeight.toFixed(3)}</div>
          <div>letter-spacing: {overlayValues.letterSpacing.toFixed(3)}px</div>
        </div>
      )}
    </div>
  )
}