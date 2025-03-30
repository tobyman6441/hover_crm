export const brand = {
  // Brand assets paths
  assets: {
    fonts: '/brand/fonts',
    icons: '/brand/icons',
    logos: '/brand/logos',
    images: '/brand/images',
    photography: '/brand/photography',
    templates: '/brand/templates',
    voiceAndTone: '/brand/voice-and-tone'
  },
  
  // Brand colors (we'll update these based on your brand guide)
  colors: {
    primary: {
      DEFAULT: '#000000', // Update with your primary color
      light: '#333333',
      dark: '#000000'
    },
    secondary: {
      DEFAULT: '#ffffff', // Update with your secondary color
      light: '#ffffff',
      dark: '#f5f5f5'
    }
  },
  
  // Typography (we'll update these based on your brand guide)
  typography: {
    fontFamily: {
      sans: ['var(--font-geist-sans)'],
      mono: ['var(--font-geist-mono)']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  
  // Spacing (we'll update these based on your brand guide)
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border radius (we'll update these based on your brand guide)
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px'
  }
} as const;

// Export type for brand configuration
export type BrandConfig = typeof brand; 