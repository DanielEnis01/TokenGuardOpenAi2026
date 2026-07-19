import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export function ScrollDashboardReveal() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth <= 768);

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const preview = new Image();
    const reveal = () => {
      window.setTimeout(() => {
        if (isCurrent) setIsPreviewReady(true);
      }, 360);
    };

    preview.onload = () => {
      void preview.decode().catch(() => undefined).finally(reveal);
    };
    preview.onerror = reveal;
    preview.src = '/dashboard-preview.png';

    if (preview.complete) reveal();

    return () => {
      isCurrent = false;
    };
  }, []);

  const rotateX = useTransform(scrollYProgress, [0, 0.55, 1], [18, 3, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.55, 1], isMobile ? [0.74, 0.94, 1] : [0.83, 0.98, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.55, 1], [120, 0, -28]);
  const titleY = useTransform(scrollYProgress, [0, 0.55, 1], [56, 0, -36]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 1], [0.35, 1, 1]);

  return (
    <section ref={containerRef} className="dashboard-scroll-section px-4 sm:px-6">
      <div className="dashboard-scroll-sticky">
        {isPreviewReady ? (
          <div className="dashboard-reveal-ready">
            <motion.div className="dashboard-scroll-heading" style={{ y: titleY }}>
              <h2>One calm view of every signal that matters.</h2>
              <Link to="/how-it-works" className="dashboard-scroll-link">
                What is TokenGuard <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              className="dashboard-scroll-card"
              style={{
                opacity,
                rotateX,
                scale,
                y: translateY,
                transformPerspective: 1200,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="dashboard-scroll-bezel">
                <img
                  src="/dashboard-preview.png"
                  alt="TokenGuard dashboard monitoring a live coding session"
                  className="dashboard-scroll-image"
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>
        ) : (
          <DashboardAnticipation />
        )}
      </div>
    </section>
  );
}

function DashboardAnticipation() {
  return (
    <div className="dashboard-anticipation" aria-busy="true" aria-label="Loading dashboard preview">
      <div className="dashboard-anticipation-heading">
        <span />
        <span />
        <i />
      </div>
      <div className="dashboard-anticipation-card">
        <div className="dashboard-anticipation-hero">
          <div><span /><span /></div>
          <div className="dashboard-anticipation-summary"><span /><span /><span /><span /></div>
        </div>
        <div className="dashboard-anticipation-metrics"><span /><span /><span /><span /></div>
        <div className="dashboard-anticipation-chart"><span /><span /><span /></div>
      </div>
    </div>
  );
}
