import { UsersPage } from "./components/UsersPage";
import { Metadata } from "next";
import { generateMetadata as baseMetadata } from "../metadata";

export const metadata: Metadata = baseMetadata(
  "Users", 
  "Browse and discover the community members of f0ck.org"
);

export default function Users() {
  return <UsersPage />;
}
