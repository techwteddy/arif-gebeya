"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  q?: string; category?: string; city?: string;
  min?: string; max?: string; condition?: string; sort?: string;
}

export function BrowseFilters({ cities, currentFilters }: { cities: string[]; currentFilters: Filters }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(currentFilters.min ?? "");
  const [max, setMax] = useState(currentFilters.max ?? "");
  const [city, setCity] = useState(currentFilters.city ?? "");
  const [condition, setCondition] = useState(currentFilters.condition ?? "");
  const [sort, setSort] = useState(currentFilters.sort ?? "newest");

  const activeCount = [currentFilters.city, currentFilters.min, currentFilters.max, currentFilters.condition].filter(Boolean).length;

  const apply = () => {
    const p = new URLSearchParams();
    if (currentFilters.q)        p.set("q", currentFilters.q);
    if (currentFilters.category) p.set("category", currentFilters.category);
    if (city)      p.set("city", city);
    if (min)       p.set("min", min);
    if (max)       p.set("max", max);
    if (condition) p.set("condition", condition);
    if (sort && sort !== "newest") p.set("sort", sort);
    router.push(`/browse?${p.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setMin(""); setMax(""); setCity(""); setCondition(""); setSort("newest");
    const p = new URLSearchParams();
    if (currentFilters.q)        p.set("q", currentFilters.q);
    if (currentFilters.category) p.set("category", currentFilters.category);
    router.push(`/browse?${p.toString()}`);
  };

  const filterBody = (
    <div className="filter-panel__body">
      {/* Sort */}
      <div>
        <p className="filter-section__label">Sort by</p>
        {[
          { value: "newest", label: "Newest first" },
          { value: "oldest", label: "Oldest first" },
          { value: "price_asc", label: "Price: low to high" },
          { value: "price_desc", label: "Price: high to low" },
        ].map(o => (
          <label key={o.value} className="filter-radio">
            <input type="radio" name="sort" value={o.value} checked={sort === o.value} onChange={() => setSort(o.value)} />
            <span className="filter-radio__label">{o.label}</span>
          </label>
        ))}
      </div>

      <hr className="divider" />

      {/* Condition */}
      <div>
        <p className="filter-section__label">Condition</p>
        {[
          { value: "", label: "Any" },
          { value: "new", label: "New" },
          { value: "used", label: "Used" },
          { value: "refurbished", label: "Refurbished" },
        ].map(o => (
          <label key={o.value} className="filter-radio">
            <input type="radio" name="condition" value={o.value} checked={condition === o.value} onChange={() => setCondition(o.value)} />
            <span className="filter-radio__label">{o.label}</span>
          </label>
        ))}
      </div>

      <hr className="divider" />

      {/* Price */}
      <div>
        <p className="filter-section__label">Price (ETB)</p>
        <div className="filter-price">
          <input className="field" type="number" min="0" placeholder="Min" value={min} onChange={e => setMin(e.target.value)} />
          <span className="filter-price-sep">–</span>
          <input className="field" type="number" min="0" placeholder="Max" value={max} onChange={e => setMax(e.target.value)} />
        </div>
      </div>

      <hr className="divider" />

      {/* City */}
      <div>
        <p className="filter-section__label">Location</p>
        <select className="field" value={city} onChange={e => setCity(e.target.value)}>
          <option value="">All locations</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: ".5rem" }}>
        <button onClick={apply} className="btn btn-primary btn-sm btn-full">Apply Filters</button>
      </div>
      {activeCount > 0 && (
        <button onClick={clear} className="btn btn-ghost btn-sm" style={{ color: "var(--red-500)", width: "100%" }}>
          <X size={13} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div style={{ marginBottom: "1rem" }} className="hide-desktop">
        <button className="btn btn-secondary btn-sm" onClick={() => setOpen(!open)} style={{ display: "flex" }}>
          <SlidersHorizontal size={15} /> Filters {activeCount > 0 && <span className="badge badge-green" style={{ marginLeft: ".25rem" }}>{activeCount}</span>}
        </button>
        {open && (
          <div className="filter-panel" style={{ marginTop: ".75rem" }}>
            <div className="filter-panel__header">
              <span className="filter-panel__title">Filters</span>
              <button onClick={() => setOpen(false)} className="btn-icon btn-ghost btn-sm"><X size={15} /></button>
            </div>
            {filterBody}
          </div>
        )}
      </div>

      {/* Desktop always visible */}
      <div className="filter-panel show-desktop">
        <div className="filter-panel__header">
          <span className="filter-panel__title"><SlidersHorizontal size={14} style={{ display: "inline", marginRight: ".375rem" }} />Filters</span>
          {activeCount > 0 && <span className="badge badge-green">{activeCount}</span>}
        </div>
        {filterBody}
      </div>

      <style>{`
        .hide-desktop { display: block; }
        .show-desktop { display: none; }
        @media(min-width:1024px) {
          .hide-desktop { display: none !important; }
          .show-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}
