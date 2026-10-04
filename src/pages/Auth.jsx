import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context';
import { api } from '../api';
import { Icon, Logo } from '../components/UI';

const API_URL = 'https://astralab-backend.onrender.com';

export function PasswordField({
  name = 'password',
  label = 'Password',
  value,
  onChange,
  minLength = 12,
  autoComplete = 'current-password'
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="form-label">
      {label}
      <span className="password-field">
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={visible ? 'text' : 'password'}
          minLength={minLength}
          maxLength={128}
          autoComplete={autoComplete}
          required
          placeholder={label === 'Password' ? 'Your password' : 'Repeat your password'}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}
        >
          <Icon name={visible ? 'EyeOff' : 'Eye'} size={18} />
        </button>
      </span>
    </label>
  );
}

export default function Auth({ mode = 'login' }) {
  const register = mode === 'register';
  const forgot = mode === 'forgot';

  const { setUser, config, toast } = useApp();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const resetToken = search.get('token');

  const [form, setForm] = useState({
    username: '',
    email: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    remember: false,
    terms: false
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = e => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value
    });
  };

  const submit = async e => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (register && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      let result;

      if (forgot) {
        result = await api(
          resetToken
            ? '/auth/reset-password'
            : '/auth/forgot-password',
          {
            method: 'POST',
            body: resetToken
              ? {
                  token: resetToken,
                  password: form.password
                }
              : {
                  email: form.email
                }
          }
        );

        setSuccess(result.message);
      } else {
        result = await api(
          register
            ? '/auth/register'
            : '/auth/login',
          {
            method: 'POST',
            body: register
              ? {
                  username: form.username,
                  email: form.email,
                  password: form.password,
                  confirmPassword: form.confirmPassword,
                  terms: form.terms
                }
              : {
                  identifier: form.identifier,
                  password: form.password,
                  remember: form.remember
                }
          }
        );

        setUser(result.user);
        toast(
          register
            ? 'Welcome to AstraLab.'
            : 'Welcome back.'
        );

        navigate('/dashboard');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-aside">
        <div className="auth-orbit" />

        <Logo className="auth-logo" />

        <span className="eyebrow">
          A UNIVERSE FOR BUILDERS
        </span>

        <h2>
          Great worlds.
          <br />
          Start here.
        </h2>

        <p>
          Resources, tools, and creations.
          <br />
          One space for your next idea.
        </p>

        <div className="auth-bottom">
          <Icon name="Box" size={17} />
          Built for the Minecraft community.
        </div>
      </div>

      <div className="auth-form-wrap">
        <Link className="auth-back" to="/">
          <Icon name="ArrowLeft" size={16} />
          Back to AstraLab
        </Link>

        <div className="auth-form">
          <span className="eyebrow">
            {forgot
              ? 'ACCOUNT RECOVERY'
              : register
                ? 'YOUR NEXT CHAPTER'
                : 'GOOD TO SEE YOU AGAIN'}
          </span>

          <h1>
            {forgot
              ? resetToken
                ? 'Set a new password.'
                : 'Forgot your password?'
              : register
                ? 'Join the universe.'
                : 'Welcome back.'}
          </h1>

          <p>
            {forgot
              ? 'We’ll help you get back to building.'
              : register
                ? 'Create your AstraLab account and start exploring.'
                : 'Sign in to your AstraLab account.'}
          </p>

          <form onSubmit={submit}>
            {error && (
              <div className="form-error" role="alert">
                <Icon name="CircleAlert" size={17} />
                {error}
              </div>
            )}

            {success && (
              <div className="form-success" role="status">
                <Icon name="CheckCircle2" size={17} />
                {success}
              </div>
            )}

            {register && (
              <label className="form-label">
                Username

                <input
                  name="username"
                  value={form.username}
                  onChange={update}
                  minLength={3}
                  maxLength={40}
                  pattern="[a-zA-Z0-9_.\-]+"
                  autoComplete="username"
                  required
                  placeholder="Your creator name"
                />
              </label>
            )}

            {(register || (forgot && !resetToken)) && (
              <label className="form-label">
                Email address

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
            )}

            {!register && !forgot && (
              <label className="form-label">
                Email or username

                <input
                  name="identifier"
                  value={form.identifier}
                  onChange={update}
                  required
                  autoComplete="username"
                  placeholder="you@example.com"
                />
              </label>
            )}

            {(!forgot || resetToken) && (
              <PasswordField
                value={form.password}
                onChange={update}
                autoComplete={
                  register || resetToken
                    ? 'new-password'
                    : 'current-password'
                }
                minLength={
                  register || resetToken
                    ? 12
                    : 1
                }
              />
            )}

            {register && (
              <>
                <small className="field-hint">
                  At least 12 characters. Make it unique to AstraLab.
                </small>

                <PasswordField
                  name="confirmPassword"
                  label="Confirm password"
                  value={form.confirmPassword}
                  onChange={update}
                  autoComplete="new-password"
                />

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={form.terms}
                    onChange={update}
                    required
                  />

                  <span>
                    I agree to the{' '}
                    <Link to="/terms">Terms</Link>{' '}
                    and{' '}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </span>
                </label>
              </>
            )}

            {!register && !forgot && (
              <div className="auth-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={update}
                  />
                  Remember me
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              className="button primary full-width"
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Please wait…'
                : forgot
                  ? resetToken
                    ? 'Update Password'
                    : 'Send Reset Link'
                  : register
                    ? 'Create Account'
                    : 'Login'}

              {!busy && (
                <Icon name="ArrowRight" size={17} />
              )}
            </button>
          </form>

          {!forgot && (
            <>
              <div className="auth-divider">
                <span />
                or continue with
                <span />
              </div>

              <div className="oauth-buttons">
                {['Google', 'Discord'].map(p => (
                  <a
                    key={p}
                    className={
                      'button secondary ' +
                      (!config?.providers?.[
                        p.toLowerCase()
                      ]
                        ? 'provider-unavailable'
                        : '')
                    }
                    href={
                      API_URL +
                      '/api/auth/oauth/' +
                      p.toLowerCase()
                    }
                    onClick={e => {
                      if (
                        !config?.providers?.[
                          p.toLowerCase()
                        ]
                      ) {
                        e.preventDefault();

                        toast(
                          `${p} sign-in requires provider configuration.`,
                          'error'
                        );
                      }
                    }}
                  >
                    <span className="provider-icon">
                      {p === 'Google'
                        ? 'G'
                        : (
                          <Icon
                            name="Gamepad2"
                            size={17}
                          />
                        )}
                    </span>

                    Continue with {p}
                  </a>
                ))}
              </div>

              <p className="auth-switch">
                {register
                  ? 'Already part of the universe?'
                  : 'New to AstraLab?'}{' '}

                <Link
                  to={
                    register
                      ? '/login'
                      : '/register'
                  }
                >
                  {register
                    ? 'Login'
                    : 'Create an account'}
                </Link>
              </p>
            </>
          )}

          {forgot && (
            <p className="auth-switch">
              <Link to="/login">
                Back to login
              </Link>
            </p>
          )}

          <div className="secure-note">
            <Icon name="LockKeyhole" size={13} />
            Your account. Your creations. Securely stored.
          </div>
        </div>
      </div>
    </main>
  );
}