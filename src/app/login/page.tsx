import { Metadata } from 'next';
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: 'Login - f0ck beta v1',
  description: 'Login to your f0ck.org account.',
};

export default function Login({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  return <LoginClient registered={searchParams.registered === 'true'} />;
}
