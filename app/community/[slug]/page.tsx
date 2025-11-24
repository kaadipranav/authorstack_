import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Link2, Twitter, Instagram, Youtube, Calendar, BookOpen, Users, MessageCircle } from "lucide-react";
import { communityService } from "@/lib/modules/community/application/community-services";
import type { Metadata } from "next";

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const profile = await communityService.getAuthorProfileBySlug(params.slug);

    if (!profile) {
        return {
            title: "Author Not Found",
        };
    }

    return {
        title: `${profile.display_name || "Author"} | AuthorStack Community`,
        description: profile.bio || `View ${profile.display_name}'s author profile and books on AuthorStack`,
        openGraph: {
            title: profile.display_name || "Author Profile",
            description: profile.bio || undefined,
            images: profile.avatar_url ? [profile.avatar_url] : undefined,
        },
    };
}

export default async function PublicAuthorProfilePage({ params }: Props) {
    const profile = await communityService.getAuthorProfileBySlug(params.slug);

    if (!profile) {
        notFound();
    }

    // Check if profile is public
    if (profile.visibility !== "public") {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <h1 className="text-2xl font-serif font-bold text-ink mb-2">Private Profile</h1>
                        <p className="text-charcoal mb-4">
                            This author's profile is private and not available for public viewing.
                        </p>
                        <Button asChild>
                            <Link href="/community">Back to Community</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-paper">
            {/* Header */}
            <header className="border-b border-stroke bg-surface/80 backdrop-blur sticky top-0 z-50">
                <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
                    <Link href="/community" className="flex items-center gap-3">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/logos/Communtiy_logo_light.png"
                                alt="AuthorStack Community"
                                fill
                                sizes="32px"
                                className="object-contain"
                            />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-charcoal">
                            Community
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/auth/sign-in">Sign in</Link>
                        </Button>
                        <Button asChild size="sm" className="bg-burgundy hover:bg-burgundy/90">
                            <Link href="/auth/sign-up">Join Community</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Profile Content */}
            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Banner */}
                {profile.banner_url && (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-6">
                        <Image
                            src={profile.banner_url}
                            alt="Profile banner"
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-lg">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.display_name || "Author"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-burgundy/10 flex items-center justify-center">
                                    <span className="text-4xl font-serif text-burgundy">
                                        {(profile.display_name || "A")[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-ink mb-2">
                                    {profile.display_name}
                                </h1>
                                {profile.location && (
                                    <div className="flex items-center gap-2 text-charcoal mb-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-charcoal text-sm">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {joinedDate}</span>
                                </div>
                            </div>

                            {/* CTA - Sign in to follow */}
                            <Button asChild className="bg-burgundy hover:bg-burgundy/90">
                                <Link href="/auth/sign-in">Sign in to Follow</Link>
                            </Button>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <p className="text-charcoal leading-relaxed mb-4">{profile.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="flex gap-6 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-burgundy">{profile.follower_count}</div>
                                <div className="text-sm text-charcoal">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-burgundy">{profile.following_count}</div>
                                <div className="text-sm text-charcoal">Following</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-burgundy">{profile.post_count}</div>
                                <div className="text-sm text-charcoal">Posts</div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-charcoal hover:text-burgundy transition-colors"
                                >
                                    <Link2 className="h-5 w-5" />
                                </a>
                            )}
                            {profile.twitter_handle && (
                                <a
                                    href={`https://twitter.com/${profile.twitter_handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-charcoal hover:text-burgundy transition-colors"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {profile.instagram_handle && (
                                <a
                                    href={`https://instagram.com/${profile.instagram_handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-charcoal hover:text-burgundy transition-colors"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {profile.youtube_channel && (
                                <a
                                    href={profile.youtube_channel}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-charcoal hover:text-burgundy transition-colors"
                                >
                                    <Youtube className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Posts Section */}
                <div className="border-t border-stroke pt-8">
                    <h2 className="text-2xl font-serif font-bold text-ink mb-6">Recent Posts</h2>
                    <div className="bg-surface/50 border border-stroke rounded-xl p-8 text-center">
                        <BookOpen className="h-12 w-12 text-charcoal mx-auto mb-4 opacity-50" />
                        <p className="text-charcoal mb-4">
                            Sign in to view {profile.display_name}'s posts and activity
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button asChild>
                                <Link href="/auth/sign-up">Create Account</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/auth/sign-in">Sign In</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-stroke bg-surface py-8 mt-12">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logos/Light_logo.png"
                                alt="AuthorStack"
                                width={24}
                                height={24}
                                className="object-contain"
                            />
                            <span className="text-sm text-charcoal">
                                © 2025 AuthorStack. Built for indie authors.
                            </span>
                        </div>
                        <div className="flex gap-6">
                            <Link href="/" className="text-sm text-charcoal hover:text-burgundy transition-colors">
                                Home
                            </Link>
                            <Link href="/community" className="text-sm text-charcoal hover:text-burgundy transition-colors">
                                Community
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
