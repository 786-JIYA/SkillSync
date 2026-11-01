import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthLayout from '../components/AuthLayout.jsx'

const initialForm = {
    prn: '',
    name: '',
    email: '',
    password: '',
    department: '',
    classYear: '',
    division: '',
}

function Register() {
    const [form, setForm] = useState(initialForm)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState('')

    const { register } = useAuth()
    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }))

        setError('')
        setFieldErrors([])
        setSuccess('')
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setFieldErrors([])
        setSuccess('')

        const classYear = Number(form.classYear)

        if (!Number.isInteger(classYear) || classYear < 1) {
            setError('Enter a valid class year.')
            return
        }

        setSubmitting(true)

        try {
            await register({
                prn: form.prn.trim(),
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                department: form.department.trim(),
                classYear,
                ...(form.division.trim() && {
                    division: form.division.trim(),
                }),
            })

            setSuccess('Registration successful! You can now sign in.')
            setForm(initialForm)

            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 1200)
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
            setFieldErrors(err.errors || [])
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthLayout activeTab="register">
            <div className="form-heading">
                <div className="heading-top">
                    <span className="eyebrow">NEW SCHOLAR REGISTRATION</span>
                    <span className="endpoint-badge">
                        <span className="status-dot" />
                        POST /auth/register
                    </span>
                </div>

                <h2>Create Account</h2>
                <p>
                    Join your campus collaboration network and showcase your skills.
                </p>
            </div>

            <form className="auth-form register-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="prn">Permanent Registration Number (PRN)</label>
                    <input
                        id="prn"
                        name="prn"
                        value={form.prn}
                        onChange={handleChange}
                        placeholder="Enter your PRN"
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="name">Full Name</label>
                    <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        minLength={2}
                        autoComplete="name"
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="email">College Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="student@college.edu"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="password">Password</label>

                    <div className="input-wrapper">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((value) => !value)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="department">Department</label>
                        <input
                            id="department"
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            placeholder="e.g. CSE"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="classYear">Class Year</label>
                        <input
                            id="classYear"
                            name="classYear"
                            type="number"
                            min="1"
                            step="1"
                            value={form.classYear}
                            onChange={handleChange}
                            placeholder="e.g. 3"
                            required
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label htmlFor="division">Division (Optional)</label>
                    <input
                        id="division"
                        name="division"
                        value={form.division}
                        onChange={handleChange}
                        placeholder="e.g. A"
                    />
                </div>

                {fieldErrors.map((item, index) => (
                    <p
                        className="auth-error"
                        key={`${item.field}-${index}`}
                    >
                        {item.field}: {item.message}
                    </p>
                ))}

                {error && (
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="auth-success" role="status">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    className="primary-button"
                    disabled={submitting}
                >
                    {submitting ? 'Creating account...' : '＋  Create Student Account'}
                </button>
            </form>

            <p className="auth-switch">
                Already registered? <Link to="/login">Sign in</Link>
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
                        <strong>Student Directory Registration</strong>
                        <small>Use your valid institutional details</small>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}

export default Register