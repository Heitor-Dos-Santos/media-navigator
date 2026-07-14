import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, CheckCircle2, Circle, AlertCircle, RefreshCw, Settings } from "lucide-react";
import { platformLogos, PlatformLogoWrapper } from "./PlatformLogos";

interface PlatformCardProps {
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  features: string[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSync?: () => void;
}

export function PlatformCard({ name, description, status, lastSync, features, onConnect, onDisconnect, onSync }: PlatformCardProps) {
  const LogoComponent = platformLogos[name];
  return (
    <div className={cn("p-5 rounded-xl border transition-all", status === "connected" && "bg-card border-status-success/30", status === "disconnected" && "bg-card border-border hover:border-primary/50", status === "error" && "bg-card border-status-error/30")}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <PlatformLogoWrapper>{LogoComponent ? <LogoComponent /> : <div className="text-2xl">📦</div>}</PlatformLogoWrapper>
          <div><h3 className="font-semibold text-foreground">{name}</h3><p className="text-xs text-muted-foreground">{description}</p></div>
        </div>
        <Badge variant="outline" className={cn("text-xs", status === "connected" && "border-status-success text-status-success", status === "disconnected" && "border-muted-foreground text-muted-foreground", status === "error" && "border-status-error text-status-error")}>
          {status === "connected" && <><CheckCircle2 className="w-3 h-3 mr-1" />Conectado</>}
          {status === "disconnected" && <><Circle className="w-3 h-3 mr-1" />Desconectado</>}
          {status === "error" && <><AlertCircle className="w-3 h-3 mr-1" />Erro</>}
        </Badge>
      </div>
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Funcionalidades:</p>
        <div className="flex flex-wrap gap-1">{features.map((feature, idx) => (<Badge key={idx} variant="secondary" className="text-xs">{feature}</Badge>))}</div>
      </div>
      {status === "connected" && lastSync && (<div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground"><RefreshCw className="w-3 h-3" />Última sincronização: {lastSync}</div>)}
      <div className="flex items-center gap-2">
        {status === "disconnected" && (<Button size="sm" className="flex-1" onClick={onConnect}><Link2 className="w-4 h-4 mr-2" />Conectar</Button>)}
        {status === "connected" && (<><Button size="sm" variant="outline" className="flex-1" onClick={onSync}><RefreshCw className="w-4 h-4 mr-2" />Sincronizar</Button><Button size="sm" variant="ghost" onClick={onDisconnect}><Settings className="w-4 h-4" /></Button></>)}
        {status === "error" && (<Button size="sm" variant="destructive" className="flex-1" onClick={onConnect}><AlertCircle className="w-4 h-4 mr-2" />Reconectar</Button>)}
      </div>
    </div>
  );
}
