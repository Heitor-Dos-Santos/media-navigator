import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  stats?: {
    label: string;
    value: string | number;
  };
  status?: "active" | "pending" | "attention";
}

export function ModuleCard({ title, description, href, icon: Icon, stats, status = "active" }: ModuleCardProps) {
  const statusStyles = {
    active: "border-status-success/30 hover:border-status-success/50",
    pending: "border-muted hover:border-primary/30",
    attention: "border-status-warning/30 hover:border-status-warning/50",
  };

  return (
    <Link
      to={href}
      className={cn(
        "group relative flex flex-col p-5 rounded-xl bg-card border transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5",
        statusStyles[status]
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      {/* Stats */}
      {stats && (
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{stats.label}</span>
            <span className="text-sm font-medium text-foreground">{stats.value}</span>
          </div>
        </div>
      )}

      {/* Arrow */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-primary" />
      </div>
    </Link>
  );
}
