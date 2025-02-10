import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Comments - f0ck beta v1",
  description: "Recent comments on f0ck.org"
};

export default function Comments() {
  return <ComingSoon pageName="Comments" />;
}
