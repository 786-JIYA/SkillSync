
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MyProfile.css";

function MyProfile() {
    const { student } = useAuth();

    const getValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Not available";
        }

        if (typeof value === "object") {
            return value.name || value.title || "Not available";
        }

        return value;
    };

    const initials = student?.name
        ? student.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("")
        : "ST";

    const profileFields = [
        { label: "Full Name", value: student?.name },
        { label: "PRN", value: student?.prn || student?.PRN },
        {
            label: "College Email",
            value: student?.email || student?.collegeEmail,
        },
        { label: "Department", value: student?.department },
        {
            label: "Class Year",
            value: student?.classYear || student?.year,
        },
        { label: "Division", value: student?.division },
    ];

    return (
        <main className="my-profile-page">
            <header className="my-profile-header">
                <div>
                    <p className="profile-eyebrow">STUDENT WORKSPACE</p>
                    <h1>My Profile</h1>
                    <p>View your academic information and manage your skills.</p>
                </div>
            </header>

            <section className="profile-identity-card">
                <div className="profile-avatar">{initials}</div>

                <div className="profile-identity-info">
                    <h2>{getValue(student?.name)}</h2>
                    <p>
                        {getValue(student?.department)}{" "}
                        {student?.classYear
                            ? `· ${student.classYear}`
                            : ""}
                    </p>
                    <span className="profile-role">STUDENT</span>
                </div>
            </section>

            <section className="profile-details-card">
                <div className="profile-section-heading">
                    <div>
                        <h2>Academic Information</h2>
                        <p>Your registered student details.</p>
                    </div>
                    <span className="profile-readonly-label">
                        Read only
                    </span>
                </div>

                <div className="profile-details-grid">
                    {profileFields.map((field) => (
                        <div className="profile-detail-item" key={field.label}>
                            <span>{field.label}</span>
                            <strong>{getValue(field.value)}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <section className="profile-skills-card">
                <div className="profile-skills-icon">✦</div>

                <div className="profile-skills-content">
                    <h2>Skills & Competencies</h2>
                    <p>
                        Add your technical skills, update your proficiency,
                        and keep your profile ready for project matching.
                    </p>
                </div>

                <Link to="/skills" className="profile-skills-link">
                    Manage Skills →
                </Link>
            </section>
        </main>
    );
}

export default MyProfile;
