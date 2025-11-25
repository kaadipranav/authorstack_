import { Suspense } from "react";
import { LeaderboardList } from "@/components/leaderboard/leaderboard-list";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";
import { leaderboardRepository } from "@/lib/modules/leaderboard/infrastructure/supabase-repository";
import { Trophy, Filter } from "lucide-react";

export const metadata = {
    title: "Leaderboard | AuthorStack",
    description: "Top authors and books ranked by sales, engagement, and community activity",
};

async function getLeaderboards() {
    return leaderboardRepository.getActiveLeaderboards();
}

async function getLeaderboardData(slug: string) {
    return leaderboardService.getLeaderboard(slug, 1, 50);
}

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: Promise<{ slug?: string; category?: string; window?: string }>;
}) {
    const params = await searchParams;
    const slug = params.slug || "weekly-authors-overall";

    const [leaderboards, data] = await Promise.all([
        getLeaderboards(),
        getLeaderboardData(slug),
    ]);

    // Group leaderboards by time window
    const weeklyLeaderboards = leaderboards.filter((lb) => lb.time_window === "weekly");
    const monthlyLeaderboards = leaderboards.filter((lb) => lb.time_window === "monthly");
    const allTimeLeaderboards = leaderboards.filter((lb) => lb.time_window === "all_time");

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Leaderboard</h1>
                </div>
                <p className="text-muted-foreground">
                    Top authors ranked by sales velocity, engagement, and community activity
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span>Filter by:</span>
                </div>

                {/* Time Window Tabs */}
                <div className="flex gap-2 border-b">
                    <a
                        href="?slug=weekly-authors-overall"
                        className={`px-4 py-2 font-medium transition-colors ${slug.includes("weekly")
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Weekly
                    </a>
                    <a
                        href="?slug=monthly-authors-overall"
                        className={`px-4 py-2 font-medium transition-colors ${slug.includes("monthly")
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Monthly
                    </a>
                    <a
                        href="?slug=alltime-authors-overall"
                        className={`px-4 py-2 font-medium transition-colors ${slug.includes("alltime")
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        All Time
                    </a>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                    <a
                        href={`?slug=${slug.includes("weekly") ? "weekly" : slug.includes("monthly") ? "monthly" : "alltime"}-authors-overall`}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${slug.includes("overall")
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                    >
                        All
                    </a>
                    {["Fiction", "Non-Fiction", "Romance", "Thriller", "Fantasy", "Self-Help", "Business", "Young Adult", "Sci-Fi", "Mystery", "Poetry", "Children's Books"].map(
                        (category) => {
                            const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "");
                            const timeWindow = slug.includes("weekly") ? "weekly" : slug.includes("monthly") ? "monthly" : "alltime";
                            const categoryLeaderboardSlug = `${timeWindow}-authors-${categorySlug}`;

                            return (
                                <a
                                    key={category}
                                    href={`?slug=${categoryLeaderboardSlug}`}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${slug === categoryLeaderboardSlug
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                        }`}
                                >
                                    {category}
                                </a>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Leaderboard List */}
            <Suspense
                fallback={
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                }
            >
                <LeaderboardList slug={slug} initialData={data} />
            </Suspense>

            {/* Info Box */}
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
                <h3 className="font-semibold mb-2">How Rankings Work</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <strong>Sales (40%):</strong> Recent sales velocity and volume</p>
                    <p>• <strong>Engagement (30%):</strong> Follower growth and profile views</p>
                    <p>• <strong>Community (30%):</strong> Posts, comments, and interactions</p>
                    <p className="mt-3 text-xs">
                        Rankings update hourly for weekly leaderboards, every 6 hours for monthly, and daily for all-time.
                    </p>
                </div>
            </div>
        </div>
    );
}
