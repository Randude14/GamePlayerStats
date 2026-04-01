import { useRef, useState } from "react";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './LoginScreen.css'

function login(token: string) {
    localStorage.setItem('token', token);
}

function logout() {
    localStorage.setItem('token', '');
}

export function LoginScreen() {
    const [message, setMessage] = useState('');

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const loginClickHandler = async () => {
        console.log('Login button clicked')
        if(emailRef.current && passwordRef.current) {
            const emailText: string = emailRef.current.value;
            const passwordText: string = passwordRef.current.value;
            const body: string = JSON.stringify({email: emailText, password: passwordText});
            const res = await fetchWithNoAuth('auth/login', HttpMethod.POST, body);
            const data = await res.json();

            if(res.status >= 400) {
                let msg = data.message || data.msg;
                if(!msg && Array.isArray(data.errors)) {
                    msg = data.errors[0].msg;
                }
                setMessage(msg || '');
                logout();
            }
            else {
                setMessage('');
                login(data);
            }
        }
    }

    return <>
        <div className="login_div">
            <div><label>Email:</label><input type="email" id="email" ref={emailRef}></input></div>
            <div><label>Password:</label><input type="password" id="password" ref={passwordRef}></input></div>
            <button type="submit" onClick={loginClickHandler}>Login</button>
            {message != '' && <label>{message}</label>}
        </div>
    </>
}