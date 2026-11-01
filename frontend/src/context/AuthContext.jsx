
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [student, setStudent] = useState(null);
    const [token, setToken] = useState(
        () => localStorage.getItem("skillsync_token")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadStudent() {
            if (!token) {
                if (active) {
                    setStudent(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const result = await authService.getMe(token);

                if (active) {
                    setStudent(result.data.student);
                }
            } catch {
                if (active) {
                    localStorage.removeItem("skillsync_token");
                    setToken(null);
                    setStudent(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        setLoading(true);
        loadStudent();

        return () => {
            active = false;
        };
    }, [token]);

    async function login(credentials) {
        const result = await authService.login(credentials);
        const { student: loggedInStudent, token: accessToken } =
            result.data;

        localStorage.setItem("skillsync_token", accessToken);
        setStudent(loggedInStudent);
        setToken(accessToken);

        return loggedInStudent;
    }

    async function register(formData) {
        return authService.register(formData);
    }

    function logout() {
        localStorage.removeItem("skillsync_token");
        setToken(null);
        setStudent(null);
    }

    return (
        <AuthContext.Provider
            value={{
                student,
                token,
                loading,
                isAuthenticated: Boolean(student && token),
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
