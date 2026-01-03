import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-2xl mx-auto">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-4">Last updated: January 2026</p>

      <div className="space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold mb-2">Information We Collect</h2>
          <p className="text-muted-foreground">
            Our Income Calculator stores your input data (job start date, income figures, check date)
            locally in your browser using localStorage. This data never leaves your device unless you
            create an account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Account Information</h2>
          <p className="text-muted-foreground">
            If you create an account, we collect your email address for authentication purposes.
            Passwords are securely hashed and never stored in plain text.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>To provide income calculation functionality</li>
            <li>To authenticate your account</li>
            <li>To send password reset emails when requested</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Data Security</h2>
          <p className="text-muted-foreground">
            We use industry-standard security measures including HTTPS encryption,
            secure password hashing (bcrypt), and secure session management.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Third-Party Links</h2>
          <p className="text-muted-foreground">
            Our site may contain links to third-party financial services. We are not responsible
            for the privacy practices of these external sites. We may earn commissions from
            partner links.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p className="text-muted-foreground">
            For privacy inquiries, contact us at admin@autolytiqs.com
          </p>
        </section>
      </div>
    </div>
  );
}
