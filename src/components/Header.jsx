import "./Header.css";

export default function Header() {
    return (
        <header className="header-container">
            <div className="header-logo-section">
                <div className="header-logo">
                    <span className="logo-emoji">🪔</span>
                    <img 
                        src="https://village-festival-manager-kte.caffeine.xyz/assets/logo-b9LpZ2oM.png" 
                        alt="Logo" 
                        onError={(e) => { e.target.style.display = 'none'; }} 
                        className="logo-image"
                    />
                </div>
                <div className="header-title">
                    <h1>Village Festival Manager</h1>
                    <p>Collection & Expense Tracker</p>
                </div>
            </div>

            <div className="header-manage-link">
                <p>Manage your</p>
                <p className="highlight">Festival Finances</p>
            </div>
        </header>
    );
}
