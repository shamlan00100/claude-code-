import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body-lg font-semibold tracking-[0.01em] transition-colors duration-fast disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 uppercase tracking-[0.04em]',
        ink: 'bg-ink text-background border-2 border-ink hover:bg-ink/90 uppercase tracking-[0.04em]',
        outline: 'bg-transparent text-ink border-2 border-ink hover:bg-ink/5 uppercase tracking-[0.04em]',
        ghost: 'bg-transparent text-ink border-2 border-transparent hover:bg-ink/5',
        accent: 'bg-accent text-accent-foreground border-2 border-accent hover:bg-accent/90 uppercase tracking-[0.04em]',
        destructive: 'bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 uppercase tracking-[0.04em]',
        link: 'bg-transparent text-primary border-0 underline underline-offset-4 decoration-2 p-0 h-auto',
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
