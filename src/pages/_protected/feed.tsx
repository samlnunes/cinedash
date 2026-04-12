import { createFileRoute } from "@tanstack/react-router";
import { FeedDashboard } from "@/widgets/feed-dashboard";

export const Route = createFileRoute("/_protected/feed")({
  component: FeedPage,
});

function FeedPage() {
  return <FeedDashboard />;
}
