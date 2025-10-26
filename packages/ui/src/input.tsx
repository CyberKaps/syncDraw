"use client";

import { ReactNode } from "react";

interface InputProps {
    placeholder: string,
    type: string,
    children?: ReactNode
}


export const Input: React.FC<InputProps> = ({ placeholder, type, ...props }) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className="p-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
        />
    );
};