import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar, ArrowLeft } from "lucide-react";
import { communityService } from "@/lib/modules/community/application/community-services";
import type { Metadata } from "next";

type Props = {
    params: { postId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await communityService.getPost(params.postId);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.author.display_name} on AuthorStack Community`,
        description: post.content.substring(0, 160),
        openGraph: {
            title: `${post.author.display_name}'s Post`,
            description: post.content.substring(0, 160),
            images: post.book?.cover_url ? [post.book.cover_url] : undefined,
        },
    };
}

export default async function PublicPostPage({ params }: Props) {
    const post = await communityService.getPost(params.postId);

    if (!post || post.is_deleted) {
        notFound();
    }

    const comments = await communityService.getComments(params.postId);

    const postDate = new Date(post.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
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

            {/* Post Content */}
            <div className="container mx-auto px-6 py-8 max-w-3xl">
                {/* Back Button */}
                <Button asChild variant="ghost" className="mb-6">
                    <Link href="/community">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Community
                    </Link>
                </Button>

                {/* Post Card */}
                <Card className="border-2 border-stroke mb-6">
                    <CardContent className="pt-6">
                        {/* Author Info */}
                        <div className="flex items-start gap-4 mb-4">
                            <Link
                                href={post.author.slug ? `/community/${post.author.slug}` : "#"}
                                className="flex-shrink-0"
                            >
                                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                    {post.author.avatar_url ? (
                                        <Image
                                            src={post.author.avatar_url}
                                            alt={post.author.display_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-burgundy/10 flex items-center justify-center">
                                            <span className="text-lg font-serif text-burgundy">
                                                {post.author.display_name[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <div className="flex-1">
                                <Link
                                    href={post.author.slug ? `/community/${post.author.slug}` : "#"}
                                    className="font-semibold text-ink hover:text-burgundy transition-colors"
                                >
                                    {post.author.display_name}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-charcoal">
                                    <Calendar className="h-3 w-3" />
                                    <span>{postDate}</span>
                                    {post.post_type !== "text" && (
                                        <>
                                            <span>•</span>
                                            <span className="capitalize">{post.post_type.replace("_", " ")}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-4">
                            <p className="text-ink whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        </div>

                        {/* Book Attachment */}
                        {post.book && (
                            <div className="bg-surface rounded-lg p-4 border border-stroke mb-4">
                                <div className="flex gap-4">
                                    {post.book.cover_url && (
                                        <div className="relative w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                                            <Image
                                                src={post.book.cover_url}
                                                alt={post.book.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-ink mb-1">{post.book.title}</h3>
                                        <p className="text-sm text-charcoal">Featured Book</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-6 pt-4 border-t border-stroke">
                            <div className="flex items-center gap-2 text-charcoal">
                                <Heart className="h-5 w-5" />
                                <span className="text-sm font-medium">{post.like_count} likes</span>
                            </div>
                            <div className="flex items-center gap-2 text-charcoal">
                                <MessageCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">{post.comment_count} comments</span>
                            </div>
                        </div>

                        {/* Sign in to interact */}
                        <div className="mt-4 pt-4 border-t border-stroke">
                            <p className="text-sm text-charcoal mb-3">Sign in to like and comment</p>
                            <div className="flex gap-3">
                                <Button asChild size="sm" className="bg-burgundy hover:bg-burgundy/90">
                                    <Link href="/auth/sign-up">Create Account</Link>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/auth/sign-in">Sign In</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-serif font-bold text-ink mb-4">
                        Comments ({comments.length})
                    </h2>

                    {comments.length === 0 ? (
                        <Card className="border-stroke">
                            <CardContent className="pt-6 text-center">
                                <MessageCircle className="h-12 w-12 text-charcoal mx-auto mb-3 opacity-50" />
                                <p className="text-charcoal">No comments yet. Be the first to comment!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => {
                                const commentDate = new Date(comment.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });

                                return (
                                    <Card key={comment.id} className="border-stroke">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                                    {comment.author.avatar_url ? (
                                                        <Image
                                                            src={comment.author.avatar_url}
                                                            alt={comment.author.display_name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-burgundy/10 flex items-center justify-center">
                                                            <span className="text-sm font-serif text-burgundy">
                                                                {comment.author.display_name[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-ink">
                                                            {comment.author.display_name}
                                                        </span>
                                                        <span className="text-sm text-charcoal">{commentDate}</span>
                                                    </div>
                                                    <p className="text-charcoal whitespace-pre-wrap">{comment.content}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Sign in to comment */}
                    <Card className="border-stroke mt-6">
                        <CardContent className="pt-6 text-center">
                            <p className="text-charcoal mb-4">Sign in to join the conversation</p>
                            <div className="flex gap-3 justify-center">
                                <Button asChild>
                                    <Link href="/auth/sign-up">Create Account</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/auth/sign-in">Sign In</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-stroke bg-surface py-8">
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
