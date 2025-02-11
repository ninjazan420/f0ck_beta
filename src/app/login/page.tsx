import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login - f0ck beta v1",
  description: "Login to your f0ck.org account.",
  icons: {
    icon: '/favicon.ico'
  }
};

export default function Login() {
  return <LoginClient />;
}
