import Image from "next/image";
import Link from "next/link";
import { getRandomLogo } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Information - f0ck beta v1",
  description: "Learn about f0ck.org's features, registration process, and account management. Find information about supported file types and platform capabilities.",
  openGraph: {
    title: "Help & Information - f0ck beta v1",
    description: "Comprehensive guide about f0ck.org's features and usage",
    images: ["/logos/1.png"],
  },
};

export default function Help() {
  const logoSrc = getRandomLogo();

  return (
    <div className="min-h-[calc(100vh-36.8px)] flex flex-col">
      {/* Logo Section */}
      <div className="w-full flex justify-center py-8">
        <Link href="/" className="relative w-[308px] h-[63px] logo-container">
          <Image
            src={logoSrc}
            alt="f0ck.org Logo"
            fill
            priority
            className="object-contain"
          />
        </Link>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-4 max-w-4xl flex-grow">
        <h1 className="text-3xl font-[family-name:var(--font-geist-mono)] mb-8 text-center">
          Help & Information
        </h1>
        
        <section className="mb-8 font-[family-name:var(--font-geist-sans)]">
          <p className="mb-4 text-gray-900 dark:text-gray-400">
            f0ck.org is a cutting-edge imageboard platform engine inspired by popular services like Danbooru, Gelbooru, and Moebooru. It offers a robust and user-friendly interface for sharing and discovering a wide array of images, catering to various interests and communities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Registration Process</h2>
          <div className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
            <p className="mb-4">
              Creating an account on f0ck.org is entirely optional. You can upload content anonymously without an account. If you choose to register, you do not need to provide an email address. However, if you want to use a Gravatar avatar, you can provide an email to fetch your Gravatar image.
            </p>
            <p>
              Rest assured, your email address is private and only visible to you. Our database staff has access for administrative purposes, but we prioritize your privacy.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Account Management</h2>
          <p className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
            At f0ck.org, we believe in giving users control over their online presence. You have the flexibility to delete your account at any time, should you choose to do so. It is important to note that while your account will be removed, the posts and content you have uploaded will remain on the platform unless an administrator decides to remove them.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-[family-name:var(--font-geist-mono)] mb-4">Why Choose f0ck.org?</h2>
          
          <div className="p-6 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-[family-name:var(--font-geist-mono)] mb-3">Supported File Extensions</h3>
            <p className="font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
              Allowed extensions include: .jpg, .png, .gif, .webm, .mp4, .mov, .swf, .avif, .heif, .heic. You can also use direct links from platforms like YouTube, Twitter, Instagram, Twitch clips, and more!
            </p>
          </div>

          <p className="mt-6 font-[family-name:var(--font-geist-sans)] text-gray-900 dark:text-gray-400">
            f0ck.org stands out due to its commitment to user privacy, ease of use, and comprehensive feature set inspired by the best aspects of Danbooru, Gelbooru, and Moebooru. Our platform is designed to be intuitive and responsive, providing a seamless browsing experience whether you are on a desktop or mobile device.
          </p>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
