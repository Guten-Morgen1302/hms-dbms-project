import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  imageSrc?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon: Icon, imageSrc, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {imageSrc ? (
        <img src={imageSrc} alt={title} className="w-32 h-32 mb-6 opacity-40" />
      ) : Icon ? (
        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-muted">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-title">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} data-testid="button-empty-action">
          {action.label}
        </Button>
      )}
    </div>
  );
}
