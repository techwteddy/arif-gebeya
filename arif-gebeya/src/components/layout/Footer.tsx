import Link from "next/link";
import { CATEGORIES } from "@/types";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="page-wrap footer__inner">
        <div className="footer__grid">
          <div>
            <div className="footer__brand-logo">
              <div className="footer__brand-icon">🛒</div>
              <span className="footer__brand-name">Arif<span>Gebeya</span></span>
            </div>
            <p className="footer__desc">Ethiopia&apos;s free classifieds marketplace. Buy and sell cars, phones, electronics, property, and more — directly with real people.</p>
          </div>
          <div>
            <p className="footer__col-title">Browse</p>
            <ul className="footer__links">
              {CATEGORIES.slice(0, 5).map(c => (
                <li key={c.slug}><Link href={`/browse?category=${c.slug}`} className="footer__link">{c.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__col-title">Account</p>
            <ul className="footer__links">
              {[
                { href: "/auth/signup",  label: "Register Free" },
                { href: "/auth/login",   label: "Sign In" },
                { href: "/dashboard",    label: "My Listings" },
                { href: "/listings/new", label: "Post an Ad" },
              ].map(({ href, label }) => (
                <li key={href}><Link href={href} className="footer__link">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__col-title">Help</p>
            <ul className="footer__links">
              {[
                { href: "/safety", label: "Safety Tips" },
                { href: "/faq",    label: "FAQ" },
                { href: "/about",  label: "About Us" },
                { href: "/contact",label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}><Link href={href} className="footer__link">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <p className="footer__copy">© {year} Arif Gebeya. All rights reserved.</p>
          <p className="footer__copy">🇪🇹 Made for Ethiopia &amp; the diaspora</p>
        </div>
      </div>
    </footer>
  );
}
