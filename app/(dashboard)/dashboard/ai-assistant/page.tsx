import { AIChat } from "@/components/ai/ai-chat";

export default function AIAssistantPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-display text-ink">AI Assistant</h1>
                <p className="text-body text-charcoal mt-2">
                    Get personalized advice on book launches, pricing, marketing, and sales optimization.
                </p>
            </div>

            <AIChat />
        </div>
    );
}
