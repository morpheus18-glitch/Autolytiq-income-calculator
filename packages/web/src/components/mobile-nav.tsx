import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calculator, PiggyBank, Home, Car, BookOpen, LogIn, User, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AutolytiqLogo } from "./icons";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/calculator", label: "Income Calculator", icon: Calculator, description: "Calculate take-home pay" },
  { href: "/smart-money", label: "Budget Planner", icon: PiggyBank, description: "50/30/20 budgeting" },
  { href: "/housing", label: "Housing Guide", icon: Home, description: "Rent & mortgage planning" },
  { href: "/auto", label: "Auto Guide", icon: Car, description: "Car affordability" },
  { href: "/blog", label: "Blog", icon: BookOpen, description: "Financial tips & guides" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "relative z-[60] p-2.5 rounded-xl transition-all duration-200",
          isOpen
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
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

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white dark:bg-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
              <Link href="/" onClick={closeMenu}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500">
                    <AutolytiqLogo className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">Autolytiq</span>
                </div>
              </Link>
              <ThemeToggle />
            </div>

            {/* Navigation */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="px-4 py-6 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 180px)' }}
            >
              <motion.p variants={itemVariants} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                Tools
              </motion.p>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location === item.href || location.startsWith(item.href + '/');
                  return (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Link href={item.href} onClick={closeMenu}>
                        <div
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]",
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-500/10"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "p-3 rounded-xl",
                            isActive
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <span className={cn(
                              "font-semibold block",
                              isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                            )}>
                              {item.label}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {item.description}
                            </span>
                          </div>
                          <ChevronRight className={cn(
                            "h-5 w-5",
                            isActive ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                          )} />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="my-6 border-t border-slate-200 dark:border-slate-800" />

              {/* Account Section */}
              <motion.p variants={itemVariants} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                Account
              </motion.p>

              <div className="space-y-1">
                {user ? (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link href="/desk" onClick={closeMenu}>
                        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-all active:scale-[0.98]">
                          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold block text-slate-900 dark:text-white">Dashboard</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 truncate block max-w-[180px]">{user.email}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                        </div>
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <button
                        onClick={() => {
                          logout();
                          closeMenu();
                        }}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-all w-full active:scale-[0.98]"
                      >
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <LogIn className="h-5 w-5 rotate-180" />
                        </div>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link href="/login" onClick={closeMenu}>
                        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-all active:scale-[0.98]">
                          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <LogIn className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">Sign In</span>
                          <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 ml-auto" />
                        </div>
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Link href="/signup" onClick={closeMenu}>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all active:scale-[0.98]">
                          <div className="p-3 rounded-xl bg-white/20 text-white">
                            <User className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-white">Create Free Account</span>
                          <ChevronRight className="h-5 w-5 text-white/70 ml-auto" />
                        </div>
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Free financial tools for smarter money decisions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
