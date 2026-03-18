"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/types";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", city: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").upsert({
        user_id: data.user.id,
        full_name: form.full_name,
        city: form.city || null,
        phone: form.phone || null,
      });
    }
    setDone(true); setLoading(false);
  };

  if (done) return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-card card" style={{ textAlign: "center" }}>
          <CheckCircle2 size={48} style={{ color: "var(--green-600)", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--gray-900)", marginBottom: ".5rem" }}>Check your email</h2>
          <p style={{ fontSize: ".9375rem", color: "var(--gray-500)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            We sent a confirmation link to <strong style={{ color: "var(--gray-800)" }}>{form.email}</strong>
          </p>
          <Link href="/auth/login" className="btn btn-primary btn-full">Go to Sign In</Link>
          <p style={{ fontSize: ".8125rem", color: "var(--gray-400)", marginTop: ".875rem" }}>
            Didn&apos;t receive it? Check spam or{" "}
            <button onClick={() => setDone(false)} style={{ color: "var(--green-600)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>try again</button>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-logo">🛒</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-sub">Free. No fees. Buy & sell anything.</p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}><AlertCircle size={15} className="alert-icon" />{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="field-label">Full Name *</label>
              <input type="text" required value={form.full_name} onChange={set("full_name")} placeholder="Abebe Kebede" className="field" />
            </div>
            <div>
              <label className="field-label">Email *</label>
              <input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" className="field" />
            </div>
            <div className="form-row">
              <div>
                <label className="field-label">Phone <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+251 911 000 000" className="field" />
              </div>
              <div>
                <label className="field-label">City <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
                <select value={form.city} onChange={set("city")} className="field">
                  <option value="">Select city…</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Password *</label>
              <div className="pw-wrap">
                <input type={showPw ? "text" : "password"} required minLength={8}
                  value={form.password} onChange={set("password")} placeholder="Min. 8 characters" className="field" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="pw-toggle">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: ".25rem", height: "2.875rem" }}>
              {loading && <Loader2 size={16} className="animate-spin" />} Create Free Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
