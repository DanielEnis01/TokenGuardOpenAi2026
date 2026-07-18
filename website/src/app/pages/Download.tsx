import { Link } from 'react-router';
import { Logo } from '../components/Logo';
import { Download, Monitor, Apple, Github, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DevToolsOverlay } from '../components/DevToolsOverlay';

export default function DownloadPage() {
  const [showDevTools, setShowDevTools] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header/Nav */}
      <nav className="px-6 py-5 flex items-center justify-between" 
           style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Link to="/">
          <Logo size={28} />
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/how-it-works" 
             style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            How It Works
          </Link>
          <Link to="/pricing" 
             style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            Pricing
          </Link>
          <Link to="/auth" 
                className="px-4 h-9 rounded-lg flex items-center transition-colors" 
                style={{ 
                  color: 'var(--text-primary)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  font: 'var(--font-label)'
                }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="mb-4" style={{ 
              font: '600 48px/1.1 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-1px'
            }}>
              Download TokenGuard
            </h1>
            <p style={{ 
              font: '400 18px/1.6 var(--font-family-sans)',
              color: 'var(--text-secondary)' 
            }}>
              Choose your platform to get started
            </p>
          </div>

          {/* Download Cards */}
          <div className="grid grid-cols-1 gap-4 mb-12">
            <DownloadCard
              icon={<Monitor className="w-6 h-6" />}
              platform="Windows"
              version="v1.2.4"
              size="84.2 MB"
              requirements="Windows 10 or later · x64"
              downloadUrl="#"
            />
            <DownloadCard
              icon={<Apple className="w-6 h-6" />}
              platform="macOS"
              version="v1.2.4"
              size="92.8 MB"
              requirements="macOS 11 (Big Sur) or later · Apple Silicon & Intel"
              downloadUrl="#"
            />
            <DownloadCard
              icon={<Github className="w-6 h-6" />}
              platform="Linux"
              version="v1.2.4"
              size="88.1 MB"
              requirements="Ubuntu 20.04+ · Debian 11+ · Fedora 36+"
              downloadUrl="#"
            />
          </div>

          {/* Additional Info */}
          <div className="rounded-xl p-6" 
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="mb-4" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
              What happens after download?
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" 
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', font: 'var(--font-caption)' }}>
                  1
                </span>
                <span style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                  Install TokenGuard on your system
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" 
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', font: 'var(--font-caption)' }}>
                  2
                </span>
                <span style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                  Connect your AI coding tools (Cursor, Windsurf, Claude, etc.)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" 
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', font: 'var(--font-caption)' }}>
                  3
                </span>
                <span style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                  Set your guardrails and start coding with confidence
                </span>
              </li>
            </ol>
          </div>

          {/* Release Notes Link */}
          <div className="mt-8 text-center">
            <a href="#" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              View release notes →
            </a>
          </div>
        </div>
      </div>

      {/* DevTools Button */}
      <button
        onClick={() => setShowDevTools(true)}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-opacity hover:opacity-80"
        style={{ 
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          backdropFilter: 'var(--blur-elevated)',
          WebkitBackdropFilter: 'var(--blur-elevated)',
          cursor: 'pointer'
        }}
        title="Open DevTools"
      >
        <span style={{ font: '600 18px/1 var(--font-family-sans)' }}>{'</>'}</span>
      </button>

      {showDevTools && <DevToolsOverlay onClose={() => setShowDevTools(false)} />}
    </div>
  );
}

function DownloadCard({ icon, platform, version, size, requirements, downloadUrl }: {
  icon: React.ReactNode;
  platform: string;
  version: string;
  size: string;
  requirements: string;
  downloadUrl: string;
}) {
  return (
    <a
      href={downloadUrl}
      className="rounded-xl p-6 flex items-center justify-between group transition-colors"
      style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-default)',
        textDecoration: 'none'
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
             style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 style={{ font: 'var(--font-label)', fontSize: '18px', color: 'var(--text-primary)' }}>
              {platform}
            </h3>
            <span className="px-2 py-0.5 rounded" 
                  style={{ background: 'var(--bg-elevated)', font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              {version}
            </span>
            <span style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
              {size}
            </span>
          </div>
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
            {requirements}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                      style={{ color: 'var(--text-muted)' }} />
      </div>
    </a>
  );
}
