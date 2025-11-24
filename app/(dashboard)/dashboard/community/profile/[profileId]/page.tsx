import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";
import { FollowButton } from "@/components/community/FollowButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Twitter, Instagram, Calendar, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const session = await requireAuth();
  const { profileId } = await params;

  const profile = await communityService.getAuthorProfileBySlug(profileId) ||
    await communityService.getAuthorProfile(profileId);

  if (!profile) {
    notFound();
  }

  const isOwnProfile = profile.profile_id === session.id;
  const isFollowing = isOwnProfile
    ? false
    : await communityService.isFollowing(session.id, profile.profile_id);

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Banner */}
      {profile.banner_url && (
        <div className="w-full h-48 mb-4 rounded-xl overflow-hidden">
          <Image
            src={profile.banner_url}
            alt="Profile banner"
            width={1200}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Header */}
      <Card className="p-6 border-2 border-stroke bg-surface mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || "Author"}
                width={120}
                height={120}
                className="rounded-full"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-burgundy/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-burgundy">
                  {(profile.display_name || "A")[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-ink mb-1">
                  {profile.display_name || "Anonymous Author"}
                </h1>
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-charcoal mb-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
              </div>

              {!isOwnProfile && (
                <FollowButton
                  profileId={profile.profile_id}
                  initialIsFollowing={isFollowing}
                />
              )}

              {isOwnProfile && (
                <Button asChild variant="outline">
                  <Link href="/dashboard/profile">Edit Profile</Link>
                </Button>
              )}
            </div>

            {profile.bio && (
              <p className="text-ink mb-4 whitespace-pre-wrap">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mb-4">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-burgundy hover:underline flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-burgundy hover:underline flex items-center gap-1"
                >
                  <Twitter className="h-4 w-4" />
                  @{profile.twitter_handle}
                </a>
              )}
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-burgundy hover:underline flex items-center gap-1"
                >
                  <Instagram className="h-4 w-4" />
                  @{profile.instagram_handle}
                </a>
              )}
            </div>

            {/* Stats */}
            {profile.show_stats && (
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-ink">{profile.post_count}</span>
                  <span className="text-charcoal ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-semibold text-ink">{profile.follower_count}</span>
                  <span className="text-charcoal ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold text-ink">{profile.following_count}</span>
                  <span className="text-charcoal ml-1">Following</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Recent Posts Section */}
      <div>
        <h2 className="text-xl font-serif font-bold text-ink mb-4">Recent Posts</h2>
        <div className="text-center py-12 text-charcoal">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-charcoal/50" />
          <p>Post history coming soon</p>
        </div>
      </div>
    </div>
  );
}
