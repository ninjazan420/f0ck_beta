import { Metadata } from 'next';
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: 'Login - f0ck beta v1',
  description: 'Login to your f0ck.org account.',
};

export default async function Login({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  const isRegistered = searchParams?.registered === 'true';
  return <LoginClient registered={isRegistered} />;
}
