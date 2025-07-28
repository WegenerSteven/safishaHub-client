import { useState } from "react";
import { Button } from "./ui/button";
import { authService } from "../services/auth.service";

export default function VerifyEmailComponent({ token }: { token?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setMessage(null);
    setIsVerifying(true);
    try {
      if (!token) throw new Error("Verification token is missing");
      const res = await authService.verifyEmail(token);
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow text-center">
      <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {message ? (
        <div className="text-green-600 text-sm mb-2">{message}</div>
      ) : (
        <Button onClick={handleVerify} disabled={isVerifying || !token}>
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>
      )}
    </div>
  );
}
