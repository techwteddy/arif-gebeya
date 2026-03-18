"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Category } from "@/types";

export function HomeSearch({ cities, categories }: { cities: string[]; categories: Category[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat)      params.set("category", cat);
    if (city)     params.set("city", city);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="hero__search-card">
      <div className="hero__search-main">
        <span className="hero__search-icon"><Search size={18} /></span>
        <input
          className="field hero__search-input"
          placeholder="What are you looking for?"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      <select value={cat} onChange={e => setCat(e.target.value)} className="field hero__search-select">
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>)}
      </select>
      <select value={city} onChange={e => setCity(e.target.value)} className="field hero__search-select">
        <option value="">All Locations</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <button type="submit" className="btn btn-primary hero__search-btn">Search</button>
    </form>
  );
}
