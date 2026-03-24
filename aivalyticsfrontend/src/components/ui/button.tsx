import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
 {
 variants: {
 variant: {
 default:
 " bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark: text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-blue-500 dark:focus:ring-blue-400",
 secondary:
 "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-gray-500 dark:focus:ring-gray-400",
 outline: "border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover: focus:ring-blue-500 dark:focus:ring-blue-400",
 ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 dark:focus:ring-gray-400",
 destructive:
 " bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark: text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-red-500 dark:focus:ring-red-400",
 success:
 " bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark: text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-green-500 dark:focus:ring-green-400",
 },
 size: {
 default: "h-12 px-6 py-3 text-sm rounded-xl",
 sm: "h-8 px-4 py-2 text-xs rounded-lg",
 lg: "h-14 px-8 py-4 text-base rounded-xl",
 icon: "h-10 w-10 rounded-xl",
 },
 fullWidth: {
 true: "w-full",
 false: "",
 },
 },
 defaultVariants: {
 variant: "default",
 size: "default",
 fullWidth: false,
 },
 }
);

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 loading?: boolean;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
 asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
 (
 {
 className = "",
 variant,
 size,
 fullWidth,
 loading = false,
 leftIcon,
 rightIcon,
 children,
 disabled,
 asChild = false,
 ...props
 },
 ref
 ) => {
 const Comp = asChild ? React.Fragment : "button";
 const buttonProps = asChild ? {} : props;

 return (
 <Comp
 ref={ref}
 className={buttonVariants({ variant, size, fullWidth, className })}
 disabled={disabled || loading}
 {...buttonProps}
 >
 {loading ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
 <span>Loading...</span>
 </>
 ) : (
 <>
 {leftIcon && leftIcon}
 {children}
 {rightIcon && rightIcon}
 </>
 )}
 </Comp>
 );
 }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
