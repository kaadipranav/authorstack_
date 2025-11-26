"use client";

import React, { useState, useEffect } from "react";

interface ABTest {
    id: string;
    test_name: string;
    test_type: string;
    status: "draft" | "running" | "paused" | "completed";
    variants: Array<{
        id: string;
        variant_name: string;
        impressions: number;
        clicks: number;
        conversions: number;
    }>;
}

export function ABTestList() {
    const [tests, setTests] = useState<ABTest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await fetch("/api/ab-tests");
            const data = await res.json();
            setTests(data.tests || []);
        } catch (error) {
            console.error("Failed to fetch tests:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (testId: string, status: string) => {
        try {
            await fetch(`/api/ab-tests/${testId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            fetchTests();
        } catch (error) {
            console.error("Failed to update test:", error);
        }
    };

    const deleteTest = async (testId: string) => {
        if (!confirm("Delete this test?")) return;
        try {
            await fetch(`/api/ab-tests/${testId}`, {
                method: "DELETE",
            });
            fetchTests();
        } catch (error) {
            console.error("Failed to delete test:", error);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading tests...</div>;
    }

    if (tests.length === 0) {
        return (
            <div className="text-center py-8 text-charcoal">
                No A/B tests yet. Create one to get started!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tests.map((test) => (
                <div
                    key={test.id}
                    className="rounded-xl border border-burgundy/10 bg-surface p-6 shadow-sm"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-medium text-ink">{test.test_name}</h3>
                            <p className="text-sm text-charcoal capitalize">
                                {test.test_type} test
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-3 py-1 text-xs rounded-full font-medium ${test.status === "running"
                                        ? "bg-green-100 text-green-700"
                                        : test.status === "completed"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {test.status}
                            </span>
                            <button
                                onClick={() => deleteTest(test.id)}
                                className="text-red-500 hover:text-red-700 px-2"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {test.variants.map((variant) => (
                            <div
                                key={variant.id}
                                className="p-4 rounded-lg bg-paper border border-burgundy/10"
                            >
                                <h4 className="font-semibold mb-2">{variant.variant_name}</h4>
                                <div className="text-sm space-y-1">
                                    <div>Impressions: {variant.impressions}</div>
                                    <div>Clicks: {variant.clicks}</div>
                                    <div>Conversions: {variant.conversions}</div>
                                    {variant.impressions > 0 && (
                                        <div className="text-primary font-semibold">
                                            CTR: {((variant.clicks / variant.impressions) * 100).toFixed(2)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {test.status === "draft" && (
                        <button
                            onClick={() => updateStatus(test.id, "running")}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
                        >
                            Start Test
                        </button>
                    )}
                    {test.status === "running" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateStatus(test.id, "paused")}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
                            >
                                Pause
                            </button>
                            <button
                                onClick={() => updateStatus(test.id, "completed")}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            >
                                Complete
                            </button>
                        </div>
                    )}
                    {test.status === "paused" && (
                        <button
                            onClick={() => updateStatus(test.id, "running")}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
                        >
                            Resume
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
