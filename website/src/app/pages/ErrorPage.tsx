import { Link, useRouteError } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div className="website-page min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-md w-full px-6 text-center">
        {/* Logo */}
        <Link to="/" className="mb-8 inline-flex items-center justify-center">
          <Logo size={24} />
        </Link>

        {/* Error Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" 
             style={{ background: 'rgba(224, 85, 85, 0.12)' }}>
          <AlertCircle className="w-8 h-8" style={{ color: 'var(--status-danger)' }} />
        </div>

        {/* Error Message */}
        <h2 className="mb-3" style={{ 
          font: '600 24px/1.2 var(--font-family-sans)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px'
        }}>
          Something went wrong
        </h2>
        
        <p className="mb-8" style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          {error?.statusText || error?.message || "The page you're looking for doesn't exist or an error occurred."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/" 
                className="w-full h-11 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ 
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  font: 'var(--font-label)',
                  backdropFilter: 'var(--blur-elevated)',
                  WebkitBackdropFilter: 'var(--blur-elevated)'
                }}>
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full h-11 rounded-lg flex items-center justify-center transition-colors"
            style={{ 
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              font: 'var(--font-label)',
              cursor: 'pointer'
            }}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
