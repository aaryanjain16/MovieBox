import { Link } from "react-router-dom";

function Sidebar({handleLogout}){
    return (
        <aside className="sidebar">

            <h2 className="logo">MovieBox</h2>

            <nav className="sidebar-nav">

                <Link to="/" className="nav-link">
                    Home
                </Link>

                <Link to="/watchlist" className="nav-link">
                    to be Watch
                </Link>

                <Link to="/watched" className="nav-link">
                    Watched
                </Link>
            </nav>

            
                <button className="logout-button" onClick={handleLogout}>
                        Logout
                </button>   

        </aside>
    )
}
export default Sidebar;