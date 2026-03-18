"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/types";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", bio: "", avatar_url: "" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (p) setForm({ full_name: p.full_name ?? "", phone: p.phone ?? "", city: p.city ?? "", bio: p.bio ?? "", avatar_url: p.avatar_url ?? "" });
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true); setError(null);

    let avatar_url = form.avatar_url;
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("listing-images").upload(path, avatarFile, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        avatar_url = `${data.publicUrl}?t=${Date.now()}`;
      }
    }

    const { error: dbErr } = await supabase.from("profiles").upsert({
      user_id: userId, full_name: form.full_name, phone: form.phone || null,
      city: form.city || null, bio: form.bio || null,
      avatar_url: avatar_url || null, updated_at: new Date().toISOString(),
    });

    if (dbErr) setError(dbErr.message);
    else { setSuccess(true); setTimeout(() => setSuccess(false), 3500); }
    setSaving(false);
  };

  if (loading) return <div className="loader-center"><Loader2 size={24} className="animate-spin spin-icon" /></div>;

  const displayAvatar = avatarPreview ?? form.avatar_url;

  return (
    <div className="profile-page page-wrap">
      <div className="profile-box">
        <div className="page-header">
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-sub">Your profile is shown to buyers who view your listings.</p>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          {error   && <div className="alert alert-error"   style={{ marginBottom: "1.25rem" }}><AlertCircle size={15} className="alert-icon" />{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}><CheckCircle2 size={15} />Profile updated!</div>}

          <form onSubmit={handleSave} className="profile-form">
            {/* Avatar */}
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrap">
                {displayAvatar
                  ? <Image src={displayAvatar} alt="Avatar" width={80} height={80} unoptimized className="profile-avatar-img" />
                  : <div className="profile-avatar-fallback">{(form.full_name || "U")[0].toUpperCase()}</div>
                }
                <label className="profile-avatar-overlay">
                  <Camera size={20} style={{ color: "#fff" }} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: ".9375rem", marginBottom: ".25rem" }}>Profile Photo</p>
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                  <Camera size={13} /> Change Photo
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
                <p className="field-hint" style={{ marginTop: ".25rem" }}>JPG, PNG or WebP, max 2 MB</p>
              </div>
            </div>

            <div>
              <label className="field-label">Full Name *</label>
              <input type="text" required value={form.full_name} onChange={set("full_name")} className="field" />
            </div>
            <div className="form-row">
              <div>
                <label className="field-label">Phone</label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+251 911 000 000" className="field" />
              </div>
              <div>
                <label className="field-label">City</label>
                <select value={form.city} onChange={set("city")} className="field">
                  <option value="">Select city…</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Bio</label>
              <textarea value={form.bio} onChange={set("bio")}
                placeholder="Tell buyers about yourself…"
                className="field" maxLength={400} />
              <p className="field-hint">{form.bio.length}/400</p>
            </div>

            <div className="profile-form-btns">
              <button type="button" onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                {saving && <Loader2 size={16} className="animate-spin" />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
