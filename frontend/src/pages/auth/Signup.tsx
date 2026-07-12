import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  const { signup, isLoading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupSchema) => {
    try {
      await signup(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch {
      // Error is already set in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-[#e9ecef] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#dee2e6] rounded-card p-8 shadow-custom text-center space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 select-none">
          <div className="w-12 h-12 bg-[#6c757d] rounded-btn flex items-center justify-center text-white shadow-inner">
            <Shield className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="text-2xl font-bold text-[#212529] tracking-tight m-0">AssetFlow ERP</h2>
          <p className="text-[14px] text-[#6c757d] font-medium m-0">Register your organization account</p>
        </div>

        {/* API Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-input px-4 py-3 text-left">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-[13px] font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email Address"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isLoading} variant="primary" className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <div className="border-t border-[#dee2e6] pt-4 select-none">
          <p className="text-small text-[#6c757d] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6c757d] hover:text-[#212529] font-bold underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
