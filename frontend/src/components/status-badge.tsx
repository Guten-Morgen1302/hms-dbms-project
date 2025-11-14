import { Badge } from "@/components/ui/badge";

type StatusVariant = "available" | "scheduled" | "completed" | "cancelled" | "pending" | "paid" | "overdue" | 
  "ordered" | "collected" | "reported" | "occupied" | "maintenance" | "no_show";

const statusStyles: Record<StatusVariant, { className: string; label: string }> = {
  available: { 
    className: "bg-chart-2 text-white border-chart-2", 
    label: "Available" 
  },
  scheduled: { 
    className: "bg-primary text-primary-foreground border-primary", 
    label: "Scheduled" 
  },
  completed: { 
    className: "bg-muted text-muted-foreground border-muted", 
    label: "Completed" 
  },
  cancelled: { 
    className: "bg-destructive/10 text-destructive border-destructive/20 line-through", 
    label: "Cancelled" 
  },
  pending: { 
    className: "bg-chart-3/20 text-chart-3 border-chart-3/30", 
    label: "Pending" 
  },
  paid: { 
    className: "bg-chart-2 text-white border-chart-2", 
    label: "Paid" 
  },
  overdue: { 
    className: "bg-destructive text-destructive-foreground border-destructive", 
    label: "Overdue" 
  },
  ordered: { 
    className: "bg-primary/20 text-primary border-primary/30", 
    label: "Ordered" 
  },
  collected: { 
    className: "bg-chart-3/20 text-chart-3 border-chart-3/30", 
    label: "Collected" 
  },
  reported: { 
    className: "bg-chart-2 text-white border-chart-2", 
    label: "Reported" 
  },
  occupied: { 
    className: "bg-primary text-primary-foreground border-primary", 
    label: "Occupied" 
  },
  maintenance: { 
    className: "bg-destructive/10 text-destructive border-destructive/20", 
    label: "Maintenance" 
  },
  no_show: { 
    className: "bg-muted text-muted-foreground border-muted line-through", 
    label: "No Show" 
  },
};

interface StatusBadgeProps {
  status: StatusVariant;
  testId?: string;
}

export function StatusBadge({ status, testId }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.pending;
  
  return (
    <Badge 
      className={`${style.className} px-3 py-1 rounded-full text-xs font-semibold uppercase`}
      data-testid={testId || `badge-status-${status}`}
    >
      {style.label}
    </Badge>
  );
}
