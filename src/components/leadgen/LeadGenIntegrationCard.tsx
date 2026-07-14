import { useState } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, CheckCircle2, AlertCircle, Clock, HelpCircle, X } from "lucide-react";

interface LeadGenIntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: "connected" | "disconnected" | "pending";
  delay?: number;
  onAction?: () => void;
  helpSteps?: string[];
}

const statusConfig = {
  connected: { label: "Conectado", icon: CheckCircle2, className: "text-status-success" },
  disconnected: { label: "Desconectado", icon: AlertCircle, className: "text-muted-foreground" },
  pending: { label: "Configurando", icon: Clock, className: "text-status-warning" },
};

export function LeadGenIntegrationCard({ name, description, icon: Icon, status, delay = 0, onAction, helpSteps }: LeadGenIntegrationCardProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div
      className="rounded-xl p-5 border border-border bg-card relative animate-fade-in hover:border-primary/40 transition-all flex flex-col h-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      {helpSteps && (
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors z-10"
          title="Como configurar"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      )}

      {showHelp && helpSteps && (
        <div className="absolute inset-0 bg-card/98 backdrop-blur-sm rounded-xl p-6 z-20 overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Como configurar {name}</h4>
            <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ol className="space-y-2.5">
            {helpSteps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-muted-foreground">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary font-bold shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <div className={cn("flex items-center gap-1 text-xs font-medium", statusInfo.className)}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={onAction}
          className={cn(
            "w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
            status === "connected"
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {status === "connected" ? "Configurar" : "Conectar"}
        </button>
      </div>
    </div>
  );
}
