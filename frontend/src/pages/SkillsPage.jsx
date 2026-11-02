
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { skillService } from "../services/skillService";
import "./SkillsPage.css";

const proficiencyLabels = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
};

function SkillsPage() {
    const { token } = useAuth();

    const [availableSkills, setAvailableSkills] = useState([]);
    const [mySkills, setMySkills] = useState([]);

    const [selectedSkill, setSelectedSkill] = useState("");
    const [proficiency, setProficiency] = useState(3);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Load catalogue and student's skills
    async function loadSkills() {
        try {
            setLoading(true);
            setError("");

            const [catalogueResult, mySkillsResult] = await Promise.all([
                skillService.getAllSkills(token),
                skillService.getMySkills(token),
            ]);

            setAvailableSkills(
                catalogueResult.data?.skills || catalogueResult.data || []
            );

            setMySkills(
                mySkillsResult.data?.skills || mySkillsResult.data || []
            );
        } catch (err) {
            setError(err.message || "Unable to load skills.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            loadSkills();
        }
    }, [token]);

    // Add or update skill
    async function handleAddSkill(e) {
        e.preventDefault();

        if (!selectedSkill) {
            setError("Please select a skill.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            await skillService.addOrUpdateSkill(
                token,
                selectedSkill,
                Number(proficiency)
            );

            setMessage("Skill saved successfully!");
            await loadSkills();
        } catch (err) {
            setError(err.message || "Unable to save skill.");
        } finally {
            setSaving(false);
        }
    }

    // Delete skill
    async function handleDeleteSkill(skillId) {
        const confirmed = window.confirm(
            "Are you sure you want to remove this skill?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await skillService.deleteSkill(token, skillId);

            setMessage("Skill removed successfully!");
            await loadSkills();
        } catch (err) {
            setError(err.message || "Unable to remove skill.");
        }
    }

    // Update proficiency of an existing skill
    async function handleProficiencyChange(skillId, value) {
        try {
            setError("");
            setMessage("");

            await skillService.addOrUpdateSkill(
                token,
                skillId,
                Number(value)
            );

            setMessage("Proficiency updated!");
            await loadSkills();
        } catch (err) {
            setError(err.message || "Unable to update proficiency.");
        }
    }

    const availableToAdd = availableSkills.filter(
        (skill) => !mySkills.some((item) => item.id === skill.id)
    );

    if (loading) {
        return <div className="skills-loading">Loading your skills...</div>;
    }

    return (
        <div className="skills-page">
            <div className="skills-header">
                <div>
                    <p className="skills-eyebrow">STUDENT PROFILE / COMPETENCIES</p>
                    <h1>My Skills</h1>
                    <p>
                        Manage your technical skills and track your proficiency.
                    </p>
                </div>

                <div className="skills-count">
                    <span>{mySkills.length}</span>
                    <p>Skills Added</p>
                </div>
            </div>

            {error && <div className="skills-error">{error}</div>}
            {message && <div className="skills-success">{message}</div>}

            <section className="skills-section">
                <div className="section-heading">
                    <div>
                        <h2>Competencies & Skills</h2>
                        <p>Add skills and select your proficiency level.</p>
                    </div>
                </div>

                <form className="skill-form" onSubmit={handleAddSkill}>
                    <div className="form-field">
                        <label htmlFor="skill">Select Skill</label>

                        <select
                            id="skill"
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                        >
                            <option value="">Choose a skill</option>

                            {availableToAdd.map((skill) => (
                                <option key={skill.id} value={skill.id}>
                                    {skill.name} ({skill.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="proficiency">Proficiency Level</label>

                        <select
                            id="proficiency"
                            value={proficiency}
                            onChange={(e) => setProficiency(e.target.value)}
                        >
                            {Object.entries(proficiencyLabels).map(
                                ([level, label]) => (
                                    <option key={level} value={level}>
                                        {level} - {label}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <button
                        className="add-skill-button"
                        type="submit"
                        disabled={saving || !selectedSkill}
                    >
                        {saving ? "Saving..." : "+ Add Skill"}
                    </button>
                </form>
            </section>

            <section className="skills-section">
                <div className="section-heading">
                    <div>
                        <h2>My Skill Collection</h2>
                        <p>Your currently selected skills.</p>
                    </div>

                    <span className="skill-total">
                        {mySkills.length} Skills
                    </span>
                </div>

                {mySkills.length === 0 ? (
                    <div className="skills-empty">
                        <h3>No skills added yet</h3>
                        <p>Choose a skill above to build your profile.</p>
                    </div>
                ) : (
                    <div className="skills-list">
                        {mySkills.map((skill) => (
                            <div className="skill-card" key={skill.id}>
                                <div className="skill-info">
                                    <div className="skill-icon">
                                        {skill.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h3>{skill.name}</h3>
                                        <span className="skill-category">
                                            {skill.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="skill-proficiency">
                                    <select
                                        value={skill.proficiency}
                                        aria-label={`Proficiency for ${skill.name}`}
                                        onChange={(e) =>
                                            handleProficiencyChange(
                                                skill.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        {Object.entries(proficiencyLabels).map(
                                            ([level, label]) => (
                                                <option key={level} value={level}>
                                                    {level} - {label}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <span>
                                        {skill.proficiency}/5 ·{" "}
                                        {proficiencyLabels[skill.proficiency]}
                                    </span>
                                </div>

                                <button
                                    className="delete-skill-button"
                                    type="button"
                                    onClick={() => handleDeleteSkill(skill.id)}
                                    aria-label={`Remove ${skill.name}`}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default SkillsPage;
