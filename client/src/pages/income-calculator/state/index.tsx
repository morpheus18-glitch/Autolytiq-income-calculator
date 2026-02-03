import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin, Search, Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/seo";
import {
  ALL_STATE_SLUGS,
  STATE_TAX_DATA,
  NO_TAX_STATES,
  HIGH_TAX_STATES
} from "@/data/state-taxes";

export default function StateCalculatorIndex() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = ALL_STATE_SLUGS.filter(slug => {
    const state = STATE_TAX_DATA[slug];
    const query = searchQuery.toLowerCase();
    return (
      state.name.toLowerCase().includes(query) ||
      state.code.toLowerCase().includes(query) ||
      state.majorCities.some(city => city.toLowerCase().includes(query))
    );
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "State Income Tax Calculators",
    "description": "State-by-state income tax calculators for all 50 US states.",
    "url": "https://autolytiqs.com/income-calculator/state",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": 50,
      "itemListElement": ALL_STATE_SLUGS.map((slug, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://autolytiqs.com/income-calculator/${slug}`,
        "name": `${STATE_TAX_DATA[slug].name} Income Tax Calculator`,
      })),
    },
  };

  return (
    <>
      <SEO
        title="State Income Tax Calculators 2026 | All 50 States"
        description="Free state income tax calculators for all 50 US states. Calculate take-home pay with accurate state tax rates for California, Texas, New York, Florida, and more."
        canonical="https://autolytiqs.com/income-calculator/state"
        structuredData={jsonLd}
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              All 50 States
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              State Income Tax Calculators
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Calculate your take-home pay with accurate state tax rates.
              Select your state to see detailed income breakdowns.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search states or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid sm:grid-cols-3 gap-4 mb-12"
          >
            <Card className="bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{NO_TAX_STATES.length}</p>
                <p className="text-sm text-muted-foreground">States with No Income Tax</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">13.3%</p>
                <p className="text-sm text-muted-foreground">Highest Top Rate (CA)</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">50</p>
                <p className="text-sm text-muted-foreground">State Calculators</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* No-Tax States Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-600" />
              </span>
              States with No Income Tax
            </h2>
            <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-3">
              {NO_TAX_STATES.map((slug) => {
                const state = STATE_TAX_DATA[slug];
                return (
                  <Link key={slug} href={`/income-calculator/${slug}`}>
                    <Card className="hover:border-emerald-500/30 transition-all cursor-pointer group h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold group-hover:text-emerald-600 transition-colors">
                              {state.name}
                            </p>
                            <p className="text-xs text-emerald-600">No Income Tax</p>
                          </div>
                          <span className="text-lg font-bold text-muted-foreground/30">{state.code}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* All States */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-4">All States</h2>
            {filteredStates.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No states found matching "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStates.map((slug, index) => {
                  const state = STATE_TAX_DATA[slug];
                  return (
                    <motion.div
                      key={slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Link href={`/income-calculator/${slug}`}>
                        <Card className="hover:border-primary/30 transition-all cursor-pointer group h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold group-hover:text-primary transition-colors">
                                    {state.name}
                                  </p>
                                  {!state.hasStateTax && (
                                    <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                                      No Tax
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {state.hasStateTax ? (
                                    <span>Top rate: {state.topRate}%</span>
                                  ) : (
                                    <span className="text-emerald-600">No income tax</span>
                                  )}
                                  <span>Avg: ${(state.averageSalary / 1000).toFixed(0)}k</span>
                                </div>
                                <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                                  {state.majorCities.slice(0, 3).join(', ')}
                                </p>
                              </div>
                              <div className="text-2xl font-bold text-muted-foreground/20 shrink-0">
                                {state.code}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-2">Not Sure Which State?</h2>
                <p className="text-muted-foreground mb-6">
                  Use our main calculator to compare take-home pay across different states.
                </p>
                <Link href="/calculator">
                  <Button size="lg" className="gap-2">
                    Open Full Calculator
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
