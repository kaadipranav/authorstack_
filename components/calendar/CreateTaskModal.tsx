"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateTaskModal() {
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder logic
        console.log("Task created");
        setIsOpen(false);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Task</Button>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl border border-burgundy/10 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-ink">Add Launch Task</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-charcoal hover:text-ink"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input id="title" placeholder="e.g., Finalize cover design" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Due Date</Label>
                                <Input id="date" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Add details..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Task
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
