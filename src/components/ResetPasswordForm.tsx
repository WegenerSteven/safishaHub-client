import { useForm } from 'react-hook-form';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { authService } from "../services/auth.service";

interface ResetPasswordFormInputs {
  token: string;
  newPassword: string;
}

export default function ResetPasswordForm({ token }: { token?: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormInputs>({
    defaultValues: { token: token || "" }
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    setError(null);
    setMessage(null);
    try {
      const res = await authService.resetPassword(data.token, data.newPassword);
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
      <Input
        type="text"
        placeholder="Token"
        {...register("token", { required: "Token is required" })}
        aria-invalid={!!errors.token}
      />
      <Input
        type="password"
        placeholder="New Password"
        {...register("newPassword", { required: "New password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
        aria-invalid={!!errors.newPassword}
      />
      {errors.token && <div className="text-red-500 text-sm">{errors.token.message}</div>}
      {errors.newPassword && <div className="text-red-500 text-sm">{errors.newPassword.message}</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {message && <div className="text-green-600 text-sm">{message}</div>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
