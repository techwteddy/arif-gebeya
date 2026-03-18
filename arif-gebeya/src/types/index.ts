export type PriceType = "fixed" | "negotiable" | "free";
export type Currency = "ETB" | "USD";
export type Condition = "new" | "used" | "refurbished";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  phone_verified: boolean;
  city?: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  slug: string;
  label: string;
  emoji: string;
  sort_order: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price?: number;
  price_type: PriceType;
  currency: Currency;
  category_slug: string;
  city: string;
  condition: Condition;
  images: string[];
  contact_phone?: string;
  contact_whatsapp?: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // joined
  profiles?: Profile;
  category?: Category;
}

export const CATEGORIES: Category[] = [
  { id: 1, slug: "phones",      label: "Phones & Tablets",   emoji: "📱", sort_order: 1 },
  { id: 2, slug: "electronics", label: "Electronics",        emoji: "💻", sort_order: 2 },
  { id: 3, slug: "cars",        label: "Cars & Vehicles",    emoji: "🚗", sort_order: 3 },
  { id: 4, slug: "fashion",     label: "Fashion",            emoji: "👗", sort_order: 4 },
  { id: 5, slug: "property",    label: "Property & Rentals", emoji: "🏠", sort_order: 5 },
  { id: 6, slug: "furniture",   label: "Furniture & Home",   emoji: "🛋️", sort_order: 6 },
  { id: 7, slug: "jobs",        label: "Jobs",               emoji: "💼", sort_order: 7 },
  { id: 8, slug: "other",       label: "Other",              emoji: "📦", sort_order: 8 },
];

export const CITIES = [
  "Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Adama",
  "Hawassa", "Bahir Dar", "Jimma", "Dessie", "Jijiga",
  "Washington DC", "Minneapolis", "Atlanta", "Seattle",
  "Dallas", "Los Angeles", "New York", "Columbus", "Houston", "Denver",
];

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "new",         label: "New" },
  { value: "used",        label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function formatPrice(price?: number, type?: PriceType, currency?: Currency): string {
  if (type === "free") return "Free";
  if (type === "negotiable" || !price) return "Negotiable";
  const symbol = currency === "USD" ? "$" : "ETB ";
  const formatted = price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return currency === "USD" ? `${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
