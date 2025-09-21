import React, { useState } from "react";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { useLocation } from "wouter";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<"signup" | "confirm">("signup");

  const [, setLocation] = useLocation(); 

  // Step 1: Sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            nickname: username,
          },
        },
      });
      setStep("confirm");
      setSuccess("✅ Sign-up successful! Please enter the verification code sent to your email.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 2: Confirm verification code
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await confirmSignUp({
        username,
        confirmationCode: code,
      });

      // ✅ Redirect to login page after successful confirmation
      setLocation("/login");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {step === "signup" && (
        <form
          onSubmit={handleSignUp}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Sign Up
          </button>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        </form>
      )}

      {step === "confirm" && (
        <form
          onSubmit={handleConfirm}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Confirm Sign Up</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
            required
          />

          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mb-4 w-full px-3 py-2 border rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Confirm
          </button>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        </form>
      )}
    </div>
  );
}