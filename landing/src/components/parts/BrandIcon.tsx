/*
 * Значки мессенджеров: в lucide их нет, поэтому свои простые SVG.
 *  solid — значок в круге с белым вырезом: для светлого фона
 *  glyph — один силуэт цветом текста: для цветных и тёмных кнопок,
 *          где белый вырез слился бы с фоном
 */
import type { Messenger } from "@/data/types";

export const MESSENGER_COLOR: Record<Messenger, string> = {
  telegram: "#229ED9",
  whatsapp: "#25D366",
  instagram: "#E1306C",
};

interface Props {
  id: Messenger;
  className?: string;
  tone?: "solid" | "glyph";
}

export function BrandIcon({ id, className = "size-5", tone = "solid" }: Props) {
  if (id === "telegram")
    return tone === "glyph" ? (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="currentColor" d="M21.4 3.2 2.6 10.5c-1.3.5-1.3 1.2-.2 1.6l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8l3.2-15.1c.3-1.3-.5-1.9-1.6-1.7ZM9.3 14.3l-.4 4-1.4-4.4 10.3-6.5c.5-.3.9-.1.5.2l-9 6.7Z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path fill="#fff" d="M5.5 11.6 17 7.2c.5-.2 1 .1.8.9l-1.9 9.1c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1l-6.6 4.1-2.8-.9c-.6-.2-.6-.6.1-.9z" />
      </svg>
    );
  if (id === "whatsapp")
    return tone === "glyph" ? (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2l-1.3 4.6 4.7-1.2A9.4 9.4 0 1 0 12 2.6Z" />
        <path fill="currentColor" d="M9 7.6c-.2-.4-.4-.4-.6-.4H8c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.9 2.6.7 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.7-.2-.3 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.3 0-.4L9 7.6Z" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path fill="currentColor" d="M12 1.5A10.5 10.5 0 0 0 3 17.4L1.6 22.5l5.3-1.4A10.5 10.5 0 1 0 12 1.5z" />
        <path fill="#fff" d="M8.7 6.9c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3l-1.8-.9c-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.2-.3 0-.4.1-.6l.4-.5.3-.4c.1-.2 0-.3 0-.5l-.7-1.9z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
