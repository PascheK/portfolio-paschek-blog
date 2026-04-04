'use client';

import { useActionState, useRef } from 'react';
import { sendContactMessage, type ContactFormState } from '@/app/actions/contact';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

const initialState: ContactFormState = { status: 'idle' };

interface ContactFormProps {
  dict: {
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    success: string;
    error: string;
  };
}

export function ContactForm({ dict }: ContactFormProps) {
  const [state, action, pending] = useActionState(sendContactMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center min-h-[220px]">
        <CheckCircle2 className="size-10 text-emerald-400" />
        <p className="font-medium text-foreground">{dict.success}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {dict.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={dict.namePlaceholder}
            className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {dict.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={dict.emailPlaceholder}
            className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          {dict.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder={dict.messagePlaceholder}
          className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
        />
      </div>

      {state.status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {state.message ?? dict.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {pending ? (
          <>
            <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            {dict.sending}
          </>
        ) : (
          <>
            <Send className="size-4" />
            {dict.send}
          </>
        )}
      </button>
    </form>
  );
}
