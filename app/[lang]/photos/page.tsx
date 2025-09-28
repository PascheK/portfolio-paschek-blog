import { redirect } from "next/navigation";

export default async function Photos({ params }: { params: Promise<{ lang: 'en' | 'fr' }> }) {
  const { lang } = await params;
  // Permanently move Photos to About; keeps old links working
  redirect(`/${lang}/about`);
}
