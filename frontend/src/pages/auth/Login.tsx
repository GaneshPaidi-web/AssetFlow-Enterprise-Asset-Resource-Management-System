import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginSchema) => {
    // Simulating authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Login credentials:', data);
    localStorage.setItem('auth_token', 'mock-jwt-token');
    navigate('/dashboard');
  };

  return (
    <div className="auth-page-wrapper">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              {...register('email')} 
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              {...register('password')} 
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};
