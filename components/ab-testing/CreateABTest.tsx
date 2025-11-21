"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateABTest() {
    const [name, setName] = useState("");
    const [variantA, setVariantA] = useState("");
    const [variantB, setVariantB] = useState("");

    const handleCreate = () => {
        // Placeholder: In a real app this would call an API.
        console.log("Create test:", { name, variantA, variantB });
        setName("");
        setVariantA("");
        setVariantB("");
    };

    return (
        <div className="rounded-xl border border-burgundy/10 bg-surface p-6 shadow-sm mb-8 w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4 text-ink">Create New A/B Test</h2>
            <div className="space-y-4">
                <Input
                    placeholder="Test name (e.g., New Cover Design)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        placeholder="Variant A"
                        value={variantA}
                        onChange={(e) => setVariantA(e.target.value)}
                    />
                    <Input
                        placeholder="Variant B"
                        value={variantB}
                        onChange={(e) => setVariantB(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} className="w-full">
                    Start Test
                </Button>
            </div>
        </div>
    );
}
