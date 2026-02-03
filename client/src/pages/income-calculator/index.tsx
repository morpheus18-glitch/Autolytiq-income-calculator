import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Calculator,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Banknote,
  ArrowRight,
  Percent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { ALL_VARIANT_SLUGS, CALCULATOR_VARIANTS } from "@/data/calculator-variants";

const ICON_MAP: Record<string, React.ReactNode> = {
  'hourly': <Clock className="h-6 w-6" />,
  'salary-to-hourly': <DollarSign className="h-6 w-6" />,
  '1099': <FileText className="h-6 w-6" />,
  'overtime': <TrendingUp className="h-6 w-6" />,
  'quarterly': <Calendar className="h-6 w-6" />,
  'biweekly': <Banknote className="h-6 w-6" />,
  'take-home': <Percent className="h-6 w-6" />,
  'gross-to-net': <Calculator className="h-6 w-6" />,
};

export default function IncomeCalculatorIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Free Income & Salary Calculators",
    "description": "Collection of free calculators for income conversion, tax estimation, and paycheck calculation.",
    "url": "https://autolytiqs.com/income-calculator",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": ALL_VARIANT_SLUGS.map((slug, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://autolytiqs.com/income-calculator/${slug}`,
        "name": CALCULATOR_VARIANTS[slug].title,
      })),
    },
  };

  return (
    <>
      <SEO
        title="Free Income & Salary Calculators 2026"
        description="Free income calculators for hourly to salary conversion, 1099 taxes, take-home pay, overtime, and more. Calculate your true earnings in seconds."
        canonical="https://autolytiqs.com/income-calculator"
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
              <Calculator className="h-4 w-4" />
              Free Calculators
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Income & Salary Calculators
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Free tools to calculate your hourly rate, annual salary, take-home pay,
              and self-employment taxes. No signup required.
            </p>
          </motion.div>

          {/* Main Calculator CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="glass-card border-2 border-primary/30 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Calculator className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-2">Full Income Calculator</h2>
                    <p className="text-muted-foreground">
                      Our complete calculator with all features—federal & state taxes,
                      401k contributions, FICA, and detailed pay breakdowns.
                    </p>
                  </div>
                  <Link href="/calculator">
                    <Button size="lg" className="gap-2">
                      Open Calculator
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calculator Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Specialized Calculators</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_VARIANT_SLUGS.map((slug, index) => {
                const variant = CALCULATOR_VARIANTS[slug];
                return (
                  <motion.div
                    key={slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link href={`/income-calculator/${slug}`}>
                      <Card className="h-full hover:border-primary/30 transition-all cursor-pointer group">
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                              {ICON_MAP[slug] || <Calculator className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base group-hover:text-primary transition-colors">
                                {variant.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {variant.subheading}
                          </p>
                          <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Use calculator
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Popular Calculations Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-6">Popular Calculations</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "$15/hour annually", value: "$31,200", link: "/income-calculator/hourly" },
                { label: "$20/hour annually", value: "$41,600", link: "/income-calculator/hourly" },
                { label: "$50k take-home", value: "~$39,500", link: "/income-calculator/take-home" },
                { label: "$75k take-home", value: "~$56,000", link: "/income-calculator/take-home" },
                { label: "$100k take-home", value: "~$72,000", link: "/income-calculator/take-home" },
                { label: "1099 tax on $50k", value: "~$12,500", link: "/income-calculator/1099" },
                { label: "$60k hourly rate", value: "$28.85/hr", link: "/income-calculator/salary-to-hourly" },
                { label: "$80k biweekly", value: "$3,077 gross", link: "/income-calculator/biweekly" },
              ].map((item) => (
                <Link key={item.label} href={item.link}>
                  <Card className="hover:border-primary/30 transition-all cursor-pointer group h-full">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold text-primary">{item.value}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* SEO Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 prose prose-gray dark:prose-invert max-w-none"
          >
            <h2>How to Use Our Income Calculators</h2>
            <p>
              Our free income calculators help you understand your true earnings. Whether you're
              comparing job offers, planning your budget, or estimating taxes, we've got the right
              tool for you.
            </p>

            <h3>Hourly vs Salary Conversions</h3>
            <p>
              Use our <Link href="/income-calculator/hourly">hourly to salary calculator</Link> to
              convert your hourly wage to an annual salary, or our{" "}
              <Link href="/income-calculator/salary-to-hourly">salary to hourly calculator</Link> to
              find your hourly rate from a yearly salary. This is helpful when comparing job offers
              with different pay structures.
            </p>

            <h3>Self-Employment & 1099 Taxes</h3>
            <p>
              Freelancers and contractors face additional tax obligations. Our{" "}
              <Link href="/income-calculator/1099">1099 tax calculator</Link> shows your
              self-employment tax burden and helps you plan{" "}
              <Link href="/income-calculator/quarterly">quarterly estimated payments</Link>.
            </p>

            <h3>Take-Home Pay Calculations</h3>
            <p>
              Want to know what you'll actually receive in your paycheck? Our{" "}
              <Link href="/income-calculator/take-home">take-home pay calculator</Link> and{" "}
              <Link href="/income-calculator/biweekly">biweekly paycheck calculator</Link> show
              your net pay after all taxes and deductions.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
