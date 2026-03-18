"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Menu, X, Search, Plus, LayoutDashboard, User as UserIcon, Heart, LogOut, ChevronDown } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("user_id", data.user.id).single();
        setName(p?.full_name ?? "");
      }
    });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => l.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => { await supabase.auth.signOut(); setDropOpen(false); router.push("/"); router.refresh(); };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (searchQ.trim()) router.push(`/browse?q=${encodeURIComponent(searchQ.trim())}`); };

  const initial = (name || user?.email || "U")[0].toUpperCase();

  return (
    <header className="navbar">
      <div className="page-wrap">
        <div className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo">
            <div className="navbar__logo-icon">🛒</div>
            <span className="navbar__logo-wordmark">Arif<span>Gebeya</span></span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="navbar__search">
            <span className="navbar__search-icon"><Search size={16} /></span>
            <input className="field navbar__search-input" placeholder="Search listings…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </form>

          {/* Desktop actions */}
          <div className="navbar__actions">
            <Link href="/listings/new" className="btn btn-primary navbar__post-btn">
              <Plus size={15} /> Post Ad
            </Link>
            {user ? (
              <div className="navbar__dropdown-wrap" ref={dropRef}>
                <button className="navbar__avatar-btn" onClick={() => setDropOpen(!dropOpen)}>
                  <div className="navbar__avatar">{initial}</div>
                  <ChevronDown size={14} style={{ color: "var(--gray-400)", transition: "transform .2s", transform: dropOpen ? "rotate(180deg)" : "" }} />
                </button>
                {dropOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{name || "My Account"}</p>
                      <p className="navbar__dropdown-email">{user.email}</p>
                    </div>
                    <hr className="divider" />
                    {[
                      { href: "/dashboard", icon: LayoutDashboard, label: "My Listings" },
                      { href: "/dashboard/saved", icon: Heart, label: "Saved Ads" },
                      { href: "/profile", icon: UserIcon, label: "Profile" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href} className="navbar__dropdown-link" onClick={() => setDropOpen(false)}>
                        <span className="navbar__dropdown-icon"><Icon size={15} /></span>{label}
                      </Link>
                    ))}
                    <hr className="divider" />
                    <button className="navbar__dropdown-link navbar__dropdown-btn--danger" onClick={handleSignOut}>
                      <span className="navbar__dropdown-icon"><LogOut size={15} /></span>Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link href="/auth/signup" className="btn btn-secondary btn-sm hide-mobile">Register</Link>
              </>
            )}
            <button className="navbar__mobile-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="navbar__mobile-menu">
            <div className="navbar__mobile-search">
              <form onSubmit={handleSearch} className="navbar__search" style={{ display: "block", maxWidth: "100%" }}>
                <span className="navbar__search-icon"><Search size={16} /></span>
                <input className="field navbar__search-input" placeholder="Search listings…" value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ width: "100%" }} />
              </form>
            </div>
            <Link href="/listings/new" className="navbar__mobile-link navbar__mobile-link--green"><Plus size={15} />Post Free Ad</Link>
            <hr className="divider navbar__mobile-divider" />
            {user ? (
              <>
                <Link href="/dashboard" className="navbar__mobile-link"><LayoutDashboard size={15} />My Listings</Link>
                <Link href="/dashboard/saved" className="navbar__mobile-link"><Heart size={15} />Saved Ads</Link>
                <Link href="/profile" className="navbar__mobile-link"><UserIcon size={15} />Profile</Link>
                <hr className="divider navbar__mobile-divider" />
                <button onClick={handleSignOut} className="navbar__mobile-link navbar__mobile-link--red" style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>
                  <LogOut size={15} />Sign Out
                </button>
              </>
            ) : (
              <div className="navbar__mobile-auth">
                <Link href="/auth/login" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Sign In</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
