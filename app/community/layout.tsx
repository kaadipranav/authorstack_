import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community",
    description: "Connect with fellow indie authors, share your journey, and grow together in the AuthorStack community.",
    openGraph: {
        title: "AuthorStack Community - Connect with Fellow Authors",
        description: "Share milestones, celebrate launches, and grow together with indie authors worldwide.",
        type: "website",
    },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
