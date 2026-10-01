/*
 * Форма заявки. Используется в нижней шторке и в секции внизу страницы.
 * Черновик сохраняется, чтобы данные не пропали, если шторку случайно закрыть.
 * Отправка: POST на PUBLIC_LEADS_ENDPOINT; без него форма работает в режиме макета.
 */
import { useEffect, useState } from "react";
import { Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandIcon } from "@/components/parts/BrandIcon";
import { MessengerGlyph } from "@/components/parts/MessengerGlyph";
import { attributionPayload } from "@/lib/attribution";
import { cn } from "@/lib/utils";
import type { Country, Messenger } from "@/data/types";

export interface LeadFormProps {
  country: Country;
  courses: { id: string; name: string }[];
  courseId: string;
  compact?: boolean;
  onDone?: () => void;
}

type Contact = "call" | Messenger;
const DRAFT = "ccm_lead_draft";
const ENDPOINT = import.meta.env.PUBLIC_LEADS_ENDPOINT as string | undefined;

/** Форматирует цифры номера по маске страны: «__ ___ __ __» */
function formatPhone(digits: string, mask: string) {
  let out = "";
  let i = 0;
  for (const ch of mask) {
    if (i >= digits.length) break;
    if (ch === "_") out += digits[i++];
    else out += ch;
  }
  return out;
}
const maskLength = (mask: string) => mask.split("").filter((c) => c === "_").length;

export function LeadForm({ country, courses, courseId, compact, onDone }: LeadFormProps) {
  const revised = country.id === "uz" && courseId === "bls";
  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const [course, setCourse] = useState(courseId);
  const [contact, setContact] = useState<Contact>("call");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const need = maskLength(country.phoneMask);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT) || "null");
      if (d) {
        setName(d.name ?? "");
        setDigits(d.digits ?? "");
        if (d.contact) setContact(d.contact);
      }
    } catch {}
  }, []);
  useEffect(() => setCourse(courseId), [courseId]);
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT, JSON.stringify({ name, digits, contact }));
    } catch {}
  }, [name, digits, contact]);

  const valid = name.trim().length >= 2 && digits.length === need;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setState("sending");
    const lead = {
      name: name.trim(),
      phone: `${country.phonePrefix}${digits}`,
      course,
      country: country.id,
      contact,
      event_id: crypto.randomUUID(),
      ...attributionPayload(),
    };
    try {
      if (ENDPOINT) {
        const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
        if (!r.ok) throw new Error(String(r.status));
      } else {
        console.info("[макет] заявка не отправлена, нет PUBLIC_LEADS_ENDPOINT", lead);
        await new Promise((r) => setTimeout(r, 600));
      }
      // Событие для пикселя Meta: тот же event_id уйдёт с сервера в Conversions API
      (window as any).fbq?.("track", "Lead", { content_name: course }, { eventID: lead.event_id });
      localStorage.removeItem(DRAFT);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    const primary = country.messengers[0];
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-7" />
        </span>
        <h3 className="text-xl font-bold">Заявка отправлена</h3>
        <p className="max-w-xs text-ink-2">Менеджер свяжется с вами и подберёт дату курса.</p>
        <a href={primary.href} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand">
          <BrandIcon id={primary.id} className="size-5" /> Или напишите нам сами
        </a>
        {onDone && (
          <Button variant="ghost" className="mt-1" onClick={onDone}>
            Закрыть
          </Button>
        )}
      </div>
    );
  }

  const contacts: { id: Contact; label: string }[] = [
    { id: "call", label: "Звонок" },
    ...country.messengers.filter((m) => m.id !== "instagram").map((m) => ({ id: m.id as Contact, label: m.id === "telegram" ? "Telegram" : "WhatsApp" })),
  ];

  return (
    <form onSubmit={submit} className={cn("grid gap-4", compact && "gap-3")} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-name">Как вас зовут</Label>
        <Input id="lead-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className="h-12 rounded-xl text-base" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-phone">Телефон</Label>
        <div className="flex h-12 items-center rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
          <span className="pl-4 pr-2 text-base font-medium text-ink-2">{country.phonePrefix}</span>
          <input
            id="lead-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className="h-full w-full bg-transparent pr-4 text-base outline-none"
            placeholder={country.phoneMask.replace(/_/g, "0")}
            value={formatPhone(digits, country.phoneMask)}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, need))}
          />
        </div>
      </div>
      {courses.length > 1 && (
        <div className="grid gap-1.5">
          <Label htmlFor="lead-course">Курс</Label>
          <select id="lead-course" value={course} onChange={(e) => setCourse(e.target.value)} className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-ring">
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Как удобнее связаться</legend>
        <div className="grid grid-cols-3 gap-2">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setContact(c.id)}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[13px] font-medium transition-colors",
                contact === c.id ? "border-brand bg-brand-50 text-brand-600" : "border-input text-ink-2 hover:border-ink-2/40",
              )}
            >
              {c.id === "call" ? <Phone className="size-5" /> : revised ? <MessengerGlyph id={c.id} className="size-6 text-brand" /> : <BrandIcon id={c.id} className="size-5" />}
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>
      <Button type="submit" size="lg" disabled={!valid || state === "sending"} className="h-13 rounded-full text-base font-semibold">
        {state === "sending" ? "Отправляем…" : "Оставить заявку"}
      </Button>
      {state === "error" && <p className="text-sm text-destructive">Не получилось отправить. Позвоните нам: {country.phone}</p>}
      <p className="text-xs leading-relaxed text-muted-foreground">Нажимая кнопку, вы соглашаетесь на обработку {revised ? <a href="#" onClick={(event) => event.preventDefault()} className="underline underline-offset-2 transition-colors hover:text-brand">персональных данных</a> : "персональных данных"}.</p>
    </form>
  );
}
