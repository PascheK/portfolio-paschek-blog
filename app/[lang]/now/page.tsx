import { redirect } from "next/navigation";

export default async function Now({ params }: { params: Promise<{ lang: 'en' | 'fr' }> }) {
  const { lang } = await params;
  // The /now page was removed; keep old links working.
  redirect(`/${lang}`);
}
