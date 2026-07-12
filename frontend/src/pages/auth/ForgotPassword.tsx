import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Shield, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Forgot password request for:', data.email);
    setIsSuccess(true);
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
          <p className="text-[14px] text-[#6c757d] font-medium m-0">Recover organizational password</p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 p-4 bg-green-50 rounded-btn border border-green-200">
            <CheckCircle className="w-12 h-12 text-[#198754] mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-[#198754]">Reset Link Sent</h3>
            <p className="text-small text-gray-600">
              We have sent a password reset link to your email address if it exists in our system. Please check your inbox.
            </p>
            <Link to="/login" className="block mt-4">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" loading={isSubmitting} variant="primary" className="w-full mt-2">
              Send Reset Link
            </Button>
          </form>
        )}

        {!isSuccess && (
          <div className="border-t border-[#dee2e6] pt-4 select-none">
            <p className="text-small text-[#6c757d] font-medium">
              Remember your password?{' '}
              <Link to="/login" className="text-[#6c757d] hover:text-[#212529] font-bold underline">
                Log in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
