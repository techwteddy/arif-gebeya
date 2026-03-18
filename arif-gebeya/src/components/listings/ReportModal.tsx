"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flag, X, AlertCircle } from "lucide-react";

const REASONS = [
  "Spam or scam",
  "Fake or misleading listing",
  "Prohibited item",
  "Duplicate listing",
  "Wrong category",
  "Other",
];

export function ReportModal({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) { setError("Please select a reason."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dbErr } = await supabase.from("reports").insert({
      listing_id: listingId,
      reporter_id: user?.id ?? null,
      reason,
    });
    if (dbErr) { setError(dbErr.message); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="report-link">
        <Flag size={13} /> Report this listing
      </button>

      {open && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="modal">
            <div className="modal__header">
              <span className="modal__title">Report Listing</span>
              <button className="modal__close btn-icon btn-ghost" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal__body">
              {done ? (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>✅</div>
                  <p style={{ fontWeight: 700, color: "var(--gray-900)", marginBottom: ".375rem" }}>Report submitted</p>
                  <p style={{ fontSize: ".875rem", color: "var(--gray-500)" }}>Thank you. We'll review this listing.</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: ".875rem", color: "var(--gray-600)" }}>Why are you reporting this listing?</p>
                  {error && <div className="alert alert-error"><AlertCircle size={15} className="alert-icon" />{error}</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: ".375rem" }}>
                    {REASONS.map(r => (
                      <label key={r} style={{ display: "flex", alignItems: "center", gap: ".625rem", padding: ".625rem .875rem", borderRadius: "var(--r-lg)", border: `1.5px solid ${reason === r ? "var(--green-400)" : "var(--border)"}`, background: reason === r ? "var(--green-50)" : "#fff", cursor: "pointer", transition: "all .15s" }}>
                        <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: "var(--green-600)" }} />
                        <span style={{ fontSize: ".875rem", color: "var(--gray-700)", fontWeight: reason === r ? 600 : 400 }}>{r}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            {!done && (
              <div className="modal__footer">
                <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
