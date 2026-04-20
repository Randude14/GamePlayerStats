import { useRef } from "react"
import { useToast } from "../context/ToastContext";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import { useAuth } from "../context/useAuth";


interface AccountCreatePageProps {
    backToLoginPage: () => void;
}

export function AccountCreatePage({backToLoginPage} : AccountCreatePageProps) {

    const { toast } = useToast();
    const { login } = useAuth();

    const nameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const onClickHandler = async () => {
        const name = nameRef.current.value;
        const username = usernameRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        if(isDataValid(name, username, email, password)) {
            const body = JSON.stringify({name, username, email, password})

            const res = await fetchWithNoAuth('players', HttpMethod.POST, body);

            if(res.ok) {
                const data = await res.json();
                login(data);
            }
            else {
                toast.error('Invalid credentials.')
            }
        }
        else {
            toast.error('Please fill in all fields.');
        }
    }

    const onFieldsChangeHandler = () => {
        const name = nameRef.current.value;
        const username = usernameRef.current.value;
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        submitButtonRef.current.disabled = !isDataValid(name, username, email, password);
    }
    
    return <>
        <form action={onClickHandler}>
            <div> <label>Name: </label> <input placeholder="Enter your name" onChange={onFieldsChangeHandler} ref={nameRef} /> </div>
            <div> <label>Username: </label> <input placeholder="Enter a unique username" onChange={onFieldsChangeHandler} ref={usernameRef} /> </div>
            <div> <label>Email: </label> <input type="email" placeholder="Enter email" onChange={onFieldsChangeHandler} ref={emailRef} /> </div>
            <div> <label>Password: </label> <input type="password" placeholder="Enter password" onChange={onFieldsChangeHandler} ref={passwordRef} /> </div>
            <div> <button type="submit" ref={submitButtonRef}>Create Account</button> <button onClick={backToLoginPage}>Back To Login</button> </div>
        </form>
    </>
}

function isDataValid(name: string, username: string, email: string, password: string) {
    return name.length > 5 && username.length > 5 && email.length > 5 && password.length > 5;
}