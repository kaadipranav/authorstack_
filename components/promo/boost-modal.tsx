"use client";

import { useState, useEffect } from "react";
import { X, Zap, AlertCircle } from "lucide-react";
import type {
    BoostSlotType,
    CreateBoostRequest,
} from "@/lib/modules/leaderboard/domain/types";
import { BOOST_SLOT_PRICING, BOOST_DURATIONS } from "@/lib/modules/leaderboard/domain/types";

interface BoostModalProps {
    isOpen: boolean;
    onClose: () => void;
    slotType: BoostSlotType;
    onSuccess: () => void;
}

export function BoostModal({
    isOpen,
    onClose,
    slotType,
    onSuccess,
}: BoostModalProps) {
    const [books, setBooks] = useState<any[]>([]);
    const [selectedBook, setSelectedBook] = useState<string>("");
    const [duration, setDuration] = useState(24);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [creditBalance, setCreditBalance] = useState(0);

    const pricing = BOOST_SLOT_PRICING[slotType];
    const cost = Math.ceil((pricing.credits_per_24hr * duration) / 24);

    useEffect(() => {
        if (isOpen) {
            fetchBooks();
            fetchCreditBalance();
        }
    }, [isOpen]);

    const fetchBooks = async () => {
        try {
            const res = await fetch("/api/books");
            const data = await res.json();
            setBooks(data.books || []);
        } catch (err) {
            console.error("Failed to fetch books:", err);
        }
    };

    const fetchCreditBalance = async () => {
        try {
            const res = await fetch("/api/promo/credits");
            const data = await res.json();
            setCreditBalance(data.balance || 0);
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    };

    const handleBoost = async () => {
        if (!selectedBook) {
            setError("Please select a book");
            return;
        }

        if (creditBalance < cost) {
            setError(`Insufficient credits. You need ${cost} credits but have ${creditBalance}.`);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const request: CreateBoostRequest = {
                book_id: selectedBook,
                slot_type: slotType,
                duration_hours: duration,
            };

            const res = await fetch("/api/promo/boosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create boost");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create boost");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-md w-full p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Boost Your Book</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Slot Info */}
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="font-medium text-sm">{pricing.label}</div>
                        <div className="text-xs text-muted-foreground">
                            {pricing.reach} Reach • {pricing.credits_per_24hr} credits/24hr
                        </div>
                    </div>

                    {/* Book Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select Book
                        </label>
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border bg-background"
                        >
                            <option value="">Choose a book...</option>
                            {books.map((book) => (
                                <option key={book.id} value={book.id}>
                                    {book.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Duration Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Duration
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {BOOST_DURATIONS.map((d) => (
                                <button
                                    key={d.hours}
                                    onClick={() => setDuration(d.hours)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${duration === d.hours
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="p-4 rounded-lg bg-muted space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Duration:</span>
                            <span className="font-medium">{duration} hours</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Cost:</span>
                            <span className="font-medium">{cost} credits</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                            <span>Your Balance:</span>
                            <span className={`font-medium ${creditBalance < cost ? "text-red-500" : "text-green-500"}`}>
                                {creditBalance} credits
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBoost}
                            disabled={loading || !selectedBook || creditBalance < cost}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? (
                                "Creating..."
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 inline mr-2" />
                                    Boost for {cost} Credits
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
