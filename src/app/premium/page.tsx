import { Metadata } from "next";
import PremiumClient from "./PremiumClient";

export const metadata: Metadata = {
  title: "Premium - f0ck beta v1",
  description: "Upgrade to Premium and unlock all features"
};

export default function Premium() {
  return <PremiumClient />;
}
