import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Copy, Check, FolderOpen, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Scenario {
  id: string;
  name: string;
  timestamp: number;
  data: Record<string, unknown>;
}

interface ScenarioManagerProps {
  storageKey: string;
  currentData: Record<string, unknown>;
  onLoad: (data: Record<string, unknown>) => void;
  className?: string;
}

export function ScenarioManager({
  storageKey,
  currentData,
  onLoad,
  className,
}: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`${storageKey}-scenarios`);
    if (saved) {
      try {
        setScenarios(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load scenarios", e);
      }
    }
  }, [storageKey]);

  const saveScenarios = (newScenarios: Scenario[]) => {
    setScenarios(newScenarios);
    localStorage.setItem(`${storageKey}-scenarios`, JSON.stringify(newScenarios));
  };

  const handleSave = () => {
    if (!saveName.trim()) return;

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: saveName.trim(),
      timestamp: Date.now(),
      data: currentData,
    };

    saveScenarios([...scenarios, newScenario]);
    setSaveName("");
    setShowSaveInput(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    saveScenarios(scenarios.filter((s) => s.id !== id));
  };

  const handleLoad = (scenario: Scenario) => {
    onLoad(scenario.data);
    setIsOpen(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        {/* Quick Save Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveInput(!showSaveInput)}
          className="gap-2"
        >
          {justSaved ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>

        {/* Load Scenarios Button */}
        {scenarios.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Load ({scenarios.length})
          </Button>
        )}
      </div>

      {/* Save Input */}
      <AnimatePresence>
        {showSaveInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border shadow-lg">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Scenario name..."
                className="w-40 px-3 py-1.5 text-sm rounded border bg-background outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button size="sm" onClick={handleSave} disabled={!saveName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveInput(false);
                  setSaveName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenarios Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 z-50 w-72"
          >
            <div className="rounded-lg bg-card border shadow-xl overflow-hidden">
              <div className="p-2 border-b bg-muted/30">
                <span className="text-sm font-medium">Saved Scenarios</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors group"
                  >
                    <button
                      onClick={() => handleLoad(scenario)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-sm">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(scenario.timestamp)}
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(scenario.id)}
                      className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {(isOpen || showSaveInput) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setShowSaveInput(false);
          }}
        />
      )}
    </div>
  );
}

interface CompareProps {
  scenarios: Array<{
    name: string;
    payment: number;
    total: number;
    interest: number;
  }>;
  formatCurrency: (value: number) => string;
  className?: string;
}

export function ScenarioComparison({ scenarios, formatCurrency, className }: CompareProps) {
  if (scenarios.length < 2) return null;

  const best = scenarios.reduce((a, b) => (a.total < b.total ? a : b));

  return (
    <div className={cn("p-4 rounded-xl bg-card border", className)}>
      <h3 className="font-semibold mb-3">Scenario Comparison</h3>
      <div className="space-y-3">
        {scenarios.map((scenario, i) => {
          const isBest = scenario === best;
          const diff = scenario.total - best.total;

          return (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                isBest ? "border-emerald-500/50 bg-emerald-500/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{scenario.name}</span>
                {isBest && (
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    Best Deal
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Payment</div>
                  <div className="font-mono">{formatCurrency(scenario.payment)}/mo</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Interest</div>
                  <div className="font-mono text-yellow-500">{formatCurrency(scenario.interest)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Total Cost</div>
                  <div className="font-mono">{formatCurrency(scenario.total)}</div>
                </div>
              </div>
              {!isBest && diff > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  +{formatCurrency(diff)} more than best option
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
