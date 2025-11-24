"use client";

import { useState, useEffect } from "react";
import { FeedList } from "@/components/community/FeedList";
import { CommunityGuidelinesModal } from "@/components/community/CommunityGuidelinesModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommunityPageClientProps {
    userId: string;
    hasAcceptedGuidelines: boolean;
}

export function CommunityPageClient({ userId, hasAcceptedGuidelines }: CommunityPageClientProps) {
    const [showGuidelines, setShowGuidelines] = useState(!hasAcceptedGuidelines);
    const [isAccepted, setIsAccepted] = useState(hasAcceptedGuidelines);

    const handleAccept = async () => {
        try {
            const response = await fetch("/api/community/accept-guidelines", {
                method: "POST",
            });

            if (response.ok) {
                setIsAccepted(true);
                setShowGuidelines(false);
            }
        } catch (error) {
            console.error("Failed to accept guidelines:", error);
        }
    };

    const handleDecline = () => {
        setShowGuidelines(false);
    };

    return (
        <>
            <CommunityGuidelinesModal
                open={showGuidelines}
                onAccept={handleAccept}
                onDecline={handleDecline}
            />

            <div className="container mx-auto px-6 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-ink mb-2">Community</h1>
                    <p className="text-charcoal">
                        Connect with fellow authors, share updates, and celebrate milestones together.
                    </p>
                </div>

                <Tabs defaultValue="following" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="following">Following</TabsTrigger>
                        <TabsTrigger value="global">Discover</TabsTrigger>
                    </TabsList>

                    <TabsContent value="following">
                        <FeedList currentUserId={userId} feedType="following" />
                    </TabsContent>

                    <TabsContent value="global">
                        <FeedList currentUserId={userId} feedType="global" />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
