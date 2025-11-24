import { requireAuth } from "@/lib/auth/session";
import { FeedList } from "@/components/community/FeedList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function CommunityPage() {
  const session = await requireAuth();

  return (
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
          <FeedList currentUserId={session.id} feedType="following" />
        </TabsContent>

        <TabsContent value="global">
          <FeedList currentUserId={session.id} feedType="global" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
