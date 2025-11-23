"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AddCompetitorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (data: { asin: string; title: string; author?: string }) => Promise<void>;
}

export function AddCompetitorModal({ open, onOpenChange, onAdd }: AddCompetitorModalProps) {
    const [asin, setAsin] = useState("");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!asin || !title) {
            setError("ASIN and title are required");
            return;
        }

        setLoading(true);
        try {
            await onAdd({ asin, title, author: author || undefined });
            // Reset form
            setAsin("");
            setTitle("");
            setAuthor("");
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to add competitor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-surface border-stroke">
                <DialogHeader>
                    <DialogTitle className="text-heading-2 text-ink">Add Competitor</DialogTitle>
                    <DialogDescription className="text-body text-charcoal">
                        Track a competitor's book by entering their Amazon ASIN or title.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="asin" className="text-body text-ink">
                            Amazon ASIN *
                        </Label>
                        <Input
                            id="asin"
                            placeholder="B08XYZ1234"
                            value={asin}
                            onChange={(e) => setAsin(e.target.value)}
                            className="border-stroke"
                            disabled={loading}
                        />
                        <p className="text-mini text-charcoal">
                            Find the ASIN in the product URL or details section
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-body text-ink">
                            Book Title *
                        </Label>
                        <Input
                            id="title"
                            placeholder="The Great Novel"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border-stroke"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="author" className="text-body text-ink">
                            Author (optional)
                        </Label>
                        <Input
                            id="author"
                            placeholder="Jane Doe"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="border-stroke"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-small text-danger bg-danger/10 border border-danger/20 rounded p-3">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="border-stroke text-ink hover:bg-glass"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-burgundy hover:bg-burgundy/90 text-surface"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Competitor"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
