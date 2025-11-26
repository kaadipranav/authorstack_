"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateTaskModalProps {
    onTaskCreated?: () => void;
}

export function CreateTaskModal({ onTaskCreated }: CreateTaskModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            event_date: formData.get("date") as string,
            event_type: (formData.get("type") as string) || "other",
            is_all_day: true,
        };

        try {
            const res = await fetch("/api/calendar/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setIsOpen(false);
                e.currentTarget.reset();
                if (onTaskCreated) onTaskCreated();
                // Reload the page to refresh the calendar
                window.location.reload();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to create task");
            }
        } catch (error) {
            console.error("Failed to create task:", error);
            alert("Failed to create task");
        } finally {
            setLoading(false);
        }
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
                                <Input id="title" name="title" placeholder="e.g., Finalize cover design" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Due Date</Label>
                                <Input id="date" name="date" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Event Type</Label>
                                <select
                                    id="type"
                                    name="type"
                                    className="w-full px-3 py-2 border border-burgundy/20 rounded-lg bg-paper"
                                >
                                    <option value="other">Other</option>
                                    <option value="launch">Launch</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="milestone">Milestone</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="Add details..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Task"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
