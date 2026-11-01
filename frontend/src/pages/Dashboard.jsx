
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const { student, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>SkillSync</h1>
                    <p>Student Dashboard</p>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <section className="dashboard-content">
                <h2>
                    Welcome, {student?.name || 'Student'}!
                </h2>

                <p>
                    Your SkillSync account is connected successfully.
                </p>

                <div className="profile-card">
                    <h3>My Profile</h3>

                    <div className="profile-row">
                        <span>PRN</span>
                        <strong>{student?.prn || '—'}</strong>
                    </div>

                    <div className="profile-row">
                        <span>Full Name</span>
                        <strong>{student?.name || '—'}</strong>
                    </div>

                    <div className="profile-row">
                        <span>Email</span>
                        <strong>{student?.email || '—'}</strong>
                    </div>

                    <div className="profile-row">
                        <span>Department</span>
                        <strong>{student?.department || '—'}</strong>
                    </div>

                    <div className="profile-row">
                        <span>Class Year</span>
                        <strong>{student?.classYear ?? '—'}</strong>
                    </div>

                    <div className="profile-row">
                        <span>Division</span>
                        <strong>{student?.division || 'Not specified'}</strong>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Dashboard
