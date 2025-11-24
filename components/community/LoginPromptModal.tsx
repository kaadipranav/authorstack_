"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, UserPlus, PenSquare } from "lucide-react";

type LoginPromptAction = "like" | "comment" | "follow" | "post";

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: LoginPromptAction;
}

const actionConfig = {
    like: {
        icon: Heart,
        title: "Sign in to like posts",
        description: "Join AuthorStack to show your support for fellow authors",
    },
    comment: {
        icon: MessageCircle,
        title: "Sign in to comment",
        description: "Share your thoughts and connect with the community",
    },
    follow: {
        icon: UserPlus,
        title: "Sign in to follow authors",
        description: "Stay updated with your favorite authors' latest posts",
    },
    post: {
        icon: PenSquare,
        title: "Sign in to create posts",
        description: "Share your author journey with the community",
    },
};

export function LoginPromptModal({ isOpen, onClose, action }: LoginPromptModalProps) {
    const config = actionConfig[action];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-burgundy/10 rounded-full flex items-center justify-center">
                            <Icon className="h-8 w-8 text-burgundy" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">{config.title}</DialogTitle>
                    <DialogDescription className="text-center text-base">
                        {config.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                    <Button asChild className="w-full bg-burgundy hover:bg-burgundy/90">
                        <Link href="/auth/sign-up">Create Account</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/sign-in">Sign In</Link>
                    </Button>
                </div>

                <p className="text-xs text-center text-charcoal mt-4">
                    Free tier includes 2 platform connections • No credit card required
                </p>
            </DialogContent>
        </Dialog>
    );
}

// Hook for using the login prompt
export function useLoginPrompt() {
    const [isOpen, setIsOpen] = useState(false);
    const [action, setAction] = useState<LoginPromptAction>("like");

    const promptLogin = (actionType: LoginPromptAction) => {
        setAction(actionType);
        setIsOpen(true);
    };

    const closePrompt = () => {
        setIsOpen(false);
    };

    return {
        isOpen,
        action,
        promptLogin,
        closePrompt,
        LoginPrompt: () => (
            <LoginPromptModal isOpen={isOpen} onClose={closePrompt} action={action} />
        ),
    };
}
