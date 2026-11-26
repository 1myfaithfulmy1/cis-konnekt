"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isNicknameAvailable } from "@/lib/supabase/nickname";
import { ru } from "@/content/ru";

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return ru.auth.errorInvalidCredentials;
  if (message.includes("already registered") || message.includes("already exists")) {
    return ru.auth.errorUserExists;
  }
  return ru.auth.errorGeneric;
}

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!nickname.trim()) {
        setError(ru.auth.errorNicknameRequired);
        return;
      }
      setSubmitting(true);
      if (!(await isNicknameAvailable(nickname))) {
        setError(ru.auth.errorNicknameTaken);
        setSubmitting(false);
        return;
      }
    } else {
      setSubmitting(true);
    }

    const supabase = createClient();
    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { name, nickname: nickname.trim() } } });

    setSubmitting(false);
    if (authError) setError(translateAuthError(authError.message));
    // Успех: onAuthStateChange в useSession сам обновит сессию во всём приложении.
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h1 className="font-display text-lg text-foreground">
        {mode === "login" ? ru.auth.loginTitle : ru.auth.signupTitle}
      </h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {mode === "signup" ? (
          <>
            <div>
              <label className="mb-1 block text-xs text-muted">{ru.auth.nameLabel}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ru.auth.namePlaceholder}
                required
                className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">{ru.auth.nicknameLabel}</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={ru.auth.nicknamePlaceholder}
                required
                className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </>
        ) : null}

        <div>
          <label className="mb-1 block text-xs text-muted">{ru.auth.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={ru.auth.emailPlaceholder}
            required
            className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">{ru.auth.passwordLabel}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={ru.auth.passwordPlaceholder}
            minLength={6}
            required
            className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="min-h-[48px] w-full rounded-xl bg-accent text-sm font-medium text-accent-ink transition-opacity duration-150 disabled:opacity-60"
        >
          {submitting ? ru.auth.loading : mode === "login" ? ru.auth.submitLogin : ru.auth.submitSignup}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
        }}
        className="mt-3 min-h-[36px] w-full text-center text-sm text-muted underline"
      >
        {mode === "login" ? ru.auth.switchToSignup : ru.auth.switchToLogin}
      </button>
    </div>
  );
}
