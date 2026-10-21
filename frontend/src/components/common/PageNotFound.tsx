import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function PageNotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="max-w-xs text-xs text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button size="sm" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  )
}
