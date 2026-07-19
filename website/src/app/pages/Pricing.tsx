import { PricingTable, type PricingFeature, type PricingPlan } from '../components/PricingTable';
import { SiteNav } from './HowItWorks';
import './product-pages.css';

const plans: PricingPlan[] = [
  { name: 'Free', level: 'free', description: 'For a single workspace getting started.', price: { monthly: 0, yearly: 0 } },
  { name: 'Pro', level: 'pro', description: 'For developers who want flexible guardrails.', price: { monthly: 12, yearly: 120 }, popular: true },
  { name: 'Team', level: 'team', description: 'For shared budgets and workspace controls.', price: { monthly: 39, yearly: 390 } },
];

const features: PricingFeature[] = [
  { name: '500k tokens monitored each month', included: 'free' },
  { name: 'Basic repeated-edit detection', included: 'free' },
  { name: 'One IDE or CLI connection', included: 'free' },
  { name: 'Unlimited token monitoring', included: 'pro' },
  { name: 'Advanced spiral detection and stop rules', included: 'pro' },
  { name: 'All IDE, CLI, and API connectors', included: 'pro' },
  { name: 'Guardrail customization and session history', included: 'pro' },
  { name: 'Shared budget pools and workspace controls', included: 'team' },
  { name: 'Usage analytics, exports, and priority support', included: 'team' },
];

export default function Pricing() {
  return (
    <div className="website-page product-page min-h-screen">
      <SiteNav />
      <main className="product-shell pricing-page-shell">
        <PricingTable plans={plans} features={features} />
      </main>
    </div>
  );
}
