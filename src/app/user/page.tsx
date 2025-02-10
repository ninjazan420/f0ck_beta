import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Pools - f0ck beta v1",
  description: "List all f0ck.org users",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function User() {
  return <ComingSoon pageName="User" />;
}
