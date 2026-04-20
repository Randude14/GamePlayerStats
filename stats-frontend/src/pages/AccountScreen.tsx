import { useRef, useState } from "react";
import { fetchWithAuth, HttpMethod } from "../util/serverRequests";
import { useAuth } from "../context/useAuth";
import { AccountLoginPage } from "../components/AccountLoginPage";
import './AccountScreen.css'
import { AccountCreatePage } from "../components/AccountCreatePage";

export function AccountScreen() {
    const { user, token, logout } = useAuth();
    const [createAccount, setCreateAccount] = useState(false);

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
                            setCreateAccount(false);
                        }
                    }>Logout</button>
                </div>
            </>
        }
        else {
            return <label>Loading...</label>
        }
    }

    const backToCreatePage = () => {
        setCreateAccount(true);
    }

    const backToLoginPage = () => {
        setCreateAccount(false);
    }

    return createAccount ? <AccountCreatePage backToLoginPage={backToLoginPage}/> : <AccountLoginPage backToCreatePage={backToCreatePage}/>;
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