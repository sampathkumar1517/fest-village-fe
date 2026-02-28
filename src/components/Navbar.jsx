import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎉 FestVillage
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Festival
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/collection" className="nav-link">
              Collection
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/expenses" className="nav-link">
              Expenses
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/analytics" className="nav-link">
              Analytics
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/review" className="nav-link">
              Review
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-link login-link">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
