import { Link } from "react-router-dom";
import { WebPageRoutes } from "../util/WebPages";
import { useAuth } from "../context/useAuth";
import "./Navbar.css"


export default function Navbar() {
    const { token } = useAuth();

    return <nav className="navbar-links">
        <Link className="navbar-item" to={WebPageRoutes.ALL_STATS}>All Stats</Link>
        <Link className="navbar-item" to={WebPageRoutes.MY_STATS}>My Stats</Link>
        <Link className="navbar-item" to={WebPageRoutes.GAMES}>Games</Link>
        <Link className="navbar-item" to={WebPageRoutes.ACCOUNT}>{token ? "Account" : "Sign In"}</Link>
    </nav>
}