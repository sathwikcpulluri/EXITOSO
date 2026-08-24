import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { TooltipProvider } from '@/components/ui/Tooltip'
import { router } from '@/router'
import { useAuthStore } from '@/store/authStore'
import { SplineBackground } from '@/components/common/SplineBackground'

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen bg-[#050505] text-white selection:bg-rose-500 selection:text-white">
          <SplineBackground />
          <RouterProvider router={router} />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
