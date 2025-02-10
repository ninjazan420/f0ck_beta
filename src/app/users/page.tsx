import { Metadata } from "next";
import { UsersPage } from "./components/UsersPage";

export const metadata: Metadata = {
  title: "Users - f0ck beta v1",
  description: "Browse and discover our community members.",
  keywords: ["users", "members", "community", "profiles", "creators"],
  openGraph: {
    title: "Community Members - f0ck beta v1",
    description: "Discover content creators and community members.",
  }
};

export default function Users() {
  return <UsersPage />;
}
