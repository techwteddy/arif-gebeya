import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { BrowseFilters } from "@/components/listings/BrowseFilters";
import { CATEGORIES, CITIES } from "@/types";
import { SlidersHorizontal } from "lucide-react";

interface BrowseProps {
  searchParams: Promise<{ q?: string; category?: string; city?: string; min?: string; max?: string; condition?: string; sort?: string }>;
}

async function Results({ q, category, city, min, max, condition, sort }: {
  q?: string; category?: string; city?: string; min?: string; max?: string; condition?: string; sort?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*, profiles(*)")
    .eq("is_active", true);

  if (q)         query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (category)  query = query.eq("category_slug", category);
  if (city)      query = query.eq("city", city);
  if (condition) query = query.eq("condition", condition);
  if (min)       query = query.gte("price", parseFloat(min));
  if (max)       query = query.lte("price", parseFloat(max));

  if (sort === "price_asc")  query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query.limit(48);

  if (error) return <p style={{ color: "var(--red-600)", fontSize: ".875rem" }}>Error loading listings.</p>;

  if (!data?.length) return (
    <div className="empty-state">
      <div className="empty-state__icon"><span style={{ fontSize: "3rem" }}>🔍</span></div>
      <p className="empty-state__title">No listings found</p>
      <p className="empty-state__sub">Try different keywords, category, or location</p>
    </div>
  );

  return (
    <>
      <div className="sort-bar">
        <p className="sort-bar__count"><strong>{data.length}</strong> listing{data.length !== 1 ? "s" : ""} found</p>
      </div>
      <div className="grid-listings">
        {data.map(l => <ListingCard key={l.id} listing={l} />)}
      </div>
    </>
  );
}

export default async function BrowsePage({ searchParams }: BrowseProps) {
  const sp = await searchParams;
  const { q, category, city, min, max, condition, sort } = sp;
  const activeCat = CATEGORIES.find(c => c.slug === category);

  return (
    <div style={{ padding: "1.5rem 0 3rem", minHeight: "80vh" }}>
      <div className="page-wrap">
        {/* Page header */}
        <div className="page-header">
          <h1 className="page-title">
            {activeCat ? `${activeCat.emoji} ${activeCat.label}` : q ? `Results for "${q}"` : "Browse All Ads"}
          </h1>
          {(q || category || city) && (
            <p className="page-sub">
              {[q && `"${q}"`, activeCat?.label, city].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: ".5rem", overflowX: "auto", paddingBottom: ".5rem", marginBottom: "1.5rem" }}>
          <a href="/browse"
            className={`cat-pill${!category ? " cat-pill--active" : ""}`}
            style={{ flexShrink: 0, flexDirection: "row", gap: ".375rem", padding: ".5rem .875rem" }}>
            <span style={{ fontSize: "1rem" }}>🏠</span>
            <span className="cat-pill__label" style={{ fontSize: ".8125rem" }}>All</span>
          </a>
          {CATEGORIES.map(c => {
            const params = new URLSearchParams(sp as Record<string,string>);
            params.set("category", c.slug);
            params.delete("q");
            return (
              <a key={c.slug} href={`/browse?${params.toString()}`}
                className={`cat-pill${category === c.slug ? " cat-pill--active" : ""}`}
                style={{ flexShrink: 0, flexDirection: "row", gap: ".375rem", padding: ".5rem .875rem" }}>
                <span style={{ fontSize: "1rem" }}>{c.emoji}</span>
                <span className="cat-pill__label" style={{ fontSize: ".8125rem" }}>{c.label}</span>
              </a>
            );
          })}
        </div>

        <div className="browse-layout">
          {/* Sidebar */}
          <aside>
            <BrowseFilters
              cities={CITIES}
              currentFilters={{ q, category, city, min, max, condition, sort }}
            />
          </aside>

          {/* Results */}
          <div>
            <Suspense fallback={
              <div className="grid-listings">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: "16rem" }} />)}
              </div>
            }>
              <Results q={q} category={category} city={city} min={min} max={max} condition={condition} sort={sort} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
