export default function PrivacyPolicy() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          Privacy Policy
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Last updated: May 1, 2025
        </p>
      </header>

      <div className="prose prose-invert max-w-none text-base sm:text-lg">
        <p className="text-muted-foreground">
          At Trenova, we take your privacy seriously. This Privacy Policy
          explains how we collect, use, and protect your personal information.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          Information We Collect
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Account information (email, password)</li>
          <li>Profile data (name, age, fitness goals)</li>
          <li>Workout and fitness tracking data</li>
          <li>Device and usage information</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Personalize your workout experience</li>
          <li>Improve our AI training algorithms</li>
          <li>Send important updates and notifications</li>
          <li>Analyze app performance and usage patterns</li>
        </ul>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          Data Security
        </h2>
        <p className="text-muted-foreground">
          We implement industry-standard security measures to protect your data,
          including encryption, secure servers, and regular security audits.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          Data Sharing
        </h2>
        <p className="text-muted-foreground">
          We never sell your personal data. We only share data with trusted
          partners necessary for providing our services.
        </p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">
          Your Rights
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Access your personal data</li>
          <li>Request data correction or deletion</li>
          <li>Opt-out of marketing communications</li>
          <li>Export your data</li>
        </ul>

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
