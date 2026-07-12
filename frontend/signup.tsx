import { Link } from "react-router-dom";
import "../styles/Auth.css";

const Signup = () => {
  return (
    <div className="auth-container">
      <div className="left-panel">
        <h1>AssetFlow</h1>
        <p>Enterprise ERP</p>

        <div className="welcome">
          <h2>Create Account</h2>
          <p>Create your account to access the ERP system.</p>
        </div>
      </div>

      <div className="right-panel">
        <h2>Sign Up</h2>

        <form>
          <input type="text" placeholder="Full Name" />

          <input type="email" placeholder="Email Address" />

          <input type="password" placeholder="Password" />

          <button type="submit">Create Account</button>
        </form>

        <p>
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
