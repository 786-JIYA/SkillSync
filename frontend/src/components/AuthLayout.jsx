import { Link } from 'react-router-dom'

function AuthLayout({ activeTab, children }) {
    return (
        <main className="auth-page">
            <header className="site-header">
                <div className="brand-area">
                    <div className="brand-icon">✣</div>

                    <div className="brand-badges">
                        <span className="version-badge">
                            V2.4-ACADEMIC-AUTH
                        </span>
                        <span className="node-badge">
                            <span className="status-dot" />
                            Federated Node: Engg-Central
                        </span>
                    </div>

                    <h1>SkillSync Terminal</h1>
                    <p className="brand-description">
                        Unified collegiate collaboration gateway. Connect student
                        talent, match research cohorts, and authenticate academic
                        credentials.
                    </p>
                </div>

                <div className="sso-button">
                    <span className="sso-icon">♧</span>
                    <span>
                        <small>Institutional SSO</small>
                        <strong>Sign in with College ID</strong>
                    </span>
                    <span className="sso-arrow">→</span>
                </div>
            </header>

            <section className="auth-content">
                <div className="auth-card">
                    <div className="auth-tabs">
                        <div className="tab-group">
                            <Link
                                to="/login"
                                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            >
                                <span>⇥</span> Sign In
                            </Link>

                            <Link
                                to="/register"
                                className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                            >
                                <span>♙</span> Create Account
                            </Link>
                        </div>

                        <span className="idp-badge">
                            <span className="status-dot" />
                            IDP Auth 2.4
                        </span>
                    </div>

                    <div className="auth-divider" />

                    {children}
                </div>

                <div className="collaboration-status">
                    <div className="collaboration-left">
                        <span className="status-dot" />
                        <span>1,482 active collaboration slots open</span>
                    </div>
                    <span className="latency">LATENCY 14ms</span>
                </div>

                <div className="feature-grid">
                    <div className="feature-card">
                        <span className="feature-icon">♙</span>
                        <div>
                            <strong>End-to-End Auth</strong>
                            <small>Zero-trust network</small>
                        </div>
                    </div>

                    <div className="feature-card">
                        <span className="feature-icon">♜</span>
                        <div>
                            <strong>Accredited Roster</strong>
                            <small>Official campus sync</small>
                        </div>
                    </div>

                    <div className="feature-card">
                        <span className="feature-icon">♧</span>
                        <div>
                            <strong>Smart Teaming</strong>
                            <small>Skill-based match %</small>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="site-footer">
                <div className="gateway-info">
                    <span>▣</span>
                    IDP-GATEWAY: 0x4B41E1
                    <span className="footer-separator">•</span>
                    Collegiate Engineering Consortium
                </div>

                <nav className="footer-links">
                    <a href="mailto:help@skillsync.edu">Help Desk</a>
                    <a href="#data-protocol">Data Protocol</a>
                    <a href="#api-specification">API Specification</a>
                </nav>
            </footer>
        </main>
    )
}

export default AuthLayout