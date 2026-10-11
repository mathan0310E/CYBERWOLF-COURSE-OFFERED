/** Terms of Service body. Rendered in the in-page legal dialog. */
export function TermsContent() {
  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">Last updated: {new Date().getUTCFullYear()}</p>

      <section>
        <h2 className="text-base font-semibold text-foreground">Registration</h2>
        <p className="mt-2">
          Submitting a registration through this website is a request to be contacted. It does not confirm admission,
          enrolment or payment. Any admission or payment arrangement is confirmed separately by our team.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Pricing</h2>
        <p className="mt-2">
          Prices shown on this website are offers for the courses described. The authoritative price for your
          registration is calculated on the server when your registration is received. If a displayed price differs
          from the server-calculated price, the server-calculated price applies.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Course descriptions</h2>
        <p className="mt-2">
          Course descriptions on this website are general marketing copy, not a verified syllabus. We do not publish
          durations, certifications, placements or trainer biographies unless they have been verified.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
        <p className="mt-2">
          You agree not to misuse this website, to submit false information, or to attempt to access data or systems
          you are not authorised to access. We may refuse or cancel registrations that breach these terms.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Communications</h2>
        <p className="mt-2">
          By registering you consent to receive transactional emails about your registration. We do not automatically
          subscribe you to marketing emails. You may withdraw consent to future processing at any time.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground">Liability</h2>
        <p className="mt-2">
          The website is provided on an &ldquo;as is&rdquo; basis. To the extent permitted by law, we are not liable
          for indirect or consequential loss arising from use of the website.
        </p>
      </section>
    </div>
  );
}
