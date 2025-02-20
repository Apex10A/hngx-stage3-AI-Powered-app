// src/components/ui/alert.tsx
import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn as utilsCn } from '@/utils/index'

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={utilsCn(
      'relative w-full rounded-lg border border-gray-200 p-4 dark:border-gray-800',
      'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100',
      '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
      className
    )}
    {...props}
  />
))
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-700 dark:text-gray-300', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }

// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}