'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/app/actions/admin';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { metaData } from '@/lib/config';

const initial: { error?: string; ok?: boolean } = {};

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAdmin, initial);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (state?.ok) router.push('/admin');
  }, [state?.ok, router]);

  return (
    <div className="admin-area min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-xl shadow-primary/20">
            <Lock className="size-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{metaData.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin panel — sign in to continue</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-6 shadow-xl">
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400 text-center">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {pending ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
