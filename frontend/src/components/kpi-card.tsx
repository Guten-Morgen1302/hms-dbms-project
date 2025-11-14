import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
}

export function KPICard({ title, value, icon: Icon, trend, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="p-6 rounded-2xl hover-elevate" data-testid={`card-kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {trend && (
            <div className={`text-xs font-semibold ${trend.isPositive ? 'text-chart-2' : 'text-destructive'}`}>
              {trend.value}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold tabular-nums" data-testid={`text-kpi-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
