import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Pools - f0ck beta v1",
  description: "Browse through our pools"
};

export default function Pools() {
  return <ComingSoon pageName="Pools" />;
}
