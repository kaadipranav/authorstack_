import React from "react";

type MockTest = {
    id: string;
    name: string;
    variantA: string;
    variantB: string;
    status: "running" | "completed";
};

const mockTests: MockTest[] = [
    {
        id: "1",
        name: "Cover A/B",
        variantA: "Cover 1",
        variantB: "Cover 2",
        status: "running",
    },
    {
        id: "2",
        name: "Title A/B",
        variantA: "Title A",
        variantB: "Title B",
        status: "completed",
    },
];

export function ABTestList() {
    return (
        <div className="space-y-4">
            {mockTests.map((test) => (
                <div
                    key={test.id}
                    className="flex items-center justify-between rounded-xl border border-burgundy/10 bg-surface p-4 shadow-sm"
                >
                    <div>
                        <h3 className="text-lg font-medium text-ink">{test.name}</h3>
                        <p className="text-sm text-charcoal">
                            {test.variantA} vs {test.variantB}
                        </p>
                    </div>
                    <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${test.status === "running"
                                ? "bg-amber/10 text-amber"
                                : "bg-success/10 text-success"
                            }`}
                    >
                        {test.status}
                    </span>
                </div>
            ))}
        </div>
    );
}
