"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PICK_EVENT } from "@/components/pricing/PickPackage";
import type { Locale } from "@/i18n/config";
import { Icon } from "@/components/icons/Icon";
import { PackageSelect } from "./PackageSelect";
import styles from "./Contact.module.css";

type Option = { id: string; name: string };
type Group = { label: string; items: Option[] };
type Copy = {
  name: string; email: string; company: string; optional: string; need: string; notSure: string; other: string;
  message: string; messageHint: string; send: string; sending: string; sent: string; errorField: string; errorSend: string;
  privacy: string; fields: Record<string, string>;
};

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "field"; field: string } | { kind: "error" };

// Posts to the existing contact service (/api/contact), keeping its bot checks:
// a hidden field people never fill, and how long the form was open.
export function ContactForm({ lang, copy, groups, preset = "" }: { lang: Locale; copy: Copy; groups: Group[]; preset?: string }) {
  const openedAt = useRef<number | null>(null);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [pkg, setPkg] = useState(preset);

  // A price card's call to action preselects its package, and so does ?package=<id> in the URL
  // (a package page's order button), read in the browser so the page stays static.
  useEffect(() => {
    const pick = (e: Event) => setPkg((e as CustomEvent<string>).detail);
    window.addEventListener(PICK_EVENT, pick);
    const fromUrl = new URLSearchParams(window.location.search).get("package");
    if (fromUrl && groups.some((g) => g.items.some((item) => item.id === fromUrl))) {
      window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: fromUrl }));
    }
    return () => window.removeEventListener(PICK_EVENT, pick);
  }, [groups]);

  const markOpened = () => {
    openedAt.current ??= Date.now();
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang, elapsed: Date.now() - (openedAt.current ?? Date.now()) }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return setState({ kind: "sent" });
      if (body.error === "invalid" && body.field) return setState({ kind: "field", field: body.field });
      setState({ kind: "error" });
    } catch {
      setState({ kind: "error" });
    }
  }

  if (state.kind === "sent") {
    return (
      <p className={styles.sent} role="status">
        {copy.sent}
      </p>
    );
  }

  const invalid = (field: string) => (state.kind === "field" && state.field === field) || undefined;

  return (
    <form className={styles.form} onSubmit={submit} onFocus={markOpened} onPointerDown={markOpened} noValidate={false}>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>{copy.name}</span>
          <input name="name" autoComplete="name" required maxLength={100} aria-invalid={invalid("name")} />
        </label>
        <label className={styles.field}>
          <span>{copy.email}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={200} aria-invalid={invalid("email")} />
        </label>
      </div>
      <div className={styles.row}>
        <label className={styles.field}>
          <span>
            {copy.company} <em>({copy.optional})</em>
          </span>
          <input name="company" autoComplete="organization" maxLength={150} aria-invalid={invalid("company")} />
        </label>
        <div className={styles.field}>
          <span>{copy.need}</span>
          <PackageSelect
            value={pkg}
            onChange={setPkg}
            groups={groups}
            none={copy.notSure}
            other={copy.other}
            invalid={invalid("package")}
          />
        </div>
      </div>
      <label className={styles.field}>
        <span>{copy.message}</span>
        <textarea name="message" rows={5} required minLength={10} maxLength={5000} placeholder={copy.messageHint} aria-invalid={invalid("message")} />
      </label>
      <input className={styles.trap} name="website" tabIndex={-1} autoComplete="off" aria-hidden />

      {state.kind === "field" && (
        <p className={styles.error} role="alert">
          {copy.errorField} {copy.fields[state.field] ?? state.field}
        </p>
      )}
      {state.kind === "error" && (
        <p className={styles.error} role="alert">
          {copy.errorSend}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={state.kind === "sending"}>
        {state.kind === "sending" ? copy.sending : copy.send}
        <Icon name="arrow-right" size={16} />
      </button>
      <p className={styles.privacy}>{copy.privacy}</p>
    </form>
  );
}
