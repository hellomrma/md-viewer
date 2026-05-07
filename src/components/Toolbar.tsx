import { usePrefs } from "@/context/usePrefs";
import { useState, useRef, useEffect, type ReactNode } from "react";

interface Props {
  fileName: string;
  onReset: () => void;
}

// --- Icons ---

function MonitorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1.5" width="13" height="9" rx="1" />
      <line x1="5" y1="13" x2="10" y2="13" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="13" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.5" />
      <line x1="7.5" y1="1" x2="7.5" y2="2.5" />
      <line x1="7.5" y1="12.5" x2="7.5" y2="14" />
      <line x1="1" y1="7.5" x2="2.5" y2="7.5" />
      <line x1="12.5" y1="7.5" x2="14" y2="7.5" />
      <line x1="2.9" y1="2.9" x2="4" y2="4" />
      <line x1="11" y1="11" x2="12.1" y2="12.1" />
      <line x1="12.1" y1="2.9" x2="11" y2="4" />
      <line x1="4" y1="11" x2="2.9" y2="12.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9A6 6 0 0 1 6 2a6 6 0 1 0 7 7z" />
    </svg>
  );
}

function ColumnsNarrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <line x1="4.5" y1="3.5" x2="10.5" y2="3.5" />
      <line x1="4.5" y1="6.5" x2="10.5" y2="6.5" />
      <line x1="4.5" y1="9.5" x2="9"    y2="9.5" />
    </svg>
  );
}

function ColumnsNormalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <line x1="2"  y1="3.5" x2="13" y2="3.5" />
      <line x1="2"  y1="6.5" x2="13" y2="6.5" />
      <line x1="2"  y1="9.5" x2="10" y2="9.5" />
    </svg>
  );
}

function ColumnsWideIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <line x1="1"  y1="3.5" x2="14" y2="3.5" />
      <line x1="1"  y1="6.5" x2="14" y2="6.5" />
      <line x1="1"  y1="9.5" x2="12" y2="9.5" />
    </svg>
  );
}

function FontSizeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,13 7.5,2 13,13" />
      <line x1="4.2" y1="9" x2="10.8" y2="9" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1" width="9" height="4" />
      <rect x="3" y="9" width="9" height="5" />
      <path d="M3 5H1v7h2M12 5h2v7h-2" />
      <line x1="5" y1="11" x2="10" y2="11" />
      <line x1="5" y1="12.5" x2="10" y2="12.5" />
    </svg>
  );
}

// --- Dropdown ---

interface DropdownOption {
  value: string;
  label: string;
}

function IconDropdown({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const triggerClass =
    "flex h-7 w-7 items-center justify-center border transition-colors " +
    "focus-visible:outline-none focus-visible:border-ink-point dark:focus-visible:border-nightInk-point ";

  const triggerIdle =
    "border-ink-border text-ink-muted hover:border-ink-fg hover:text-ink-fg " +
    "dark:border-nightInk-border dark:text-nightInk-muted dark:hover:border-nightInk-fg dark:hover:text-nightInk-fg";

  const triggerOpen =
    "border-ink-fg text-ink-fg dark:border-nightInk-fg dark:text-nightInk-fg";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={label}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass + (open ? triggerOpen : triggerIdle)}
      >
        {icon}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={
            "absolute right-0 top-full z-50 mt-1 min-w-[5.5rem] " +
            "border border-ink-fg bg-ink-bg py-1 " +
            "dark:border-nightInk-fg dark:bg-nightInk-bg"
          }
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={active}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={
                  "flex w-full items-center justify-between gap-4 px-3 py-1.5 text-xs transition-colors " +
                  (active
                    ? "text-ink-fg dark:text-nightInk-fg"
                    : "text-ink-muted hover:text-ink-fg dark:text-nightInk-muted dark:hover:text-nightInk-fg")
                }
              >
                <span>{opt.label}</span>
                {active && <span className="text-ink-point dark:text-nightInk-point">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Toolbar ---

const THEME_ICONS = {
  system: <MonitorIcon />,
  light: <SunIcon />,
  dark: <MoonIcon />,
};

const WIDTH_ICONS = {
  narrow: <ColumnsNarrowIcon />,
  normal: <ColumnsNormalIcon />,
  wide: <ColumnsWideIcon />,
};

export function Toolbar({ fileName, onReset }: Props) {
  const { prefs, setTheme, setWidth, setFont } = usePrefs();

  const iconBtnClass =
    "flex h-7 items-center gap-1.5 border border-ink-border px-2 text-xs text-ink-muted " +
    "hover:border-ink-fg hover:text-ink-fg transition-colors " +
    "focus-visible:border-ink-point focus-visible:outline-none " +
    "dark:border-nightInk-border dark:text-nightInk-muted " +
    "dark:hover:border-nightInk-fg dark:hover:text-nightInk-fg " +
    "dark:focus-visible:border-nightInk-point";

  return (
    <header className="no-print sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-ink-border bg-ink-bg px-6 py-4 dark:border-nightInk-border dark:bg-nightInk-bg">
      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        <span className="kicker hidden sm:inline">File</span>
        <span
          className="truncate text-sm font-semibold text-ink-fg dark:text-nightInk-fg"
          style={{ letterSpacing: "-0.01em" }}
          title={fileName}
        >
          {fileName}
        </span>
      </div>

      <IconDropdown
        icon={THEME_ICONS[prefs.theme]}
        label="테마"
        value={prefs.theme}
        options={[
          { value: "system", label: "시스템" },
          { value: "light",  label: "라이트" },
          { value: "dark",   label: "다크"   },
        ]}
        onChange={(v) => setTheme(v as typeof prefs.theme)}
      />

      <IconDropdown
        icon={WIDTH_ICONS[prefs.width]}
        label="폭"
        value={prefs.width}
        options={[
          { value: "narrow", label: "좁게" },
          { value: "normal", label: "보통" },
          { value: "wide",   label: "넓게" },
        ]}
        onChange={(v) => setWidth(v as typeof prefs.width)}
      />

      <IconDropdown
        icon={<FontSizeIcon />}
        label="글자 크기"
        value={prefs.font}
        options={[
          { value: "s", label: "작게" },
          { value: "m", label: "보통" },
          { value: "l", label: "크게" },
        ]}
        onChange={(v) => setFont(v as typeof prefs.font)}
      />

      <button type="button" onClick={() => window.print()} className={iconBtnClass} title="인쇄">
        <PrintIcon />
        <span className="hidden sm:inline">인쇄</span>
      </button>

      <button type="button" onClick={onReset} className={iconBtnClass}>
        새 파일 열기
      </button>
    </header>
  );
}
