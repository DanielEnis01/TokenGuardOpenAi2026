import { Link } from 'react-router';
import { Activity, ArrowRight, Download, ShieldCheck, Waypoints } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../providers/AuthProvider';
import './product-pages.css';

const layers = [
  {
    icon: Activity,
    number: '01',
    title: 'Observe the session',
    description: 'Watch tokens, cost, context, and repeated edits in one local view.',
  },
  {
    icon: Waypoints,
    number: '02',
    title: 'Identify the pattern',
    description: 'See a likely loop before it burns through the session budget.',
  },
  {
    icon: ShieldCheck,
    number: '03',
    title: 'Hold the line',
    description: 'Warn, pause, or stop a session using the limits you choose.',
  },
];

export default function HowItWorks() {
  return (
    <div className="website-page product-page min-h-screen">
      <SiteNav />

      <main className="product-shell">
        <section className="product-intro">
          <p className="product-eyebrow">What is TokenGuard</p>
          <h1>Control for AI coding sessions.</h1>
          <p className="product-lede">
            A local monitor for AI-assisted coding: it makes the session visible, flags risky patterns, and applies the guardrails you set.
          </p>
          <Link to="/download" className="product-primary-link">
            <Download className="h-4 w-4" /> Download TokenGuard <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="product-layers" aria-label="How TokenGuard works">
          {layers.map((layer) => {
            const Icon = layer.icon;
            return (
              <article key={layer.number} className="product-layer">
                <div className="product-layer-mark">
                  <span>{layer.number}</span>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2>{layer.title}</h2>
                  <p>{layer.description}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="product-download-callout">
          <div>
            <p className="product-eyebrow">Start locally</p>
            <h2>Set up protection in a few minutes.</h2>
            <p>Install the desktop companion, connect the tool you use, and set your limits.</p>
          </div>
          <Link to="/download" className="product-secondary-link">
            View downloads <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

export function SiteNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link to="/" aria-label="TokenGuard home"><Logo size={28} /></Link>
        <div className="site-nav-links">
          <Link to="/how-it-works">How it works</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/download">Download</Link>
        </div>
        {user ? (
          <button 
            onClick={() => void logout()} 
            className="site-nav-sign-in"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Sign out
          </button>
        ) : (
          <Link to="/auth" className="site-nav-sign-in">Sign in <ArrowRight className="h-3.5 w-3.5" /></Link>
        )}
      </div>
    </nav>
  );
}
