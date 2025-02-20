// src/components/ui/card.tsx
import * as React from 'react'
import * as CardPrimitive from '@radix-ui/react-slot'
import { cn } from '../../utils/index'

const Card = React.forwardRef<
  React.ElementRef<typeof CardPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CardPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CardPrimitive.Root
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

export { Card, CardContent }