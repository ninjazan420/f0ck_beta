'use client';

import { useState } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Hier implementieren Sie die API-Integration zum Zurücksetzen des Passworts
      // Beispiel:
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Fehler beim Zurücksetzen des Passworts');
      // }

      // Erfolgsfall simulieren (entfernen, wenn API integriert ist)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-medium text-green-600 dark:text-green-400">
          E-Mail gesendet
        </h2>

        <p className="text-gray-600 dark:text-gray-400">
          Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir eine
          E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts gesendet.
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-500">
          Haben Sie keine E-Mail erhalten? Überprüfen Sie Ihren Spam-Ordner oder
          versuchen Sie es erneut.
        </p>

        <div className="mt-6">
          <Link
            href="/login"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Back to the login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
          placeholder="E-Mail-Adresse"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="relative h-12 w-full mt-6 rounded-lg overflow-hidden transition-all duration-500 group"
      >
        <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#654358] via-[#17092A] to-[#2F0D64]">
          <div className="absolute inset-0 bg-[#170928] rounded-lg opacity-90"></div>
        </div>
        <div className="absolute inset-[2px] bg-[#170928] rounded-lg opacity-95"></div>
        <div className="absolute inset-[2px] bg-gradient-to-r from-[#170928] via-[#1d0d33] to-[#170928] rounded-lg opacity-90"></div>
        <div className="absolute inset-[2px] bg-gradient-to-b from-[#654358]/40 via-[#1d0d33] to-[#2F0D64]/30 rounded-lg opacity-80"></div>
        <div className="absolute inset-[2px] bg-gradient-to-br from-[#C787F6]/10 via-[#1d0d33] to-[#2A1736]/50 rounded-lg"></div>
        <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(199,135,246,0.15)] rounded-lg"></div>
        <div className="relative flex items-center justify-center gap-2">
          <span className="text-lg font-normal bg-gradient-to-b from-[#D69DDE] to-[#B873F8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(199,135,246,0.4)] tracking-tighter">
            {isSubmitting ? "Wird gesendet..." : "Zurücksetzen-Link senden"}
          </span>
        </div>
        <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#2A1736]/20 via-[#C787F6]/10 to-[#2A1736]/20 group-hover:opacity-100 rounded-lg"></div>
      </button>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          Back to the login
        </Link>
      </div>
    </form>
  );
}
