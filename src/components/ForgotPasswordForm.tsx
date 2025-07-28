import { useForm } from 'react-hook-form';
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { authService } from "../services/auth.service";

interface ForgotPasswordFormInputs {
  email: string;
}

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormInputs>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setError(null);
    setMessage(null);
    try {
      const res = await authService.forgotPassword(data.email);
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
      <Input
        type="email"
        placeholder="Email"
        {...register("email", { required: "Email is required" })}
        aria-invalid={!!errors.email}
        autoFocus
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {message && <div className="text-green-600 text-sm">{message}</div>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
