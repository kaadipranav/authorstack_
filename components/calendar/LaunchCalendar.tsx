"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    event_date: string;
    event_type: string;
    completed: boolean;
}

export function LaunchCalendar() {
    const [selected, setSelected] = React.useState<Date | undefined>(new Date());
    const [events, setEvents] = React.useState<CalendarEvent[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/calendar/events");
            const data = await res.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = async (eventId: string, completed: boolean) => {
        try {
            await fetch(`/api/calendar/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !completed }),
            });
            fetchEvents();
        } catch (error) {
            console.error("Failed to update event:", error);
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (!confirm("Delete this event?")) return;
        try {
            await fetch(`/api/calendar/events/${eventId}`, {
                method: "DELETE",
            });
            fetchEvents();
        } catch (error) {
            console.error("Failed to delete event:", error);
        }
    };

    const eventsForSelectedDate = selected
        ? events.filter(
            (e) => e.event_date === format(selected, "yyyy-MM-dd")
        )
        : [];

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
                {loading ? (
                    <p className="text-charcoal">Loading events...</p>
                ) : eventsForSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                        {eventsForSelectedDate.map((event) => (
                            <div
                                key={event.id}
                                className="rounded-lg border border-burgundy/10 bg-paper p-4 text-charcoal"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={event.completed}
                                            onChange={() => toggleComplete(event.id, event.completed)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <h3 className={`font-semibold ${event.completed ? "line-through text-charcoal/50" : "text-ink"}`}>
                                                {event.title}
                                            </h3>
                                            {event.description && (
                                                <p className="text-sm mt-1">{event.description}</p>
                                            )}
                                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-burgundy/10 text-burgundy">
                                                {event.event_type}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-burgundy/10 bg-paper p-4 text-charcoal text-sm">
                        No tasks scheduled for this date.
                    </div>
                )}
            </div>
        </div>
    );
}
