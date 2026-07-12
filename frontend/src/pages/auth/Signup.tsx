import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupSchema = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupSchema) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Registration details:', data);
    navigate('/login');
  };

  return (
    <div className="auth-page-wrapper">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              placeholder="Full Name" 
              {...register('name')} 
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              placeholder="Email Address" 
              {...register('email')} 
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              placeholder="Password" 
              {...register('password')} 
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input 
              type="password" 
              placeholder="Confirm Password" 
              {...register('confirmPassword')} 
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};
