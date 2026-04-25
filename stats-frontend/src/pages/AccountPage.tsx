import { useEffect, useRef, useState } from "react";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import { useAuth } from "../context/useAuth";
import { AccountLoginPage } from "../components/AccountLoginPage";
import { AccountCreatePage } from "../components/AccountCreatePage";
import './AccountPage.css'
import { useToast } from "../context/ToastContext";
import { extractMessage } from "../util/Helpers";
import type { PlayerDashboard } from "../util/Models";

export function AccountPage() {
    const { user, token, logout } = useAuth();
    const { toast } = useToast();
    const [createAccount, setCreateAccount] = useState(false);
    const [ dashboardInfo, setDashboardInfo ] = useState<PlayerDashboard | null>(null);
    const [isLoading, setIsLoading ] = useState(true);
 
    const logoutHandler = () => {
        logout();
        setCreateAccount(false);
    }

    useEffect(() => {
        if(user && user.id) {
            const fetchData = async () => {
                const res = await fetchWithNoAuth(`player_stats/dashboard/${user.id}`, HttpMethod.GET);

                if(res.ok) {
                    const info: PlayerDashboard = await res.json();
                    setDashboardInfo(info);
                }
                else {
                    toast.error('Failed to get dashboard information for user ' + user.username);
                }

                setIsLoading(false);
            }

            fetchData();
        }
    }, [user, toast]);

    if(token) {
        if(! isLoading) {

            if(dashboardInfo) {
                return <>
                    {/* Account Details Card */}
                    <h2>My Account</h2>
                    <div className="profile-card">
                        <div><label>{`Username: ${dashboardInfo.username}`}</label></div>
                        <div><label>{`Name: ${dashboardInfo.name}`}</label></div>
                        <div><label>{`Email: ${dashboardInfo.email}`}</label></div>
                        <div><label>{`Total Games Played: ${dashboardInfo.total_games}`}</label></div>
                        <div><label>{`Total Hours Played: ${dashboardInfo.total_hours}`}</label></div>
                        <div><label>{`Member Since: ${new Date(dashboardInfo.created_at).toLocaleDateString()}`}</label></div>
                    </div>

                    <div className="profile-card">
                        <h3>Update Info</h3>
                        <UpdateAccountField label='Username: ' currValue={dashboardInfo.username} field={'username'} endpoint={'players/me/username'}/>
                        <UpdateAccountField label='Name: ' currValue={dashboardInfo.name} field={'name'} endpoint={'players/me/name'}/>
                    </div>
                    <div className="profile-card">
                        <h3>Update Password</h3>
                        <UpdatePassword/>
                    </div>
                    <div className="account-action">
                        <button className="action-button" onClick={logoutHandler}>Logout</button>
                        <button className="action-button" id="delete-account">Delete Account</button>
                    </div>
                </>
            }
            else if(user) {
                return <>Failed to grab info for {user.username}</>
            }
            else {
                return <></>
            }
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

    return createAccount ? <AccountCreatePage backToLoginPage={backToLoginPage}/> : 
                            <AccountLoginPage backToCreatePage={backToCreatePage}/>;
}

function UpdatePassword() {
    const oldPasswordRef = useRef<null | HTMLInputElement>(null);
    const newPasswordRef = useRef<null | HTMLInputElement>(null);
    const confirmPasswordRef = useRef<null | HTMLInputElement>(null);
    const updatePasswordButtonRef = useRef<null | HTMLButtonElement>(null);
    const [message, setMessage] = useState(null);
    const { toast } = useToast();

    const onClickHandler = async () => {
        const old_password = oldPasswordRef.current.value;
        const new_password = newPasswordRef.current.value;
        const body = JSON.stringify({old_password, new_password})

        const res = await fetchWithAuth('players/me/password', HttpMethod.PATCH, body);
        const data = await res.json();
        const mess = extractMessage(data, 'Failed to update!');

        if(res.ok) {
            toast.success(mess);
        }
        else {
            toast.error(mess);
        }
    }

    const onChangeHandler = async () => {
        const old_password = oldPasswordRef.current.value;
        const new_password = newPasswordRef.current.value;
        const confirm_password = confirmPasswordRef.current.value;
        let currentMessage: string = null;

        if(new_password !== confirm_password) {
            currentMessage = 'Passwords must match';

        }
        else if(!validatePassword(new_password)) {
            currentMessage = 'Passwords must contain one uppercase letter and a special character.';
        }
        else if(old_password.length === 0) {
            currentMessage = 'Must provide old password.';
        }

        setMessage(currentMessage);
    }

    return <>
        
        <form action={onClickHandler}>
            <div className="update-password">
                <label>Old Password: </label> <input type="password" ref={oldPasswordRef} onChange={onChangeHandler}/>
                <label>New Password: </label> <input type="password" ref={newPasswordRef} onChange={onChangeHandler}/>
                <label>Confirm New Password: </label> <input type="password" ref={confirmPasswordRef} onChange={onChangeHandler}/>
            </div>
            <button type="submit" ref={updatePasswordButtonRef}>Update Password</button>
        </form>
        
        
        {message && <label className="warning-message">{message}</label>}
    </>
}

function UpdateAccountField({label, currValue, field, endpoint}) {
    const inputRef = useRef<null | HTMLInputElement>(null);
    const { refreshPlayer } = useAuth();
    const { toast } = useToast();

    const onClickHandler = async () => {
        if(inputRef.current) {
            const input = inputRef.current.value;

            if(input.length < 6) {
                toast.error('Field must contain at least 6 characters.', 3000);
                return;
            }

            // Just ignore, no need for error messages
            if(input === currValue) {
                return;
            }

            const body = JSON.stringify({
                [field]: inputRef.current.value
            });

            const res = await fetchWithAuth(endpoint, HttpMethod.PATCH, body);
            const data = await res.json();
            const mess = data.message || data.msg || (res.ok ? 'Updated!' : 'Failed to update!');
            
            if(res.ok) {
                toast.success(mess);
                refreshPlayer();
            }
            else {
                toast.error(mess);
            }
        }
    }

    return <form action={onClickHandler}>
        <div className="update-info">
            <label>{label}</label>
            <input defaultValue={currValue} ref={inputRef}></input>
            <button>Update</button>
        </div>
    </form>
}

function validatePassword(password: string): boolean {
    if(!password) {
        return false;
    }
    // Regex breakdown:
    // (?=.*[A-Z])       : Ensures at least one uppercase letter exists
    // (?=.*[!@#$%^&*])  : Ensures at least one special character exists (from the set provided)
    // .{8,}             : Enforces a minimum length (e.g., 8 characters)
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;

    return regex.test(password); // returns true
}