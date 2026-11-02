"use client";

import { useState, type InputHTMLAttributes } from "react";

/** Password field with a show / hide button. `invalid` paints the border red. */
export default function PasswordInput({ className = "", invalid = false, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative mt-1.5 block">
            <input
                {...props}
                type={show ? "text" : "password"}
                aria-invalid={invalid || undefined}
                className={`${className} !mt-0 pr-12 ${invalid ? "!border-[#d23b25] !bg-[#fff5f3] focus:!border-[#d23b25]" : ""}`}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
                aria-pressed={show}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-[#5b6478] hover:bg-[#0b1220]/5 hover:text-[#0b1220]"
            >
                {show ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.800 9.800 0 0112 5c5 0 8.500 4.200 10 7a14.500 14.500 0 01-3.200 4M6.600 6.600C4.400 8 2.900 10.200 2 12c1.500 2.800 5 7 10 7 1.600 0 3-.4 4.200-1" /></svg>
                ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12c1.500-2.800 5-7 10-7s8.500 4.200 10 7c-1.500 2.800-5 7-10 7S3.500 14.800 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
            </button>
        </span>
    );
}
