import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AUDIT_PLATFORMS, type AuditPlatform } from "@/data/auditTypes";
import { GoogleAdsLogo, MetaAdsLogo, DV360Logo } from "@/components/integrations/PlatformLogos";

interface AuditPlatformSelectorProps {
  selectedPlatform: AuditPlatform | null;
  onSelect: (platform: AuditPlatform) => void;
}

const platformLogos: Record<AuditPlatform, React.ReactNode> = {
  "google-ads": <GoogleAdsLogo className="w-10 h-10" />,
  "meta-ads": <MetaAdsLogo className="w-10 h-10" />,
  "programatica": <DV360Logo className="w-10 h-10" />,
};

export function AuditPlatformSelector({ selectedPlatform, onSelect }: AuditPlatformSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Selecione a Plataforma</h2>
        <p className="text-sm text-muted-foreground">
          Escolha a plataforma de mídia que deseja auditar
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AUDIT_PLATFORMS.map((platform) => (
          <Card
            key={platform.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedPlatform === platform.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onSelect(platform.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              {platformLogos[platform.id]}
              <div>
                <h3 className="font-medium text-foreground">{platform.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{platform.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
