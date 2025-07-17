"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect } from "react"

type ProviderProps = Parameters<typeof NextThemesProvider>[0]

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: ProviderProps['attribute']
  defaultTheme?: ProviderProps['defaultTheme']
  enableSystem?: ProviderProps['enableSystem']
  disableTransitionOnChange?: ProviderProps['disableTransitionOnChange']
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {

  // Apply font optimization for dark mode
  useEffect(() => {
    // Add class to html element to fix font rendering in dark mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const htmlElement = document.documentElement
          const isDark = htmlElement.classList.contains('dark')

          // Ensure body also has dark class for specific body styles
          if (isDark) {
            document.body.classList.add('dark')
          } else {
            document.body.classList.remove('dark')
          }
        }
      })
    })

    // Start observing document root for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return <NextThemesProvider
    attribute="class"
    defaultTheme={defaultTheme}
    enableSystem
    {...props}
  >{children}</NextThemesProvider>
}
