import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  const variants = {
    default: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border border-border bg-transparent hover:bg-muted',
    ghost: 'hover:bg-muted',
    danger: 'bg-danger text-white hover:opacity-90',
    link: 'text-primary underline-offset-4 hover:underline',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10',
  }

  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})

Button.displayName = 'Button'
export default Button
