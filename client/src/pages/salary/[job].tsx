import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ChevronRight,
  Briefcase,
  Calculator,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema, createJobPostingSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon, HousingIcon, AutoIcon, WalletIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { analytics } from "@/lib/analytics";

import { SalaryBreakdown } from "@/components/salary/SalaryBreakdown";
import {
  getSalaryBySlug,
  getRelatedJobs,
  formatSalary,
  type SalaryData,
} from "@/data/salaries";
import { calculateAffordability } from "@/data/affordability-data";

function SalaryPage() {
  const { job: jobSlug } = useParams<{ job: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const jobData = jobSlug ? getSalaryBySlug(jobSlug) : null;
  const relatedJobs = jobSlug ? getRelatedJobs(jobSlug) : [];

  if (!mounted) return null;

  if (!jobData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We don't have salary data for this job yet.
            </p>
            <Link href="/salary">
              <Button>
                Browse All Jobs
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate affordability based on median salary
  const affordability = calculateAffordability(jobData.median);

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Salary Guide", url: "https://autolytiqs.com/salary" },
      { name: `${jobData.title} Salary`, url: `https://autolytiqs.com/salary/${jobData.slug}` },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title={`${jobData.title} Salary 2026 | How Much Do ${jobData.title}s Make?`}
        description={`${jobData.title} salary guide for 2026. Median salary: ${formatSalary(jobData.median)}. Entry-level to senior pay ranges, top-paying states, and job outlook.`}
        canonical={`https://autolytiqs.com/salary/${jobData.slug}`}
        keywords={jobData.keywords.join(', ')}
        structuredData={{ "@graph": [seoData.breadcrumbs] }}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="site-header">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="header-logo p-2 rounded-xl">
                <AutolytiqLogo className="h-6 w-6 text-primary" />
              </div>
              <span className="header-title text-xl">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculator" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Calculator</Link>
            <Link href="/afford" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Budget Guides</Link>
            <Link href="/salary" className="text-sm font-medium text-primary">Salary Guide</Link>
            <Link href="/blog" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <Link href="/calculator">
              <Button size="sm" className="hidden md:flex">Calculator</Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/salary" className="hover:text-foreground transition-colors">Salary Guide</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{jobData.title}</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{jobData.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-primary">{jobData.title}</span> Salary
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            How much do {jobData.title.toLowerCase()}s make? Comprehensive salary data including
            pay by experience level, top-paying states, and job outlook for 2026.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Median: {formatSalary(jobData.median)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Growth: {jobData.growthRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">BLS Data</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <SalaryBreakdown data={jobData} />
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Calculator CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-2 border-primary/30 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Calculate Your Take-Home
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See exactly how much you'll take home after taxes with our
                    income calculator.
                  </p>
                  <Link href={`/calculator?salary=${jobData.median}`}>
                    <Button className="w-full group">
                      Calculate {formatSalary(jobData.median)} Salary
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Affordability Quick Look */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="glass-card border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    What Can a {jobData.title} Afford?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    Based on median salary of {formatSalary(jobData.median)}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-sm">Max Rent</span>
                      <span className="font-mono font-medium text-primary">
                        {formatSalary(affordability.maxRent)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-sm">Max Car Payment</span>
                      <span className="font-mono font-medium">
                        {formatSalary(affordability.maxCarPayment)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-card border border-border/50">
                      <span className="text-sm">Monthly Savings</span>
                      <span className="font-mono font-medium text-emerald-500">
                        {formatSalary(affordability.savings)}/mo
                      </span>
                    </div>
                  </div>
                  <Link href={`/afford/${affordability.slug}`}>
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      See Full Budget Breakdown
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Useful Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <Link href="/housing" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <HousingIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Housing Calculator</div>
                        <div className="text-xs text-muted-foreground">What can you afford?</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                    <Link href="/auto" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <AutoIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Auto Calculator</div>
                        <div className="text-xs text-muted-foreground">Car affordability</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                    <Link href="/smart-money" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <WalletIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Budget Planner</div>
                        <div className="text-xs text-muted-foreground">50/30/20 breakdown</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Search CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="glass-card border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Find {jobData.title} Jobs</span>
                    <span className="text-xs font-normal text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                      Partner
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <a
                    href={`https://www.indeed.com/jobs?q=${encodeURIComponent(jobData.title)}`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => analytics.affiliateClick('Indeed', 'jobs', 'https://indeed.com', `/salary/${jobData.slug}`)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1">
                      <div className="font-medium">Indeed</div>
                      <div className="text-xs text-muted-foreground">
                        Search {jobData.title} jobs
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                  <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                    We may earn a commission from partner links
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-card border-none shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Related Careers</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    {relatedJobs.map((job) => (
                      <Link key={job.slug} href={`/salary/${job.slug}`}>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                          <div>
                            <div className="font-medium text-sm">{job.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatSalary(job.median)} median
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Alternative Titles (hidden but good for SEO) */}
        {jobData.alternativeTitles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-lg bg-muted/30"
          >
            <p className="text-sm text-muted-foreground">
              <strong>Also known as:</strong> {jobData.alternativeTitles.join(', ')}
            </p>
          </motion.div>
        )}

        {/* SEO Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-invert max-w-4xl mx-auto mt-12"
        >
          <h2>How Much Do {jobData.title}s Make?</h2>
          <p>
            The median annual salary for a {jobData.title.toLowerCase()} in the United States
            is {formatSalary(jobData.median)} as of 2026. This means half of {jobData.title.toLowerCase()}s
            earn more than this amount, and half earn less.
          </p>

          <h3>Salary by Experience Level</h3>
          <ul>
            <li><strong>Entry Level (0-2 years):</strong> {formatSalary(jobData.entry)}</li>
            <li><strong>Mid Career (5-10 years):</strong> {formatSalary(jobData.mid)}</li>
            <li><strong>Senior Level (10+ years):</strong> {formatSalary(jobData.senior)}</li>
          </ul>

          <h3>Top Paying States for {jobData.title}s</h3>
          <p>
            Location significantly affects {jobData.title.toLowerCase()} salaries.
            The highest-paying state is {jobData.topStates[0].state} at {formatSalary(jobData.topStates[0].salary)}.
          </p>

          <h3>Job Outlook</h3>
          <p>
            Employment of {jobData.title.toLowerCase()}s is projected to {
              jobData.growthRate > 0 ? `grow ${jobData.growthRate}%` : `decline ${Math.abs(jobData.growthRate)}%`
            } from 2022 to 2032. {jobData.education}
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. Salary data based on BLS statistics.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/salary" className="text-muted-foreground hover:text-foreground transition-colors">All Salaries</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SalaryPage;
