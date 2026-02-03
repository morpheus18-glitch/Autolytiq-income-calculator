import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Briefcase, Search, TrendingUp, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import {
  SALARY_DATA,
  getAllCategories,
  getSalariesByCategory,
  formatSalary,
  type SalaryData,
} from "@/data/salaries";

function JobCard({ job }: { job: SalaryData }) {
  return (
    <Link href={`/salary/${job.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer h-full"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {job.category}
          </span>
          {job.growthOutlook === 'fast' && (
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              High Growth
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Median</div>
            <div className="font-bold mono-value text-primary">
              {formatSalary(job.median)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Senior</div>
            <div className="font-bold mono-value text-emerald-500">
              {formatSalary(job.senior)}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function SalaryIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getAllCategories();
  const allJobs = Object.values(SALARY_DATA);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs;

    if (selectedCategory) {
      jobs = jobs.filter((job) => job.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.alternativeTitles.some((t) => t.toLowerCase().includes(query)) ||
          job.category.toLowerCase().includes(query)
      );
    }

    return jobs.sort((a, b) => b.median - a.median);
  }, [allJobs, selectedCategory, searchQuery]);

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Salary Guide", url: "https://autolytiqs.com/salary" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Salary Guide 2026 | Average Salaries by Job"
        description="Comprehensive salary guide for 2026. Find average salaries, pay ranges, and top-paying states for popular jobs in tech, healthcare, finance, and more."
        canonical="https://autolytiqs.com/salary"
        keywords="salary guide, average salary, job salary, how much do teachers make, software engineer salary, nurse salary, career salaries"
        structuredData={seoData.breadcrumbs}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

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
            <span className="text-sm font-medium text-primary">Salary Guide</span>
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
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">2026 Salary Data</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-primary">Salary</span> Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Find average salaries, pay ranges by experience, and top-paying locations
            for popular careers.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">{allJobs.length} jobs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">{categories.length} categories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">BLS data</span>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs (e.g., nurse, engineer, teacher)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border/50 hover:border-primary/30"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border/50 hover:border-primary/30"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-sm text-muted-foreground"
        >
          Showing {filteredJobs.length} jobs
          {selectedCategory && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </motion.div>

        {/* Job Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
        >
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.02 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </motion.div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No jobs found matching your search.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-2 border-primary/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Calculate Your Actual Take-Home Pay
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                These are averages. Use our calculator to see your personalized
                income breakdown based on your actual salary.
              </p>
              <Link href="/calculator">
                <Button size="lg" className="group">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Open Income Calculator
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEO Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-invert max-w-4xl mx-auto mt-12"
        >
          <h2>How We Calculate Salary Data</h2>
          <p>
            Our salary data is sourced from the Bureau of Labor Statistics (BLS)
            Occupational Employment and Wage Statistics program, supplemented with
            industry reports and job posting data.
          </p>

          <h3>Understanding Salary Percentiles</h3>
          <ul>
            <li><strong>10th Percentile:</strong> Entry-level or low-cost-of-living areas</li>
            <li><strong>Median (50th):</strong> Half of workers earn more, half earn less</li>
            <li><strong>90th Percentile:</strong> Top earners or high-cost-of-living areas</li>
          </ul>

          <h3>Factors That Affect Your Salary</h3>
          <ul>
            <li><strong>Experience:</strong> More years typically means higher pay</li>
            <li><strong>Location:</strong> Coastal cities often pay more but cost more</li>
            <li><strong>Education:</strong> Advanced degrees can unlock higher salaries</li>
            <li><strong>Industry:</strong> Same job can pay differently across industries</li>
            <li><strong>Company Size:</strong> Larger companies often pay more</li>
          </ul>
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
              <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SalaryIndex;
