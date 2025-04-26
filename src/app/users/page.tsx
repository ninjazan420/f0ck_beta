import { UsersPage } from "./components/UsersPage";
import { Metadata } from "next";
import { generateMetadata as baseMetadata } from "../metadata";
import { Suspense } from "react";

export const metadata: Metadata = baseMetadata(
  "Users",
  "Browse and discover the community members of f0ck.org"
);

function UsersPageFallback() {
  return <div className="p-4 text-center">Loading users...</div>;
}

export default function Users() {
  return (
    <Suspense fallback={<UsersPageFallback />}>
      <UsersPage />
    </Suspense>
  );
}
