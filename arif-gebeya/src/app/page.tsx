import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { CATEGORIES, CITIES } from "@/types";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";
import { HomeSearch } from "@/components/listings/HomeSearch";

async function RecentListings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!data?.length) return (
    <div className="empty-state">
      <p className="empty-state__title">No listings yet</p>
      <p className="empty-state__sub">Be the first to post an ad!</p>
      <Link href="/listings/new" className="btn btn-primary">Post Free Ad</Link>
    </div>
  );

  return (
    <div className="grid-listings">
      {data.map(l => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}

async function FeaturedListings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (!data?.length) return null;

  return (
    <section style={{ padding: "2rem 0", background: "var(--orange-50)", borderBottom: "1px solid var(--orange-100)" }}>
      <div className="page-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 className="section-title">⭐ Featured Ads</h2>
          <Link href="/browse?featured=true" className="btn btn-ghost btn-sm" style={{ color: "var(--orange-600)" }}>See all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid-listings">
          {data.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero__bg-pattern" />
        <div className="hero__content page-wrap">
          <h1 className="hero__title">Buy & Sell in Ethiopia 🇪🇹</h1>
          <p className="hero__sub">The free classifieds marketplace for Ethiopia and the diaspora</p>

          <Suspense fallback={<div className="skeleton" style={{ height: "4rem", borderRadius: "var(--r-xl)" }} />}>
            <HomeSearch cities={CITIES} categories={CATEGORIES} />
          </Suspense>

          <div className="hero__stats">
            <div>
              <p className="hero__stat-num">Free</p>
              <p className="hero__stat-label">to post ads</p>
            </div>
            <div>
              <p className="hero__stat-num">8</p>
              <p className="hero__stat-label">categories</p>
            </div>
            <div>
              <p className="hero__stat-num">20+</p>
              <p className="hero__stat-label">cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "1.5rem 0" }}>
        <div className="page-wrap">
          <div className="grid-cats">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/browse?category=${cat.slug}`} className="cat-pill">
                <span className="cat-pill__emoji">{cat.emoji}</span>
                <span className="cat-pill__label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured ─── */}
      <Suspense fallback={null}>
        <FeaturedListings />
      </Suspense>

      {/* ─── Recent listings ─── */}
      <section style={{ padding: "2rem 0" }}>
        <div className="page-wrap">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 className="section-title">Latest Ads</h2>
            <Link href="/browse" className="btn btn-ghost btn-sm" style={{ color: "var(--green-700)" }}>
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <Suspense fallback={
            <div className="grid-listings">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: "16rem" }} />)}
            </div>
          }>
            <RecentListings />
          </Suspense>
        </div>
      </section>

      {/* ─── Trust strip ─── */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "2.5rem 0" }}>
        <div className="page-wrap">
          <div className="grid-3">
            {[
              { icon: <Zap size={22} />, color: "var(--green-600)", bg: "var(--green-100)", title: "Post in 2 minutes", desc: "Free to post. No fees, no commissions — ever." },
              { icon: <Shield size={22} />, color: "var(--blue-600)", bg: "var(--blue-100)", title: "Verified Sellers", desc: "Phone-verified badges help you identify trusted sellers." },
              { icon: <Users size={22} />, color: "var(--orange-600)", bg: "var(--orange-100)", title: "Direct Contact", desc: "Message sellers directly via phone or WhatsApp." },
            ].map(({ icon, color, bg, title, desc }) => (
              <div key={title} className="card" style={{ padding: "1.5rem", display: "flex", gap: "1rem" }}>
                <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "var(--r-lg)", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, marginBottom: ".375rem", color: "var(--gray-900)" }}>{title}</p>
                  <p style={{ fontSize: ".875rem", color: "var(--gray-500)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: "var(--gray-900)", padding: "3rem 0", textAlign: "center" }}>
        <div className="page-wrap">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,4vw,2.25rem)", color: "#fff", fontWeight: 800, marginBottom: ".75rem" }}>
            Have something to sell?
          </h2>
          <p style={{ color: "var(--gray-400)", marginBottom: "1.75rem", fontSize: "1.0625rem" }}>
            Post your first ad for free in under 2 minutes
          </p>
          <Link href="/listings/new" className="btn btn-primary btn-lg">
            Post Free Ad <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
