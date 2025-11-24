"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface AccordionProps {
    type?: "single" | "multiple";
    collapsible?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface AccordionItemProps {
    value: string;
    className?: string;
    children: React.ReactNode;
}

interface AccordionTriggerProps {
    className?: string;
    children: React.ReactNode;
}

interface AccordionContentProps {
    className?: string;
    children: React.ReactNode;
}

const AccordionContext = React.createContext<{
    openItems: string[];
    toggleItem: (value: string) => void;
}>({
    openItems: [],
    toggleItem: () => { },
});

const AccordionItemContext = React.createContext<string>("");

export function Accordion({ type = "single", collapsible = true, className, children }: AccordionProps) {
    const [openItems, setOpenItems] = React.useState<string[]>([]);

    const toggleItem = (value: string) => {
        if (type === "single") {
            setOpenItems((prev) =>
                prev.includes(value) && collapsible ? [] : [value]
            );
        } else {
            setOpenItems((prev) =>
                prev.includes(value)
                    ? prev.filter((item) => item !== value)
                    : [...prev, value]
            );
        }
    };

    return (
        <AccordionContext.Provider value={{ openItems, toggleItem }}>
            <div className={className}>{children}</div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({ value, className, children }: AccordionItemProps) {
    return (
        <AccordionItemContext.Provider value={value}>
            <div className={cn("border-b border-stroke", className)}>{children}</div>
        </AccordionItemContext.Provider>
    );
}

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
    const { openItems, toggleItem } = React.useContext(AccordionContext);
    const value = React.useContext(AccordionItemContext);
    const isOpen = openItems.includes(value);

    return (
        <button
            type="button"
            onClick={() => toggleItem(value)}
            className={cn(
                "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-left",
                className
            )}
        >
            {children}
            <ChevronDown
                className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}
            />
        </button>
    );
}

export function AccordionContent({ className, children }: AccordionContentProps) {
    const { openItems } = React.useContext(AccordionContext);
    const value = React.useContext(AccordionItemContext);
    const isOpen = openItems.includes(value);

    return (
        <div
            className={cn(
                "overflow-hidden text-sm transition-all",
                isOpen ? "max-h-96 pb-4" : "max-h-0"
            )}
        >
            <div className={className}>{children}</div>
        </div>
    );
}
