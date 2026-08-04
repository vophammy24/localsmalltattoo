export function StudioInformation() {
  return (
    <aside className="booking-studio" aria-labelledby="booking-studio-title">
      <div>
        <p className="booking-studio__label">Atelier location</p>
        <h2 id="booking-studio-title">Da Nang City</h2>
        <address>
          52–54 Tran Thanh Mai
          <br />
          An Hai, Da Nang, Vietnam
        </address>
      </div>

      <dl className="booking-studio__details">
        <div>
          <dt>Phone</dt>
          <dd>
            <a href="tel:+84946752336">+84 946 752 336</a>
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href="mailto:booking@localsmalltattoo.vn">booking@localsmalltattoo.vn</a>
          </dd>
        </div>
        <div>
          <dt>Studio hours</dt>
          <dd>10:00 – 20:00 daily</dd>
        </div>
      </dl>

      <figure className="booking-studio__image">
        <img src="/images/studio-location.JPG" alt="Local Small Tattoo studio interior" />
      </figure>

      <a
        className="button button--secondary booking-studio__map-link"
        href="https://www.google.com/maps/search/?api=1&query=52-54+Tran+Thanh+Mai+Da+Nang+Vietnam"
        target="_blank"
        rel="noreferrer"
      >
        View map ↗
      </a>
    </aside>
  );
}
