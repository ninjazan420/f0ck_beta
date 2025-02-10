import { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Pools - f0ck beta v1",
  description: "Your Account",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Account() {
  return <ComingSoon pageName="Account" />;
}
