import * as React from 'react';
import { Link } from 'react-router';
import { CheckCircleIcon, SparklesIcon } from 'lucide-react';
import { motion, type Transition } from 'motion/react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from './ui/utils';

type Frequency = 'monthly' | 'yearly';
const frequencies: Frequency[] = ['monthly', 'yearly'];

export interface PricingPlan {
  name: string;
  info: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    text: string;
    tooltip?: string;
  }[];
  btn: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'section'> {
  plans: PricingPlan[];
  heading: string;
  description?: string;
}

export function PricingSection({
  plans,
  heading,
  description,
  className,
  ...props
}: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<Frequency>('monthly');

  return (
    <section className={cn('flex w-full flex-col items-center justify-center space-y-8', className)} {...props}>
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h2
          style={{
            font: '500 clamp(2.6rem, 5vw, 4rem)/0.98 var(--font-family-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
          }}
        >
          {heading}
        </h2>
        {description ? (
          <p
            className="mx-auto max-w-xl"
            style={{
              font: '400 1rem/1.7 var(--font-family-sans)',
              color: 'var(--text-secondary)',
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      <PricingFrequencyToggle frequency={frequency} setFrequency={setFrequency} />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} frequency={frequency} />
        ))}
      </div>
    </section>
  );
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
  frequency: Frequency;
  setFrequency: React.Dispatch<React.SetStateAction<Frequency>>;
};

export function PricingFrequencyToggle({
  frequency,
  setFrequency,
  className,
  ...props
}: PricingFrequencyToggleProps) {
  return (
    <div
      className={cn('mx-auto flex w-fit rounded-xl p-1.5', className)}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        backdropFilter: 'var(--blur-elevated)',
        WebkitBackdropFilter: 'var(--blur-elevated)',
      }}
      {...props}
    >
      {frequencies.map((freq) => (
        <button
          key={freq}
          type="button"
          onClick={() => setFrequency(freq)}
          className="relative px-5 py-2 text-sm capitalize"
          style={{
            color: frequency === freq ? '#080808' : 'var(--text-secondary)',
            font: '500 0.9rem/1 var(--font-family-sans)',
          }}
        >
          <span className="relative z-10">{freq}</span>
          {frequency === freq ? (
            <motion.span
              layoutId="pricing-frequency"
              transition={{ type: 'spring', duration: 0.4 } satisfies Transition}
              className="absolute inset-0 z-0 rounded-[10px]"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(210,210,210,0.92))',
              }}
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}

type PricingCardProps = React.ComponentProps<'article'> & {
  plan: PricingPlan;
  frequency?: Frequency;
};

export function PricingCard({
  plan,
  className,
  frequency = frequencies[0],
  ...props
}: PricingCardProps) {
  const savings =
    frequency === 'yearly' && plan.name !== 'Free'
      ? Math.round(((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100)
      : 0;

  return (
    <article
      className={cn('relative flex w-full flex-col overflow-hidden rounded-[28px]', className)}
      style={{
        background: plan.highlighted ? 'rgba(24, 24, 26, 0.72)' : 'rgba(18, 18, 20, 0.65)',
        border: plan.highlighted ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
        backdropFilter: 'var(--blur-card)',
        WebkitBackdropFilter: 'var(--blur-card)',
      }}
      {...props}
    >
      {plan.highlighted ? (
        <BorderTrail
          size={112}
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(210,210,210,0.52) 45%, rgba(255,255,255,0.08) 78%, rgba(255,255,255,0.01) 100%)',
            boxShadow: '0 0 36px rgba(255,255,255,0.18)',
          }}
        />
      ) : null}

      <div
        className={cn('rounded-t-[28px] p-6', plan.highlighted && 'pb-7')}
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {plan.highlighted ? (
            <p
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
              }}
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              Popular
            </p>
          ) : null}
          {frequency === 'yearly' && savings > 0 ? (
            <p
              className="rounded-lg px-2.5 py-1 text-xs"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-primary)',
              }}
            >
              {savings}% off
            </p>
          ) : null}
        </div>

        <div style={{ font: '500 1.05rem/1.2 var(--font-family-sans)', color: 'var(--text-primary)' }}>{plan.name}</div>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {plan.info}
        </p>
        <h3 className="mt-5 flex items-end gap-1.5">
          <span
            style={{
              font: '500 3rem/0.92 var(--font-family-display)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
            }}
          >
            ${plan.price[frequency]}
          </span>
          <span style={{ color: 'var(--text-muted)', font: '400 0.92rem/1.4 var(--font-family-sans)' }}>
            {plan.name !== 'Free' ? `/${frequency === 'monthly' ? 'month' : 'year'}` : ''}
          </span>
        </h3>
      </div>

      <div className="space-y-4 px-6 py-7 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <TooltipProvider>
          {plan.features.map((feature, index) => (
            <div key={`${plan.name}-${index}`} className="flex items-start gap-3">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-primary)' }} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className={cn(feature.tooltip ? 'cursor-help border-b border-dashed border-white/20' : '')}
                    style={{ color: 'var(--text-secondary)', font: '400 0.92rem/1.6 var(--font-family-sans)' }}
                  >
                    {feature.text}
                  </p>
                </TooltipTrigger>
                {feature.tooltip ? (
                  <TooltipContent>
                    <p>{feature.tooltip}</p>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>

      <div className={cn('mt-auto w-full p-5 pt-0', plan.highlighted && 'pb-6')}>
        <Button
          className="h-11 w-full rounded-xl"
          variant={plan.highlighted ? 'default' : 'outline'}
          asChild
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            backdropFilter: 'var(--blur-elevated)',
            WebkitBackdropFilter: 'var(--blur-elevated)',
          }}
        >
          <Link to={plan.btn.href}>{plan.btn.text}</Link>
        </Button>
      </div>
    </article>
  );
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const baseTransition: Transition = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear',
  };

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn('absolute aspect-square rounded-full', className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={{
          ...(transition ?? baseTransition),
          delay,
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
