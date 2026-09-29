/*
 * Нижняя шторка с формой заявки. Открывается любым элементом с атрибутом
 * data-lead-open (значение — id курса, можно пустое).
 */
import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { LeadForm, type LeadFormProps } from "./LeadForm";

export default function LeadSheet(props: Omit<LeadFormProps, "onDone" | "compact">) {
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
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          <LeadForm {...props} courseId={courseId} compact onDone={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
