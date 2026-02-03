import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
  Calculator,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { analytics } from "@/lib/analytics";
import {
  QUIZ_QUESTIONS,
  PERSONALITY_RESULTS,
  calculateResult,
  type PersonalityType,
  type PersonalityResult,
} from "@/data/quiz-data";

function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + (answers[question?.id] !== undefined ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const resultType = showResult ? calculateResult(answers) : null;
  const result = resultType ? PERSONALITY_RESULTS[resultType] : null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quiz/financial-health?result=${resultType}`
    : '';

  const shareText = result
    ? `I'm "${result.title}" ${result.emoji} - take the Financial Personality Quiz to discover yours!`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Quiz", url: "https://autolytiqs.com/quiz/financial-health" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Financial Personality Quiz | What's Your Money Type?"
        description="Take our free financial personality quiz to discover your money type. Are you a Saver, Investor, Spender, or Builder? Get personalized tips and tool recommendations."
        canonical="https://autolytiqs.com/quiz/financial-health"
        keywords="financial personality quiz, money personality test, financial health quiz, what's my money type, budgeting quiz"
        structuredData={seoData.breadcrumbs}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

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
            <span className="text-sm font-medium text-primary">Quiz</span>
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!showResult ? (
          <>
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-card border-2 border-primary/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl leading-tight">
                      {question.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {question.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[question.id] === index
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/30 bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              answers[question.id] === index
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30'
                            }`}
                          >
                            {answers[question.id] === index && (
                              <Check className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                          <span className="text-sm sm:text-base">{option.text}</span>
                        </div>
                      </motion.button>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Select an answer to continue
              </span>
            </div>
          </>
        ) : result && (
          /* Results */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Result Card */}
            <Card className={`glass-card border-2 border-${result.color}-500/50 shadow-xl overflow-hidden`}>
              <div className={`p-6 bg-gradient-to-br from-${result.color}-500/20 to-${result.color}-500/5 text-center`}>
                <div className="text-6xl mb-4">{result.emoji}</div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  You're <span className={`text-${result.color}-500`}>{result.title}</span>
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {result.description}
                </p>
              </div>
              <CardContent className="p-6">
                {/* Strengths & Watch Outs */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <h3 className="font-semibold text-emerald-500 mb-2">Your Strengths</h3>
                    <ul className="space-y-1">
                      {result.strengths.map((strength) => (
                        <li key={strength} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <h3 className="font-semibold text-yellow-500 mb-2">Watch Out For</h3>
                    <ul className="space-y-1">
                      {result.watchOuts.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <Heart className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tips */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Tips for {result.title}</h3>
                  <div className="space-y-2">
                    {result.tips.map((tip, index) => (
                      <div key={tip} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <span className="text-lg font-bold text-muted-foreground/50">
                          {index + 1}
                        </span>
                        <span className="text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Tools */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center justify-between">
                    <span>Recommended Tools for You</span>
                    <span className="text-xs font-normal text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                      Partner
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {result.recommendedTools.map((tool) => (
                      <a
                        key={tool.name}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => analytics.affiliateClick(tool.name, tool.category, tool.url, '/quiz/financial-health')}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                      >
                        <div className="flex-1">
                          <div className="font-medium group-hover:text-primary transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tool.description}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                    We may earn a commission from partner links
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="glass-card border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Share Your Result
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                Retake Quiz
              </Button>
              <Link href="/calculator" className="flex-1">
                <Button className="w-full group">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Your Income
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. Quiz is for entertainment purposes.
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

export default QuizPage;
