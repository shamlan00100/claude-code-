import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-body-lg font-semibold transition-all duration-fast disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-glow hover:bg-primary/90',
        ink: 'bg-surface-raised text-ink border border-border-subtle hover:bg-surface-raised/80',
        outline: 'bg-transparent text-ink border border-border hover:bg-surface/60',
        ghost: 'bg-transparent text-ink hover:bg-surface/60',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'bg-transparent text-primary border-0 underline underline-offset-4 decoration-2 p-0 h-auto rounded-none',
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-10 px-4 text-body-md',
        lg: 'h-14 px-6 text-heading-sm',
        icon: 'h-11 w-11 shrink-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
