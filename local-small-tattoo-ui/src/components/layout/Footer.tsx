import { Link } from "react-router";
import { navigationItems } from "../../data/navigation";

const styleLinks = ["Fineline", "Ornamental", "Blackwork", "Japanese"];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main page-shell">
        <section className="site-footer__brand-column">
          <Link className="site-footer__brand" to="/">
            Local
            <br />
            Small
            <br />
            Tattoo
          </Link>
          <p>
            A minimalist tattoo studio focused on precise work, personal stories, and a calm client
            experience.
          </p>
        </section>

        <section className="site-footer__column">
          <h2>Navigation</h2>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-footer__column">
          <h2>Styles</h2>
          <ul>
            {styleLinks.map((style) => (
              <li key={style}>
                <Link to={`/styles#${style.toLowerCase()}`}>{style}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-footer__column site-footer__contact">
          <h2>Contact</h2>
          <address>
            52–54 Tran Thanh Mai
            <br />
            Da Nang, Vietnam
          </address>
          <a href="tel:+84000000000">+84 946 752 336</a>
          <a href="mailto:hello@localsmalltattoo.com">booking@localsmalltattoo.vn</a>
          <p>Mon–Sun · 10:00–20:00</p>
        </section>
      </div>

      <div className="site-footer__bottom page-shell">
        <p>© 2026 Local Small Tattoo</p>
        <div>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
