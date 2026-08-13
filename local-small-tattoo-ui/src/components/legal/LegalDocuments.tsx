import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { X } from "lucide-react";
import { useBusinessSettings } from "../../features/businessSettings/BusinessSettingsContext";

const EFFECTIVE_DATE = "13 August 2026";

export function LegalDocuments() {
  const { hash, pathname } = useLocation();
  const { settings } = useBusinessSettings();
  const document = hash === "#privacy" ? "privacy" : hash === "#terms" ? "terms" : null;
  const businessName = settings?.businessName || "Local Small Tattoo";
  const email = settings?.contact.email;
  const closeTo = pathname || "/";

  useEffect(() => {
    if (!document) return;
    const previousOverflow = documentElement().style.overflow;
    documentElement().style.overflow = "hidden";
    return () => {
      documentElement().style.overflow = previousOverflow;
    };
  }, [document]);

  useEffect(() => {
    if (!document) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.location.hash = "";
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [document]);

  if (!document) return null;

  return (
    <div className="legal-document" role="dialog" aria-modal="true" aria-labelledby="legal-title">
      <Link className="legal-document__backdrop" to={closeTo} aria-label="Close legal document" />
      <article className="legal-document__panel">
        <header className="legal-document__header">
          <div>
            <p>{businessName}</p>
            <h1 id="legal-title">
              {document === "privacy" ? "Privacy Policy" : "Terms of Service"}
            </h1>
            <small>Effective date: {EFFECTIVE_DATE}</small>
          </div>
          <Link className="legal-document__close" to={closeTo} aria-label="Close">
            <X aria-hidden="true" />
          </Link>
        </header>

        <div className="legal-document__content">
          {document === "privacy" ? (
            <PrivacyPolicy businessName={businessName} email={email} />
          ) : (
            <TermsOfService businessName={businessName} email={email} />
          )}
        </div>
      </article>
    </div>
  );
}

function PrivacyPolicy({ businessName, email }: { businessName: string; email?: string }) {
  return (
    <>
      <p>
        This Privacy Policy explains how {businessName} collects, uses and protects information when
        you visit our website, contact the studio or request a tattoo appointment.
      </p>

      <h2>1. Information we collect</h2>
      <p>We may collect information you provide directly, including:</p>
      <ul>
        <li>your name, phone number, email address and preferred contact method;</li>
        <li>appointment preferences and details about your tattoo idea;</li>
        <li>reference images, placement information and other notes you submit;</li>
        <li>messages and communications exchanged with the studio; and</li>
        <li>consent, health or identification information required before a tattoo session.</li>
      </ul>
      <p>
        Our website and service providers may also process basic technical information such as IP
        address, browser type, device information and pages visited for security and website
        operation.
      </p>

      <h2>2. How we use information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>review booking requests and communicate about consultations or appointments;</li>
        <li>prepare for and safely provide tattoo services;</li>
        <li>respond to questions and provide customer support;</li>
        <li>operate, secure and improve our website and services;</li>
        <li>maintain appropriate business and transaction records; and</li>
        <li>comply with legal obligations and protect our legitimate interests.</li>
      </ul>

      <h2>3. Images and portfolio use</h2>
      <p>
        Reference images you submit are used to understand your request and do not transfer
        ownership of third-party artwork to us. We will ask for appropriate permission before using
        identifiable photographs of you or your tattoo for our portfolio, website or social media.
        You may withdraw permission for future use by contacting us, although this may not affect
        material already lawfully published or shared.
      </p>

      <h2>4. Sharing and service providers</h2>
      <p>
        We do not sell personal information. We may share only what is necessary with trusted
        providers that help us host the website, store images, manage communications or operate the
        studio. Information may also be disclosed when required by law, to protect safety or legal
        rights, or as part of a business reorganisation.
      </p>

      <h2>5. International processing and security</h2>
      <p>
        Some technology providers may process information outside Vietnam. We take reasonable
        organisational and technical measures to protect personal information, but no online
        transmission or storage system can be guaranteed completely secure.
      </p>

      <h2>6. Retention</h2>
      <p>
        We keep information only for as long as reasonably necessary for bookings, studio records,
        safety, dispute resolution and applicable legal requirements. Unsuccessful or abandoned
        requests may be removed when they are no longer needed.
      </p>

      <h2>7. Your choices and rights</h2>
      <p>
        Subject to applicable law, you may ask to access, correct, update or delete your personal
        information, withdraw consent, or object to certain processing. We may need to verify your
        identity and may retain information where legally required.
      </p>

      <h2>8. Third-party links and children</h2>
      <p>
        Our website may link to maps, social networks or other third-party services whose privacy
        practices we do not control. This website is not directed to children, and minors should not
        submit a booking without the involvement of a parent or legal guardian.
      </p>

      <h2>9. Changes and contact</h2>
      <p>
        We may update this policy when our practices or legal obligations change. The effective date
        above identifies the latest version. For privacy questions or requests, contact us
        {email ? (
          <>
            {" "}
            at <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : (
          " through the Contact page"
        )}
        .
      </p>
    </>
  );
}

function TermsOfService({ businessName, email }: { businessName: string; email?: string }) {
  return (
    <>
      <p>
        These Terms govern use of the {businessName} website and tattoo booking services. By using
        the website or submitting a booking request, you agree to these Terms.
      </p>

      <h2>1. Website information</h2>
      <p>
        Website content is provided for general information and may be updated without notice.
        Portfolio images show previous work but do not guarantee an identical result. Colours,
        placement, skin, healing and the artist's professional judgement can affect the final
        tattoo.
      </p>

      <h2>2. Booking requests and confirmation</h2>
      <p>
        Sending the online form is a request only and does not confirm an appointment. A booking is
        confirmed when the studio accepts the request and communicates the appointment details and
        any required deposit. Pricing, estimated duration and the artist assigned may change after
        consultation if the design or scope changes.
      </p>

      <h2>3. Deposits, changes and cancellations</h2>
      <p>
        Any deposit amount, payment deadline, cancellation conditions and rescheduling rules will be
        provided before you confirm the appointment. Those booking-specific terms form part of these
        Terms. Contact the studio as soon as possible if you need to change an appointment. Late
        arrival may shorten or require rescheduling the session.
      </p>

      <h2>4. Age, identification and consent</h2>
      <p>
        You must meet the legal age and consent requirements applicable to the service in Vietnam.
        We may request valid identification and may require a parent or legal guardian where
        permitted and appropriate. The studio may refuse service if age, identity or consent cannot
        be verified.
      </p>

      <h2>5. Health and safety</h2>
      <p>
        You must provide complete and accurate information about allergies, medication, skin
        conditions, pregnancy, blood-borne illness or other circumstances relevant to safe tattoo
        services. Tattooing involves risks including pain, bleeding, infection, allergic reaction,
        scarring and variations in healing. Before the session, you may be asked to review and sign
        a separate informed-consent form.
      </p>
      <p>
        We may postpone or refuse a procedure when we reasonably believe it would be unsafe,
        unlawful, inappropriate, or when a client appears intoxicated or unable to give informed
        consent. Follow all aftercare instructions and seek qualified medical advice if you have
        health concerns or signs of a serious reaction.
      </p>

      <h2>6. Designs and intellectual property</h2>
      <p>
        The website, branding, text and original portfolio content belong to {businessName} or its
        licensors and may not be copied or commercially used without permission. Custom designs and
        sketches remain the artist's intellectual property unless otherwise agreed in writing.
        Please submit only reference material you are entitled to share. We may decline requests to
        directly copy another artist's protected work.
      </p>

      <h2>7. Client photographs</h2>
      <p>
        We may ask to photograph completed work for studio records. Identifiable photographs will be
        used for marketing or portfolio purposes only with appropriate permission, as described in
        our <a href="#privacy">Privacy Policy</a>.
      </p>

      <h2>8. Acceptable use</h2>
      <p>
        You must not misuse the website, attempt unauthorised access, upload malicious material,
        impersonate another person, submit unlawful content or interfere with the website's normal
        operation.
      </p>

      <h2>9. Liability</h2>
      <p>
        To the extent permitted by applicable law, {businessName} is not responsible for indirect or
        consequential loss arising from website use, third-party services, inaccurate information
        supplied by a client, failure to follow aftercare, or risks that were properly disclosed and
        accepted. Nothing in these Terms excludes rights or liability that cannot legally be
        excluded.
      </p>

      <h2>10. Governing law and changes</h2>
      <p>
        These Terms are governed by the laws of Vietnam. Disputes should first be raised with the
        studio in good faith and, if unresolved, may be submitted to the competent courts of
        Vietnam. We may update these Terms; the effective date above identifies the current version.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms can be sent
        {email ? (
          <>
            {" "}
            to <a href={`mailto:${email}`}>{email}</a>
          </>
        ) : (
          " through the Contact page"
        )}
        .
      </p>
    </>
  );
}

function documentElement() {
  return window.document.documentElement;
}
