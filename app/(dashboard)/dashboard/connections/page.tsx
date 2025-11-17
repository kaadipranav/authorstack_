import Link from "next/link";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const connectors = [
  {
    title: "Amazon KDP",
    description: "Upload CSVs or connect OAuth to sync Kindle Direct Publishing data.",
    href: "/dashboard/connections/amazon-kdp",
  },
  {
    title: "Gumroad",
    description: "OAuth with Gumroad to ingest SKU-level sales and refunds.",
    href: "/dashboard/connections/gumroad",
  },
  {
    title: "Whop",
    description: "Manage memberships and upgrade/downgrade events.",
    href: "/dashboard/connections/whop",
  },
];

export default function ConnectionsPage() {
  return (
    <DashboardShell
      title="Platform connections"
      description="Authenticate sales channels so ingestion jobs can run automatically."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {connectors.map((connector) => (
          <Card key={connector.title}>
            <CardHeader>
              <CardTitle>{connector.title}</CardTitle>
              <CardDescription>{connector.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={connector.href}>Configure</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

