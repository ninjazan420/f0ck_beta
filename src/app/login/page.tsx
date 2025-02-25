import LoginClient from "./LoginClient";

export default async function Login({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  const isRegistered = searchParams?.registered === 'true';
  return <LoginClient registered={isRegistered} />;
}
