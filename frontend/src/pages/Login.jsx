import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthArt from '../components/AuthArt.jsx'
import PasswordField from '../components/PasswordField.jsx'
import AuthError from '../components/AuthError.jsx'

export default function Login() {
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const f = e.target
    try {
      const response = await fetch('http://127.0.0.1:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email.value, password: f.password.value, remember })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Incorrect email or password.')
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      window.location.href = data.redirectTo
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="auth">
      <AuthArt />
      <section className="auth-panel">
        <div className="auth-form">
          <div className="seg">
            <a className="on" href="/login">Log in</a>
            <a href="/signup">Sign up</a>
          </div>
          <div className="auth-eyebrow">Welcome back</div>
          <h1>Log in to your account</h1>
          <p className="lead">Enter your details to continue.</p>

          <form onSubmit={handleSubmit} noValidate>
            <AuthError message={error} />
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="you@gmail.com" autoComplete="username" />
            </div>
            <PasswordField id="pw" name="password" label="Password" placeholder="Enter your password" autoComplete="current-password" />
            <div className="auth-row">
              <label className="check">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <b><a href="/forgot-password">Forgot password?</a></b>
            </div>
            <button className="auth-btn" type="submit">Log In</button>
          </form>

          <p className="auth-foot">New to Allmighty? <b><a href="/signup">Create account</a></b></p>
        </div>
      </section>
    </div>
  )
}
