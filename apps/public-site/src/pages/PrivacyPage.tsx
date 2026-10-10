export function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {new Date().getUTCFullYear()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What we collect</h2>
          <p className="mt-2">
            When you submit a registration we collect: your full name, email address, mobile number, the courses you
            selected, and — if you choose to provide them — your education or occupation, city, and a message. We also
            record your privacy consent and a server-generated timestamp.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">How we use your data</h2>
          <p className="mt-2">
            We use your data to process your registration, confirm it on the server, and send you transactional emails
            about that registration. We do not automatically subscribe you to marketing emails.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Service providers</h2>
          <p className="mt-2">
            Registration records are stored in Cloud Firestore and audit artefacts are stored as plain-text files in
            Cloud Storage. Transactional email is sent through an SMTP provider from our trusted backend. These providers
            process data on our behalf.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Audit logging</h2>
          <p className="mt-2">
            We record meaningful actions (such as registration attempts and admin activity) in plain-text audit logs.
            Audit entries never contain passwords, session tokens, SMTP secrets, service-account keys or unnecessary
            personal data.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Retention</h2>
          <p className="mt-2">
            Registrations are retained while they are needed to process your enquiry and for a reasonable period
            afterwards. Email activity records and audit files are retained according to our operational and audit
            requirements. Retention is configuration-driven and disabled by default so data is never removed
            unexpectedly.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Your requests</h2>
          <p className="mt-2">
            You can ask us to access, correct or delete the personal data we hold about you by contacting our team using
            the details you were given when you registered. We will respond within a reasonable period.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Consent</h2>
          <p className="mt-2">
            Registration requires your consent to process your data for the purposes described above. You can withdraw
            consent for future processing by contacting us; this does not affect processing already carried out.
          </p>
        </section>
      </div>
    </div>
  );
}
