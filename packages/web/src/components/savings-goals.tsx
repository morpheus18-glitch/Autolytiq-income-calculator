import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, Trash2, Edit2, Plane, Car, Home,
  GraduationCap, Smartphone, Gift, Wallet, PiggyBank, TrendingUp,
  Calendar, Sparkles, ChevronDown, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "savings-goals";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline?: string;
  weeklyContribution?: number;
  createdAt: string;
}

const GOAL_ICONS: Record<string, typeof Target> = {
  target: Target,
  plane: Plane,
  car: Car,
  home: Home,
  graduation: GraduationCap,
  phone: Smartphone,
  gift: Gift,
  wallet: Wallet,
  piggy: PiggyBank,
};

const GOAL_COLORS = [
  { id: "emerald", class: "bg-emerald-500", text: "text-emerald-500" },
  { id: "blue", class: "bg-blue-500", text: "text-blue-500" },
  { id: "purple", class: "bg-purple-500", text: "text-purple-500" },
  { id: "amber", class: "bg-amber-500", text: "text-amber-500" },
  { id: "rose", class: "bg-rose-500", text: "text-rose-500" },
  { id: "cyan", class: "bg-cyan-500", text: "text-cyan-500" },
];

const PRESET_GOALS = [
  { name: "Emergency Fund", icon: "wallet", target: 10000, color: "emerald" },
  { name: "Vacation", icon: "plane", target: 3000, color: "blue" },
  { name: "New Car", icon: "car", target: 15000, color: "purple" },
  { name: "Down Payment", icon: "home", target: 50000, color: "amber" },
  { name: "New Phone", icon: "phone", target: 1200, color: "cyan" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function calculateWeeksToGoal(remaining: number, weeklyContribution: number): number {
  if (weeklyContribution <= 0) return Infinity;
  return Math.ceil(remaining / weeklyContribution);
}

function calculateTargetDate(weeks: number): string {
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface GoalCardProps {
  goal: SavingsGoal;
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
}

function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [addAmount, setAddAmount] = useState("");

  const progress = goal.targetAmount > 0
    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
    : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isComplete = goal.currentAmount >= goal.targetAmount;

  const IconComponent = GOAL_ICONS[goal.icon] || Target;
  const colorClass = GOAL_COLORS.find(c => c.id === goal.color) || GOAL_COLORS[0];

  const weeklyContribution = goal.weeklyContribution || 0;
  const weeksToGoal = calculateWeeksToGoal(remaining, weeklyContribution);
  const estimatedDate = weeksToGoal < 1000 ? calculateTargetDate(weeksToGoal) : null;

  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      onUpdate(goal.id, { currentAmount: goal.currentAmount + amount });
      setAddAmount("");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "p-4 rounded-xl border transition-all",
        isComplete
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-card border-border/50 hover:border-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colorClass.class + "/10")}>
            <IconComponent className={cn("h-5 w-5", colorClass.text)} />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {goal.name}
              {isComplete && <Sparkles className="h-4 w-4 text-amber-500" />}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isComplete ? "Goal reached!" : `${formatCurrency(remaining)} to go`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-mono">{formatCurrency(goal.currentAmount)}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
          <span className="font-mono">{formatCurrency(goal.targetAmount)}</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("h-full rounded-full", colorClass.class)}
          />
        </div>
      </div>

      {/* Weekly contribution & ETA */}
      {weeklyContribution > 0 && !isComplete && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 p-2 rounded-lg bg-secondary/50">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatCurrency(weeklyContribution)}/week
          </span>
          {estimatedDate && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              Goal by {estimatedDate}
            </span>
          )}
        </div>
      )}

      {/* Add funds section */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t border-border/50"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  placeholder="Add amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="pl-7 h-9"
                  onKeyDown={(e) => e.key === "Enter" && handleAddFunds()}
                />
              </div>
              <Button size="sm" onClick={handleAddFunds} className="h-9">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div>
              <Label className="text-xs">Weekly contribution</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={goal.weeklyContribution || ""}
                  onChange={(e) => onUpdate(goal.id, { weeklyContribution: parseFloat(e.target.value) || 0 })}
                  className="pl-7 h-9"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Trade-off suggestions */}
            {remaining > 0 && weeklyContribution === 0 && (
              <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-2">
                  Quick ways to save {formatCurrency(50)}/week:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>- Skip 2 coffees + 1 lunch out</li>
                  <li>- Cancel 1 streaming service + pack lunch 2x</li>
                  <li>- Cook dinner 3 more nights</li>
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SavingsGoalsProps {
  className?: string;
  monthlyIncome?: number;
}

export function SavingsGoals({ className }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    icon: "target",
    color: "emerald",
  });

  // Load goals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setGoals(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load goals:", e);
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error("Failed to save goals:", e);
    }
  }, [goals]);

  const addGoal = (preset?: typeof PRESET_GOALS[0]) => {
    const goal: SavingsGoal = preset
      ? {
          id: generateId(),
          name: preset.name,
          targetAmount: preset.target,
          currentAmount: 0,
          icon: preset.icon,
          color: preset.color,
          createdAt: new Date().toISOString(),
        }
      : {
          id: generateId(),
          name: newGoal.name,
          targetAmount: parseFloat(newGoal.targetAmount) || 0,
          currentAmount: 0,
          icon: newGoal.icon,
          color: newGoal.color,
          createdAt: new Date().toISOString(),
        };

    if (goal.name && goal.targetAmount > 0) {
      setGoals([...goals, goal]);
      setShowAddForm(false);
      setNewGoal({ name: "", targetAmount: "", icon: "target", color: "emerald" });
    }
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <Card className={cn("glass-card border-none shadow-xl", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Savings Goals
          </CardTitle>
          <Button
            size="sm"
            className="gap-1"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? "Close" : "Add Goal"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Goal Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
                {/* Preset goals */}
                <div>
                  <Label className="text-xs text-muted-foreground">Quick Start</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PRESET_GOALS.map((preset) => {
                      const Icon = GOAL_ICONS[preset.icon];
                      return (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-8"
                          onClick={() => addGoal(preset)}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {preset.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-secondary/30 px-2 text-muted-foreground">Or custom</span>
                  </div>
                </div>

                {/* Custom goal form */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Goal Name</Label>
                    <Input
                      placeholder="e.g., New Laptop"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        className="pl-7 h-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Icon</Label>
                    <div className="flex gap-1 mt-1">
                      {Object.entries(GOAL_ICONS).map(([key, Icon]) => (
                        <Button
                          key={key}
                          variant={newGoal.icon === key ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setNewGoal({ ...newGoal, icon: key })}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-1 mt-1">
                      {GOAL_COLORS.map((color) => (
                        <button
                          key={color.id}
                          className={cn(
                            "h-8 w-8 rounded-full transition-all",
                            color.class,
                            newGoal.color === color.id
                              ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                              : "opacity-50 hover:opacity-100"
                          )}
                          onClick={() => setNewGoal({ ...newGoal, color: color.id })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => addGoal()}>
                  Create Goal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overall progress */}
        {goals.length > 0 && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total Progress</span>
              <span className="text-sm">
                <span className="font-mono font-bold text-primary">{formatCurrency(totalSaved)}</span>
                <span className="text-muted-foreground"> / {formatCurrency(totalTarget)}</span>
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {Math.round(overallProgress)}% of all goals
            </div>
          </div>
        )}

        {/* Goals list */}
        <AnimatePresence mode="popLayout">
          {goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No savings goals yet</p>
              <p className="text-xs">Click "Add Goal" to get started</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={updateGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Motivational tip */}
        {goals.length > 0 && totalSaved > 0 && (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {totalSaved >= totalTarget
                ? "Amazing! You've reached all your savings goals!"
                : overallProgress >= 50
                  ? `You're more than halfway there! Keep going!`
                  : `Great start! You've saved ${formatCurrency(totalSaved)} so far.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
