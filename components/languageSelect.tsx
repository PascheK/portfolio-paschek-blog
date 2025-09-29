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
  <SelectTrigger className="w-32 px-2 py-1.5 rounded border border-border bg-surface-alt/40 hover:bg-surface-alt text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label={dict?.a11y?.language ?? 'Language'}>
        <Globe className="mr-2 size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-md border border-border bg-surface-alt/95 text-foreground shadow-lg">
        <SelectItem value="fr" className="px-3 py-2 hover:bg-surface-alt focus:bg-surface-alt rounded">{dict?.lang?.fr ?? 'Français'}</SelectItem>
        <SelectItem value="en" className="px-3 py-2 hover:bg-surface-alt focus:bg-surface-alt rounded">{dict?.lang?.en ?? 'English'}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export { LanguageSelect };
