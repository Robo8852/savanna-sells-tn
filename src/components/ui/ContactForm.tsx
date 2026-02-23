"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Send, CheckCircle, Loader2 } from "lucide-react";

interface ContactFormProps {
  listingId?: Id<"listings">;
  listingTitle?: string;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export default function ContactForm({ listingId, listingTitle }: ContactFormProps) {
  // Connects to the Convex mutation defined in convex/leads.ts → submit.
  // useMutation gives us a function we can call to write data to the database.
  // It does NOT run on load — it only fires when we call submitLead() below.
  const submitLead = useMutation(api.leads.submit);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      // Calls convex/leads.ts → submit mutation, which inserts a new row
      // into the "leads" table with status "new". Optional fields are sent
      // as undefined (not empty strings) so Convex doesn't store blanks.
      // listingId/listingTitle are only passed when this form lives on a
      // listing detail page — on the homepage they're omitted.
      await submitLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
        message: message.trim() || undefined,
        listingId: listingId ?? undefined,
        listingTitle: listingTitle ?? undefined,
      });
      setSubmitted(true);
    } finally {
      // Runs whether the mutation succeeds or fails — re-enables the button.
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle size={40} className="text-accent" />
        <h4 className="text-lg font-serif text-primary">Thank You!</h4>
        <p className="text-sm text-primary/60">
          Savanna will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-primary/70">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="cf-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className={INPUT_CLASS}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="cf-email" className="mb-1 block text-sm font-medium text-primary/70">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="cf-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={INPUT_CLASS}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="cf-phone" className="mb-1 block text-sm font-medium text-primary/70">
          Phone
        </label>
        <input
          id="cf-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(615) 555-1234"
          className={INPUT_CLASS}
        />
      </div>

      {/* Preferred Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cf-date" className="mb-1 block text-sm font-medium text-primary/70">
            Preferred Date
          </label>
          <input
            id="cf-date"
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="cf-time" className="mb-1 block text-sm font-medium text-primary/70">
            Preferred Time
          </label>
          <input
            id="cf-time"
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className="mb-1 block text-sm font-medium text-primary/70">
          Message
        </label>
        <textarea
          id="cf-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            listingTitle
              ? `I'm interested in ${listingTitle}…`
              : "Tell Savanna how she can help…"
          }
          className={INPUT_CLASS + " resize-none"}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={16} />
            {listingId ? "Schedule a Showing" : "Send Message"}
          </>
        )}
      </button>
    </form>
  );
}
