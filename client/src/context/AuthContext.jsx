import { createContext, useState, useEffect, useContext } from "react";
import { loginUser, signupUser, getMe } from "../api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check for saved token and fetch user
    useEffect(() => {
        const token = localStorage.getItem("medicare_token");
        if (token) {
            getMe()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("medicare_token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (identifier, password) => {
        const res = await loginUser({ identifier, password });
        localStorage.setItem("medicare_token", res.data.token);
        setUser(res.data);
        return res.data;
    };

    const signup = async (data) => {
        const res = await signupUser(data);
        localStorage.setItem("medicare_token", res.data.token);
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem("medicare_token");
        setUser(null);
    };

    const updateUser = (data) => {
        setUser((prev) => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
