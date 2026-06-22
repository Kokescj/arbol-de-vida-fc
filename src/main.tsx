import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { polyfill as touchDndPolyfill } from 'mobile-drag-drop'
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour'
import 'mobile-drag-drop/default.css'
import './index.css'
import App from './App.tsx'

// Pragmatic DnD usa HTML5 Drag and Drop nativo, que en touch devices (iOS/Android)
// no dispara dragstart/dragover/drop — solo touchstart/move/end. Este polyfill
// sintetiza los eventos HTML5 a partir de touch para que el reorder del board
// funcione en mobile. holdToDrag=300ms evita que un scroll accidental dispare un
// drag; scrollBehaviourDragImageTranslateOverride permite auto-scroll mientras se
// arrastra cerca del borde de la pantalla.
touchDndPolyfill({
  holdToDrag: 300,
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
