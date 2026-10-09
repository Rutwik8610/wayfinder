'use client'

import { Compass, LoaderCircle } from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'

export default function Loading() {
  const { t } = useAppSettings()
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Compass className="size-6" />
        </span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
          <LoaderCircle className="size-4 animate-spin text-primary" />
          {t('common.loading')}
        </div>
      </div>
    </main>
  )
}
