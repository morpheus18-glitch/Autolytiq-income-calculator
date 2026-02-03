import { motion } from "framer-motion";
import { TrendingUp, CreditCard, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculatePaymentApprovals,
  calculateLoanEstimates,
  formatCurrency,
  formatPercent,
  CREDIT_TIERS,
  type PaymentApproval,
} from "@/lib/pti-calculator";
import { cn } from "@/lib/utils";

interface PTISectionProps {
  monthlyIncome: number;
}

export function PTISection({ monthlyIncome }: PTISectionProps) {
  const paymentApprovals = calculatePaymentApprovals(monthlyIncome);
  const standardPayment = paymentApprovals.find((p) => p.type === "Standard");
  const loanEstimates = standardPayment
    ? calculateLoanEstimates(standardPayment.maxPayment)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Payment Approval Card */}
      <Card className="glass-card border-none shadow-xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Payment Approval Estimates
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Based on your projected monthly income, these are typical
                  payment amounts lenders may approve for auto loans.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">PTI Ratio</TableHead>
                <TableHead className="text-right">Max Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentApprovals.map((approval) => (
                <PaymentRow key={approval.type} approval={approval} />
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-3">
            PTI = Payment-to-Income ratio. Lower ratios mean easier approval.
          </p>
        </CardContent>
      </Card>

      {/* Loan Amount by Credit Score */}
      <Card className="glass-card border-none shadow-xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Loan Amount by Credit Score
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Based on a {formatCurrency(standardPayment?.maxPayment || 0)}/mo
                  payment (12% PTI) over 60 months. Better credit = lower APR =
                  higher loan amount.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Score</TableHead>
                <TableHead className="text-right">Est. APR</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanEstimates.map((estimate) => (
                <TableRow key={estimate.creditTier.name}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn("font-medium", estimate.creditTier.color)}>
                        {estimate.creditTier.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {estimate.creditTier.range}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {estimate.creditTier.apr.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold font-mono">
                      {formatCurrency(estimate.loanAmount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Example:</strong> With{" "}
              <span className="text-primary font-medium">Excellent</span> credit,
              a {formatCurrency(standardPayment?.maxPayment || 0)}/mo payment could
              finance up to{" "}
              <span className="font-bold">
                {formatCurrency(loanEstimates[0]?.loanAmount || 0)}
              </span>{" "}
              over 5 years.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <div className="grid grid-cols-2 gap-3">
        {CREDIT_TIERS.slice(0, 2).map((tier, i) => {
          const estimate = loanEstimates[i];
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border/50"
            >
              <div className={cn("text-sm font-medium", tier.color)}>
                {tier.name} Credit
              </div>
              <div className="text-2xl font-bold font-mono mt-1">
                {formatCurrency(estimate?.loanAmount || 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                max loan at {tier.apr}% APR
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function PaymentRow({ approval }: { approval: PaymentApproval }) {
  const isStandard = approval.type === "Standard";

  return (
    <TableRow className={isStandard ? "bg-primary/5" : ""}>
      <TableCell>
        <div className="flex flex-col">
          <span className={cn("font-medium", isStandard && "text-primary")}>
            {approval.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {approval.description}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono">
        {formatPercent(approval.ratio)}
      </TableCell>
      <TableCell className="text-right">
        <span className={cn("font-bold font-mono", isStandard && "text-primary")}>
          {formatCurrency(approval.maxPayment)}
        </span>
        <span className="text-xs text-muted-foreground">/mo</span>
      </TableCell>
    </TableRow>
  );
}
