import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthArt from '../components/AuthArt.jsx'
import AuthError from '../components/AuthError.jsx'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // email → otp → newpassword
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [expired, setExpired] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const inputs = useRef([])
  const timerRef = useRef(null)

  function startTimer() {
    setTimeLeft(300); setExpired(false)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setExpired(true); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => { return () => clearInterval(timerRef.current) }, [])

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function getCode() {
    return inputs.current.map(i => i?.value || '').join('')
  }

  function handleInput(e, idx) {
    const val = e.target.value.replace(/\D/g, '')
    e.target.value = val.slice(-1)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) inputs.current[idx - 1]?.focus()
  }

  async function handleSendOTP(e) {
    e.preventDefault()
    if (!email) return setError('Email is required.')
    setLoading(true); setError('')
    try {
      const res = await fetch('http://127.0.0.1:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Failed to send OTP.')
      setStep('otp')
      startTimer()
      setAttempts(0)
    } catch { setError('Unable to connect to server.') }
    finally { setLoading(false) }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault()
    const code = getCode()
    if (code.length < 6) return setError('Please enter the complete 6-digit code.')
    if (expired) return setError('OTP has expired. Please request a new one.')
    if (attempts >= 3) return setError('Too many attempts. Please request a new OTP.')
    setLoading(true); setError('')
    try {
      const res = await fetch('http://127.0.0.1:3000/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      if (!res.ok) { setAttempts(prev => prev + 1); return setError(data.error || 'Invalid OTP.') }
      setStep('newpassword')
      clearInterval(timerRef.current)
    } catch { setError('Unable to connect to server.') }
    finally { setLoading(false) }
  }

  async function handleResend() {
    setResending(true); setError(''); setResent(false); setAttempts(0)
    try {
      const res = await fetch('http://127.0.0.1:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Failed to resend OTP.')
      setResent(true)
      startTimer()
      inputs.current.forEach(i => { if (i) i.value = '' })
      inputs.current[0]?.focus()
    } catch { setError('Unable to connect to server.') }
    finally { setResending(false) }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    setLoading(true); setError('')
    try {
      const res = await fetch('http://127.0.0.1:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Failed to reset password.')
      setSuccess(true)
    } catch { setError('Unable to connect to server.') }
    finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="auth">
        <AuthArt />
        <section className="auth-panel">
          <div className="auth-form" style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--ok-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
            </div>
            <h1 style={{ marginBottom: '8px' }}>Password reset!</h1>
            <p className="lead" style={{ marginBottom: '24px' }}>Your password has been updated successfully.</p>
            <button className="auth-btn" onClick={() => navigate('/login')}>Back to Login</button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="auth">
      <AuthArt />
      <section className="auth-panel">
        <div className="auth-form">

          {/* Step 1 — Enter Email */}
          {step === 'email' && (
            <>
              <div className="auth-eyebrow">Password Recovery</div>
              <h1>Forgot password?</h1>
              <p className="lead">Enter your email and we'll send you a verification code.</p>
              <form onSubmit={handleSendOTP} noValidate>
                <AuthError message={error} />
                <div className="field">
                  <label>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
              <p className="auth-foot" style={{ marginTop: '8px' }}>
                <b><a href="#" onClick={e => { e.preventDefault(); navigate('/login') }}>Back to Login</a></b>
              </p>
            </>
          )}

          {/* Step 2 — Verify OTP */}
          {step === 'otp' && (
            <>
              <div className="auth-eyebrow">Verify your email</div>
              <h1>Enter OTP</h1>
              <p className="lead">We sent a 6-digit code to <b>{email}</b>.</p>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: expired ? 'var(--bad)' : timeLeft <= 60 ? 'var(--warn)' : 'var(--muted)' }}>
                  {expired ? 'OTP expired' : `Expires in ${formatTime(timeLeft)}`}
                </span>
              </div>

              {attempts > 0 && !expired && (
                <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--warn)', marginBottom: '4px' }}>
                  {3 - attempts} attempt{3 - attempts === 1 ? '' : 's'} remaining
                </div>
              )}

              <form onSubmit={handleVerifyOTP} noValidate>
                <AuthError message={error} />
                <div className="otp-boxes">
                  {[0,1,2,3,4,5].map(i => (
                    <input key={i} ref={el => inputs.current[i] = el} type="text" inputMode="numeric"
                      maxLength={1} className="otp-box"
                      onInput={e => handleInput(e, i)} onKeyDown={e => handleKeyDown(e, i)}
                      disabled={expired || attempts >= 3} />
                  ))}
                </div>
                {resent && <p className="otp-resent">OTP resent! Check your email.</p>}
                <button className="auth-btn" type="submit" disabled={loading || expired || attempts >= 3}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <p className="auth-foot">
                Didn't receive a code? <b><a href="#" onClick={e => { e.preventDefault(); handleResend() }}>{resending ? 'Sending...' : 'Resend OTP'}</a></b>
              </p>
            </>
          )}

          {/* Step 3 — New Password */}
          {step === 'newpassword' && (
            <>
              <div className="auth-eyebrow">Almost there</div>
              <h1>New password</h1>
              <p className="lead">Enter your new password below.</p>
              <form onSubmit={handleResetPassword} noValidate>
                <AuthError message={error} />
                <div className="field">
                  <label>New password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
                </div>
                <div className="field">
                  <label>Confirm new password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Enter password again" />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            </>
          )}

        </div>
      </section>
    </div>
  )
}
