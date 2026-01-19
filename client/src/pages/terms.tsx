import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-2xl mx-auto">
      <SEO
        title="Terms of Service"
        description="Terms of Service for using Autolytiq income calculator and financial tools."
        canonical="https://autolytiqs.com/terms"
      />
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-4">Last updated: January 2026</p>

      <div className="space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold mb-2">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using Autolytiq Income Calculator, you accept and agree to be bound
            by these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Service Description</h2>
          <p className="text-muted-foreground">
            Autolytiq provides a free income calculation tool that helps users estimate their
            annual income based on year-to-date earnings. This tool is for informational
            purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Disclaimer</h2>
          <p className="text-muted-foreground">
            The calculations provided are estimates only and should not be considered financial
            advice. We recommend consulting with a qualified financial advisor for important
            financial decisions. We are not responsible for decisions made based on our calculations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Affiliate Disclosure</h2>
          <p className="text-muted-foreground">
            Our site contains affiliate links to third-party financial services. We may earn
            commissions when you click on these links and sign up for services. This does not
            affect our recommendations or the price you pay.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">User Accounts</h2>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your account credentials.
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            Autolytiq shall not be liable for any indirect, incidental, special, or consequential
            damages arising from your use of this service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact</h2>
          <p className="text-muted-foreground">
            For questions about these terms, contact us at admin@autolytiqs.com
          </p>
        </section>
      </div>
    </div>
  );
}
