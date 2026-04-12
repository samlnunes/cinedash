import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/widgets/profile-page";

export const Route = createFileRoute("/_protected/profile")({
  component: () => <ProfilePage />,
});
