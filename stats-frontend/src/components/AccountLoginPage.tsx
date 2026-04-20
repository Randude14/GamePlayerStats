import { useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import { useToast } from "../context/ToastContext";

interface AccountLoginProps {
    backToCreatePage: () => void;
}

export function AccountLoginPage({backToCreatePage} : AccountLoginProps) {

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const { logout, login } = useAuth();
    const { toast } = useToast();

    const loginClickHandler = async () => {
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
                    logout();
                    toast.error('Invalid credentials.');
                }
                else {
                    login(data);

                    toast.success(`Welcome back!`);
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

    return <div className="login_div">
            <div> <label>Email:</label><input type="email" id="email" ref={emailRef}></input> </div>
            <div> <label>Password:</label><input type="password" id="password" ref={passwordRef}></input> </div>
            <div> <button type="submit" onClick={loginClickHandler}>Login</button> <button onClick={backToCreatePage}>Create Account</button> </div>
    </div>
}