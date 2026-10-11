import { COMPANY } from "@cyberwolf/shared-types";

/** Cookie Policy body. Rendered in the in-page legal dialog. */
export function CookieContent() {
  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">Last updated: {new Date().getUTCFullYear()}</p>

      <section>
        <h2 className="text-base font-semibold text-foreground">Our approach</h2>
        <p className="mt-2">
          CyberWolf 360 keeps browser storage to the minimum needed to run the site. We do not use advertising,
          profiling or third-party analytics cookies, and we do not sell data.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">What we store</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Cookie consent decision</strong> — stored in local storage under the key{" "}
            <code className="rounded bg-background-secondary px-1 py-0.5 text-xs">cyberwolf360.cookieConsent.v1</code>{" "}
            so we remember your choice and do not show the banner again.
          </li>
          <li>
            <strong className="text-foreground">Firebase Authentication session</strong> — set only when you sign in to
            the administration application, which is a separate, private application. Visitors to this website do not
            receive an authentication session.
          </li>
        </ul>
        <p className="mt-2">
          No registration data — such as your name, email, mobile number or course selection — is stored in browser
          storage at any time.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Your choice</h2>
        <p className="mt-2">
          Both options in the consent banner are honest: this site sets no non-essential cookies, so &ldquo;Accept
          all&rdquo; and &ldquo;Essential only&rdquo; lead to the same behaviour. You can change your choice at any
          time using the &ldquo;Cookie settings&rdquo; link in the footer.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Contact</h2>
        <p className="mt-2">
          Questions about cookies or storage can be sent to{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-neon underline underline-offset-2">
            {COMPANY.email}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
