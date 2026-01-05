import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Home, Car, CreditCard, ShoppingCart, Zap, Smartphone, Tv, Music, Sparkles, Shirt, Package, Coffee, Utensils, Dumbbell, Gamepad2, BookOpen, Scissors, Dog, Baby, Pill, PiggyBank, Check, AlertTriangle, X, Droplets, Wind, Wallet, Plane, Plus, Cigarette, Wine, Dice1, Scale, Briefcase, Banknote, Users, DollarSign, Train, Gift, Heart, GraduationCap, Ticket, Film, Save, History, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth-guard";
import { ReceiptUpload } from "@/components/receipt-upload";
import { TransactionList } from "@/components/transaction-list";
import { ManualTransactionForm } from "@/components/manual-transaction-form";
import { budgetApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Subscription services with typical prices
const SUBSCRIPTIONS = {
  streaming: {
    title: "TV & Video Streaming",
    icon: Tv,
    items: [
      { id: "netflix", name: "Netflix", price: 15.49 },
      { id: "hulu", name: "Hulu", price: 17.99 },
      { id: "disney", name: "Disney+", price: 13.99 },
      { id: "hbomax", name: "Max (HBO)", price: 15.99 },
      { id: "prime", name: "Prime Video", price: 14.99 },
      { id: "apple_tv", name: "Apple TV+", price: 9.99 },
      { id: "peacock", name: "Peacock", price: 7.99 },
      { id: "paramount", name: "Paramount+", price: 11.99 },
      { id: "youtube_premium", name: "YouTube Premium", price: 13.99 },
      { id: "crunchyroll", name: "Crunchyroll", price: 7.99 },
      { id: "espn", name: "ESPN+", price: 10.99 },
    ],
  },
  music: {
    title: "Music & Audio",
    icon: Music,
    items: [
      { id: "spotify", name: "Spotify", price: 11.99 },
      { id: "apple_music", name: "Apple Music", price: 10.99 },
      { id: "amazon_music", name: "Amazon Music", price: 9.99 },
      { id: "youtube_music", name: "YouTube Music", price: 10.99 },
      { id: "tidal", name: "Tidal", price: 10.99 },
      { id: "pandora", name: "Pandora Plus", price: 4.99 },
      { id: "audible", name: "Audible", price: 14.95 },
      { id: "sirius", name: "SiriusXM", price: 16.99 },
    ],
  },
  ai: {
    title: "AI & Productivity",
    icon: Sparkles,
    items: [
      { id: "chatgpt", name: "ChatGPT Plus", price: 20.00 },
      { id: "claude", name: "Claude Pro", price: 20.00 },
      { id: "copilot", name: "GitHub Copilot", price: 10.00 },
      { id: "copilot_pro", name: "MS Copilot Pro", price: 20.00 },
      { id: "midjourney", name: "Midjourney", price: 10.00 },
      { id: "notion", name: "Notion AI", price: 10.00 },
      { id: "canva", name: "Canva Pro", price: 12.99 },
      { id: "grammarly", name: "Grammarly", price: 12.00 },
      { id: "adobe_cc", name: "Adobe CC", price: 54.99 },
    ],
  },
  gaming: {
    title: "Gaming",
    icon: Gamepad2,
    items: [
      { id: "xbox_gamepass", name: "Xbox Game Pass", price: 16.99 },
      { id: "ps_plus", name: "PlayStation Plus", price: 17.99 },
      { id: "nintendo", name: "Nintendo Online", price: 3.99 },
      { id: "ea_play", name: "EA Play", price: 9.99 },
      { id: "ubisoft", name: "Ubisoft+", price: 17.99 },
      { id: "humble", name: "Humble Choice", price: 11.99 },
    ],
  },
  fitness: {
    title: "Fitness & Wellness",
    icon: Dumbbell,
    items: [
      { id: "gym", name: "Gym Membership", price: 40.00 },
      { id: "planet_fitness", name: "Planet Fitness", price: 24.99 },
      { id: "crossfit", name: "CrossFit Box", price: 150.00 },
      { id: "peloton", name: "Peloton", price: 44.00 },
      { id: "classpass", name: "ClassPass", price: 49.00 },
      { id: "headspace", name: "Headspace", price: 12.99 },
      { id: "calm", name: "Calm", price: 14.99 },
      { id: "noom", name: "Noom", price: 59.00 },
    ],
  },
  boxes: {
    title: "Subscription Boxes",
    icon: Package,
    items: [
      { id: "hellofresh", name: "HelloFresh", price: 60.00 },
      { id: "bluapron", name: "Blue Apron", price: 50.00 },
      { id: "factor", name: "Factor", price: 60.00 },
      { id: "fabfitfun", name: "FabFitFun", price: 55.00 },
      { id: "birchbox", name: "Birchbox", price: 15.00 },
      { id: "ipsy", name: "Ipsy", price: 13.00 },
      { id: "boxycharm", name: "BoxyCharm", price: 28.00 },
      { id: "sephora", name: "Sephora Box", price: 10.00 },
      { id: "stitch_fix", name: "Stitch Fix", price: 20.00 },
      { id: "trunk_club", name: "Trunk Club", price: 25.00 },
      { id: "bark_box", name: "BarkBox", price: 35.00 },
      { id: "chewy", name: "Chewy Autoship", price: 40.00 },
    ],
  },
  news: {
    title: "News & Reading",
    icon: BookOpen,
    items: [
      { id: "nyt", name: "NY Times", price: 17.00 },
      { id: "wsj", name: "Wall Street Journal", price: 12.00 },
      { id: "wapo", name: "Washington Post", price: 10.00 },
      { id: "athletic", name: "The Athletic", price: 9.99 },
      { id: "economist", name: "The Economist", price: 22.00 },
      { id: "kindle", name: "Kindle Unlimited", price: 11.99 },
      { id: "scribd", name: "Scribd", price: 11.99 },
      { id: "medium", name: "Medium", price: 5.00 },
      { id: "substack", name: "Substack(s)", price: 10.00 },
    ],
  },
  auto: {
    title: "Auto & Vehicle",
    icon: Car,
    items: [
      { id: "car_wash", name: "Car Wash Pass", price: 25.00 },
      { id: "aaa", name: "AAA Membership", price: 12.00 },
      { id: "oil_change", name: "Oil Change Plan", price: 30.00 },
      { id: "parking", name: "Parking Spot", price: 150.00 },
      { id: "tolls", name: "Toll Pass", price: 50.00 },
    ],
  },
  services: {
    title: "Services & Maintenance",
    icon: Wind,
    items: [
      { id: "dry_cleaning", name: "Dry Cleaning", price: 60.00 },
      { id: "laundry", name: "Laundry Service", price: 80.00 },
      { id: "house_cleaning", name: "House Cleaning", price: 150.00 },
      { id: "lawn_care", name: "Lawn Care", price: 100.00 },
      { id: "pest_control", name: "Pest Control", price: 40.00 },
      { id: "security", name: "Home Security", price: 30.00 },
    ],
  },
  cloud: {
    title: "Cloud & Tech",
    icon: Smartphone,
    items: [
      { id: "icloud", name: "iCloud+", price: 2.99 },
      { id: "google_one", name: "Google One", price: 2.99 },
      { id: "dropbox", name: "Dropbox", price: 11.99 },
      { id: "onedrive", name: "OneDrive", price: 2.99 },
      { id: "1password", name: "1Password", price: 4.99 },
      { id: "lastpass", name: "LastPass", price: 3.00 },
      { id: "vpn", name: "VPN Service", price: 12.99 },
      { id: "domain", name: "Domain/Hosting", price: 15.00 },
    ],
  },
  education: {
    title: "Learning & Education",
    icon: GraduationCap,
    items: [
      { id: "coursera", name: "Coursera Plus", price: 59.00 },
      { id: "linkedin_learning", name: "LinkedIn Learning", price: 29.99 },
      { id: "skillshare", name: "Skillshare", price: 13.99 },
      { id: "masterclass", name: "MasterClass", price: 10.00 },
      { id: "udemy", name: "Udemy (avg)", price: 15.00 },
      { id: "duolingo", name: "Duolingo Plus", price: 12.99 },
      { id: "brilliant", name: "Brilliant", price: 24.99 },
      { id: "codecademy", name: "Codecademy Pro", price: 17.99 },
      { id: "pluralsight", name: "Pluralsight", price: 29.00 },
    ],
  },
};

interface FrequencyQuestion {
  id: string;
  icon: React.ElementType;
  title: string;
  question: string;
  frequencyLabel: string;
  amountLabel: string;
  frequencyOptions: { label: string; value: number }[];
  amountOptions: { label: string; value: number }[];
  category: "needs" | "wants" | "savings";
  guideline: number;
}

const FREQUENCY_QUESTIONS: FrequencyQuestion[] = [
  {
    id: "groceries",
    icon: ShoppingCart,
    title: "Grocery Shopping",
    question: "Let's figure out your grocery spending",
    frequencyLabel: "How often do you go grocery shopping?",
    amountLabel: "About how much per trip?",
    frequencyOptions: [
      { label: "Never/Rarely", value: 0 },
      { label: "Once a week", value: 4 },
      { label: "Twice a week", value: 8 },
      { label: "Every 2 weeks", value: 2 },
      { label: "Once a month", value: 1 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$50-75", value: 62 },
      { label: "$75-100", value: 87 },
      { label: "$100-150", value: 125 },
      { label: "$150-200", value: 175 },
      { label: "$200-300", value: 250 },
      { label: "$300+", value: 350 },
    ],
    category: "needs",
    guideline: 0.10,
  },
  {
    id: "dining",
    icon: Utensils,
    title: "Dining Out & Delivery",
    question: "How often do you eat out or order delivery?",
    frequencyLabel: "Times per month eating out/ordering",
    amountLabel: "Average spent per meal",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Rarely (1-2x)", value: 1.5 },
      { label: "Sometimes (3-4x)", value: 3.5 },
      { label: "Weekly (4-5x)", value: 4.5 },
      { label: "Often (6-8x)", value: 7 },
      { label: "Very often (10+)", value: 12 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$10-15", value: 12 },
      { label: "$15-25", value: 20 },
      { label: "$25-40", value: 32 },
      { label: "$40-60", value: 50 },
      { label: "$60+", value: 75 },
    ],
    category: "wants",
    guideline: 0.05,
  },
  {
    id: "coffee",
    icon: Coffee,
    title: "Coffee & Drinks",
    question: "Coffee shop and drink habits",
    frequencyLabel: "Coffee shop visits per month",
    amountLabel: "Average per visit",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Few times (2-4x)", value: 3 },
      { label: "Weekly (4-5x)", value: 4.5 },
      { label: "Several/week (8-12x)", value: 10 },
      { label: "Daily (20+)", value: 22 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$4-6", value: 5 },
      { label: "$6-8", value: 7 },
      { label: "$8-12", value: 10 },
      { label: "$12+", value: 15 },
    ],
    category: "wants",
    guideline: 0.02,
  },
  {
    id: "shopping",
    icon: Shirt,
    title: "Clothes & Shopping",
    question: "Clothing and personal shopping",
    frequencyLabel: "Shopping trips per month",
    amountLabel: "Average spent per trip",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Rarely (0-1x)", value: 0.5 },
      { label: "Monthly (1-2x)", value: 1.5 },
      { label: "Often (2-4x)", value: 3 },
      { label: "Very often (4+)", value: 5 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$25-50", value: 37 },
      { label: "$50-100", value: 75 },
      { label: "$100-200", value: 150 },
      { label: "$200-300", value: 250 },
      { label: "$300+", value: 400 },
    ],
    category: "wants",
    guideline: 0.05,
  },
  {
    id: "haircare",
    icon: Scissors,
    title: "Hair & Beauty",
    question: "Haircuts, salon, and beauty services",
    frequencyLabel: "Salon/barber visits per month",
    amountLabel: "Average cost per visit",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Every 2-3 months", value: 0.4 },
      { label: "Monthly", value: 1 },
      { label: "Twice a month", value: 2 },
      { label: "Weekly", value: 4 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$15-25", value: 20 },
      { label: "$25-50", value: 37 },
      { label: "$50-100", value: 75 },
      { label: "$100-200", value: 150 },
      { label: "$200+", value: 250 },
    ],
    category: "wants",
    guideline: 0.02,
  },
  {
    id: "gas",
    icon: Car,
    title: "Gas & Fuel",
    question: "How often do you fill up your car?",
    frequencyLabel: "Fill-ups per month",
    amountLabel: "Cost per fill-up",
    frequencyOptions: [
      { label: "Don't drive", value: 0 },
      { label: "Once a month", value: 1 },
      { label: "Twice a month", value: 2 },
      { label: "Weekly", value: 4 },
      { label: "Twice a week", value: 8 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$30-50", value: 40 },
      { label: "$50-70", value: 60 },
      { label: "$70-100", value: 85 },
      { label: "$100+", value: 120 },
    ],
    category: "needs",
    guideline: 0.05,
  },
  {
    id: "smoking",
    icon: Cigarette,
    title: "Smoking / Tobacco",
    question: "Do you smoke or use tobacco products?",
    frequencyLabel: "How often do you buy cigarettes/tobacco?",
    amountLabel: "How much per purchase?",
    frequencyOptions: [
      { label: "Don't smoke", value: 0 },
      { label: "Weekly", value: 4 },
      { label: "Every few days", value: 10 },
      { label: "Daily", value: 30 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$8-12 (1 pack)", value: 10 },
      { label: "$15-20", value: 17 },
      { label: "$25-35", value: 30 },
      { label: "$40+", value: 45 },
    ],
    category: "wants",
    guideline: 0.00,
  },
  {
    id: "drinking",
    icon: Wine,
    title: "Alcohol / Drinks",
    question: "Spending on alcohol (bars, beer, liquor, wine)?",
    frequencyLabel: "How often do you buy alcohol?",
    amountLabel: "Average spent each time?",
    frequencyOptions: [
      { label: "Don't drink", value: 0 },
      { label: "Once a month", value: 1 },
      { label: "2-3 times/month", value: 2.5 },
      { label: "Weekly", value: 4 },
      { label: "Multiple/week", value: 8 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$10-20", value: 15 },
      { label: "$20-40", value: 30 },
      { label: "$40-75", value: 57 },
      { label: "$75-100", value: 87 },
      { label: "$100+", value: 125 },
    ],
    category: "wants",
    guideline: 0.02,
  },
  {
    id: "gambling",
    icon: Dice1,
    title: "Gambling / Lottery",
    question: "Do you gamble, bet, or play the lottery?",
    frequencyLabel: "How often?",
    amountLabel: "How much per session?",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Rarely (1-2x/mo)", value: 1.5 },
      { label: "Weekly", value: 4 },
      { label: "Multiple/week", value: 8 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$5-10", value: 7 },
      { label: "$10-25", value: 17 },
      { label: "$25-50", value: 37 },
      { label: "$50-100", value: 75 },
      { label: "$100-200", value: 150 },
      { label: "$200+", value: 300 },
    ],
    category: "wants",
    guideline: 0.00,
  },
  {
    id: "rideshare",
    icon: Car,
    title: "Uber / Lyft / Taxis",
    question: "How often do you use rideshare services?",
    frequencyLabel: "Rides per month",
    amountLabel: "Average cost per ride",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "1-2 times/month", value: 1.5 },
      { label: "Weekly", value: 4 },
      { label: "2-3 times/week", value: 10 },
      { label: "Daily", value: 22 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$8-15", value: 12 },
      { label: "$15-25", value: 20 },
      { label: "$25-40", value: 32 },
      { label: "$40-60", value: 50 },
      { label: "$60+", value: 75 },
    ],
    category: "needs",
    guideline: 0.03,
  },
  {
    id: "entertainment",
    icon: Film,
    title: "Movies & Events",
    question: "Movies, concerts, sports, shows, etc?",
    frequencyLabel: "Events per month",
    amountLabel: "Average cost per event",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "1-2 times/month", value: 1.5 },
      { label: "Weekly", value: 4 },
      { label: "Multiple/week", value: 8 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$15-25 (movie)", value: 20 },
      { label: "$30-50", value: 40 },
      { label: "$50-100", value: 75 },
      { label: "$100-200", value: 150 },
      { label: "$200+", value: 300 },
    ],
    category: "wants",
    guideline: 0.03,
  },
  {
    id: "gifts",
    icon: Gift,
    title: "Gifts & Presents",
    question: "Average monthly spending on gifts?",
    frequencyLabel: "Gift-buying occasions per month",
    amountLabel: "Average spent per gift",
    frequencyOptions: [
      { label: "Rarely", value: 0.5 },
      { label: "1-2 times/month", value: 1.5 },
      { label: "Several/month", value: 3 },
      { label: "Frequently", value: 5 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$20-40", value: 30 },
      { label: "$40-75", value: 57 },
      { label: "$75-125", value: 100 },
      { label: "$125-200", value: 162 },
      { label: "$200+", value: 250 },
    ],
    category: "wants",
    guideline: 0.02,
  },
  {
    id: "donations",
    icon: Heart,
    title: "Charity & Donations",
    question: "Do you donate to charity or causes?",
    frequencyLabel: "How often do you donate?",
    amountLabel: "Average donation amount",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Occasionally", value: 0.5 },
      { label: "Monthly", value: 1 },
      { label: "Multiple/month", value: 2 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$10-25", value: 17 },
      { label: "$25-50", value: 37 },
      { label: "$50-100", value: 75 },
      { label: "$100-250", value: 175 },
      { label: "$250+", value: 350 },
    ],
    category: "wants",
    guideline: 0.05,
  },
];

interface FixedExpense {
  id: string;
  icon: React.ElementType;
  title: string;
  question: string;
  placeholder: string;
  category: "needs" | "wants" | "savings";
  guideline: number;
  optional?: boolean;
}

const FIXED_EXPENSES: FixedExpense[] = [
  {
    id: "housing",
    icon: Home,
    title: "Housing",
    question: "What's your monthly rent or mortgage?",
    placeholder: "Monthly payment",
    category: "needs",
    guideline: 0.28,
  },
  {
    id: "car_payment",
    icon: Car,
    title: "Car Payment",
    question: "Monthly car payment (if any)?",
    placeholder: "Loan or lease payment",
    category: "needs",
    guideline: 0.08,
    optional: true,
  },
  {
    id: "car_insurance",
    icon: Car,
    title: "Car Insurance",
    question: "Monthly car insurance cost?",
    placeholder: "Insurance premium",
    category: "needs",
    guideline: 0.03,
    optional: true,
  },
  {
    id: "renters_insurance",
    icon: Home,
    title: "Renters / Home Insurance",
    question: "Monthly renters or homeowners insurance?",
    placeholder: "Insurance premium",
    category: "needs",
    guideline: 0.01,
    optional: true,
  },
  {
    id: "transit_pass",
    icon: Train,
    title: "Transit Pass",
    question: "Monthly transit pass or commute costs?",
    placeholder: "Bus, subway, train pass",
    category: "needs",
    guideline: 0.03,
    optional: true,
  },
  {
    id: "credit_cards",
    icon: CreditCard,
    title: "Credit Card Payments",
    question: "Monthly credit card payments?",
    placeholder: "Minimum or payoff amount",
    category: "needs",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "student_loans",
    icon: BookOpen,
    title: "Student Loans",
    question: "Monthly student loan payment?",
    placeholder: "Loan payment",
    category: "needs",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "utilities",
    icon: Zap,
    title: "Utilities",
    question: "Total monthly utilities?",
    placeholder: "Electric, gas, water",
    category: "needs",
    guideline: 0.05,
  },
  {
    id: "phone",
    icon: Smartphone,
    title: "Phone Bill",
    question: "Monthly phone bill?",
    placeholder: "Cell phone plan",
    category: "needs",
    guideline: 0.02,
  },
  {
    id: "internet",
    icon: Zap,
    title: "Internet",
    question: "Monthly internet cost?",
    placeholder: "Home internet",
    category: "needs",
    guideline: 0.02,
  },
  {
    id: "health_expenses",
    icon: Pill,
    title: "Medical Expenses",
    question: "Out-of-pocket medical costs (not deducted from paycheck)?",
    placeholder: "Copays, prescriptions, dental, vision",
    category: "needs",
    guideline: 0.03,
    optional: true,
  },
  {
    id: "pets",
    icon: Dog,
    title: "Pet Expenses",
    question: "Monthly pet costs (food, vet, etc)?",
    placeholder: "Pet expenses",
    category: "needs",
    guideline: 0.02,
    optional: true,
  },
  {
    id: "childcare",
    icon: Baby,
    title: "Childcare",
    question: "Monthly childcare or child expenses?",
    placeholder: "Daycare, activities, etc",
    category: "needs",
    guideline: 0.10,
    optional: true,
  },
  {
    id: "child_support",
    icon: Users,
    title: "Child Support",
    question: "Monthly child support payments?",
    placeholder: "Court-ordered support",
    category: "needs",
    guideline: 0.10,
    optional: true,
  },
  {
    id: "alimony",
    icon: Scale,
    title: "Alimony / Spousal Support",
    question: "Monthly alimony or spousal support?",
    placeholder: "Court-ordered payments",
    category: "needs",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "garnishments",
    icon: Scale,
    title: "Wage Garnishments",
    question: "Any wage garnishments (taxes, judgments)?",
    placeholder: "Amount withheld from pay",
    category: "needs",
    guideline: 0.00,
    optional: true,
  },
  {
    id: "other_loans",
    icon: Banknote,
    title: "Other Loans",
    question: "Other loan payments (personal, payday, etc)?",
    placeholder: "Monthly loan payments",
    category: "needs",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "business_expenses",
    icon: Briefcase,
    title: "Business Expenses",
    question: "Monthly out-of-pocket business expenses?",
    placeholder: "Not reimbursed by employer",
    category: "needs",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "personal_cash",
    icon: Wallet,
    title: "Personal Cash / Misc",
    question: "Cash spending not tracked elsewhere?",
    placeholder: "ATM withdrawals, misc cash",
    category: "wants",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "vacation_fund",
    icon: Plane,
    title: "Vacation / Travel Fund",
    question: "Monthly amount set aside for travel?",
    placeholder: "Vacation savings",
    category: "wants",
    guideline: 0.05,
    optional: true,
  },
  {
    id: "savings",
    icon: PiggyBank,
    title: "Savings",
    question: "How much do you save each month?",
    placeholder: "Emergency fund, general savings",
    category: "savings",
    guideline: 0.10,
  },
  {
    id: "investments",
    icon: PiggyBank,
    title: "Additional Investments",
    question: "Extra investments beyond 401k (already deducted)?",
    placeholder: "Brokerage, Roth IRA, HSA",
    category: "savings",
    guideline: 0.10,
    optional: true,
  },
];

type Step =
  | { type: "fixed"; data: FixedExpense }
  | { type: "frequency"; data: FrequencyQuestion }
  | { type: "subscriptions"; category: keyof typeof SUBSCRIPTIONS }
  | { type: "results" };

interface InteractiveBudgetProps {
  monthlyIncome: number;
}

export function InteractiveBudget({ monthlyIncome }: InteractiveBudgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Data storage
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, number>>({});
  const [frequencyData, setFrequencyData] = useState<Record<string, { frequency: number; amount: number }>>({});
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());
  const [customSubAmounts, setCustomSubAmounts] = useState<Record<string, number>>({});

  // Expense tracking state
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Build step sequence
  const steps: Step[] = [
    ...FIXED_EXPENSES.map(exp => ({ type: "fixed" as const, data: exp })),
    ...FREQUENCY_QUESTIONS.map(q => ({ type: "frequency" as const, data: q })),
    ...Object.keys(SUBSCRIPTIONS).map(cat => ({ type: "subscriptions" as const, category: cat as keyof typeof SUBSCRIPTIONS })),
    { type: "results" as const },
  ];

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  const handleStart = () => {
    setIsOpen(true);
    setCurrentStepIndex(0);
    setFixedExpenses({});
    setFrequencyData({});
    setSelectedSubscriptions(new Set());
    setCustomSubAmounts({});
  };

  // Quick start presets for faster completion
  const applyPreset = (preset: "minimal" | "moderate" | "comfortable") => {
    const presets = {
      minimal: {
        fixed: {
          housing: monthlyIncome * 0.25,
          utilities: monthlyIncome * 0.04,
          phone: 50,
          internet: 60,
        },
        frequency: {
          groceries: { frequency: 4, amount: 75 },
          dining: { frequency: 2, amount: 15 },
          gas: { frequency: 2, amount: 50 },
        },
        subscriptions: new Set(["netflix", "spotify"]),
      },
      moderate: {
        fixed: {
          housing: monthlyIncome * 0.28,
          utilities: monthlyIncome * 0.05,
          phone: 80,
          internet: 75,
          car_payment: monthlyIncome * 0.06,
          car_insurance: 120,
          savings: monthlyIncome * 0.10,
        },
        frequency: {
          groceries: { frequency: 4, amount: 125 },
          dining: { frequency: 4, amount: 25 },
          coffee: { frequency: 4, amount: 6 },
          gas: { frequency: 3, amount: 60 },
          shopping: { frequency: 1, amount: 75 },
        },
        subscriptions: new Set(["netflix", "spotify", "amazon_music", "gym"]),
      },
      comfortable: {
        fixed: {
          housing: monthlyIncome * 0.30,
          utilities: monthlyIncome * 0.05,
          phone: 100,
          internet: 90,
          car_payment: monthlyIncome * 0.08,
          car_insurance: 150,
          savings: monthlyIncome * 0.15,
          investments: monthlyIncome * 0.05,
        },
        frequency: {
          groceries: { frequency: 4, amount: 175 },
          dining: { frequency: 6, amount: 35 },
          coffee: { frequency: 10, amount: 7 },
          gas: { frequency: 4, amount: 70 },
          shopping: { frequency: 2, amount: 100 },
          entertainment: { frequency: 3, amount: 50 },
          haircare: { frequency: 1, amount: 50 },
        },
        subscriptions: new Set(["netflix", "hulu", "spotify", "chatgpt", "gym", "nyt"]),
      },
    };

    const selected = presets[preset];
    setFixedExpenses(selected.fixed);
    setFrequencyData(selected.frequency);
    setSelectedSubscriptions(selected.subscriptions);
    setCustomSubAmounts({});
    setIsOpen(true);
    setCurrentStepIndex(steps.length - 1); // Jump to results
  };

  // Save budget to server
  const handleSaveBudget = async () => {
    if (!user) return;

    setSavingBudget(true);
    setSavedMessage(null);

    try {
      const { data, error } = await budgetApi.save({
        fixedExpenses,
        frequencyData,
        selectedSubscriptions: Array.from(selectedSubscriptions),
        customSubAmounts,
        monthlyIncome,
      });

      if (error) throw new Error(error);

      setSavedMessage("Budget saved!");
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSavedMessage("Failed to save");
      setTimeout(() => setSavedMessage(null), 3000);
    } finally {
      setSavingBudget(false);
    }
  };

  // Handle transaction created from receipt scan or manual entry
  const handleTransactionCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setDirection(1);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep.type === "fixed") {
      setFixedExpenses({ ...fixedExpenses, [currentStep.data.id]: 0 });
    }
    handleNext();
  };

  const handleFixedChange = (id: string, value: string) => {
    setFixedExpenses({ ...fixedExpenses, [id]: parseFloat(value) || 0 });
  };

  const handleFrequencySelect = (id: string, type: "frequency" | "amount", value: number) => {
    setFrequencyData({
      ...frequencyData,
      [id]: { ...frequencyData[id], [type]: value },
    });
  };

  const toggleSubscription = (id: string) => {
    const newSet = new Set(selectedSubscriptions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSubscriptions(newSet);
  };

  const handleCustomSubAmount = (category: string, value: string) => {
    setCustomSubAmounts({ ...customSubAmounts, [category]: parseFloat(value) || 0 });
  };

  // Calculate totals
  const calculateTotals = () => {
    let needs = 0;
    let wants = 0;
    let savings = 0;

    FIXED_EXPENSES.forEach(exp => {
      const amount = fixedExpenses[exp.id] || 0;
      if (exp.category === "needs") needs += amount;
      else if (exp.category === "wants") wants += amount;
      else savings += amount;
    });

    FREQUENCY_QUESTIONS.forEach(q => {
      const data = frequencyData[q.id];
      if (data) {
        const amount = (data.frequency || 0) * (data.amount || 0);
        if (q.category === "needs") needs += amount;
        else if (q.category === "wants") wants += amount;
        else savings += amount;
      }
    });

    // Subscriptions (all wants) + custom amounts
    Object.entries(SUBSCRIPTIONS).forEach(([catKey, category]) => {
      category.items.forEach(item => {
        if (selectedSubscriptions.has(item.id)) {
          wants += item.price;
        }
      });
      // Add custom amount for this category
      wants += customSubAmounts[catKey] || 0;
    });

    return { needs, wants, savings, total: needs + wants + savings };
  };

  const { needs, wants, savings, total } = calculateTotals();
  const needsPercent = monthlyIncome > 0 ? (needs / monthlyIncome) * 100 : 0;
  const wantsPercent = monthlyIncome > 0 ? (wants / monthlyIncome) * 100 : 0;
  const savingsPercent = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const leftover = monthlyIncome - total;

  // Calculate subscription totals
  const subscriptionTotal = Object.entries(SUBSCRIPTIONS).reduce((sum, [catKey, category]) => {
    const catSum = category.items.reduce((s, item) => s + (selectedSubscriptions.has(item.id) ? item.price : 0), 0);
    return sum + catSum + (customSubAmounts[catKey] || 0);
  }, 0);

  // Count subscriptions by category for recommendations
  const getSubCountByCategory = (catKey: string) => {
    const category = SUBSCRIPTIONS[catKey as keyof typeof SUBSCRIPTIONS];
    return category.items.filter(item => selectedSubscriptions.has(item.id)).length;
  };

  const getRecommendations = () => {
    const recommendations: { type: "success" | "warning" | "danger"; message: string }[] = [];

    // Housing check
    const housingPercent = monthlyIncome > 0 ? ((fixedExpenses.housing || 0) / monthlyIncome) * 100 : 0;
    if (housingPercent > 30) {
      recommendations.push({
        type: "danger",
        message: `Housing is ${housingPercent.toFixed(0)}% of income - above the recommended 30%. Consider ways to reduce housing costs or increase income.`,
      });
    } else if (housingPercent > 0 && housingPercent <= 30) {
      recommendations.push({
        type: "success",
        message: `Housing at ${housingPercent.toFixed(0)}% is within the recommended 30%.`,
      });
    }

    // Multiple streaming services
    const streamingCount = getSubCountByCategory("streaming");
    if (streamingCount >= 4) {
      recommendations.push({
        type: "warning",
        message: `You have ${streamingCount} streaming services. Consider rotating subscriptions monthly or using free ad-supported tiers to save money.`,
      });
    }

    // Multiple music services
    const musicCount = getSubCountByCategory("music");
    if (musicCount >= 2) {
      const musicSubs = SUBSCRIPTIONS.music.items.filter(item => selectedSubscriptions.has(item.id));
      const musicTotal = musicSubs.reduce((sum, item) => sum + item.price, 0);
      recommendations.push({
        type: "warning",
        message: `You have ${musicCount} music services ($${musicTotal.toFixed(0)}/mo). Consider consolidating to just one - they all have similar libraries.`,
      });
    }

    // Multiple AI subscriptions
    const aiCount = getSubCountByCategory("ai");
    if (aiCount >= 3) {
      recommendations.push({
        type: "warning",
        message: `You have ${aiCount} AI subscriptions. Consider which ones you actually use weekly and cancel the rest.`,
      });
    }

    // Multiple fitness subscriptions
    const fitnessCount = getSubCountByCategory("fitness");
    if (fitnessCount >= 2) {
      recommendations.push({
        type: "warning",
        message: `Multiple fitness subscriptions detected. Make sure you're actively using each one - unused gym memberships are a common money leak.`,
      });
    }

    // Meal kit services
    const mealKits = ["hellofresh", "bluapron", "factor"].filter(id => selectedSubscriptions.has(id));
    if (mealKits.length > 0) {
      const mealKitTotal = mealKits.reduce((sum, id) => {
        const item = SUBSCRIPTIONS.boxes.items.find(i => i.id === id);
        return sum + (item?.price || 0);
      }, 0);
      recommendations.push({
        type: "warning",
        message: `Meal kits cost $${mealKitTotal.toFixed(0)}/mo. While convenient, you could save 50-70% by grocery shopping and meal prepping.`,
      });
    }

    // Total subscriptions warning
    if (subscriptionTotal > monthlyIncome * 0.05) {
      recommendations.push({
        type: "warning",
        message: `Total subscriptions: $${subscriptionTotal.toFixed(0)}/mo ($${(subscriptionTotal * 12).toFixed(0)}/year). Do an annual audit - cancel anything you haven't used in 30 days.`,
      });
    }

    // Coffee habit
    const coffeeData = frequencyData.coffee;
    if (coffeeData && coffeeData.frequency * coffeeData.amount > 100) {
      const coffeeTotal = coffeeData.frequency * coffeeData.amount;
      recommendations.push({
        type: "warning",
        message: `Coffee habit: $${coffeeTotal.toFixed(0)}/mo ($${(coffeeTotal * 12).toFixed(0)}/year). Cutting in half could save $${(coffeeTotal * 6).toFixed(0)}/year.`,
      });
    }

    // Dining out
    const diningData = frequencyData.dining;
    if (diningData && diningData.frequency * diningData.amount > monthlyIncome * 0.08) {
      const diningTotal = diningData.frequency * diningData.amount;
      recommendations.push({
        type: "warning",
        message: `Dining out: ${((diningTotal / monthlyIncome) * 100).toFixed(0)}% of income. Cooking 2 more meals at home per week could save $${(diningData.amount * 8).toFixed(0)}/mo.`,
      });
    }

    // 50/30/20 checks
    if (needsPercent > 50) {
      recommendations.push({
        type: "danger",
        message: `Essential expenses are ${needsPercent.toFixed(0)}% of income (target: 50%). Look for areas to reduce fixed costs.`,
      });
    } else if (needsPercent <= 50 && needsPercent > 0) {
      recommendations.push({
        type: "success",
        message: `Needs at ${needsPercent.toFixed(0)}% - nicely within the 50% guideline!`,
      });
    }

    if (wantsPercent > 30) {
      recommendations.push({
        type: "warning",
        message: `Wants/lifestyle spending is ${wantsPercent.toFixed(0)}% (target: 30%). Prioritize what truly brings you joy.`,
      });
    }

    if (savingsPercent < 10 && monthlyIncome > 0) {
      recommendations.push({
        type: "danger",
        message: `Only saving ${savingsPercent.toFixed(0)}%. Aim for 20% - even small increases help. Try automating savings on payday.`,
      });
    } else if (savingsPercent >= 20) {
      recommendations.push({
        type: "success",
        message: `Excellent! Saving ${savingsPercent.toFixed(0)}% puts you on track for financial independence.`,
      });
    } else if (savingsPercent >= 10) {
      recommendations.push({
        type: "success",
        message: `Saving ${savingsPercent.toFixed(0)}% - good start! Try to gradually increase to 20%.`,
      });
    }

    // Leftover money
    if (leftover < 0) {
      recommendations.push({
        type: "danger",
        message: `You're spending $${Math.abs(leftover).toFixed(0)} more than you earn! Review all categories and make cuts immediately.`,
      });
    } else if (leftover > monthlyIncome * 0.1) {
      recommendations.push({
        type: "success",
        message: `$${leftover.toFixed(0)} unallocated each month. Consider increasing savings/investments or building a larger emergency fund.`,
      });
    }

    // Credit card debt
    const ccPayment = fixedExpenses.credit_cards || 0;
    if (ccPayment > monthlyIncome * 0.1) {
      recommendations.push({
        type: "danger",
        message: `Credit card payments are ${((ccPayment / monthlyIncome) * 100).toFixed(0)}% of income. Consider the avalanche or snowball method to accelerate payoff.`,
      });
    }

    // Personal cash spending
    const personalCash = fixedExpenses.personal_cash || 0;
    if (personalCash > monthlyIncome * 0.05) {
      recommendations.push({
        type: "warning",
        message: `Untracked cash spending is ${((personalCash / monthlyIncome) * 100).toFixed(0)}% of income. Try tracking where this goes for one month.`,
      });
    }

    // Smoking habit
    const smokingData = frequencyData.smoking;
    if (smokingData && smokingData.frequency * smokingData.amount > 0) {
      const smokingTotal = smokingData.frequency * smokingData.amount;
      const yearlySmoke = smokingTotal * 12;
      recommendations.push({
        type: "danger",
        message: `Smoking costs $${smokingTotal.toFixed(0)}/mo ($${yearlySmoke.toFixed(0)}/year). Quitting or cutting back significantly improves both health and finances.`,
      });
    }

    // Drinking/Alcohol
    const drinkingData = frequencyData.drinking;
    if (drinkingData && drinkingData.frequency * drinkingData.amount > monthlyIncome * 0.05) {
      const drinkingTotal = drinkingData.frequency * drinkingData.amount;
      recommendations.push({
        type: "warning",
        message: `Alcohol spending: $${drinkingTotal.toFixed(0)}/mo (${((drinkingTotal / monthlyIncome) * 100).toFixed(0)}% of income). Consider cutting bar nights in half to save $${(drinkingTotal * 6).toFixed(0)}/year.`,
      });
    }

    // Gambling
    const gamblingData = frequencyData.gambling;
    if (gamblingData && gamblingData.frequency * gamblingData.amount > 0) {
      const gamblingTotal = gamblingData.frequency * gamblingData.amount;
      if (gamblingTotal > monthlyIncome * 0.02) {
        recommendations.push({
          type: "danger",
          message: `Gambling/lottery: $${gamblingTotal.toFixed(0)}/mo. This is ${((gamblingTotal / monthlyIncome) * 100).toFixed(1)}% of income going to negative expected value activities. Set a strict limit or consider stopping.`,
        });
      } else if (gamblingTotal > 0) {
        recommendations.push({
          type: "warning",
          message: `Gambling/lottery: $${gamblingTotal.toFixed(0)}/mo ($${(gamblingTotal * 12).toFixed(0)}/year). Keep this strictly entertainment-only with a fixed budget.`,
        });
      }
    }

    // Child support / garnishments warning
    const childSupport = fixedExpenses.child_support || 0;
    const garnishments = fixedExpenses.garnishments || 0;
    const alimony = fixedExpenses.alimony || 0;
    const legalObligations = childSupport + garnishments + alimony;
    if (legalObligations > monthlyIncome * 0.25) {
      recommendations.push({
        type: "danger",
        message: `Legal obligations take ${((legalObligations / monthlyIncome) * 100).toFixed(0)}% of income. This leaves very little flexibility - focus on essential expenses only.`,
      });
    }

    // Other loans / payday warning
    const otherLoans = fixedExpenses.other_loans || 0;
    if (otherLoans > 0) {
      recommendations.push({
        type: "warning",
        message: `Other loans: $${otherLoans.toFixed(0)}/mo. If these are high-interest (payday, personal), prioritize paying them off aggressively.`,
      });
    }

    // Rideshare spending
    const rideshareData = frequencyData.rideshare;
    if (rideshareData && rideshareData.frequency * rideshareData.amount > monthlyIncome * 0.05) {
      const rideshareTotal = rideshareData.frequency * rideshareData.amount;
      recommendations.push({
        type: "warning",
        message: `Rideshare costs: $${rideshareTotal.toFixed(0)}/mo. Consider transit, biking, or carpooling to reduce this significant expense.`,
      });
    }

    // Entertainment spending
    const entertainmentData = frequencyData.entertainment;
    if (entertainmentData && entertainmentData.frequency * entertainmentData.amount > monthlyIncome * 0.05) {
      const entertainmentTotal = entertainmentData.frequency * entertainmentData.amount;
      recommendations.push({
        type: "warning",
        message: `Entertainment: $${entertainmentTotal.toFixed(0)}/mo. Look for free community events, matinee prices, or use rewards points.`,
      });
    }

    // Debt-to-income ratio
    const carPayment = fixedExpenses.car_payment || 0;
    const ccPayments = fixedExpenses.credit_cards || 0;
    const studentLoans = fixedExpenses.student_loans || 0;
    const totalDebtPayments = carPayment + ccPayments + studentLoans + otherLoans + legalObligations;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebtPayments / monthlyIncome) * 100 : 0;
    if (debtToIncomeRatio > 43) {
      recommendations.push({
        type: "danger",
        message: `Debt-to-income ratio: ${debtToIncomeRatio.toFixed(0)}%. Above 43% makes it hard to qualify for loans. Focus on debt payoff before new borrowing.`,
      });
    } else if (debtToIncomeRatio > 36) {
      recommendations.push({
        type: "warning",
        message: `Debt-to-income ratio: ${debtToIncomeRatio.toFixed(0)}%. You're approaching the limit where lenders get cautious (36-43%).`,
      });
    } else if (debtToIncomeRatio > 0 && debtToIncomeRatio <= 20) {
      recommendations.push({
        type: "success",
        message: `Debt-to-income ratio: ${debtToIncomeRatio.toFixed(0)}%. Healthy level - you have good financial flexibility.`,
      });
    }

    // Generous giving recognition
    const donationsData = frequencyData.donations;
    if (donationsData && donationsData.frequency * donationsData.amount > monthlyIncome * 0.03) {
      const donationsTotal = donationsData.frequency * donationsData.amount;
      recommendations.push({
        type: "success",
        message: `Charitable giving: $${donationsTotal.toFixed(0)}/mo. Generous! Remember to track for tax deductions.`,
      });
    }

    return recommendations;
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  if (!isOpen) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
            <PiggyBank className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Interactive Budget Builder</h3>
          <p className="text-muted-foreground mb-4">
            Answer easy questions about your spending habits to get personalized budget recommendations.
          </p>
          <Button onClick={handleStart} className="gap-2 mb-4">
            Start Interactive Budget
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-muted-foreground mb-3">Or quick start with a preset lifestyle:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => applyPreset("minimal")}
                className="px-3 py-1.5 text-xs rounded-full border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                aria-label="Apply minimal spending preset"
              >
                Minimal Spender
              </button>
              <button
                onClick={() => applyPreset("moderate")}
                className="px-3 py-1.5 text-xs rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                aria-label="Apply moderate lifestyle preset"
              >
                Moderate Lifestyle
              </button>
              <button
                onClick={() => applyPreset("comfortable")}
                className="px-3 py-1.5 text-xs rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                aria-label="Apply comfortable living preset"
              >
                Comfortable Living
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderStepContent = () => {
    if (currentStep.type === "fixed") {
      const exp = currentStep.data;
      const value = fixedExpenses[exp.id] || 0;
      const Icon = exp.icon;

      return (
        <div className="text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
          <p className="text-muted-foreground mb-4">{exp.question}</p>

          <div className="max-w-xs mx-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={value || ""}
                onChange={(e) => handleFixedChange(exp.id, e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={exp.placeholder}
                className="w-full h-14 pl-8 pr-4 text-2xl text-center rounded-lg border bg-background font-mono focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
              />
            </div>
            {monthlyIncome > 0 && value > 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {((value / monthlyIncome) * 100).toFixed(1)}% of income
                <span className={cn(
                  "ml-2",
                  (value / monthlyIncome) > exp.guideline ? "text-yellow-500" : "text-green-500"
                )}>
                  (guideline: {(exp.guideline * 100).toFixed(0)}%)
                </span>
              </div>
            )}
            {exp.optional && (
              <button
                onClick={handleSkip}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground underline"
              >
                Skip (I don't have this expense)
              </button>
            )}
          </div>
        </div>
      );
    }

    if (currentStep.type === "frequency") {
      const q = currentStep.data;
      const data = frequencyData[q.id] || { frequency: 0, amount: 0 };
      const Icon = q.icon;
      const monthlyTotal = data.frequency * data.amount;

      return (
        <div className="text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{q.title}</h3>
          <p className="text-muted-foreground mb-4">{q.question}</p>

          <div className="space-y-4 max-w-sm mx-auto">
            <div>
              <label className="text-sm font-medium block mb-2">{q.frequencyLabel}</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {q.frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFrequencySelect(q.id, "frequency", opt.value)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm border transition-all",
                      data.frequency === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted border-border"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {data.frequency > 0 && (
              <div>
                <label className="text-sm font-medium block mb-2">{q.amountLabel}</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {q.amountOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFrequencySelect(q.id, "amount", opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm border transition-all",
                        data.amount === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted border-border"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {monthlyTotal > 0 && (
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <span className="text-sm text-muted-foreground">Monthly total: </span>
                <span className="font-bold text-lg">${monthlyTotal.toFixed(0)}</span>
                {monthlyIncome > 0 && (
                  <span className={cn(
                    "text-sm ml-2",
                    (monthlyTotal / monthlyIncome) > q.guideline ? "text-yellow-500" : "text-green-500"
                  )}>
                    ({((monthlyTotal / monthlyIncome) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentStep.type === "subscriptions") {
      const catKey = currentStep.category;
      const category = SUBSCRIPTIONS[catKey];
      const Icon = category.icon;
      const categoryItemTotal = category.items.reduce((sum, item) =>
        sum + (selectedSubscriptions.has(item.id) ? item.price : 0), 0
      );
      const customAmount = customSubAmounts[catKey] || 0;
      const categoryTotal = categoryItemTotal + customAmount;

      return (
        <div className="text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{category.title}</h3>
          <p className="text-muted-foreground mb-4">Select all that you subscribe to</p>

          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto max-h-48 overflow-y-auto">
            {category.items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSubscription(item.id)}
                className={cn(
                  "p-2 rounded-lg text-left border transition-all flex items-center justify-between",
                  selectedSubscriptions.has(item.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted border-border"
                )}
              >
                <div>
                  <div className="font-medium text-xs">{item.name}</div>
                  <div className="text-xs text-muted-foreground">${item.price}/mo</div>
                </div>
                {selectedSubscriptions.has(item.id) && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Custom/Other amount */}
          <div className="mt-4 max-w-xs mx-auto">
            <label className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-2">
              <Plus className="h-3 w-3" />
              Other {category.title.toLowerCase()} not listed
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={customAmount || ""}
                onChange={(e) => handleCustomSubAmount(catKey, e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0"
                className="w-full h-10 pl-7 pr-4 text-center rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
              />
            </div>
          </div>

          {categoryTotal > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Category total: </span>
              <span className="font-bold">${categoryTotal.toFixed(2)}/mo</span>
            </div>
          )}
        </div>
      );
    }

    if (currentStep.type === "results") {
      return (
        <div>
          <div className="text-center mb-6">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Your Budget Analysis</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-500">{needsPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Needs</div>
              <div className="text-xs font-medium">${needs.toFixed(0)}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-2xl font-bold text-purple-500">{wantsPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Wants</div>
              <div className="text-xs font-medium">${wants.toFixed(0)}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-500">{savingsPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Savings</div>
              <div className="text-xs font-medium">${savings.toFixed(0)}</div>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Monthly Income</span>
              <span className="font-bold">${monthlyIncome.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Spending</span>
              <span className="font-bold">${total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="pl-2">↳ Subscriptions</span>
              <span>${subscriptionTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Leftover</span>
              <span className={cn("font-bold", leftover >= 0 ? "text-green-500" : "text-red-500")}>
                ${leftover.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            <h4 className="font-semibold sticky top-0 bg-background py-1">Recommendations</h4>
            {getRecommendations().map((rec, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg flex gap-3 items-start text-sm",
                  rec.type === "success" && "bg-green-500/10 text-green-700 dark:text-green-400",
                  rec.type === "warning" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                  rec.type === "danger" && "bg-red-500/10 text-red-700 dark:text-red-400"
                )}
              >
                {rec.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{rec.message}</span>
              </div>
            ))}
          </div>

          {/* Save Budget & Expense Tracking */}
          {user && (
            <div className="mt-6 space-y-4 border-t pt-4">
              {/* Save Budget Button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveBudget}
                  disabled={savingBudget}
                  className="gap-2"
                >
                  {savingBudget ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Budget
                </Button>
                {savedMessage && (
                  <span className={cn(
                    "text-sm",
                    savedMessage.includes("Failed") ? "text-destructive" : "text-green-600"
                  )}>
                    {savedMessage}
                  </span>
                )}
              </div>

              {/* Expense Tracking Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Track Your Actual Spending
                </h4>
                <ReceiptUpload onTransactionCreated={handleTransactionCreated} />
                <TransactionList
                  onAddNew={() => setShowAddForm(true)}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex justify-between items-center px-4 pt-3">
          <span className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-muted"
            aria-label="Close budget builder"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 pt-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            {currentStep.type === "results" ? (
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Done
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                {currentStepIndex === totalSteps - 2 ? "See Results" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Manual Transaction Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <ManualTransactionForm
            onClose={() => setShowAddForm(false)}
            onCreated={handleTransactionCreated}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}

/**
 * Interactive Budget wrapped with AuthGuard.
 * Requires login to use the budget builder and expense tracking features.
 */
export function ProtectedInteractiveBudget({ monthlyIncome }: InteractiveBudgetProps) {
  return (
    <AuthGuard>
      <InteractiveBudget monthlyIncome={monthlyIncome} />
    </AuthGuard>
  );
}
