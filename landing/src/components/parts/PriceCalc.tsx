/*
 * Калькулятор цены для группы: число участников → цена на человека и итог.
 * Пока цена не подтверждена ЦКМ, над расчётом висит пометка «условно».
 */
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface Props {
  amount: number;
  confirmed: boolean;
  currency: string;
  discounts: { from: number; percent: number }[];
  courseId: string;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

export default function PriceCalc({ amount, confirmed, currency, discounts, courseId }: Props) {
  const [n, setN] = useState(1);
  const base = amount;
  const disc = [...discounts].reverse().find((d) => n >= d.from)?.percent ?? 0;
  const per = base * (1 - disc / 100);
  const next = discounts.find((d) => d.from > n);

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(17,19,23,.25)] ring-1 ring-black/5 md:p-8">
      {!confirmed && (
        <p className="mb-5 inline-block rounded-lg bg-[#fff5d6] px-3 py-1 text-xs font-medium text-[#7a5200]">Цены и скидки условные — ждём данные от ЦКМ</p>
      )}
      <p className="text-sm font-medium text-muted-foreground">Сколько человек пойдёт на курс?</p>
      <div className="mt-3 flex items-center gap-4">
        <button type="button" aria-label="Меньше" onClick={() => setN((v) => Math.max(1, v - 1))} className="grid size-12 place-items-center rounded-full bg-soft transition hover:bg-line disabled:opacity-40" disabled={n <= 1}>
          <Minus className="size-5" />
        </button>
        <span className="w-16 text-center text-5xl font-bold tabular-nums">{n}</span>
        <button type="button" aria-label="Больше" onClick={() => setN((v) => Math.min(10, v + 1))} className="grid size-12 place-items-center rounded-full bg-soft transition hover:bg-line disabled:opacity-40" disabled={n >= 10}>
          <Plus className="size-5" />
        </button>
        {disc > 0 && <span className="ml-auto rounded-full bg-brand px-3 py-1 text-sm font-bold text-white">−{disc}%</span>}
      </div>
      <div className="mt-6 flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < n ? "bg-brand" : "bg-soft"}`} />
        ))}
      </div>
      <p className="mt-3 min-h-5 text-sm text-ink-2">
        {next ? `Ещё ${next.from - n} — и скидка ${next.percent}% каждому` : "Максимальная скидка для группы"}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-soft p-5">
        <div>
          <p className="text-xs text-muted-foreground">За человека</p>
          <p className="text-2xl font-bold tabular-nums">{fmt(per)} <span className="text-base font-medium">{currency}</span></p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Итого</p>
          <p className="text-2xl font-bold tabular-nums">{fmt(per * n)} <span className="text-base font-medium">{currency}</span></p>
        </div>
      </div>
      <button data-lead-open={courseId} className="mt-6 h-14 w-full rounded-full bg-brand text-base font-semibold text-white transition hover:bg-brand-600">
        {n > 1 ? `Записать группу из ${n}` : "Записаться"}
      </button>
    </div>
  );
}
