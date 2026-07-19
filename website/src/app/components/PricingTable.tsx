import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

export type PlanLevel = 'free' | 'pro' | 'team';

export type PricingPlan = {
  name: string;
  level: PlanLevel;
  description: string;
  price: { monthly: number; yearly: number };
  popular?: boolean;
};

export type PricingFeature = {
  name: string;
  included: PlanLevel;
};

type PricingTableProps = {
  plans: PricingPlan[];
  features: PricingFeature[];
};

const planRank: Record<PlanLevel, number> = { free: 0, pro: 1, team: 2 };

export function PricingTable({ plans, features }: PricingTableProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanLevel>('pro');
  const selected = plans.find((plan) => plan.level === selectedPlan) ?? plans[0];

  return (
    <section className="pricing-table-shell">
      <div className="pricing-table-intro">
        <p className="product-eyebrow">Pricing</p>
        <h1>Simple limits. Clear control.</h1>
        <p>Start with local session visibility, then add deeper controls as your workflow grows.</p>
      </div>

      <div className="pricing-interval" role="group" aria-label="Billing interval">
        <button className={!isYearly ? 'is-selected' : ''} type="button" onClick={() => setIsYearly(false)}>Monthly</button>
        <button className={isYearly ? 'is-selected' : ''} type="button" onClick={() => setIsYearly(true)}>Yearly <span>save 17%</span></button>
      </div>

      <div className="pricing-plan-selectors">
        {plans.map((plan) => {
          const selectedPlanCard = plan.level === selectedPlan;
          const amount = isYearly ? plan.price.yearly : plan.price.monthly;
          return (
            <button
              key={plan.level}
              type="button"
              onClick={() => setSelectedPlan(plan.level)}
              className={`pricing-plan-selector ${selectedPlanCard ? 'is-selected' : ''}`}
            >
              <div className="pricing-plan-selector-top">
                <span>{plan.name}</span>
                {plan.popular ? <span className="pricing-popular">Most chosen</span> : null}
              </div>
              <p>{plan.description}</p>
              <div className="pricing-price">
                <motion.span key={`${plan.level}-${amount}`} initial={{ opacity: 0.4, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                  ${amount}
                </motion.span>
                <small>{amount === 0 ? '' : `/${isYearly ? 'year' : 'month'}`}</small>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pricing-feature-table">
        <div className="pricing-feature-heading">
          <span>Included capabilities</span>
          <div>{plans.map((plan) => <span key={plan.level}>{plan.name}</span>)}</div>
        </div>
        {features.map((feature) => (
          <div className={`pricing-feature-row ${feature.included === selectedPlan ? 'is-selected' : ''}`} key={feature.name}>
            <span>{feature.name}</span>
            <div>
              {plans.map((plan) => (
                <span key={plan.level} className={plan.level === selectedPlan ? 'is-selected' : ''}>
                  {planRank[plan.level] >= planRank[feature.included] ? <Check className="h-4 w-4" aria-label="Included" /> : <i>—</i>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-action">
        <Link to="/auth">
          {selected.level === 'team' ? 'Talk to the team' : `Start with ${selected.name}`} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
