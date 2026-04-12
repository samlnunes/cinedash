import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from './app/providers/query-client'
import { router } from './app/providers/router'
import { initializeAuth } from '@/features/auth'

const rootElement = document.getElementById('app')!

async function bootstrap() {
  const unsubscribe = await initializeAuth()

  if (import.meta.hot) {
    import.meta.hot.dispose(() => unsubscribe())
  }

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
  }
}

bootstrap()

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js')
}
