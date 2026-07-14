import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { CLIENTS, PLATFORMS } from "@/data/multiClientData";

export interface FilterState {
  clientId: string;
  platform: string;
  campaignId: string;
  status: string;
}

interface GlobalFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  campaigns?: { campaignId: string; campaignName: string; clientId: string; platform: string }[];
  showStatus?: boolean;
}

export function GlobalFilterBar({ filters, onFiltersChange, campaigns = [], showStatus = true }: GlobalFilterBarProps) {
  const filteredPlatforms = useMemo(() => {
    if (!filters.clientId || filters.clientId === "all") return PLATFORMS;
    return [...new Set(campaigns.filter(c => c.clientId === filters.clientId).map(c => c.platform))];
  }, [filters.clientId, campaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (filters.clientId && filters.clientId !== "all") result = result.filter(c => c.clientId === filters.clientId);
    if (filters.platform && filters.platform !== "all") result = result.filter(c => c.platform === filters.platform);
    return result;
  }, [filters.clientId, filters.platform, campaigns]);

  const activeCount = [filters.clientId, filters.platform, filters.campaignId, filters.status].filter(v => v && v !== "all").length;

  const clearFilters = () => onFiltersChange({ clientId: "all", platform: "all", campaignId: "all", status: "all" });

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filtros</span>
        {activeCount > 0 && <Badge variant="secondary" className="text-xs">{activeCount}</Badge>}
      </div>

      <Select value={filters.clientId || "all"} onValueChange={v => onFiltersChange({ ...filters, clientId: v, campaignId: "all" })}>
        <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Cliente" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.platform || "all"} onValueChange={v => onFiltersChange({ ...filters, platform: v, campaignId: "all" })}>
        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="DSP / Plataforma" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas DSPs</SelectItem>
          {filteredPlatforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.campaignId || "all"} onValueChange={v => onFiltersChange({ ...filters, campaignId: v })}>
        <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Campanha" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Campanhas</SelectItem>
          {filteredCampaigns.map(c => <SelectItem key={c.campaignId} value={c.campaignId}>{c.campaignName}</SelectItem>)}
        </SelectContent>
      </Select>

      {showStatus && (
        <Select value={filters.status || "all"} onValueChange={v => onFiltersChange({ ...filters, status: v })}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>
      )}

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearFilters}>
          <X className="w-3 h-3 mr-1" />Limpar
        </Button>
      )}
    </div>
  );
}
