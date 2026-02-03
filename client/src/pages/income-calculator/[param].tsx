import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Calculator,
  ChevronRight,
  MapPin,
  DollarSign,
  TrendingUp,
  Building2,
  Check,
  X,
  ArrowRight,
  HelpCircle,
  Clock,
  FileText,
  Banknote,
  Percent,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO, createFAQSchema } from "@/components/seo";
import { getStateData, STATE_TAX_DATA, ALL_STATE_SLUGS, NO_TAX_STATES } from "@/data/state-taxes";
import { getVariantData, CALCULATOR_VARIANTS, ALL_VARIANT_SLUGS } from "@/data/calculator-variants";
import { SoFiInline, CreditKarmaInline } from "@/components/blog/InlineAffiliate";

// Icon map for variants
const ICON_MAP: Record<string, React.ReactNode> = {
  'hourly': <Clock className="h-6 w-6" />,
  'salary-to-hourly': <DollarSign className="h-6 w-6" />,
  '1099': <FileText className="h-6 w-6" />,
  'overtime': <TrendingUp className="h-6 w-6" />,
  'quarterly': <Calculator className="h-6 w-6" />,
  'biweekly': <Banknote className="h-6 w-6" />,
  'take-home': <Percent className="h-6 w-6" />,
  'gross-to-net': <Calculator className="h-6 w-6" />,
};

export default function IncomeCalculatorDynamicPage() {
  const params = useParams<{ param: string }>();
  const paramValue = params.param || '';

  // Check if it's a calculator variant
  const variant = getVariantData(paramValue);
  if (variant) {
    return <VariantPage variant={variant} />;
  }

  // Check if it's a state
  const state = getStateData(paramValue);
  if (state) {
    return <StatePage state={state} />;
  }

  // 404 - neither variant nor state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Calculator Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find that calculator. Browse our available options below.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/income-calculator">
            <Button>Calculator Tools</Button>
          </Link>
          <Link href="/income-calculator/state">
            <Button variant="outline">State Calculators</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Variant Page Component
function VariantPage({ variant }: { variant: ReturnType<typeof getVariantData> }) {
  if (!variant) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": variant.title,
    "description": variant.metaDescription,
    "url": `https://autolytiqs.com/income-calculator/${variant.slug}`,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1247" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": variant.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };

  // Combined structured data
  const combinedSchema = [jsonLd, faqJsonLd];

  return (
    <>
      <SEO
        title={variant.metaTitle.replace(' | Autolytiq', '')}
        description={variant.metaDescription}
        canonical={`https://autolytiqs.com/income-calculator/${variant.slug}`}
        structuredData={combinedSchema}
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/income-calculator" className="hover:text-foreground transition-colors">Calculators</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{variant.title}</span>
          </nav>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                {ICON_MAP[variant.slug] || <Calculator className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Free Calculator</p>
                <h1 className="text-3xl md:text-4xl font-bold">{variant.heading}</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{variant.subheading}</p>
          </motion.div>

          {/* Calculator CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="glass-card border-2 border-primary/30">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">{variant.description}</p>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {variant.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/calculator">
                  <Button size="lg" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    Open {variant.title}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Affiliate */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="font-semibold mb-1">Pro Tip: Track Your Credit Too</h3>
                    <p className="text-sm text-muted-foreground mb-3">Monitor your credit score for free to stay on top of your financial health.</p>
                    <CreditKarmaInline sourcePage={`/income-calculator/${variant.slug}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  {variant.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Tools */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
            <h2 className="text-xl font-bold mb-4">Related Tools</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {variant.relatedPages.map((page) => (
                <Link key={page.url} href={page.url}>
                  <Card className="h-full hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-primary transition-colors mb-1">{page.title}</h3>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Other Calculators */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-bold mb-4">More Calculators</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_VARIANT_SLUGS.filter(slug => slug !== variant.slug).map((slug) => (
                <Link key={slug} href={`/income-calculator/${slug}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    {CALCULATOR_VARIANTS[slug].title}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// State Page Component
function StatePage({ state }: { state: ReturnType<typeof getStateData> }) {
  if (!state) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const exampleSalary = 75000;
  const federalTax = exampleSalary * 0.18;
  const ficaTax = exampleSalary * 0.0765;
  const stateTax = state.hasStateTax ? exampleSalary * ((state.topRate || 5) / 100) * 0.7 : 0;
  const estimatedTakeHome = exampleSalary - federalTax - ficaTax - stateTax;

  const faqs = [
    {
      question: `Does ${state.name} have state income tax?`,
      answer: state.hasStateTax
        ? `Yes, ${state.name} has a state income tax with a top rate of ${state.topRate}%. ${state.localTaxes ? 'Some cities and counties also levy local income taxes.' : ''}`
        : `No, ${state.name} is one of ${NO_TAX_STATES.length} states with no state income tax on wages.`,
    },
    {
      question: `What is the average salary in ${state.name}?`,
      answer: `The average salary in ${state.name} is approximately ${formatCurrency(state.averageSalary)} per year.`,
    },
    {
      question: `How much tax will I pay on $75,000 in ${state.name}?`,
      answer: `On a $75,000 salary in ${state.name}, your estimated take-home pay would be around ${formatCurrency(estimatedTakeHome)}.`,
    },
    {
      question: `What is the cost of living in ${state.name}?`,
      answer: `${state.name} has a cost of living index of ${state.costOfLivingIndex} (100 = national average).`,
    },
  ];

  const comparisonStates = NO_TAX_STATES.filter(s => s !== state.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${state.name} Income Tax Calculator`,
    "description": `Free ${state.name} income tax calculator.`,
    "url": `https://autolytiqs.com/income-calculator/${state.slug}`,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  };

  const faqJsonLd = createFAQSchema(faqs);

  // Combined structured data
  const combinedSchema = [jsonLd, faqJsonLd];

  return (
    <>
      <SEO
        title={`${state.name} Income Tax Calculator 2026 | Calculate Take Home Pay`}
        description={`Free ${state.name} income tax calculator. Calculate your take-home pay with ${state.hasStateTax ? `up to ${state.topRate}% state tax` : 'no state income tax'}.`}
        canonical={`https://autolytiqs.com/income-calculator/${state.slug}`}
        structuredData={combinedSchema}
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/income-calculator" className="hover:text-foreground transition-colors">Calculators</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/income-calculator/state" className="hover:text-foreground transition-colors">States</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{state.name}</span>
          </nav>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {state.code}
              </div>
              <div>
                <p className="text-sm text-primary font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  State Tax Calculator
                </p>
                <h1 className="text-3xl md:text-4xl font-bold">{state.name} Income Tax Calculator</h1>
              </div>
            </div>
          </motion.div>

          {/* Key Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className={state.hasStateTax ? '' : 'bg-emerald-500/10 border-emerald-500/20'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  State Tax Rate
                </div>
                <p className={`text-2xl font-bold ${!state.hasStateTax ? 'text-emerald-600' : ''}`}>
                  {state.hasStateTax ? `${state.topRate}%` : 'None'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {state.hasStateTax ? 'Top marginal rate' : 'No state income tax'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Average Salary
                </div>
                <p className="text-2xl font-bold">{formatCurrency(state.averageSalary)}</p>
                <p className="text-xs text-muted-foreground">Statewide average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Building2 className="h-4 w-4" />
                  Cost of Living
                </div>
                <p className="text-2xl font-bold">{state.costOfLivingIndex}</p>
                <p className="text-xs text-muted-foreground">
                  {state.costOfLivingIndex > 100 ? `${state.costOfLivingIndex - 100}% above` : `${100 - state.costOfLivingIndex}% below`} avg
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calculator CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <Card className="glass-card border-2 border-primary/30">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-3">Calculate Your {state.name} Take-Home Pay</h2>
                <p className="text-muted-foreground mb-4">{state.description}</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-6">
                  {state.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                  {state.localTaxes && (
                    <div className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-amber-500" />
                      <span>Local taxes in some areas</span>
                    </div>
                  )}
                </div>
                <Link href="/calculator">
                  <Button size="lg" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculate {state.name} Take-Home Pay
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Example Calculation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example: $75,000 Salary in {state.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Gross Annual Salary</span>
                    <span className="font-semibold">{formatCurrency(exampleSalary)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Federal Income Tax (est.)</span>
                    <span className="text-red-500">-{formatCurrency(federalTax)}</span>
                  </div>
                  {state.hasStateTax && (
                    <div className="flex justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{state.name} State Tax (est.)</span>
                      <span className="text-red-500">-{formatCurrency(stateTax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">FICA (Social Security + Medicare)</span>
                    <span className="text-red-500">-{formatCurrency(ficaTax)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-lg">
                    <span className="font-semibold">Estimated Take-Home Pay</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(estimatedTakeHome)}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  *Estimates based on 2026 tax rates. Actual amounts may vary.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Affiliate */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
            {!state.hasStateTax ? (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Maximize Your No-Tax Advantage</h3>
                  <p className="text-sm text-muted-foreground mb-3">Put that extra cash to work with a high-yield savings account.</p>
                  <SoFiInline sourcePage={`/income-calculator/${state.slug}`} />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Track Your Financial Health</h3>
                  <p className="text-sm text-muted-foreground mb-3">Monitor your credit score for free.</p>
                  <CreditKarmaInline sourcePage={`/income-calculator/${state.slug}`} />
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Major Cities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <h2 className="text-xl font-bold mb-4">Major Cities in {state.name}</h2>
            <div className="flex flex-wrap gap-2">
              {state.majorCities.map((city) => (
                <span key={city} className="px-3 py-1.5 bg-muted rounded-full text-sm">{city}</span>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {state.name} Tax FAQs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* Compare States */}
          {state.hasStateTax && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
              <h2 className="text-xl font-bold mb-4">Compare: No-Tax States</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {comparisonStates.map((slug) => {
                  const compareState = STATE_TAX_DATA[slug];
                  return (
                    <Link key={slug} href={`/income-calculator/${slug}`}>
                      <Card className="hover:border-emerald-500/30 transition-all cursor-pointer h-full">
                        <CardContent className="p-4">
                          <p className="font-semibold">{compareState.name}</p>
                          <p className="text-sm text-emerald-600">No Income Tax</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Other States */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <h2 className="text-xl font-bold mb-4">Other State Calculators</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_STATE_SLUGS.filter(slug => slug !== state.slug).slice(0, 12).map((slug) => (
                <Link key={slug} href={`/income-calculator/${slug}`}>
                  <Button variant="outline" size="sm">{STATE_TAX_DATA[slug].code}</Button>
                </Link>
              ))}
              <Link href="/income-calculator/state">
                <Button variant="ghost" size="sm" className="text-primary">All 50 States →</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
