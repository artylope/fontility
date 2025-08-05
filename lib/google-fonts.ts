export interface GoogleFont {
  family: string
  variants: string[]
  category: string
}

export interface GoogleFontsResponse {
  items: GoogleFont[]
}

const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts'

export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY

  if (!apiKey) {
    console.warn('Google Fonts API key not found. Please add NEXT_PUBLIC_GOOGLE_FONTS_API_KEY to your .env.local file')
    return []
  }

  try {
    console.log('Fetching Google Fonts...')
    const response = await fetch(
      `${GOOGLE_FONTS_API_URL}?key=${apiKey}&sort=popularity`
    )

    if (!response.ok) {
      console.error('Google Fonts API response not ok:', response.status, response.statusText)
      throw new Error(`Failed to fetch Google Fonts: ${response.status}`)
    }

    const data: GoogleFontsResponse = await response.json()
    console.log(`Loaded ${data.items.length} fonts from Google Fonts API`)
    return data.items
  } catch (error) {
    console.error('Error fetching Google Fonts:', error)
    return []
  }
}

export function loadGoogleFont(fontFamily: string, weights: string[] = ['400']) {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`
  
  // Remove existing font link to reload with new weights
  const existingLink = document.getElementById(fontId)
  if (existingLink) {
    existingLink.remove()
    console.log('Removed existing font link:', fontFamily)
  }

  // Limit weights to avoid URL being too long - Google Fonts has limits
  const limitedWeights = weights.slice(0, 5) // Max 5 weights
  const weightQuery = limitedWeights.join(';')
  
  // Use the newer Google Fonts API format
  const encodedFontFamily = fontFamily.replace(/\s+/g, '+')
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontFamily}:wght@${weightQuery}&display=swap`

  console.log('Loading font:', fontFamily, 'with weights:', limitedWeights, 'URL:', fontUrl)

  // Try fetching first to check if font exists
  fetch(fontUrl, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        console.error('Font not available:', fontFamily, 'Status:', response.status)
        return
      }
      
      // Font exists, create link element
      const link = document.createElement('link')
      link.id = fontId
      link.rel = 'stylesheet'
      link.href = fontUrl
      link.crossOrigin = 'anonymous' // Add CORS support

      // Add error handling
      link.onerror = (event) => {
        console.error('Failed to load font CSS:', fontFamily, 'Event:', event)
      }
      
      link.onload = () => {
        console.log('Successfully loaded font CSS:', fontFamily)
        
        // Try to load the actual font
        if ('fonts' in document) {
          document.fonts.load(`${limitedWeights[0]} 16px "${fontFamily}"`).then(() => {
            console.log('Font face loaded successfully:', fontFamily)
          }).catch((error) => {
            console.error('Font face loading failed:', fontFamily, error)
          })
        }
      }

      document.head.appendChild(link)
      console.log('Font link added to document head:', fontId)
    })
    .catch(error => {
      console.error('Error checking font availability:', fontFamily, error)
    })
}

export function getFontWeights(font: GoogleFont): string[] {
  const standardWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900']

  const availableWeights = font.variants
    .filter(variant => !variant.includes('italic'))
    .map(variant => variant === 'regular' ? '400' : variant)
    .filter(weight => standardWeights.includes(weight))
    .sort((a, b) => parseInt(a) - parseInt(b))

  // Always include 400 if no weights are available
  return availableWeights.length > 0 ? availableWeights : ['400']
}

// Check if a font is available via Google Fonts API
export async function validateGoogleFont(fontFamily: string): Promise<boolean> {
  try {
    const encodedFontFamily = fontFamily.replace(/\s+/g, '+')
    const testUrl = `https://fonts.googleapis.com/css2?family=${encodedFontFamily}:wght@400&display=swap`
    
    const response = await fetch(testUrl, { method: 'HEAD' })
    const isValid = response.ok
    
    if (!isValid) {
      console.warn('Font not available on Google Fonts:', fontFamily, 'Status:', response.status)
    }
    
    return isValid
  } catch (error) {
    console.error('Error validating font:', fontFamily, error)
    return false
  }
}