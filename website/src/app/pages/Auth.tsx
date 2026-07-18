import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { Logo } from '../components/Logo';

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth - redirect to download
    navigate('/download');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-md w-full px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center mb-8">
            <Logo size={32} />
          </Link>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-xl" 
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div className="mb-6">
            <h2 className="mb-2" style={{ 
              font: '600 24px/1.2 var(--font-family-sans)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Get started with TokenGuard' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
                style={{ 
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  font: 'var(--font-body)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
                style={{ 
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  font: 'var(--font-body)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
                    Remember me
                  </span>
                </label>
                <button type="button" 
                        style={{ font: 'var(--font-caption)', color: 'var(--text-primary)' }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-lg transition-opacity hover:opacity-90"
              style={{ 
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                font: 'var(--font-label)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'var(--blur-elevated)',
                WebkitBackdropFilter: 'var(--blur-elevated)',
                cursor: 'pointer'
              }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ font: 'var(--font-caption)', color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span style={{ color: 'var(--text-primary)' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)' }}>
            By continuing, you agree to TokenGuard's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
