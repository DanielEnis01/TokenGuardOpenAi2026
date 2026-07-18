import { Link } from 'react-router';
import { Logo } from '../components/Logo';
import { PricingSection, type PricingPlan } from '../components/PricingSection';

const plans: PricingPlan[] = [
  {
    name: 'Free',
    info: 'For trying TokenGuard on a single workspace.',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { text: 'Up to 500k tokens monitored each month' },
      { text: 'Basic spiral detection' },
      { text: 'One IDE or CLI connection' },
      { text: 'Email alerts for session thresholds' },
    ],
    btn: {
      text: 'Get Started',
      href: '/auth',
    },
  },
  {
    name: 'Pro',
    info: 'For developers who want full monitoring and flexible guardrails.',
    price: {
      monthly: 12,
      yearly: 120,
    },
    features: [
      { text: 'Unlimited token monitoring across sessions' },
      { text: 'Advanced spiral detection and stop rules', tooltip: 'Includes repeated-edit detection, burn-rate alerts, and configurable intervention thresholds.' },
      { text: 'All IDE and API connectors' },
      { text: 'Real-time alerts for Slack and Discord' },
      { text: 'Guardrail customization and exports' },
      { text: 'Session history with incident review' },
    ],
    btn: {
      text: 'Start Free Trial',
      href: '/auth',
    },
    highlighted: true,
  },
  {
    name: 'Team',
    info: 'For small teams that want shared visibility and budget control.',
    price: {
      monthly: 39,
      yearly: 390,
    },
    features: [
      { text: 'Everything in Pro' },
      { text: 'Shared budget pools and workspace controls', tooltip: 'Pool budgets by team and apply different defaults to each connected workspace.' },
      { text: 'Usage analytics and reporting' },
      { text: 'Priority support' },
      { text: 'Optional SSO and admin controls' },
    ],
    btn: {
      text: 'Contact Sales',
      href: '/auth',
    },
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <nav
        className="flex items-center justify-between px-6 py-5"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-panel)',
          backdropFilter: 'var(--blur-panel)',
          WebkitBackdropFilter: 'var(--blur-panel)',
        }}
      >
        <Link to="/">
          <Logo size={28} />
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/how-it-works" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            How It Works
          </Link>
          <Link to="/pricing" style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>
            Pricing
          </Link>
          <Link
            to="/auth"
            className="flex h-9 items-center rounded-lg px-4 transition-colors"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              font: 'var(--font-label)',
            }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <PricingSection
            plans={plans}
            heading="Pricing built for controlled scale"
            description="Start free, monitor live sessions, and upgrade when you want more connectors, richer alerts, and stricter guardrails."
          />

          <div className="mx-auto mt-24 max-w-2xl">
            <h2
              className="mb-8 text-center"
              style={{
                font: '300 clamp(2rem, 4vw, 2.6rem)/1.08 var(--font-family-sans)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.06em',
              }}
            >
              Frequently asked questions
            </h2>

            <div className="space-y-6">
              <FAQItem
                question="What counts as a monitored token?"
                answer="Any token sent to or received from an AI coding tool while TokenGuard is active. Prompt contents are never stored, only usage metadata such as counts, timestamps, and tool source."
              />
              <FAQItem
                question="Can I switch plans anytime?"
                answer="Yes. You can upgrade or downgrade whenever you need, and paid changes take effect immediately."
              />
              <FAQItem
                question="What happens if I exceed Free plan limits?"
                answer="TokenGuard warns you as you approach the monthly monitoring cap, then pauses additional monitoring until the next cycle or until you upgrade."
              />
              <FAQItem
                question="How does Team pricing work?"
                answer="Team plans are built for shared monitoring, pooled budgets, and workspace-level controls. If you need more seats or custom support, we can scope that with you."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div
      className="rounded-[22px] p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
    >
      <h4 className="mb-2" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
        {question}
      </h4>
      <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
        {answer}
      </p>
    </div>
  );
}
