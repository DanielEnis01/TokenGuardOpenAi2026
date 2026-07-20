import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MeshGradient } from '@paper-design/shaders-react';
import { Lock, Mail } from 'lucide-react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { getWebsiteAuthUrl } from '../lib/externalLinks';
import { firebaseConfigurationError, getFirebaseAuth } from '../lib/firebase';
import { useAuth } from '../providers/AuthProvider';
import './auth-page.css';

export default function Auth() {
  const navigate = useNavigate();
  const websiteAuthUrl = getWebsiteAuthUrl();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(firebaseConfigurationError);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/monitor', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSigningIn(true);

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      navigate('/monitor');
    } catch (error) {
      setErrorMessage(getSignInErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);

    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      navigate('/monitor');
    } catch (error) {
      setErrorMessage(getSignInErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="auth-entry-page relative h-screen w-full overflow-hidden bg-black">
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

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="w-full text-center">
          <h1 className="title-text mb-3">TokenGuard</h1>
          <p className="subtitle-text mb-3">A protected coding experience.</p>

          <div className="sign-in-form-container">
            <form className="sign-in-form" onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  className="form-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  className="form-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {errorMessage ? (
                <p role="alert" style={{ color: 'var(--status-danger)', font: 'var(--font-caption)', textAlign: 'left' }}>
                  {errorMessage}
                </p>
              ) : null}

              <button className="sign-in-button" type="submit" disabled={isSigningIn}>
                <span className="button-text">{isSigningIn ? 'Signing in…' : 'Sign in'}</span>
              </button>

              <div className="divider">
                <span className="divider-text">or</span>
              </div>

              <button type="button" className="google-button" onClick={() => void handleGoogleSignIn()} disabled={isSigningIn}>
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="google-text">Sign in with Google</span>
              </button>

              <p className="register-text">
                Don&apos;t have an account?{' '}
                <a className="register-link" href={websiteAuthUrl} target="_blank" rel="noreferrer">
                  Register
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function getSignInErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.startsWith('Firebase is not configured')) {
    return error.message;
  }

  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'The email address or password is incorrect.';
  }

  if (code === 'auth/invalid-email') {
    return 'Enter a valid email address.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was cancelled.';
  }

  return 'Sign-in failed. Please try again.';
}
