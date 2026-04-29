import { useRef } from "react";
import { useApi } from "../context/ApiContext";

interface AccountLoginProps {
    backToCreatePage: () => void;
}

export function AccountLoginPage({backToCreatePage} : AccountLoginProps) {

    const { authPlayer } = useApi();

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);


    const loginClickHandler = async () => {
        if(emailRef.current && passwordRef.current) {
            const emailText: string = emailRef.current.value;
            const passwordText: string = passwordRef.current.value;
            await authPlayer(emailText, passwordText);
        }
    }

    return <div className="login_div">
            <div> <label>Email:</label><input type="email" id="email" ref={emailRef}></input> </div>
            <div> <label>Password:</label><input type="password" id="password" ref={passwordRef}></input> </div>
            <div> <button type="submit" onClick={loginClickHandler}>Login</button> <button onClick={backToCreatePage}>Create Account</button> </div>
    </div>
}