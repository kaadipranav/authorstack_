"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateABTest() {
    const [name, setName] = useState("");
    const [testType, setTestType] = useState("cover");
    const [variantA, setVariantA] = useState("");
    const [variantB, setVariantB] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !variantA || !variantB) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/ab-tests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    test_name: name,
                    test_type: testType,
                    variants: [
                        { name: "Variant A", data: { value: variantA } },
                        { name: "Variant B", data: { value: variantB } },
                    ],
                }),
            });

            if (res.ok) {
                setName("");
                setVariantA("");
                setVariantB("");
                // Reload to show new test
                window.location.reload();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to create test");
            }
        } catch (error) {
            console.error("Failed to create test:", error);
            alert("Failed to create test");
        } finally {
            setLoading(false);
        }
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
                <div>
                    <label className="block text-sm font-medium mb-2">Test Type</label>
                    <select
                        value={testType}
                        onChange={(e) => setTestType(e.target.value)}
                        className="w-full px-3 py-2 border border-burgundy/20 rounded-lg bg-paper"
                    >
                        <option value="cover">Cover</option>
                        <option value="title">Title</option>
                        <option value="description">Description</option>
                        <option value="price">Price</option>
                        <option value="keywords">Keywords</option>
                    </select>
                </div>
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
                <Button onClick={handleCreate} className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Test"}
                </Button>
            </div>
        </div>
    );
}
