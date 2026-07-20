import { useEffect, useState } from 'react';

export function DynamicStatusText({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 2200);
    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <div className="dynamic-status-text" aria-live="polite">
      <span className="dynamic-status-dot" />
      <span key={items[index]} className="dynamic-status-copy">{items[index]}</span>
    </div>
  );
}

type TerminalLine = { text: string; tone?: 'muted' | 'success' | 'danger' };

export function EmbeddedTerminal({ title, lines, resetKey }: { title: string; lines: TerminalLine[]; resetKey?: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
  }, [title, lines.length, resetKey]);

  useEffect(() => {
    if (shown >= lines.length) return;
    const timer = window.setTimeout(() => setShown((current) => current + 1), shown === 0 ? 350 : 620);
    return () => window.clearTimeout(timer);
  }, [shown, lines.length]);

  return (
    <div className="embedded-terminal" aria-label={title}>
      <div className="embedded-terminal-bar">
        <span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
      </div>
      <div className="embedded-terminal-body">
        {lines.slice(0, shown).map((line, index) => (
          <p key={`${line.text}-${index}`} className={`terminal-line is-${line.tone ?? 'muted'}`}>{line.text}</p>
        ))}
        {shown < lines.length ? <span className="terminal-cursor" aria-label="Loading" /> : null}
      </div>
    </div>
  );
}
