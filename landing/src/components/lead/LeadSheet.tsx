/*
 * Нижняя шторка с формой заявки. Открывается любым элементом с атрибутом
 * data-lead-open (значение — id курса, можно пустое).
 */
import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { LeadForm, type LeadFormProps } from "./LeadForm";
import { rich } from "@/lib/rich";

type Props = Omit<LeadFormProps, "onDone" | "compact"> & { prices: Record<string, string> };

export default function LeadSheet({ prices, ...props }: Props) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(props.courseId);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-lead-open]");
      if (!el) return;
      e.preventDefault();
      if (el.dataset.leadOpen) setCourseId(el.dataset.leadOpen);
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="mx-auto max-w-lg data-[vaul-drawer-direction=bottom]:max-h-[92vh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl font-bold">Запись на курс</DrawerTitle>
          <DrawerDescription className="text-base">Оставьте контакты — перезвоним и подберём дату.</DrawerDescription>
          {prices[courseId] && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 rounded-2xl bg-soft px-4 py-3 text-sm text-ink-2">
              Стоимость:
              <b className="text-base text-ink" dangerouslySetInnerHTML={{ __html: rich(prices[courseId]) }} />
              за участника, всё включено
            </p>
          )}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          <LeadForm {...props} courseId={courseId} compact onDone={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
