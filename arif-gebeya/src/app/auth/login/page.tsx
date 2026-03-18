"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(redirectTo); router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="alert alert-error"><AlertCircle size={15} className="alert-icon" />{error}</div>}
      <div>
        <label className="field-label">Email address</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" className="field" autoComplete="email" />
      </div>
      <div>
        <label className="field-label">Password</label>
        <div className="pw-wrap">
          <input type={showPw ? "text" : "password"} required value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            className="field" autoComplete="current-password" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="pw-toggle">
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: ".25rem", height: "2.875rem" }}>
        {loading && <Loader2 size={16} className="animate-spin" />} Sign In
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-logo">🛒</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to your Arif Gebeya account</p>
          </div>
          <Suspense fallback={<div className="skeleton" style={{ height: "12rem" }} />}>
            <LoginForm />
          </Suspense>
          <p className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
