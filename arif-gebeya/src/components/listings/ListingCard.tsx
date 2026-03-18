"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Listing, formatPrice, timeAgo, getCategoryBySlug } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const cat = getCategoryBySlug(listing.category_slug);
  const firstImage = listing.images?.[0];

  return (
    <Link href={`/listings/${listing.id}`} className="lc">
      {listing.is_featured && <div className="lc__featured-bar" />}
      <div className="lc__img-wrap">
        {firstImage ? (
          <Image src={firstImage} alt={listing.title} fill className="lc__img" sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
        ) : (
          <div className="lc__no-img">{cat?.emoji ?? "📦"}</div>
        )}
        <div className="lc__badge-wrap">
          {listing.condition === "new" && <span className="badge badge-green">New</span>}
          {listing.is_featured && <span className="badge badge-orange">Featured</span>}
        </div>
      </div>
      <div className="lc__body">
        <p className={`lc__price${listing.price_type === "free" ? " lc__price--free" : listing.price_type === "negotiable" ? " lc__price--neg" : ""}`}>
          {formatPrice(listing.price, listing.price_type, listing.currency)}
        </p>
        <p className="lc__title">{listing.title}</p>
        <div className="lc__meta">
          <span className="lc__loc"><MapPin size={10} /><span>{listing.city}</span></span>
          <span className="lc__time">{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
