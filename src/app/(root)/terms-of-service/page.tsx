export default function TermsOfService() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Terms of Service
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Last updated: May 1, 2025
        </p>
      </header>

      <div className="prose prose-invert max-w-none text-base sm:text-lg">
        <p className="text-muted-foreground">
          Welcome to Trenova. By using our service, you agree to these terms.
          Please read them carefully.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          1. Account Terms
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>You must be at least 18 years old to use this service</li>
          <li>
            You are responsible for maintaining the security of your account
          </li>
          <li>You must provide accurate and complete information</li>
          <li>You may not use the service for any illegal purposes</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          2. Service Usage
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Personalize your workout experience</li>
          <li>Improve our AI training algorithms</li>
          <li>Send important updates and notifications</li>
          <li>Analyze app performance and usage patterns</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          3. Payment Terms
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Some features may require a paid subscription</li>
          <li>Subscriptions automatically renew unless cancelled</li>
          <li>Refunds are handled according to our refund policy</li>
          <li>Prices are subject to change with notice</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          4. Content and Copyright
        </h2>
        <p className="text-muted-foreground">
          All content provided through the service is owned by Trenova or its
          licensors and protected by copyright laws.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          5. Limitation of Liability
        </h2>
        <p className="text-muted-foreground">
          Trenova is not liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use of the
          service.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          6. Changes to Terms
        </h2>
        <p className="text-muted-foreground">
          We reserve the right to modify these terms at any time. We will notify
          users of any material changes.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          Contact Us
        </h2>
        <p className="text-muted-foreground">
          If you have any questions about our Privacy Policy, please contact us
          at privacy@trenova.app
        </p>
      </div>
    </section>
  );
}
