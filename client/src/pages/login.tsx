import React, { useState } from "react";
import { signIn } from "aws-amplify/auth";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await signIn({ username, password });
      console.log("Login success:", user);
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.name === "UserAlreadyAuthenticatedException") {
        setError(err.message || "Hi");
        // navigate("/"); // already logged in → just redirect
      } else {
        setError(err.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-80 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Log In</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* 👇 Sign up link */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup">
            <span className="text-blue-600 hover:underline cursor-pointer">
              Sign up here
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
}
