import { Metadata } from "next";
import PremiumClient from "./PremiumClient";

export const metadata: Metadata = {
  title: "Premium Features - f0ck beta v1",
  description: "Discover exclusive premium features on f0ck.org",
};

export default function Premium() {
  return <PremiumClient />;
}
