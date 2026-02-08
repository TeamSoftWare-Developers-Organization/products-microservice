import * as React from "react"
import { Root as CheckboxPrimitiveRoot, Indicator as CheckboxPrimitiveIndicator } from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitiveRoot>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitiveRoot>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitiveRoot
        ref={ref}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
        )}
        {...props}
    >
        <CheckboxPrimitiveIndicator
            className={cn("flex items-center justify-center text-current")}
        >
            <Check className="h-4 w-4" />
        </CheckboxPrimitiveIndicator>
    </CheckboxPrimitiveRoot>
))
Checkbox.displayName = CheckboxPrimitiveRoot.displayName

export { Checkbox }
