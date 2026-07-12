import { Link } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  return (
    <div className="auth-container">

      <div className="left-panel">
        <h1>AssetFlow</h1>
        <p>Enterprise ERP</p>

        <div className="welcome">
          <h2>Welcome Back</h2>
          <p>Sign in to continue managing your enterprise assets.</p>
        </div>
      </div>

      <div className="right-panel">

        <h2>Sign In</h2>

        <form>

          <input
            type="email"
            placeholder="Email Address"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <button>
            Sign In
          </button>

        </form>

        <p>
          Don't have an account?
          <Link to="/signup"> Sign Up</Link>
        </p>

      </div>

    </div>
  );
}
