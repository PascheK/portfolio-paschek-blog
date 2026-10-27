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
      <SelectTrigger
        className="h-9 w-auto gap-1.5 rounded-lg border-transparent bg-transparent px-2.5 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        aria-label={dict?.a11y?.language ?? 'Language'}
      >
        <Globe className="size-4" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg border-border-strong bg-popover text-foreground">
        <SelectItem value="fr" className="rounded-md px-3 py-2">{dict?.lang?.fr ?? 'Français'}</SelectItem>
        <SelectItem value="en" className="rounded-md px-3 py-2">{dict?.lang?.en ?? 'English'}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export { LanguageSelect };
