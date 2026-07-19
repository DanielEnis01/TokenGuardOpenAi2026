import { Link } from 'react-router';
import { useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { Activity, ArrowRight, ChevronDown } from 'lucide-react';
import { ContactPopup } from '../components/ContactPopup';
import { Logo } from '../components/Logo';
import { ScrollDashboardReveal } from '../components/ScrollDashboardReveal';
import { SiteNav } from './HowItWorks';
import './home-hero.css';
import './product-pages.css';

export default function Home() {
  const [showContactPopup, setShowContactPopup] = useState(false);

  return (
    <div className="website-home min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <SiteNav />

      <section className="relative flex h-screen items-center justify-center overflow-hidden px-6 pt-20">
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          colors={['#000000', '#1a1a1a', '#2a2a2a', '#ffffff']}
          speed={0.8}
          backgroundColor="#000000"
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-1/4 h-32 w-32 animate-pulse rounded-full bg-gray-800/5 blur-3xl" />
          <div
            className="absolute bottom-1/3 right-1/4 h-24 w-24 animate-pulse rounded-full bg-white/5 blur-2xl"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute right-1/3 top-1/2 h-20 w-20 animate-pulse rounded-full bg-gray-900/10 blur-xl"
            style={{ animationDelay: '0.5s' }}
          />
        </div>

        <div className="hero-content relative z-10 w-full max-w-5xl text-center">
          <div className="hero-eyebrow"><span /> Local protection for AI coding</div>
          <h1 className="title-text">Keep every AI coding session in view.</h1>
          <p className="subtitle-text mx-auto max-w-2xl">A local monitor for tokens, cost, context, and runaway loops.</p>

          <div className="hero-session-panel">
            <div className="hero-session-topline">
              <div><Activity className="h-4 w-4" /><span>Live monitor</span></div>
              <span className="hero-ready"><i /> Ready to connect</span>
            </div>
            <div className="hero-session-main">
              <div className="hero-session-metrics">
                <div><span>Tool</span><strong>Codex</strong></div>
                <div><span>Guardrail</span><strong>Warn at 80%</strong></div>
                <div><span>Session</span><strong>Not started</strong></div>
              </div>
              <Link to="/download" className="hero-session-action">Connect Codex <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>

          <div className="hero-scroll-prompt flex flex-col items-center gap-2" style={{ animation: 'fadeInBounce 2s ease-in-out infinite' }}>
            <span>See it in action</span>
            <ChevronDown className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>
      </section>

      <ScrollDashboardReveal />

      <footer className="site-footer">
        <div className="site-footer-shell">
          <div className="site-footer-top">
            <div className="site-footer-brand">
              <Logo size={28} />
              <p>A calm guardrail for the AI coding sessions you care about.</p>
            </div>
            <div className="site-footer-start">
              <span>Ready when your next session starts.</span>
              <Link to="/download">Get TokenGuard <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>© 2026 TokenGuard</p>
          <div className="site-footer-links">
            <Link to="/pricing" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>Pricing</Link>
            <Link to="/how-it-works" style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>How It Works</Link>
            <button
              onClick={() => setShowContactPopup(true)}
              style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>

      {showContactPopup ? <ContactPopup onClose={() => setShowContactPopup(false)} /> : null}

      <style>{`
        @keyframes fadeInBounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
