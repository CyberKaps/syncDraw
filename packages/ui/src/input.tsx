"use client";

import { ReactNode, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    type?: string;
    children?: ReactNode;
}

export const Input: React.FC<InputProps> = ({ placeholder, type = "text", ...props }) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className="p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            {...props}
        />
    );
};