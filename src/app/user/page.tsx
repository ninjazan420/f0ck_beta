import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Users - f0ck beta v1",
  description: "List all f0ck.org users"
};

export default function User() {
  return <ComingSoon pageName="User" />;
}
