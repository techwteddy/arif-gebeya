import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { MapPin, Phone, CheckCircle2, Calendar, Package } from "lucide-react";

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", id).single(),
    supabase.from("listings").select("*, profiles(*)")
      .eq("seller_id", id).eq("is_active", true).order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  return (
    <div style={{ minHeight: "80vh" }}>
      {/* Seller header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "2rem 0" }}>
        <div className="page-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div className="seller-avatar" style={{ width: "4.5rem", height: "4.5rem", fontSize: "1.75rem" }}>
              {profile.avatar_url
                ? <Image src={profile.avatar_url} alt={profile.full_name} width={72} height={72} style={{ borderRadius: "50%", objectFit: "cover" }} />
                : (profile.full_name || "S")[0].toUpperCase()
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap", marginBottom: ".375rem" }}>
                <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--gray-900)" }}>{profile.full_name}</h1>
                {profile.is_verified && <span className="badge badge-verified"><CheckCircle2 size={11} />Verified</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem 1rem", fontSize: ".875rem", color: "var(--gray-500)" }}>
                {profile.city && <span style={{ display: "flex", alignItems: "center", gap: ".25rem" }}><MapPin size={13} />{profile.city}</span>}
                {profile.phone && <span style={{ display: "flex", alignItems: "center", gap: ".25rem" }}><Phone size={13} />{profile.phone}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: ".25rem" }}>
                  <Calendar size={13} />Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
              {profile.bio && <p style={{ marginTop: ".625rem", fontSize: ".9375rem", color: "var(--gray-600)", lineHeight: 1.6, maxWidth: "40rem" }}>{profile.bio}</p>}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gray-900)", lineHeight: 1 }}>{listings?.length ?? 0}</p>
              <p style={{ fontSize: ".75rem", color: "var(--gray-500)", marginTop: ".25rem" }}>Active Ads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding: "2rem 0" }}>
        <div className="page-wrap">
          <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>
            Ads by {profile.full_name.split(" ")[0]}
          </h2>
          {!listings?.length ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Package size={40} /></div>
              <p className="empty-state__title">No active listings</p>
            </div>
          ) : (
            <div className="grid-listings">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
