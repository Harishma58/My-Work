import {withRouter, Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

const Header = props => {
  const onClickLogout = () => {
    Cookies.remove('jwt_token')
    const {history} = props
    history.replace('/login')
  }
  return (
    <nav className="header-container">
      <ul className="list-container">
        <li>
          <Link to="/" className="nav-link">
            <img
              className="logo"
              alt="website logo"
              src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
            />
          </Link>
        </li>
        <li className="nav-links-container">
          <Link to="/" className="nav-link">
            <h1 className="nav-to-name">Home</h1>
          </Link>
          <Link to="/jobs" className="nav-link">
            <h1 className="nav-to-name">Jobs</h1>
          </Link>
        </li>
        <li className="nav-button-container">
          <button
            className="logout-button"
            type="button"
            onClick={onClickLogout}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}
export default withRouter(Header)
