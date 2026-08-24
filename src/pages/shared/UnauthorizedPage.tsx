import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent text-white">
      <div className="text-center max-w-md p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-500/10 mx-auto mb-6 border border-rose-500/20">
          <ShieldOff className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-300 mb-2">403</h1>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Link to="/">
          <Button className="px-6 py-2.5">Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
