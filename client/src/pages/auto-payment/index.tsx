/**
 * Auto Payment Index - Vehicle Hub Page
 *
 * Lists all available vehicle payment calculators
 * with search and filtering capability.
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Car, Truck, ChevronRight } from "lucide-react";
import { AutolytiqLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";
import { cn } from "@/lib/utils";
import {
  VEHICLES,
  getPopularVehicles,
  getVehiclesByBodyType,
  formatVehicleName,
  getVehicleMidpointPrice,
  vehicleToUrl,
  type Vehicle,
} from "@/data/vehicles";
import { formatCurrency } from "@/lib/auto-payment-calculator";

type BodyTypeFilter = "all" | "truck" | "suv" | "sedan";

const BODY_TYPE_LABELS: Record<BodyTypeFilter, string> = {
  all: "All Vehicles",
  truck: "Trucks",
  suv: "SUVs",
  sedan: "Sedans",
};

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={vehicleToUrl(vehicle)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {formatVehicleName(vehicle)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(vehicle.priceRangeLow)} – {formatCurrency(vehicle.priceRangeHigh)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Est. payment from{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(Math.round((vehicle.priceRangeLow * 0.9) / 60))}
            </span>
            /mo
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function AutoPaymentIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyTypeFilter, setBodyTypeFilter] = useState<BodyTypeFilter>("all");

  const filteredVehicles = useMemo(() => {
    let vehicles = VEHICLES;

    // Filter by body type
    if (bodyTypeFilter !== "all") {
      vehicles = getVehiclesByBodyType(bodyTypeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      vehicles = vehicles.filter(
        (v) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          `${v.year}`.includes(query) ||
          formatVehicleName(v).toLowerCase().includes(query)
      );
    }

    return vehicles;
  }, [searchQuery, bodyTypeFilter]);

  const popularVehicles = getPopularVehicles(6);

  const breadcrumbs = [
    { name: "Home", url: "https://autolytiqs.com/" },
    { name: "Auto Payment Calculator", url: "https://autolytiqs.com/auto-payment" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO
        title="Auto Payment Calculator by Vehicle | Find Your Comfort Zone"
        description="Calculate your real monthly payment for any vehicle. Not approval estimates — actual payment comfort verdicts for trucks, SUVs, and sedans."
        canonical="https://autolytiqs.com/auto-payment"
        keywords="car payment calculator, auto loan calculator, truck payment, SUV payment, how much car can I afford"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            createBreadcrumbSchema(breadcrumbs),
            {
              "@type": "ItemList",
              name: "Vehicle Payment Calculators",
              description: "Payment calculators for popular vehicles",
              itemListElement: popularVehicles.map((v, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://autolytiqs.com${vehicleToUrl(v)}`,
                name: `${formatVehicleName(v)} Payment Calculator`,
              })),
            },
          ],
        }}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <AutolytiqLogo className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/auto"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Income-Based Calculator
            </Link>
            <Link
              href="/calculator"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Income Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:flex" />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Vehicle <span className="text-primary">Payment Calculator</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find out what a specific vehicle actually costs you per month.
            Not just estimates — comfort verdicts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by make, model, or year..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          {/* Body Type Filter */}
          <div className="flex gap-2">
            {(Object.keys(BODY_TYPE_LABELS) as BodyTypeFilter[]).map((type) => (
              <Button
                key={type}
                variant={bodyTypeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setBodyTypeFilter(type)}
                className="gap-1"
              >
                {type === "truck" && <Truck className="h-3 w-3" />}
                {type === "suv" && <Car className="h-3 w-3" />}
                {BODY_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Section */}
        {!searchQuery && bodyTypeFilter === "all" && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Most Popular</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.slug} vehicle={vehicle} />
              ))}
            </div>
          </div>
        )}

        {/* All Vehicles */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : bodyTypeFilter !== "all"
                ? BODY_TYPE_LABELS[bodyTypeFilter]
                : "All Vehicles"}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredVehicles.length})
            </span>
          </h2>

          {filteredVehicles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.slug} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No vehicles found matching your search.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setBodyTypeFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* CTA to general calculator */}
        <Card className="mt-12 p-6 text-center bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-2">Not sure which vehicle?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start with your income and find out what payment range is comfortable for you.
          </p>
          <Link href="/auto">
            <Button>Start with Income</Button>
          </Link>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Autolytiq. For estimation purposes only.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <ManageCookiesButton />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
