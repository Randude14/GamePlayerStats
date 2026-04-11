import { useRef, useState } from "react";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './AccountScreen.css'
import { useAuth } from "../context/useAuth";

function AccountLogin() {

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [message, setMessage] = useState<string | null>(null);

    const { logout, login } = useAuth();

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
                    logout();
                }
                else {
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

    return <div className="login_div">
            <div><label>Email:</label><input type="email" id="email" ref={emailRef}></input></div>
            <div><label>Password:</label><input type="password" id="password" ref={passwordRef}></input></div>
            <button type="submit" onClick={loginClickHandler}>Login</button>
            {message != '' && <label>{message}</label>}
    </div>
}

function UpdateAccountField({label, currValue, field, endpoint}) {
    const inputContext = useRef<null | HTMLInputElement>(null);
    const [message, setMessage] = useState(null);

    console.log(endpoint);

    const onClickHandler = async () => {
        if(inputContext.current) {
            const body = JSON.stringify({
                [field]: inputContext.current.value
            });
            setMessage(`Updating...`);

            const res = await fetchWithAuth(endpoint, HttpMethod.PATCH, body);
            const data = await res.json();
            const mess = data.message || data.msg || (res.ok ? 'Updated!' : 'Failed to update!');
            setMessage(mess);
        }
    }

    return <div>
        <div>
            <label>{label}</label>
            <input defaultValue={currValue} ref={inputContext}></input>
            <button onClick={onClickHandler}>Update</button>
        </div>
        <div>{message || ''}</div>
    </div>
}

export function AccountScreen() {
    const { user, token, logout } = useAuth();

    if(token) {
        if(user) {
            return <>
                <UpdateAccountField label='Username: ' currValue={user.username} field={'username'} endpoint={'players/me/username'}/>
                <UpdateAccountField label='Name: ' currValue={user.name} field={'name'} endpoint={'players/me/name'}/>
                <div><label>Email: {user.email}</label></div>
                <div>
                    <button onClick={
                        () => {
                            logout();
                        }
                    }>Logout</button>
                </div>
            </>
        }
        else {
            return <label>Loading...</label>
        }
    }

    return <AccountLogin/>;
}