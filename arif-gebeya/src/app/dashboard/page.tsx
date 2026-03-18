import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { DashActions } from "@/components/listings/DashActions";
import { getCategoryBySlug, formatPrice, timeAgo } from "@/types";
import { Plus, Eye, Package, TrendingUp, Settings } from "lucide-react";

export const metadata = { title: "My Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/dashboard");

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
  ]);

  const active  = (listings ?? []).filter(l => l.is_active).length;
  const total   = listings?.length ?? 0;
  const views   = (listings ?? []).reduce((s, l) => s + (l.view_count ?? 0), 0);

  return (
    <div className="dash-page page-wrap">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-sub">Welcome back, <strong>{profile?.full_name || user.email}</strong></p>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <Link href="/profile" className="btn btn-secondary btn-sm"><Settings size={14} /> Profile</Link>
          <Link href="/listings/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Ad</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: "2rem" }}>
        {[
          { label: "Total Ads",    value: total,  icon: Package,    cls: "green" },
          { label: "Active",       value: active, icon: TrendingUp, cls: "orange" },
          { label: "Total Views",  value: views,  icon: Eye,        cls: "blue" },
          { label: "Paused",       value: total - active, icon: Package, cls: "gray" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="dash-stat card">
            <div className="dash-stat__label">
              {label}
              <div className={`dash-stat__icon dash-stat__icon--${cls}`}><Icon size={14} /></div>
            </div>
            <p className="dash-stat__value">{value}</p>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 className="section-title">My Listings</h2>
          <Link href="/listings/new" className="btn btn-ghost btn-sm" style={{ color: "var(--green-700)" }}>
            <Plus size={14} /> Add New
          </Link>
        </div>

        {!listings?.length ? (
          <div className="empty-state card">
            <div className="empty-state__icon"><Package size={40} /></div>
            <p className="empty-state__title">No ads yet</p>
            <p className="empty-state__sub">Post your first free ad and start selling today</p>
            <Link href="/listings/new" className="btn btn-primary"><Plus size={16} />Post Free Ad</Link>
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            {listings.map((listing, idx) => {
              const cat = getCategoryBySlug(listing.category_slug);
              return (
                <div key={listing.id} className="dash-listing-card"
                  style={{ borderBottom: idx < listings.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                  {/* Thumbnail */}
                  <div className="dash-listing-thumb">
                    {listing.images?.[0] ? (
                      <Image src={listing.images[0]} alt={listing.title} width={80} height={64}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div className="dash-listing-thumb-empty">{cat?.emoji ?? "📦"}</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="dash-listing-info">
                    <p className="dash-listing-title">{listing.title}</p>
                    <div className="dash-listing-meta">
                      <span className="dash-listing-price">{formatPrice(listing.price, listing.price_type, listing.currency)}</span>
                      <span>{listing.city}</span>
                      <span>{timeAgo(listing.created_at)}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: ".25rem" }}>
                        <Eye size={12} /> {listing.view_count}
                      </span>
                      <span className={`badge ${listing.is_active ? "badge-green" : "badge-gray"}`}>
                        {listing.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="dash-listing-actions">
                    <DashActions listingId={listing.id} isActive={listing.is_active} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
