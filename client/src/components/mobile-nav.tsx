import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calculator, PiggyBank, Home, Car, BookOpen, LogIn, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AutolytiqLogo } from "./icons";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/smart-money", label: "Budget Planner", icon: PiggyBank },
  { href: "/housing", label: "Housing", icon: Home },
  { href: "/auto", label: "Auto Guide", icon: Car },
  { href: "/blog", label: "Blog", icon: BookOpen },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="relative z-50 p-2 rounded-lg hover:bg-secondary/50 transition-colors touch-target"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-40 w-[280px] bg-card border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link href="/" onClick={closeMenu}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <AutolytiqLogo className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold">Autolytiq</span>
                </div>
              </Link>
              <ThemeToggle />
            </div>

            {/* Navigation Links */}
            <div className="py-4">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors touch-target",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="mobile-nav-indicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-border" />

            {/* Auth Section */}
            <div className="py-4">
              {user ? (
                <>
                  <Link href="/desk" onClick={closeMenu}>
                    <div className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-secondary/50 transition-colors touch-target">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-sm">My Dashboard</span>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-secondary/50 transition-colors w-full text-left touch-target"
                  >
                    <LogIn className="h-5 w-5 text-muted-foreground rotate-180" />
                    <span className="font-medium text-sm text-muted-foreground">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu}>
                    <div className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-secondary/50 transition-colors touch-target">
                      <LogIn className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Sign In</span>
                    </div>
                  </Link>
                  <Link href="/signup" onClick={closeMenu}>
                    <div className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg bg-primary text-primary-foreground touch-target">
                      <User className="h-5 w-5" />
                      <span className="font-medium">Create Account</span>
                    </div>
                  </Link>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground text-center">
                Free financial tools for smarter decisions
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
