import { Link } from "react-router-dom";
import "./Auth.css";

export default function Signup() {

    return (

        <div className="auth-container">

            <div className="left-panel">

                <h1>AssetFlow</h1>
                <p>Enterprise ERP</p>

                <div className="welcome">
                    <h2>Create Account</h2>
                    <p>Register your organization and start managing assets.</p>
                </div>

            </div>

            <div className="right-panel">

                <h2>Sign Up</h2>

                <form>

                    <input
                        type="text"
                        placeholder="Full Name"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                    />

                    <button>
                        Create Account
                    </button>

                </form>

                <p>
                    Already have an account?
                    <Link to="/"> Sign In</Link>
                </p>

            </div>

        </div>

    );
}
