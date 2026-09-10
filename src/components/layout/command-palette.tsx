"use client";

import { ArrowRight, Check, Copy, Languages, MoonStar, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { GithubIcon, LinkedinIcon } from "@/components/visual/brand-icons";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { useClipboard } from "@/hooks/use-clipboard";
import { useI18n } from "@/hooks/use-i18n";
import { cn, scrollToSection } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";

interface CommandEntry {
  readonly id: string;
  readonly group: "sections" | "projects" | "actions";
  readonly label: string;
  readonly hint?: string;
  readonly icon: ReactNode;
  readonly run: () => void;
}

export function CommandPalette() {
  const { dict, t } = useI18n();
  const open = usePortfolioStore((state) => state.commandOpen);
  const setOpen = usePortfolioStore((state) => state.setCommandOpen);
  const toggleCommand = usePortfolioStore((state) => state.toggleCommand);
  const toggleLanguage = usePortfolioStore((state) => state.toggleLanguage);
  const openProject = usePortfolioStore((state) => state.openProject);
  const { resolvedTheme, setTheme } = useTheme();
  const { copied, copy } = useClipboard();

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Reset the search as the palette opens. Adjusting state during render is
  // the documented alternative to a synchronous effect.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setCursor(0);
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommand();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleCommand]);

  const entries = useMemo<readonly CommandEntry[]>(() => {
    const github = profile.socials.find((social) => social.id === "github");
    const linkedin = profile.socials.find((social) => social.id === "linkedin");

    const sectionEntries: CommandEntry[] = navItems.map((item) => ({
      id: `section:${item.id}`,
      group: "sections",
      label: t(item.label),
      hint: `#${item.id}`,
      icon: <ArrowRight className="size-4" />,
      run: () => {
        setOpen(false);
        scrollToSection(item.id);
      },
    }));

    const projectEntries: CommandEntry[] = projects.map((project) => ({
      id: `project:${project.id}`,
      group: "projects",
      label: project.title,
      hint: t(project.tagline),
      icon: (
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: project.accent }}
          aria-hidden
        />
      ),
      run: () => {
        setOpen(false);
        scrollToSection("work");
        openProject(project.id);
      },
    }));

    const actionEntries: CommandEntry[] = [
      {
        id: "action:theme",
        group: "actions",
        label: dict.command.toggleTheme,
        icon: <MoonStar className="size-4" />,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      {
        id: "action:language",
        group: "actions",
        label: dict.command.switchLanguage,
        icon: <Languages className="size-4" />,
        run: () => toggleLanguage(),
      },
      {
        id: "action:copy-email",
        group: "actions",
        label: dict.command.copyEmail,
        hint: profile.email,
        icon: copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />,
        run: () => {
          void copy(profile.email);
        },
      },
    ];

    if (github) {
      actionEntries.push({
        id: "action:github",
        group: "actions",
        label: dict.command.openGithub,
        hint: github.handle,
        icon: <GithubIcon className="size-4" />,
        run: () => {
          setOpen(false);
          window.open(github.href, "_blank", "noopener,noreferrer");
        },
      });
    }
    if (linkedin) {
      actionEntries.push({
        id: "action:linkedin",
        group: "actions",
        label: dict.command.openLinkedin,
        hint: linkedin.handle,
        icon: <LinkedinIcon className="size-4" />,
        run: () => {
          setOpen(false);
          window.open(linkedin.href, "_blank", "noopener,noreferrer");
        },
      });
    }

    return [...sectionEntries, ...projectEntries, ...actionEntries];
  }, [dict, t, setOpen, openProject, setTheme, resolvedTheme, toggleLanguage, copy, copied]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return entries;
    return entries.filter((entry) =>
      `${entry.label} ${entry.hint ?? ""}`.toLowerCase().includes(needle),
    );
  }, [entries, query]);

  // Keep the highlighted row inside the filtered list without another render.
  const activeIndex = cursor >= filtered.length ? 0 : cursor;

  const groups = useMemo(() => {
    const order: CommandEntry["group"][] = ["sections", "projects", "actions"];
    return order
      .map((group) => ({
        group,
        label: dict.command[group],
        items: filtered.filter((entry) => entry.group === group),
      }))
      .filter((section) => section.items.length > 0);
  }, [filtered, dict]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = Math.max(1, filtered.length);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((activeIndex + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((activeIndex - 1 + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      filtered[activeIndex]?.run();
    }
  };

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      labelledBy="command-title"
      align="top"
      className="max-w-xl overflow-hidden"
    >
      <div onKeyDown={onKeyDown}>
        <h2 id="command-title" className="sr-only">
          {dict.nav.openCommand}
        </h2>

        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            placeholder={dict.command.placeholder}
            aria-label={dict.command.placeholder}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="rounded-md border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {groups.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              {dict.command.empty}
            </p>
          ) : (
            groups.map((section) => (
              <div key={section.group} className="mb-1.5 last:mb-0">
                <p className="px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                  {section.label}
                </p>
                {section.items.map((entry) => {
                  const index = filtered.indexOf(entry);
                  const active = index === activeIndex;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      data-active={active}
                      onMouseEnter={() => setCursor(index)}
                      onClick={entry.run}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "bg-surface-muted text-foreground"
                          : "text-muted-foreground hover:bg-surface-muted/60",
                      )}
                    >
                      <span className="flex size-5 items-center justify-center">{entry.icon}</span>
                      <span className="flex-1 truncate text-foreground">{entry.label}</span>
                      {entry.hint ? (
                        <span className="max-w-[45%] truncate font-mono text-[11px] text-muted-foreground">
                          {entry.hint}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-surface-muted px-1 font-mono">↑↓</kbd>
            {dict.command.navigate}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-surface-muted px-1 font-mono">↵</kbd>
            {dict.command.select}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-surface-muted px-1 font-mono">esc</kbd>
            {dict.command.dismiss}
          </span>
        </div>
      </div>
    </Modal>
  );
}
