"use client";

/** Submit button that asks for confirmation first (used for destructive actions). */
export default function ConfirmButton({
    message, children, className, ...rest
}: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...rest}
            type="submit"
            className={className}
            onClick={(e) => {
                if (!window.confirm(message)) e.preventDefault();
            }}
        >
            {children}
        </button>
    );
}
