"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContactForm, type ContactActionState } from "@/app/contact/actions";
import { CONTACT_LIMITS } from "@/lib/contact/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Info, Send } from "lucide-react";

const INITIAL_STATE: ContactActionState = {
  status: "idle",
};

interface ContactFormProps {
  isDeliveryConfigured: boolean;
}

export function ContactForm({ isDeliveryConfigured }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState<ContactActionState, FormData>(
    submitContactForm,
    INITIAL_STATE
  );
  const [renderedAt, setRenderedAt] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setRenderedAt(String(Date.now()));
  }, []);

  useEffect(() => {
    if (state.status === "sent") {
      formRef.current?.reset();
      setRenderedAt(String(Date.now()));
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {!isDeliveryConfigured && state.status === "idle" && (
        <div className="p-3.5 rounded-btn bg-primary-light/70 border border-primary/20 text-apptext text-xs sm:text-sm flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Server Notice:</strong> Automated inbox delivery is not yet configured on this
            environment. Submissions are validated on the server, and you will see clear delivery
            status feedback below.
          </p>
        </div>
      )}

      {state.status === "sent" && state.message && (
        <div
          role="status"
          className="p-3.5 rounded-btn bg-status-successLight border border-status-success/20 text-status-success text-xs sm:text-sm flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{state.message}</p>
        </div>
      )}

      {state.status === "unconfigured" && state.message && (
        <div
          role="status"
          className="p-3.5 rounded-btn bg-status-warningLight border border-status-warning/25 text-apptext text-xs sm:text-sm flex items-start gap-2.5"
        >
          <Info className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">{state.message}</p>
        </div>
      )}

      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="p-3.5 rounded-btn bg-status-dangerLight border border-status-danger/20 text-status-danger text-xs sm:text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{state.message}</p>
        </div>
      )}

      {/* Lightweight bot honeypot & fill-timing field */}
      <input type="hidden" name="formRenderedAt" value={renderedAt} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field blank</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          id="contact-name"
          name="name"
          type="text"
          label="Your Name"
          placeholder="e.g. Aarav Sharma"
          required
          minLength={CONTACT_LIMITS.NAME_MIN}
          maxLength={CONTACT_LIMITS.NAME_MAX}
          error={state.fieldErrors?.name}
          disabled={isPending}
        />

        <Input
          id="contact-email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          required
          minLength={CONTACT_LIMITS.EMAIL_MIN}
          maxLength={CONTACT_LIMITS.EMAIL_MAX}
          error={state.fieldErrors?.email}
          disabled={isPending}
        />
      </div>

      <Input
        id="contact-subject"
        name="subject"
        type="text"
        label="Subject"
        placeholder="e.g. Question about daily allowance calculation"
        required
        minLength={CONTACT_LIMITS.SUBJECT_MIN}
        maxLength={CONTACT_LIMITS.SUBJECT_MAX}
        error={state.fieldErrors?.subject}
        disabled={isPending}
      />

      <div className="w-full space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-apptext"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={CONTACT_LIMITS.MESSAGE_MIN}
          maxLength={CONTACT_LIMITS.MESSAGE_MAX}
          disabled={isPending}
          placeholder="Describe your question, feedback, or bug report clearly (10–2,000 characters)."
          className="w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 text-sm text-apptext placeholder:text-apptext-light transition-colors hover:border-[#b8cfc2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-background/50 disabled:opacity-60 resize-y"
        />
        {state.fieldErrors?.message ? (
          <p className="text-xs font-medium text-status-danger">{state.fieldErrors.message}</p>
        ) : (
          <p className="text-xs text-apptext-muted">
            Minimum {CONTACT_LIMITS.MESSAGE_MIN} characters, maximum{" "}
            {CONTACT_LIMITS.MESSAGE_MAX.toLocaleString()} characters.
          </p>
        )}
      </div>

      <div className="pt-1">
        <Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
          <Send className="w-4 h-4" />
          Send Message
        </Button>
      </div>
    </form>
  );
}

