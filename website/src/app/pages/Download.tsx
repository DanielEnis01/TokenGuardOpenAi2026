import { ArrowRight, Apple, Check, Code2, Copy, Download, Github, Monitor, Terminal } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { SiteNav } from './HowItWorks';
import './product-pages.css';

const WINDOWS_DOWNLOAD_URL = 'https://github.com/DanielEnis01/TokenGuardOpenAi2026/releases/latest/download/TokenGuard-Setup.exe';

const releases = [
  { platform: 'Windows', detail: 'Windows 10 or later · x64', size: '84.2 MB', icon: Monitor, status: 'Available now', downloadUrl: WINDOWS_DOWNLOAD_URL },
  { platform: 'macOS', detail: 'macOS 11 or later · Apple Silicon and Intel', size: '92.8 MB', icon: Apple, status: 'Coming soon', downloadUrl: undefined },
  { platform: 'Linux', detail: 'Ubuntu, Debian, and Fedora packages', size: '88.1 MB', icon: Github, status: 'Coming soon', downloadUrl: undefined },
];

export default function DownloadPage() {
  return (
    <div className="website-page product-page min-h-screen">
      <SiteNav />
      <main className="product-shell product-download-shell">
        <section className="product-intro product-intro-compact">
          <p className="product-eyebrow">Desktop companion</p>
          <h1>Bring guardrails into your editor.</h1>
          <p className="product-lede">Install TokenGuard locally, connect your AI coding tools, and keep a clear view of the session while you work.</p>
        </section>

        <section className="release-list" aria-label="TokenGuard downloads">
          {releases.map((release) => {
            const Icon = release.icon;
            const available = release.status === 'Available now';
            return (
              <article className="release-row" key={release.platform}>
                <div className="release-icon"><Icon className="h-5 w-5" /></div>
                <div className="release-copy">
                  <div className="release-title"><h2>{release.platform}</h2><span>{release.size}</span></div>
                  <p>{release.detail}</p>
                </div>
                {available ? (
                  <a href={release.downloadUrl} className="release-download"><Download className="h-4 w-4" /> Download <ArrowRight className="h-4 w-4" /></a>
                ) : (
                  <span className="release-status">{release.status}</span>
                )}
              </article>
            );
          })}
        </section>

        <ConnectGuide />

        <p className="product-footnote">Need another platform? <Link to="/auth">Request access</Link>.</p>
      </main>
    </div>
  );
}

const connectionOptions = [
  { id: 'codex', label: 'Codex', detail: 'Recommended', command: 'tokenguard connect codex', icon: Terminal },
  { id: 'cursor', label: 'Cursor', detail: 'Extension', command: 'tokenguard connect cursor', icon: Monitor },
  { id: 'api', label: 'API', detail: 'OpenAI', command: 'tokenguard connect openai', icon: Code2 },
];

function ConnectGuide() {
  const [selectedId, setSelectedId] = useState('codex');
  const [copied, setCopied] = useState(false);
  const selected = connectionOptions.find((option) => option.id === selectedId) ?? connectionOptions[0];
  const Icon = selected.icon;

  const copyCommand = async () => {
    await navigator.clipboard?.writeText(selected.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="connect-guide" aria-label="Connect TokenGuard to your coding tool">
      <div className="connect-guide-steps">
        <p className="product-eyebrow">Then connect a tool</p>
        <h2>Protected coding in a few steps.</h2>
        <ol>
          <li><span>a</span> Install TokenGuard</li>
          <li><span>b</span> Select your coding tool</li>
          <li><span>c</span> Run the connection command</li>
          <li><span>d</span> Start a protected session</li>
        </ol>
      </div>

      <div className="connect-guide-panel">
        <div className="connect-tabs" role="tablist" aria-label="Connection method">
          {connectionOptions.map((option) => {
            const TabIcon = option.icon;
            const active = option.id === selected.id;
            return (
              <button
                key={option.id}
                type="button"
                className={active ? 'is-active' : ''}
                onClick={() => setSelectedId(option.id)}
                role="tab"
                aria-selected={active}
              >
                <TabIcon className="h-4 w-4" />
                <span><strong>{option.label}</strong><small>{option.detail}</small></span>
              </button>
            );
          })}
        </div>
        <div className="connect-command-content">
          <div className="connect-command-heading"><Icon className="h-4 w-4" /> Connect TokenGuard to {selected.label}</div>
          <div className="connect-command-box">
            <code><span>$</span> {selected.command}</code>
            <button type="button" onClick={() => void copyCommand()}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy'}</button>
          </div>
          <div className="connect-command-foot"><span>Runs locally on your machine.</span><Link to="/how-it-works">How TokenGuard works <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </div>
      </div>
    </section>
  );
}
