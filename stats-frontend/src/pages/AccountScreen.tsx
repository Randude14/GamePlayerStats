import { useRef, useState } from "react";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './AccountScreen.css'
import { useAuth } from "../context/useAuth";

export function AccountScreen() {
    const { user, token, logout, login } = useAuth();

    const [message, setMessage] = useState('');

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [isLoggedIn, setLoggedIn] = useState(!!token);

    const loginClickHandler = async () => {
        console.log('Login button clicked')
        if(emailRef.current && passwordRef.current) {
            const emailText: string = emailRef.current.value;
            const passwordText: string = passwordRef.current.value;
            const body: string = JSON.stringify({email: emailText, password: passwordText});

            try {
                const res = await fetchWithNoAuth('auth/login', HttpMethod.POST, body);
                const data = await res.json();

                if(res.status >= 400) {
                    let msg = data.message || data.msg;
                    if(!msg && Array.isArray(data.errors)) {
                        msg = data.errors[0].msg;
                    }
                    setMessage(msg || '');
                    setLoggedIn(false);
                    logout();
                }
                else {
                    setLoggedIn(true);
                    setMessage('');
                    login(data);
                }
            }
            catch (error: unknown) {
                if (error instanceof Error) {
                    console.log(error.message);
                } else {
                    console.log("An unknown error occurred", String(error));
                }
            }
        }
    }

    if(isLoggedIn) {
        if(user) {
            return <>
                <div><label>Username: {user.username}</label></div>
                <div><label>Name: {user.name}</label></div>
                <div><label>Email: {user.email}</label></div>
                <div>
                    <button onClick={
                        () => {
                            logout();
                            setLoggedIn(false);
                        }
                    }>Logout</button>
                </div>
            </>
        }
        else {
            return <label>Loading...</label>
        }
    }

    return   <div className="login_div">
            <div><label>Email:</label><input type="email" id="email" ref={emailRef}></input></div>
            <div><label>Password:</label><input type="password" id="password" ref={passwordRef}></input></div>
            <button type="submit" onClick={loginClickHandler}>Login</button>
            {message != '' && <label>{message}</label>}
        </div>

}