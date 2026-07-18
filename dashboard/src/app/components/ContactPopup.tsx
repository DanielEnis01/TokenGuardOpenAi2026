import { X } from 'lucide-react';

interface ContactPopupProps {
  onClose: () => void;
}

export function ContactPopup({ onClose }: ContactPopupProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl p-8 max-w-md w-full relative"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="mb-6" style={{ 
          font: 'var(--font-heading)', 
          fontSize: '24px',
          color: 'var(--text-primary)' 
        }}>
          Contact Us
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Email
            </div>
            <a 
              href="mailto:danielenis00@gmail.com"
              style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}
            >
              danielenis00@gmail.com
            </a>
          </div>

          <div>
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Website
            </div>
            <a 
              href="https://danielenis.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}
            >
              danielenis.com
            </a>
          </div>

          <div>
            <div style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              GitHub
            </div>
            <a 
              href="https://github.com/DanielEnis01"
              target="_blank"
              rel="noopener noreferrer"
              style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}
            >
              github.com/DanielEnis01
            </a>
          </div>
        </div>

        <a
          href="mailto:danielenis00@gmail.com"
          className="flex h-10 w-full items-center justify-center rounded-xl transition-opacity hover:opacity-90"
          style={{ 
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            font: 'var(--font-label)',
            backdropFilter: 'var(--blur-elevated)',
            WebkitBackdropFilter: 'var(--blur-elevated)'
          }}
        >
          Open in Outlook
        </a>
      </div>
    </div>
  );
}
