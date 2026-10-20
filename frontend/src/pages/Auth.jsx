import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Auth({ onLogin }) {
const [isRegister, setIsRegister] = useState(false);
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");


async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
        if (isRegister) {
            const registerResponse = await fetch(`${API}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();

                let message = "Registration failed";

                try {
                    const errorData = JSON.parse(errorText);
                    message = errorData.detail || message;
                } catch {
                    message = errorText || message;
                }

                throw new Error(message);
            }
        }

        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login failed");
        }

        onLogin(data);
    } catch (err) {
        setError(err.message || "Something went wrong");
    }
}

return (
    <div>
        <h1>{isRegister ? "Create Account" : "Login"}</h1>

        <form onSubmit={handleSubmit}>
            {isRegister && (
                <input
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
            )}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />

            <button type="submit">
                {isRegister ? "Register" : "Login"}
            </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button onClick={() => {
            setIsRegister(!isRegister);
            setError("");
        }}>
            {isRegister
                ? "Already registered? Login"
                : "New here? Register"}
        </button>
    </div>
);


}

export default Auth;
