import { redirect } from "next/navigation";

// app/(auth)/signup/page.tsx — alias vers /register pour rétrocompatibilité
export default function SignupRedirectPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const query = searchParams?.callbackUrl
    ? `?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}`
    : "";
  redirect(`/register${query}`);
}
