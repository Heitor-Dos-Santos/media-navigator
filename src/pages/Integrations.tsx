import { AppLayout } from "@/components/layout/AppLayout";
import { PlatformCard } from "@/components/integrations/PlatformCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Info } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

interface Platform {
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  features: string[];
}

const platforms: Platform[] = [
  { name: "Google Ads", description: "Search, Display, YouTube, Performance Max", status: "disconnected", features: ["Métricas", "Campanhas", "Conversões", "Audiências"] },
  { name: "Meta Ads", description: "Facebook, Instagram, Messenger, Audience Network", status: "disconnected", features: ["Métricas", "Campanhas", "Criativos", "Audiências"] },
  { name: "DV360", description: "Display & Video 360 - Programmatic DSP", status: "disconnected", features: ["IOs", "Line Items", "Criativos", "Métricas"] },
  { name: "TikTok Ads", description: "TikTok For Business", status: "disconnected", features: ["Métricas", "Campanhas", "Criativos", "Spark Ads"] },
  { name: "LinkedIn Ads", description: "LinkedIn Campaign Manager", status: "disconnected", features: ["Métricas", "Campanhas", "Leads", "Audiências"] },
  { name: "Kwai Ads", description: "Kwai For Business", status: "disconnected", features: ["Métricas", "Campanhas", "Criativos"] },
  { name: "Spotify Ads", description: "Spotify Ad Studio", status: "disconnected", features: ["Métricas", "Campanhas", "Áudio", "Podcast"] },
  { name: "Amazon DSP", description: "Amazon Demand-Side Platform", status: "disconnected", features: ["Métricas", "Campanhas", "Audiências", "Retail"] },
  { name: "Google Drive", description: "Drive, Sheets, Docs, Slides - Exportação direta", status: "disconnected", features: ["Exportação", "Planilhas", "Documentos", "Apresentações"] },
  { name: "BigQuery", description: "Google BigQuery - Data Warehouse", status: "disconnected", features: ["Queries", "Datasets", "Analytics", "Relatórios"] },
];

export default function Integrations() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Integrações</h1><PageInfoTooltip description="Conecte plataformas de mídia para sincronização automática de métricas e dados de campanha." /></div>
            <p className="text-sm text-muted-foreground">Conecte suas plataformas de mídia para sincronização automática</p>
          </div>
          <Badge variant="outline" className="text-xs"><Zap className="w-3 h-3 mr-1" />0 de {platforms.length} conectadas</Badge>
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">Sincronização de dados em tempo real</p>
            <p className="text-xs text-muted-foreground mt-1">Ao conectar suas plataformas, o MediaHub irá automaticamente importar métricas, campanhas e dados de performance para calcular o Ping Score e Eficiência de Compra.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <PlatformCard key={platform.name} {...platform} onConnect={() => console.log(`Conectar ${platform.name}`)} onDisconnect={() => console.log(`Desconectar ${platform.name}`)} onSync={() => console.log(`Sincronizar ${platform.name}`)} />
          ))}
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Precisa de outra integração? <Button variant="link" className="p-0 h-auto text-primary">Solicitar nova plataforma</Button></p>
        </div>
      </div>
    </AppLayout>
  );
}
