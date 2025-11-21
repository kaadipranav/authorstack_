"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export function LaunchCalendar() {
    const [selected, setSelected] = React.useState<Date | undefined>(new Date());

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="p-4 border border-burgundy/10 rounded-xl bg-surface shadow-sm self-start">
                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    modifiersClassNames={{
                        selected: "bg-burgundy text-white hover:bg-burgundy/90",
                        today: "text-burgundy font-bold"
                    }}
                />
            </div>
            <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-6 text-ink">
                    {selected ? format(selected, "MMMM do, yyyy") : "Select a date"}
                </h2>
                {selected ? (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-burgundy/10 bg-paper p-4 text-charcoal text-sm">
                            No tasks scheduled for this date.
                        </div>
                        {/* Placeholder for task list */}
                    </div>
                ) : (
                    <p className="text-charcoal">Pick a date to view tasks.</p>
                )}
            </div>
        </div>
    );
}
