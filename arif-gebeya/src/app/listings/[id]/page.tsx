import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCategoryBySlug, formatPrice, timeAgo } from "@/types";
import { ArrowLeft, MapPin, Clock, Eye, Shield, Phone, MessageCircle, Flag, CheckCircle2, Tag, Repeat2 } from "lucide-react";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ReportModal } from "@/components/listings/ReportModal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("listings").select("title,description").eq("id", id).single();
  return data ? { title: data.title, description: data.description.slice(0, 155) } : { title: "Listing Not Found" };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!listing) notFound();

  // increment view count
  await supabase.rpc("increment_view_count", { listing_id: id });

  const cat = getCategoryBySlug(listing.category_slug);
  const seller = listing.profiles;

  // More from same seller
  const { data: moreSeller } = await supabase
    .from("listings")
    .select("id,title,price,price_type,currency,images,city,created_at,category_slug")
    .eq("seller_id", listing.seller_id)
    .eq("is_active", true)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(4);

  // Similar listings
  const { data: similar } = await supabase
    .from("listings")
    .select("id,title,price,price_type,currency,images,city,created_at,category_slug,condition")
    .eq("category_slug", listing.category_slug)
    .eq("is_active", true)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(4);

  const waMsg = encodeURIComponent(`Hi! I'm interested in your listing: "${listing.title}" on Arif Gebeya`);
  const waLink = listing.contact_whatsapp
    ? `https://wa.me/${listing.contact_whatsapp.replace(/\D/g,"")}?text=${waMsg}`
    : listing.contact_phone
      ? `https://wa.me/${listing.contact_phone.replace(/\D/g,"")}?text=${waMsg}`
      : null;

  const conditionLabel = listing.condition === "new" ? "New" : listing.condition === "refurbished" ? "Refurbished" : "Used";

  return (
    <div className="detail-page page-wrap">
      {/* Back */}
      <Link href="/browse" className="detail-back">
        <ArrowLeft size={15} /> Back to listings
      </Link>

      <div className="grid-detail">
        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Image gallery */}
          <ImageGallery images={listing.images} title={listing.title} emoji={cat?.emoji} />

          {/* Title & price */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: ".75rem", alignItems: "center" }}>
              <span className="badge badge-gray">{cat?.emoji} {cat?.label}</span>
              <span className={`badge ${listing.condition === "new" ? "badge-green" : "badge-gray"}`}>{conditionLabel}</span>
              {listing.is_featured && <span className="badge badge-orange">⭐ Featured</span>}
              {seller?.is_verified && (
                <span className="badge badge-verified"><CheckCircle2 size={11} /> Verified</span>
              )}
            </div>

            <h1 className="detail-title">{listing.title}</h1>

            <p className={`detail-price${listing.price_type === "free" ? " detail-price--free" : ""}`}>
              {formatPrice(listing.price, listing.price_type, listing.currency)}
              {listing.price_type === "negotiable" && <span style={{ fontSize: ".875rem", fontWeight: 500, color: "var(--gray-500)", marginLeft: ".5rem" }}>(Negotiable)</span>}
            </p>

            <div className="detail-meta">
              <span className="detail-meta-item"><MapPin size={14} /> {listing.city}</span>
              <span className="detail-meta-item"><Clock size={14} /> {timeAgo(listing.created_at)}</span>
              <span className="detail-meta-item"><Eye size={14} /> {listing.view_count} views</span>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "2rem" }}>
            <p className="detail-desc-title">Description</p>
            <p className="detail-desc">{listing.description}</p>
          </div>

          {/* Details table */}
          <div className="card" style={{ padding: "1.25rem", marginBottom: "2rem" }}>
            <p className="detail-desc-title" style={{ marginBottom: "1rem" }}>Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".625rem 1.5rem" }}>
              {[
                { label: "Category",  value: `${cat?.emoji} ${cat?.label}` },
                { label: "Condition", value: conditionLabel },
                { label: "Location",  value: listing.city },
                { label: "Currency",  value: listing.currency },
                { label: "Posted",    value: new Date(listing.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                { label: "Ad ID",     value: listing.id.slice(0, 8).toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: ".75rem", color: "var(--gray-400)", marginBottom: ".125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
                  <p style={{ fontSize: ".9375rem", color: "var(--gray-800)", fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile contact bar */}
          <div className="contact-bar">
            {listing.contact_phone && (
              <a href={`tel:${listing.contact_phone}`} className="btn btn-secondary btn-full">
                <Phone size={16} /> {listing.contact_phone}
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-full">
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
          </div>

          {/* Report */}
          <ReportModal listingId={listing.id} />

          {/* Similar */}
          {similar && similar.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <p className="section-title" style={{ fontSize: "1rem" }}><Repeat2 size={16} style={{ display: "inline", marginRight: ".375rem" }} />Similar Ads</p>
                <Link href={`/browse?category=${listing.category_slug}`} style={{ fontSize: ".8125rem", color: "var(--green-600)", fontWeight: 600 }}>See more</Link>
              </div>
              <div className="grid-listings">
                {similar.map(s => {
                  const sc = getCategoryBySlug(s.category_slug);
                  return (
                    <Link key={s.id} href={`/listings/${s.id}`} className="lc card-hover" style={{ fontSize: ".875rem" }}>
                      <div className="lc__img-wrap">
                        {s.images?.[0] ? (
                          <Image src={s.images[0]} alt={s.title} fill className="lc__img" sizes="25vw" />
                        ) : (
                          <div className="lc__no-img">{sc?.emoji ?? "📦"}</div>
                        )}
                      </div>
                      <div className="lc__body">
                        <p className="lc__price">{formatPrice(s.price, s.price_type, s.currency)}</p>
                        <p className="lc__title">{s.title}</p>
                        <div className="lc__meta">
                          <span className="lc__loc"><MapPin size={10} /><span>{s.city}</span></span>
                          <span className="lc__time">{timeAgo(s.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Contact card */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--gray-500)", marginBottom: "1rem" }}>Contact Seller</p>

            {/* Seller info */}
            {seller && (
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                <div className="seller-avatar">
                  {seller.avatar_url
                    ? <Image src={seller.avatar_url} alt={seller.full_name} width={52} height={52} style={{ borderRadius: "50%", objectFit: "cover" }} />
                    : (seller.full_name || "S")[0].toUpperCase()
                  }
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".375rem" }}>
                    <p className="seller-name">{seller.full_name}</p>
                    {seller.is_verified && <CheckCircle2 size={14} style={{ color: "var(--green-600)" }} />}
                  </div>
                  <p className="seller-since">Member since {new Date(seller.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                </div>
              </div>
            )}

            <div className="seller-actions">
              {listing.contact_phone && (
                <a href={`tel:${listing.contact_phone}`} className="btn btn-secondary btn-full">
                  <Phone size={16} /> {listing.contact_phone}
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa btn-full">
                  <MessageCircle size={16} /> Chat on WhatsApp
                </a>
              )}
              {!listing.contact_phone && !waLink && (
                <p style={{ fontSize: ".875rem", color: "var(--gray-400)", textAlign: "center", padding: ".5rem" }}>No contact info provided</p>
              )}
            </div>

            {seller && (
              <Link href={`/seller/${listing.seller_id}`} style={{ display: "block", textAlign: "center", fontSize: ".8125rem", color: "var(--green-600)", fontWeight: 600, marginTop: ".875rem" }}>
                View all ads from this seller →
              </Link>
            )}
          </div>

          {/* Safety tip */}
          <div className="card" style={{ padding: "1.25rem", background: "var(--blue-50)", borderColor: "var(--blue-100)" }}>
            <div style={{ display: "flex", gap: ".625rem" }}>
              <Shield size={18} style={{ color: "var(--blue-600)", flexShrink: 0, marginTop: "1px" }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--blue-700)", marginBottom: ".375rem" }}>Safety Tips</p>
                <ul style={{ fontSize: ".8125rem", color: "var(--blue-600)", lineHeight: 1.7, paddingLeft: "1rem" }}>
                  <li>Meet in a public place</li>
                  <li>Never pay in advance</li>
                  <li>Check item before paying</li>
                  <li>Verify seller identity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* More from seller */}
          {moreSeller && moreSeller.length > 0 && (
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: ".875rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--gray-800)" }}>
                  <Tag size={13} style={{ display: "inline", marginRight: ".375rem" }} />
                  More from this seller
                </p>
              </div>
              <div>
                {moreSeller.map(s => {
                  const sc = getCategoryBySlug(s.category_slug);
                  return (
                    <Link key={s.id} href={`/listings/${s.id}`}
                      style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".75rem 1.25rem", borderBottom: "1px solid var(--border-light)", transition: "background .15s" }}
                      className="card-hover">
                      <div style={{ width: "3.25rem", height: "2.75rem", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--gray-100)", flexShrink: 0 }}>
                        {s.images?.[0]
                          ? <Image src={s.images[0]} alt={s.title} width={52} height={44} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>{sc?.emoji}</div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: ".8125rem", fontWeight: 500, color: "var(--gray-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                        <p style={{ fontSize: ".8125rem", fontWeight: 700, color: "var(--gray-900)" }}>{formatPrice(s.price, s.price_type, s.currency)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
