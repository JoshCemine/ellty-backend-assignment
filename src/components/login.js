import { FormEvent } from 'react'
import { useRouter } from 'next/router'

function LoginForm({ onToggle, setUser }) {
    const handleLogin = async (e) => {
        e.preventDefault();

        const { username, password } = e.target.elements;
        
        if (username.value && password.value) {
        setUser({ username: username.value });
        }
    };

    return (
        <div>
        <h1>Log In</h1>
        <form onSubmit={handleLogin}>
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
        <button onClick={onToggle}>
            Need to sign up?
        </button>
        </div>
    );
}

export default LoginForm;
