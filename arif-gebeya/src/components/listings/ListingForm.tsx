"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES, CONDITIONS, type Listing } from "@/types";
import { Loader2, AlertCircle, Upload, X, ImagePlus } from "lucide-react";

interface Props { userId: string; listing?: Listing; }

const MAX_IMAGES = 8;

export function ListingForm({ userId, listing }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!listing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title:       listing?.title ?? "",
    description: listing?.description ?? "",
    price:       listing?.price?.toString() ?? "",
    price_type:  listing?.price_type ?? "fixed",
    currency:    listing?.currency ?? "ETB",
    category_slug: listing?.category_slug ?? "",
    city:        listing?.city ?? "",
    condition:   listing?.condition ?? "used",
    contact_phone:     listing?.contact_phone ?? "",
    contact_whatsapp:  listing?.contact_whatsapp ?? "",
  });

  const [existingImages, setExistingImages] = useState<string[]>(listing?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const total = existingImages.length + newFiles.length + files.length;
    if (total > MAX_IMAGES) { setError(`Max ${MAX_IMAGES} images allowed.`); return; }
    const arr = Array.from(files);
    setNewFiles(p => [...p, ...arr]);
    arr.forEach(f => {
      const r = new FileReader();
      r.onload = e => setNewPreviews(p => [...p, e.target?.result as string]);
      r.readAsDataURL(f);
    });
  };

  const removeExisting = (url: string) => setExistingImages(p => p.filter(u => u !== url));
  const removeNew = (idx: number) => {
    setNewFiles(p => p.filter((_, i) => i !== idx));
    setNewPreviews(p => p.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of newFiles) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
      if (upErr) throw new Error(upErr.message);
      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.category_slug) { setError("Please select a category."); return; }
    if (!form.city) { setError("Please select a location."); return; }
    if (form.price_type !== "free" && form.price_type !== "negotiable" && !form.price) {
      setError("Please enter a price or select Negotiable / Free."); return;
    }

    setLoading(true);
    setUploading(true);

    let newUrls: string[] = [];
    try { newUrls = await uploadImages(); } catch (err: any) { setError(err.message); setLoading(false); setUploading(false); return; }
    setUploading(false);

    const allImages = [...existingImages, ...newUrls];

    const payload = {
      seller_id:   userId,
      title:       form.title.trim(),
      description: form.description.trim(),
      price:       form.price_type === "free" || form.price_type === "negotiable" ? null : parseFloat(form.price) || 0,
      price_type:  form.price_type,
      currency:    form.currency,
      category_slug: form.category_slug,
      city:        form.city,
      condition:   form.condition,
      images:      allImages,
      contact_phone:    form.contact_phone.trim() || null,
      contact_whatsapp: form.contact_whatsapp.trim() || null,
      is_active:   true,
    };

    const { error: dbErr } = isEdit
      ? await supabase.from("listings").update(payload).eq("id", listing.id).eq("seller_id", userId)
      : await supabase.from("listings").insert(payload);

    if (dbErr) { setError(dbErr.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <form onSubmit={handleSubmit} className="form-section" style={{ gap: "2rem" }}>
      {error && <div className="alert alert-error"><AlertCircle size={16} className="alert-icon" />{error}</div>}

      {/* ─ Photos ─ */}
      <div>
        <p className="form-section-title">Photos</p>
        <p className="field-hint" style={{ marginBottom: ".875rem" }}>Add up to {MAX_IMAGES} photos. First photo is the cover image.</p>
        <div className="img-upload-grid">
          {existingImages.map(url => (
            <div key={url} className="img-thumb">
              <Image src={url} alt="listing" width={120} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" className="img-thumb__remove" onClick={() => removeExisting(url)}><X size={11} /></button>
              {url === existingImages[0] && newFiles.length === 0 && <span className="img-thumb__main-tag">Cover</span>}
            </div>
          ))}
          {newPreviews.map((src, i) => (
            <div key={i} className="img-thumb">
              <Image src={src} alt="preview" width={120} height={120} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" className="img-thumb__remove" onClick={() => removeNew(i)}><X size={11} /></button>
              {i === 0 && existingImages.length === 0 && <span className="img-thumb__main-tag">Cover</span>}
            </div>
          ))}
          {totalImages < MAX_IMAGES && (
            <div className="img-upload-zone" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={20} />
              <span className="img-upload-zone__text">Add photo</span>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                onChange={e => handleFiles(e.target.files)} />
            </div>
          )}
        </div>
      </div>

      {/* ─ Basic info ─ */}
      <div>
        <p className="form-section-title">Ad Details</p>
        <div className="form-section" style={{ gap: "1.25rem" }}>
          <div>
            <label className="field-label">Title *</label>
            <input type="text" required value={form.title} onChange={set("title")}
              placeholder="e.g. iPhone 14 Pro Max 256GB" className="field" maxLength={120} />
            <p className="field-hint">Be specific — good titles get more views</p>
          </div>

          <div className="form-row">
            <div>
              <label className="field-label">Category *</label>
              <select required value={form.category_slug} onChange={set("category_slug")} className="field">
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Condition</label>
              <select value={form.condition} onChange={set("condition")} className="field">
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Description *</label>
            <textarea required value={form.description} onChange={set("description")}
              placeholder="Describe your item — condition, features, reason for selling…"
              className="field" style={{ minHeight: "140px" }} maxLength={2000} />
            <p className="field-hint">{form.description.length}/2000</p>
          </div>
        </div>
      </div>

      {/* ─ Price ─ */}
      <div>
        <p className="form-section-title">Price</p>
        <div className="form-section" style={{ gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 110px", gap: ".75rem", alignItems: "start" }}>
            <div>
              <label className="field-label">Amount</label>
              <input type="number" min="0" step="any" value={form.price} onChange={set("price")}
                placeholder="0" className="field"
                disabled={form.price_type === "free" || form.price_type === "negotiable"} />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select value={form.price_type} onChange={set("price_type")} className="field">
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
                <option value="free">Free</option>
              </select>
            </div>
            <div>
              <label className="field-label">Currency</label>
              <select value={form.currency} onChange={set("currency")} className="field">
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─ Location ─ */}
      <div>
        <p className="form-section-title">Location</p>
        <div>
          <label className="field-label">City *</label>
          <select required value={form.city} onChange={set("city")} className="field">
            <option value="">Select city…</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ─ Contact ─ */}
      <div>
        <p className="form-section-title">Contact Information</p>
        <p className="field-hint" style={{ marginBottom: ".875rem" }}>Provide at least one way for buyers to reach you</p>
        <div className="form-row">
          <div>
            <label className="field-label">Phone Number</label>
            <input type="tel" value={form.contact_phone} onChange={set("contact_phone")}
              placeholder="+251 911 000 000" className="field" />
          </div>
          <div>
            <label className="field-label">WhatsApp Number</label>
            <input type="tel" value={form.contact_whatsapp} onChange={set("contact_whatsapp")}
              placeholder="+251 911 000 000" className="field" />
            <p className="field-hint">Leave blank if same as phone</p>
          </div>
        </div>
      </div>

      {/* ─ Submit ─ */}
      <div style={{ display: "flex", gap: ".75rem", paddingTop: ".5rem" }}>
        <button type="button" onClick={() => router.back()} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {uploading ? "Uploading photos…" : isEdit ? "Save Changes" : "Post Ad — It's Free!"}
        </button>
      </div>
    </form>
  );
}
