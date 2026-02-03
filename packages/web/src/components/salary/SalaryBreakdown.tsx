import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Minus, MapPin, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type SalaryData, formatSalary, formatGrowthOutlook } from "@/data/salaries";

interface SalaryBreakdownProps {
  data: SalaryData;
}

function GrowthIndicator({ outlook, rate }: { outlook: SalaryData['growthOutlook']; rate: number }) {
  const colors = {
    declining: 'text-destructive',
    stable: 'text-yellow-500',
    growing: 'text-emerald-500',
    fast: 'text-emerald-500',
  };

  const icons = {
    declining: <TrendingDown className="h-4 w-4" />,
    stable: <Minus className="h-4 w-4" />,
    growing: <TrendingUp className="h-4 w-4" />,
    fast: <TrendingUp className="h-4 w-4" />,
  };

  return (
    <div className={`flex items-center gap-1 ${colors[outlook]}`}>
      {icons[outlook]}
      <span className="font-medium">{rate}%</span>
    </div>
  );
}

export function SalaryBreakdown({ data }: SalaryBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Main Salary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              {data.title} Salary Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
                <div className="text-xs text-muted-foreground mb-1">Median Salary</div>
                <div className="text-2xl font-bold text-primary mono-value">
                  {formatSalary(data.median)}
                </div>
                <div className="text-xs text-muted-foreground">per year</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground mb-1">Entry Level</div>
                <div className="text-xl font-bold mono-value">
                  {formatSalary(data.entry)}
                </div>
                <div className="text-xs text-muted-foreground">0-2 years</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground mb-1">Mid Career</div>
                <div className="text-xl font-bold mono-value">
                  {formatSalary(data.mid)}
                </div>
                <div className="text-xs text-muted-foreground">5-10 years</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground mb-1">Senior Level</div>
                <div className="text-xl font-bold mono-value text-emerald-500">
                  {formatSalary(data.senior)}
                </div>
                <div className="text-xs text-muted-foreground">10+ years</div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Salary Range (Percentiles)</h4>
              <div className="relative h-8 rounded-full bg-muted/50 overflow-hidden">
                {/* 10th to 90th percentile bar */}
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500/50 via-primary/50 to-emerald-500/50 rounded-full"
                  style={{
                    left: `${(data.percentile10 / data.percentile90) * 40}%`,
                    right: '0%',
                  }}
                />
                {/* Median marker */}
                <div
                  className="absolute top-0 h-full w-1 bg-primary"
                  style={{ left: `${(data.median / data.percentile90) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>10th: {formatSalary(data.percentile10)}</span>
                <span>25th: {formatSalary(data.percentile25)}</span>
                <span className="font-medium text-primary">Median: {formatSalary(data.median)}</span>
                <span>75th: {formatSalary(data.percentile75)}</span>
                <span>90th: {formatSalary(data.percentile90)}</span>
              </div>
            </div>

            {/* Pay Periods */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Hourly</div>
                <div className="font-bold mono-value text-sm">
                  {formatSalary(Math.round(data.median / 2080))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Weekly</div>
                <div className="font-bold mono-value text-sm">
                  {formatSalary(Math.round(data.median / 52))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Bi-weekly</div>
                <div className="font-bold mono-value text-sm">
                  {formatSalary(Math.round(data.median / 26))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Monthly</div>
                <div className="font-bold mono-value text-sm">
                  {formatSalary(Math.round(data.median / 12))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Paying States */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <MapPin className="h-5 w-5 text-emerald-500" />
              </div>
              Highest Paying States
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {data.topStates.map((state, index) => (
                <div
                  key={state.state}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
                >
                  <div className="text-lg font-bold text-muted-foreground/50 w-6">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{state.state}</div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/50"
                        style={{
                          width: `${(state.salary / data.topStates[0].salary) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="font-bold mono-value text-emerald-500">
                    {formatSalary(state.salary)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Outlook */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              Job Outlook & Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <div className="text-sm text-muted-foreground mb-2">Job Growth (2022-2032)</div>
                <div className="flex items-center gap-2">
                  <GrowthIndicator outlook={data.growthOutlook} rate={data.growthRate} />
                  <span className="text-sm text-muted-foreground">
                    {formatGrowthOutlook(data.growthOutlook)}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <div className="text-sm text-muted-foreground mb-2">Education Required</div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{data.education}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
