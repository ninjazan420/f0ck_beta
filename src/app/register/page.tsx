import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Register - f0ck beta v1",
  description: "Create your account on f0ck.org to access additional features.",
};

export default function Register() {
  return <RegisterClient />;
}
