"use server";

import { Resend } from "resend";

// Landing page /pro-rodice (D26): waitlist and quiz interest go to Milan by e-mail, nothing is stored.

export type LandingFormState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function recipients(): string[] {
  return (process.env.LANDING_LEADS_EMAIL ?? process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function sendLeadMail(subject: string, text: string): Promise<boolean> {
  const to = recipients();
  const apiKey = process.env.RESEND_API_KEY;
  if (to.length === 0 || !apiKey) {
    console.warn("landing: no LANDING_LEADS_EMAIL/ADMIN_NOTIFICATION_EMAILS or RESEND_API_KEY", {
      subject,
      text,
    });
    return false;
  }
  const from = process.env.NOTIFICATION_FROM_EMAIL ?? "Homeworks <onboarding@resend.dev>";
  const { error } = await new Resend(apiKey).emails.send({ from, to, subject, text });
  if (error) {
    console.error("landing: resend failed", error);
    return false;
  }
  return true;
}

export async function joinWaitlistAction(
  _prev: LandingFormState,
  formData: FormData,
): Promise<LandingFormState> {
  // Honeypot: bots fill every field, people never see this one.
  if (formData.get("web")) return { status: "sent" };

  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Zkontrolujte prosím e-mail." };
  }

  const ok = await sendLeadMail(
    `Homeworks: nový zájemce ${email}`,
    `Na landing page /pro-rodice se zapsal nový zájemce:\n\n${email}\n`,
  );
  return ok
    ? { status: "sent" }
    : { status: "error", message: "Nepodařilo se odeslat. Zkuste to prosím za chvíli." };
}

export async function quizInterestAction(
  _prev: LandingFormState,
  formData: FormData,
): Promise<LandingFormState> {
  if (formData.get("web")) return { status: "sent" };

  const answer = formData.get("answer");
  if (answer !== "yes" && answer !== "no") {
    return { status: "error", message: "Vyberte prosím odpověď." };
  }

  const label = answer === "yes" ? "Ano, hned" : "Spíš ne";
  const ok = await sendLeadMail(
    `Homeworks: kvízy z mediální gramotnosti — ${label}`,
    `Odpověď na otázku „Chtěli byste to pro své děti?“ na /pro-rodice:\n\n${label}\n`,
  );
  return ok
    ? { status: "sent" }
    : { status: "error", message: "Nepodařilo se odeslat. Zkuste to prosím za chvíli." };
}
