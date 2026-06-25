import { useState } from 'react';
import { loginUser, loginAdmin, registerUser } from '../api';
import './Auth.css';

function Auth({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setMsg({ type: 'error', text: 'Email and password are required.' });
      return;
    }
    if (tab === 'register' && !form.name) {
      setMsg({ type: 'error', text: 'Name is required for registration.' });
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      if (tab === 'register') {
        const result = await registerUser(form.name, form.email, form.password);
        if (result === 'User Registered Successfully') {
          setMsg({ type: 'success', text: 'Account created! Please login.' });
          setTimeout(() => {
            setTab('login');
            setForm(f => ({ ...f, password: '' }));
            setMsg(null);
          }, 1200);
        } else {
          setMsg({ type: 'error', text: result });
        }
      } else if (role === 'ADMIN') {
        const result = await loginAdmin(form.email, form.password);
        if (result === 'Admin Login Successful') {
          setMsg({ type: 'success', text: 'Welcome, Admin! Redirecting...' });
          setTimeout(() => {
            onLogin({ name: 'Manosh', email: form.email, role: 'ADMIN' });
          }, 800);
        } else {
          setMsg({ type: 'error', text: result || 'Invalid admin credentials.' });
        }
      } else {
        const result = await loginUser(form.email, form.password);
        if (result === 'Login Successful') {
          setMsg({ type: 'success', text: 'Welcome back! Redirecting...' });
          const displayName = form.email.split('@')[0];
          setTimeout(() => {
            onLogin({ name: displayName, email: form.email, role: 'CUSTOMER' });
          }, 800);
        } else {
          setMsg({ type: 'error', text: result });
        }
      }
    } catch {
      setMsg({
        type: 'error',
        text: 'Cannot reach backend. Is the Spring Boot server running on port 9000?',
      });
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">MR.<span>Coffee</span></div>
        <p className="auth-tagline">
          Sign in to place your order, track your favourites,
          and experience coffee the right way.
        </p>
        <div className="auth-divider" />

        <div className="auth-box">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setMsg(null); }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setRole('CUSTOMER'); setMsg(null); }}
            >
              Register
            </button>
          </div>

          <div className="auth-form" onKeyDown={handleKeyDown}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {tab === 'login' && (
              <div className="form-group">
                <label className="form-label">Login As</label>
                <div className="role-select">
                  <button
                    className={`role-btn ${role === 'CUSTOMER' ? 'active' : ''}`}
                    onClick={() => setRole('CUSTOMER')}
                  >
                    ☕ Customer
                  </button>
                  <button
                    className={`role-btn ${role === 'ADMIN' ? 'active' : ''}`}
                    onClick={() => setRole('ADMIN')}
                  >
                    🔧 Admin
                  </button>
                </div>
                {role === 'ADMIN' && (
                  <p className="admin-login-note">
                    Admin access is restricted. Use authorized credentials only.
                  </p>
                )}
              </div>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : tab === 'login'
                ? 'Login'
                : 'Create Account'}
            </button>

            {msg && (
              <div className={`form-msg ${msg.type}`}>{msg.text}</div>
            )}
          </div>
        </div>
      </div>

      <div className="auth-right hide-mobile">
        <div className="auth-quote">
          <blockquote>
            "Coffee is the best thing to douse the sunrise with."
          </blockquote>
          <cite>— Terri Guillemets</cite>
        </div>
      </div>
    </div>
  );
}

export default Auth;
