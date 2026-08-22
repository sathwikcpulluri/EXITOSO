import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50">
      <div className="text-center max-w-md animate-fade-in">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-50 mx-auto mb-6">
          <ShieldOff className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-6xl font-bold text-rose-500 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Access Denied</h2>
        <p className="text-surface-500 mb-8">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
