import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            await login({
                email: email.trim().toLowerCase(),
                password,
            })

            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthLayout activeTab="login">
            <div className="form-heading">
                <div className="heading-top">
                    <span className="eyebrow">REGISTERED SCHOLARS</span>
                    <span className="endpoint-badge">
                        <span className="status-dot" />
                        POST /auth/login
                    </span>
                </div>

                <h2>Log in</h2>
                <p>
                    Access your team roster, skill evaluations, and project workspaces.
                </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="email">College Email</label>

                    <div className="input-wrapper">
                        <span className="input-icon">@</span>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="student@college.edu"
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                <div className="form-field">
                    <div className="label-row">
                        <label htmlFor="password">Password</label>
                        <a href="mailto:help@skillsync.edu?subject=Password%20Recovery">
                            Forgot password?
                        </a>
                    </div>

                    <div className="input-wrapper">
                        <span className="input-icon">♙</span>

                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className="form-options">
                    <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        <span>Keep 30-day session</span>
                    </label>

                    <span className="security-label">♧ SHA-256</span>
                </div>

                {error && (
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="primary-button"
                    disabled={submitting}
                >
                    {submitting ? 'Signing in...' : '⇥  Log in to Workspace'}
                </button>
            </form>

            <p className="auth-switch">
                Don't have an account? <Link to="/register">Create account</Link>
            </p>

            <div className="campus-section">
                <div className="section-divider">
                    <span />
                    CAMPUS STATUS
                    <span />
                </div>

                <div className="campus-status">
                    <span className="campus-icon">▣</span>
                    <div>
                        <strong>Directory Synchronization Active</strong>
                        <small>All registered institutional emails accepted</small>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}

export default Login