import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Briefcase, Calculator, DollarSign, Laptop, Car, Camera, PenTool, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";

const ARTICLE_META = {
  title: "15 Side Hustle Ideas to Boost Your Income in 2026",
  description: "Discover 15 proven side hustle ideas with realistic income potential. From freelancing to passive income streams, find the best side gig for your skills and schedule.",
  datePublished: "2025-12-20",
  url: "https://autolytiqs.com/blog/side-hustle-income-ideas",
  keywords: "side hustle ideas, make extra money, passive income, freelance income, side gig 2026",
};

export default function SideHustleIncomeIdeas() {
  const combinedSchema = [
    createArticleSchema(ARTICLE_META.title, ARTICLE_META.description, ARTICLE_META.url, ARTICLE_META.datePublished),
    createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "Side Hustle Ideas", url: ARTICLE_META.url },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={ARTICLE_META.title}
        description={ARTICLE_META.description}
        canonical={ARTICLE_META.url}
        type="article"
        keywords={ARTICLE_META.keywords}
        structuredData={combinedSchema}
      />
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/blog">
            <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </a>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Meta */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
            Side Income
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            15 Side Hustle Ideas to Boost Your Income in 2026
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              December 20, 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether you're paying off debt, building an emergency fund, or saving for a major purchase, a side hustle can accelerate your financial goals. Here are 15 proven ways to earn extra income in 2026.
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 my-8">
            <p className="text-primary font-medium mb-2">Before You Start</p>
            <p className="text-muted-foreground">
              The best side hustle depends on your skills, available time, and goals. Consider how many hours you can commit weekly and whether you want active income (trading time for money) or passive income (upfront work that pays over time).
            </p>
          </div>

          {/* Skills-Based */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Skills-Based Side Hustles</h2>
          <p className="text-muted-foreground">
            Leverage your existing expertise for the highest hourly rates.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">1. Freelance Writing & Content Creation</h3>
                <p className="text-primary text-sm font-medium">$25-$150/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Businesses need blog posts, website copy, email sequences, and social media content. Platforms like Contently, Upwork, and LinkedIn are great for finding clients. Specialize in a niche (tech, finance, health) to command higher rates.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">2. Graphic Design</h3>
                <p className="text-primary text-sm font-medium">$30-$100/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Create logos, social media graphics, presentations, and marketing materials. Tools like Figma, Canva Pro, and Adobe Creative Suite are essential. Build a portfolio on Dribbble or Behance to attract clients.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">3. Web Development</h3>
                <p className="text-primary text-sm font-medium">$50-$200/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Build websites for small businesses, create landing pages, or develop custom applications. WordPress, Shopify, and no-code tools like Webflow are in high demand. Even basic HTML/CSS skills can earn $500-$2,000 per simple website.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">4. Consulting in Your Field</h3>
                <p className="text-primary text-sm font-medium">$75-$300/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              If you have expertise in marketing, finance, HR, operations, or technology, businesses will pay for your knowledge. Start by offering 1-hour strategy calls on platforms like Clarity.fm or through LinkedIn outreach.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">5. Online Tutoring</h3>
                <p className="text-primary text-sm font-medium">$25-$80/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Teach subjects you're knowledgeable in—math, languages, test prep, music, coding. Platforms like Wyzant, Varsity Tutors, and Preply connect you with students. SAT/ACT prep and college admissions consulting pay premium rates.
            </p>
          </div>

          {/* Service-Based */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Service-Based Side Hustles</h2>
          <p className="text-muted-foreground">
            Trade your time for reliable income with minimal startup costs.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">6. Rideshare & Delivery</h3>
                <p className="text-primary text-sm font-medium">$15-$30/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Drive for Uber, Lyft, DoorDash, Instacart, or Amazon Flex. Flexible hours mean you can work around your schedule. Peak hours (weekends, dinner time) and surge pricing can significantly boost earnings.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">7. Pet Sitting & Dog Walking</h3>
                <p className="text-primary text-sm font-medium">$15-$50/walk or $50-$100/night</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Use Rover or Wag to connect with pet owners. Dog walking can be done during lunch breaks or after work. Overnight pet sitting pays more and works well if you love animals and have a pet-friendly home.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">8. Home Services</h3>
                <p className="text-primary text-sm font-medium">$20-$75/hour</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Offer cleaning, lawn care, handyman services, or pressure washing. Use TaskRabbit, Thumbtack, or Nextdoor to find clients. Low startup costs and high demand, especially in suburban areas.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">9. Photography</h3>
                <p className="text-primary text-sm font-medium">$100-$500/session</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Shoot portraits, events, real estate, or product photography. A decent camera and editing skills can get you started. Wedding photography pays exceptionally well once you build a portfolio.
            </p>
          </div>

          {/* Product-Based */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Product-Based Side Hustles</h2>
          <p className="text-muted-foreground">
            Sell products online for more passive income potential.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">10. Reselling & Flipping</h3>
                <p className="text-primary text-sm font-medium">$500-$3,000/month</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Buy undervalued items at thrift stores, garage sales, or clearance sections and resell on eBay, Poshmark, Mercari, or Facebook Marketplace. Popular niches: vintage clothing, electronics, collectibles, books.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <PenTool className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">11. Print-on-Demand</h3>
                <p className="text-primary text-sm font-medium">$500-$5,000/month</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Create designs for t-shirts, mugs, phone cases, and more. Platforms like Printful, Printify, and Redbubble handle printing and shipping. No inventory required—you earn per sale.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">12. Handmade Products on Etsy</h3>
                <p className="text-primary text-sm font-medium">$300-$10,000+/month</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Sell crafts, jewelry, art, candles, or digital downloads. Etsy has 90+ million active buyers. Digital products (planners, printables, templates) scale especially well with no shipping required.
            </p>
          </div>

          {/* Passive Income */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Passive Income Side Hustles</h2>
          <p className="text-muted-foreground">
            More work upfront, but can generate income while you sleep.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">13. Create an Online Course</h3>
                <p className="text-primary text-sm font-medium">$1,000-$50,000+/year</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Package your expertise into a course on Udemy, Teachable, or Skillshare. Topics can range from professional skills to hobbies. Once created, courses can sell for years with minimal updates.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">14. Affiliate Marketing</h3>
                <p className="text-primary text-sm font-medium">$100-$10,000+/month</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Recommend products you use and earn commissions on sales. Works well with a blog, YouTube channel, or social media following. Amazon Associates, ShareASale, and company-specific programs offer opportunities.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">15. Stock Photography/Video</h3>
                <p className="text-primary text-sm font-medium">$100-$2,000/month</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Upload photos and videos to Shutterstock, Adobe Stock, or Getty Images. Each asset can sell repeatedly over time. Focus on in-demand categories: business, lifestyle, technology, diverse representations.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Getting Started Tips</h2>
          <div className="bg-card border border-border rounded-xl p-6 my-6 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Start Small</h4>
              <p className="text-muted-foreground text-sm">Test your side hustle with minimal investment before going all-in</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Track Your Income</h4>
              <p className="text-muted-foreground text-sm">Keep records for taxes—you'll owe self-employment tax on side income</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Set Boundaries</h4>
              <p className="text-muted-foreground text-sm">Don't let your side hustle burn you out or affect your main job</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Reinvest Earnings</h4>
              <p className="text-muted-foreground text-sm">Use profits to improve tools, marketing, or skills to grow faster</p>
            </div>
          </div>

          <div className="my-8">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Calculator className="w-5 h-5" />
                Calculate My Total Income
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback & Share */}
        <BlogFeedback
          slug="side-hustle-income-ideas"
          title="15 Side Hustle Ideas to Boost Your Income in 2026"
        />

        {/* CTA */}
        <div className="p-8 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl text-center">
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-3">Track Your Growing Income</h3>
          <p className="text-muted-foreground mb-6">Use our calculator to project how much extra your side hustle adds to your annual income.</p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Calculator className="w-5 h-5" />
              Use Free Calculator
            </Button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Autolytiq. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy">
              <a className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </Link>
            <ManageCookiesButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
