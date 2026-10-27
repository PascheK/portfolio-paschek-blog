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
      <div
        role="status"
        className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface-alt p-8 text-center"
      >
        <CheckCircle2 className="size-8 text-success" aria-hidden />
        <p className="font-medium text-foreground">{dict.success}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            {dict.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={dict.namePlaceholder}
            className="field"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {dict.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={dict.emailPlaceholder}
            className="field"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          {dict.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={dict.messagePlaceholder}
          className="field resize-none"
        />
      </div>

      {state.status === 'error' && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {state.message ?? dict.error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary self-start">
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />
            {dict.sending}
          </>
        ) : (
          <>
            <Send aria-hidden />
            {dict.send}
          </>
        )}
      </button>
    </form>
  );
}
