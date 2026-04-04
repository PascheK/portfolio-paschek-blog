'use server';

export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function sendContactMessage(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const message = formData.get('message')?.toString().trim();

  if (!name || !email || !message) {
    return { status: 'error', message: 'All fields are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }
  if (message.length < 10) {
    return { status: 'error', message: 'Message must be at least 10 characters.' };
  }

  // Optional: send via Resend if RESEND_API_KEY is configured
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL ?? 'killian.pasche7@gmail.com';

  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: [toEmail],
          subject: `[Portfolio] Message from ${name}`,
          html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
          reply_to: email,
        }),
      });
      if (!res.ok) {
        console.error('Resend API error:', await res.text());
        return { status: 'error' };
      }
    } catch (err) {
      console.error('Contact send error:', err);
      return { status: 'error' };
    }
  }

  // When no email provider is configured, we still return success
  // (message was received but not forwarded — configure RESEND_API_KEY to enable email forwarding)
  return { status: 'success' };
}
