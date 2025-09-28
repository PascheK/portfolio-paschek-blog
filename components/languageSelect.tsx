'use client';
import React from 'react';
import { Globe } from 'lucide-react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const LanguageSelect = ({ dict }: { dict?: any }) => {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLang = React.useMemo<'en' | 'fr'>(() => {
    const first = (pathname || '').split('/').filter(Boolean)[0];
    return first === 'fr' ? 'fr' : 'en';
  }, [pathname]);

  const onSwitch = (to: 'en' | 'fr') => {
    const parts = pathname.split('/').filter(Boolean);
    parts[0] = to;
    const newPath = `/${parts.join('/')}`;
    const query = searchParams.toString();
    router.push(query ? `${newPath}?${query}` : newPath);
  };

  return (
    <Select value={currentLang} onValueChange={onSwitch}>
      <SelectTrigger className="w-32 px-2 py-1.5 rounded border border-white/10 bg-white/0 hover:bg-white/[0.06] text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950" aria-label={dict?.a11y?.language ?? 'Language'}>
        <Globe className="mr-2 size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-md border border-white/10 bg-neutral-950/95 text-neutral-100 shadow-lg">
        <SelectItem value="fr" className="px-3 py-2 hover:bg-white/[0.06] focus:bg-white/[0.06] rounded">{dict?.lang?.fr ?? 'Français'}</SelectItem>
        <SelectItem value="en" className="px-3 py-2 hover:bg-white/[0.06] focus:bg-white/[0.06] rounded">{dict?.lang?.en ?? 'English'}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export { LanguageSelect };
