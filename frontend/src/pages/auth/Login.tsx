import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-[#e9ecef] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#dee2e6] rounded-card p-8 shadow-custom text-center space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 select-none">
          <div className="w-12 h-12 bg-[#6c757d] rounded-btn flex items-center justify-center text-white shadow-inner">
            <Shield className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="text-2xl font-bold text-[#212529] tracking-tight m-0">AssetFlow ERP</h2>
          <p className="text-[14px] text-[#6c757d] font-medium m-0">Sign in to manage your enterprise resources</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex items-center justify-between text-left select-none">
            <label className="flex items-center gap-2 text-small text-[#495057] font-medium cursor-pointer">
              <input type="checkbox" className="rounded border-[#ced4da] text-[#6c757d] focus:ring-[#6c757d]" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-small text-[#6c757d] hover:text-[#212529] font-semibold underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={isSubmitting} variant="primary" className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="border-t border-[#dee2e6] pt-4 select-none">
          <p className="text-small text-[#6c757d] font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#6c757d] hover:text-[#212529] font-bold underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
