import { redirect } from "next/navigation";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/about`);
}
