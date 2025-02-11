import { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password - f0ck beta v1",
  description: "Reset your password for your f0ck.org account.",
};

export default function ForgotPassword() {
  return <ForgotPasswordClient />;
}
