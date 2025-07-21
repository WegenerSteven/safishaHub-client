import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'
import { ModalProvider } from '../contexts/ModalContext'
import { ThemeProvider } from '../components/theme/theme-provider'
import { Toaster } from 'sonner'
import { AuthProvider } from '../contexts/auth-context'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import appCss from '../styles.css?url'
import themeFixesCss from '../components/theme/theme-fixes.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { NotificationProvider } from '@/contexts/notification-context.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SafishaHub - Professional Car Wash Services',
      },
      {
        name: 'description',
        content:
          'Book professional car wash services near you. From basic wash to premium detailing, SafishaHub connects you with trusted local providers.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: themeFixesCss,
      },
    ],
  }),

  component: () => (
    <RootDocument>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <Toaster position="top-right" richColors />
        <ModalProvider>
          <AuthProvider>
            <NotificationProvider>
              <Header />
              <Outlet />
              <TanStackRouterDevtools />
              <TanStackQueryLayout />
            </NotificationProvider>
          </AuthProvider>
        </ModalProvider>
      </ThemeProvider>
    </RootDocument>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
