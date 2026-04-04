'use client';

import { useActionState } from 'react';
import { loginAdmin } from '@/app/actions/admin';
import { Lock } from 'lucide-react';

const initial = { error: undefined };

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, initial);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl border border-primary/30 bg-primary/10">
            <Lock className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your password to access the admin panel.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-400 text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-60 transition-all"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
