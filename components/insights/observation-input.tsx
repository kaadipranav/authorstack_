"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";

interface Observation {
    id: string;
    observationText: string;
    createdAt: Date;
}

interface ObservationInputProps {
    observations: Observation[];
    onAdd: (text: string) => Promise<void>;
}

export function ObservationInput({ observations, onAdd }: ObservationInputProps) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            await onAdd(text);
            setText("");
        } catch (error) {
            console.error("Failed to add observation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-stroke bg-surface">
            <CardHeader>
                <CardTitle className="text-heading-2 text-ink">Your Observations</CardTitle>
                <p className="text-small text-charcoal">
                    Add notes and insights that the AI will incorporate into future recommendations
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Textarea
                        placeholder="e.g., 'Sales spike on weekends' or 'Thriller category performs better than romance'"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[100px] border-stroke resize-none"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !text.trim()}
                        className="bg-burgundy hover:bg-burgundy/90 text-surface"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Observation
                            </>
                        )}
                    </Button>
                </form>

                {/* List of observations */}
                <div className="space-y-2 mt-6">
                    <h4 className="text-body font-semibold text-ink">Recent Observations</h4>
                    {observations.length === 0 ? (
                        <p className="text-small text-charcoal italic py-4">
                            No observations yet. Add your first insight above.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {observations.slice(0, 5).map((obs) => (
                                <div
                                    key={obs.id}
                                    className="p-3 rounded border border-stroke bg-glass"
                                >
                                    <p className="text-body text-ink">{obs.observationText}</p>
                                    <p className="text-mini text-charcoal mt-1">
                                        {new Date(obs.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
