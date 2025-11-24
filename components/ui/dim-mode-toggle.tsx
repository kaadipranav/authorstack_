"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function DimModeToggle() {
    const [isDimMode, setIsDimMode] = useState(false);

    // Load preference from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("dimMode");
        const isDim = saved === "true";
        setIsDimMode(isDim);

        if (isDim) {
            document.documentElement.classList.add("dim");
        } else {
            document.documentElement.classList.remove("dim");
        }
    }, []);

    const toggleDimMode = () => {
        const newValue = !isDimMode;
        setIsDimMode(newValue);
        localStorage.setItem("dimMode", String(newValue));

        if (newValue) {
            document.documentElement.classList.add("dim");
        } else {
            document.documentElement.classList.remove("dim");
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleDimMode}
            className="h-9 w-9 p-0"
            aria-label={isDimMode ? "Switch to light mode" : "Switch to dim mode"}
            title={isDimMode ? "Light Mode" : "Dim Mode"}
        >
            {isDimMode ? (
                <Sun className="h-4 w-4 text-amber" />
            ) : (
                <Moon className="h-4 w-4 text-charcoal" />
            )}
        </Button>
    );
}
