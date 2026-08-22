import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50">
      <div className="text-center max-w-md animate-fade-in">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 mx-auto mb-6">
          <FileQuestion className="h-10 w-10 text-primary-500" />
        </div>
        <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Page Not Found</h2>
        <p className="text-surface-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
