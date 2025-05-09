import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";
import { siteConfig } from "../metadata";
import { RandomLogo } from "@/components/RandomLogo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: `Forgot Password | ${siteConfig.name}`,
  description: "Reset your f0ck.org account password",
  icons: {
    icon: [{ url: siteConfig.icon, type: "image/x-icon" }],
  },
};

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      <div className="w-full flex justify-center py-8">
        <RandomLogo />
      </div>

      <div className="container mx-auto px-4 py-4 max-w-lg flex-grow">
        <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-6 text-black dark:text-gray-400">
            Forgotten password
          </h2>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Enter your e-mail address and we will send you instructions to reset
            your password.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
