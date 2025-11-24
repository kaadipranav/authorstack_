"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Heart, Shield, Users, Sparkles, AlertCircle } from "lucide-react";

interface CommunityGuidelinesModalProps {
    open: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

const guidelines = [
    {
        icon: Heart,
        title: "Be Respectful & Supportive",
        description: "Treat fellow authors with kindness. Constructive feedback is welcome; negativity is not.",
        required: true,
    },
    {
        icon: BookOpen,
        title: "Share Authentically",
        description: "Post genuine updates about your author journey. Self-promotion is allowed, but avoid spam.",
        required: true,
    },
    {
        icon: Shield,
        title: "Respect Intellectual Property",
        description: "Don't share copyrighted content without permission. Respect others' creative work.",
        required: true,
    },
    {
        icon: Users,
        title: "Keep It Professional",
        description: "No harassment, hate speech, or inappropriate content. This is a professional community.",
        required: true,
    },
    {
        icon: Sparkles,
        title: "Add Value",
        description: "Share insights, celebrate wins, ask questions. Help make this community valuable for everyone.",
        required: false,
    },
];

export function CommunityGuidelinesModal({
    open,
    onAccept,
    onDecline,
}: CommunityGuidelinesModalProps) {
    const [acceptedGuidelines, setAcceptedGuidelines] = useState<boolean[]>(
        new Array(guidelines.length).fill(false)
    );
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const allRequiredAccepted = guidelines.every(
        (guideline, index) => !guideline.required || acceptedGuidelines[index]
    );

    const canProceed = allRequiredAccepted && agreedToTerms;

    const toggleGuideline = (index: number) => {
        const newAccepted = [...acceptedGuidelines];
        newAccepted[index] = !newAccepted[index];
        setAcceptedGuidelines(newAccepted);
    };

    const handleAccept = () => {
        if (canProceed) {
            onAccept();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">
                        Welcome to AuthorStack Community! 📚
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Before you start posting, please review and accept our community guidelines.
                        These help us maintain a supportive, professional space for all authors.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Guidelines List */}
                    {guidelines.map((guideline, index) => {
                        const Icon = guideline.icon;
                        return (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-lg border border-stroke hover:border-burgundy/30 transition-colors"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <Checkbox
                                        id={`guideline-${index}`}
                                        checked={acceptedGuidelines[index]}
                                        onCheckedChange={() => toggleGuideline(index)}
                                        className="h-5 w-5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className="h-5 w-5 text-burgundy" />
                                        <label
                                            htmlFor={`guideline-${index}`}
                                            className="font-semibold text-ink cursor-pointer"
                                        >
                                            {guideline.title}
                                            {guideline.required && (
                                                <span className="text-burgundy ml-1">*</span>
                                            )}
                                        </label>
                                    </div>
                                    <p className="text-sm text-charcoal leading-relaxed">
                                        {guideline.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Final Agreement */}
                    <div className="mt-6 p-4 bg-amber/10 border border-amber/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="terms-agreement"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                className="h-5 w-5 mt-0.5"
                            />
                            <label
                                htmlFor="terms-agreement"
                                className="text-sm text-ink cursor-pointer leading-relaxed"
                            >
                                <span className="font-semibold">I agree to follow these guidelines</span> and
                                understand that violations may result in content removal or account suspension.
                                I will help maintain a positive, supportive community for all authors.
                            </label>
                        </div>
                    </div>

                    {/* Warning if not all accepted */}
                    {!canProceed && (
                        <div className="flex items-start gap-2 p-3 bg-burgundy/10 border border-burgundy/30 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-burgundy flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-burgundy">
                                Please accept all required guidelines (marked with *) and agree to the terms to continue.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onDecline}
                        className="border-stroke hover:bg-glass"
                    >
                        Not Now
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={!canProceed}
                        className="bg-burgundy hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Accept & Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
