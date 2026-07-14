import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataHealthWidget } from "@/components/data/DataHealthWidget";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plug, RefreshCw, Key, ScrollText, Wifi, WifiOff, AlertTriangle,
  CheckCircle2, XCircle, Plus, Eye, EyeOff, Copy, Code2, Trash2, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiKey, ConnectionStatus, SyncHealth } from "@/types/integration";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";
import { INTERNAL_API_ENDPOINTS } from "@/types/integration";
import {
  PLATFORM_CONNECTIONS, API_KEYS, INTEGRATION_LOGS,
  generateFakeApiKey, maskApiKey,
} from "@/data/integrationData";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { MOCK_VALIDATION_ISSUES } from "@/data/dataArchitectureData";
import { VALIDATION_ISSUE_LABELS, SEVERITY_COLORS } from "@/types/dataArchitecture";

const healthIcons: Record<SyncHealth, React.ReactNode> = {
  healthy: <CheckCircle2 className="w-4 h-4 text-status-success" />,
  warning: <AlertTriangle className="w-4 h-4 text-status-warning" />,
  error: <XCircle className="w-4 h-4 text-status-error" />,
};

const healthLabels: Record<SyncHealth, string> = {
  healthy: "Healthy",
  warning: "Warning",
  error: "Error",
};

const statusColors: Record<ConnectionStatus, string> = {
  connected: "bg-status-success/10 text-status-success border-status-success/30",
  disconnected: "bg-muted text-muted-foreground border-border",
};

export default function IntegrationCenter() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(API_KEYS);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return;
    const rawKey = generateFakeApiKey();
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      tenantId: "tenant-001",
      keyName: newKeyName.trim(),
      apiKeyHash: maskApiKey(rawKey),
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: "active",
    };
    setApiKeys(prev => [newKey, ...prev]);
    setGeneratedKey(rawKey);
    setNewKeyName("");
    setShowKey(true);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));
    toast({ title: "API Key revogada", description: "A chave foi desativada com sucesso." });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copiado!", description: "Chave copiada para a área de transferência." });
  };

  const handleSync = (platform: string) => {
    toast({ title: "Sync iniciado", description: `Sincronização manual para ${platform} em andamento...` });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Integration Center</h1>
            <PageInfoTooltip description="Gerencie conexões com plataformas, chaves de API, webhooks e monitore sincronizações de dados." />
            <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Gerencie conexões com plataformas, chaves de API e monitore sincronizações</p>
        </div>

        <Tabs defaultValue="platforms" className="space-y-4">
          <TabsList>
            <TabsTrigger value="platforms" className="gap-1.5"><Plug className="w-4 h-4" />Plataformas</TabsTrigger>
            <TabsTrigger value="data-health" className="gap-1.5"><Database className="w-4 h-4" />Saúde dos Dados</TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-1.5"><Key className="w-4 h-4" />API Keys</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5"><ScrollText className="w-4 h-4" />Sync Logs</TabsTrigger>
            <TabsTrigger value="endpoints" className="gap-1.5"><Code2 className="w-4 h-4" />API Endpoints</TabsTrigger>
          </TabsList>

          {/* ── Data Health ── */}
          <TabsContent value="data-health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DataHealthWidget />
              <DataIngestionSummary />
            </div>
          </TabsContent>

          {/* ── Connected Platforms ── */}
          <TabsContent value="platforms">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PLATFORM_CONNECTIONS.map(conn => (
                <Card key={conn.platform} className="p-5 border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-muted">
                        {conn.connectionStatus === "connected" ? (
                          <Wifi className="w-5 h-5 text-status-success" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{conn.displayName}</p>
                        {conn.accountId && (
                          <p className="text-xs text-muted-foreground font-mono">{conn.accountId}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-xs border", statusColors[conn.connectionStatus])}>
                      {conn.connectionStatus === "connected" ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sync Health</span>
                      <div className="flex items-center gap-1.5">
                        {healthIcons[conn.syncHealth]}
                        <span className="text-foreground">{healthLabels[conn.syncHealth]}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Último Sync</span>
                      <span className="text-foreground">
                        {conn.lastSyncAt ? format(new Date(conn.lastSyncAt), "dd/MM/yyyy HH:mm") : "—"}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1.5"
                    disabled={conn.connectionStatus === "disconnected"}
                    onClick={() => handleSync(conn.displayName)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />Manual Sync
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── API Key Management ── */}
          <TabsContent value="api-keys">
            <Card className="p-5 border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">API Keys</h3>
                  <p className="text-xs text-muted-foreground">Chaves para acesso à API interna — visíveis apenas na criação</p>
                </div>
                <Dialog open={showKeyDialog} onOpenChange={(open) => { setShowKeyDialog(open); if (!open) { setGeneratedKey(null); setShowKey(false); } }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" />Gerar Nova Chave</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gerar API Key</DialogTitle>
                      <DialogDescription>
                        {generatedKey
                          ? "Copie a chave abaixo. Ela não será exibida novamente."
                          : "Dê um nome para identificar esta chave."}
                      </DialogDescription>
                    </DialogHeader>
                    {!generatedKey ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Nome da chave (ex: Production API)"
                          value={newKeyName}
                          onChange={e => setNewKeyName(e.target.value)}
                        />
                        <DialogFooter>
                          <Button onClick={handleGenerateKey} disabled={!newKeyName.trim()}>Gerar</Button>
                        </DialogFooter>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted font-mono text-sm break-all">
                          <span className="flex-1">{showKey ? generatedKey : maskApiKey(generatedKey)}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => setShowKey(!showKey)}>
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleCopyKey(generatedKey)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-status-warning flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Esta chave não será exibida novamente. Guarde-a em local seguro.
                        </p>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setShowKeyDialog(false); setGeneratedKey(null); setShowKey(false); }}>Fechar</Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium text-foreground">{k.keyName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{k.apiKeyHash}</TableCell>
                      <TableCell className="text-xs">{format(new Date(k.createdAt), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-xs">{k.lastUsedAt ? format(new Date(k.lastUsedAt), "dd/MM/yyyy HH:mm") : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", k.status === "active" ? "text-status-success border-status-success/30" : "text-muted-foreground border-border")}>
                          {k.status === "active" ? "Ativa" : "Revogada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {k.status === "active" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-status-error/70 hover:text-status-error" onClick={() => handleRevokeKey(k.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ── Sync Logs ── */}
          <TabsContent value="logs">
            <Card className="p-5 border-border">
              <h3 className="font-semibold text-foreground mb-4">Sync Logs</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INTEGRATION_LOGS.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-foreground capitalize">{log.platform.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{log.syncType === "auto" ? "Auto" : "Manual"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.recordsProcessed.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", log.status === "success" ? "text-status-success border-status-success/30" : "text-status-error border-status-error/30")}>
                          {log.status === "success" ? "Sucesso" : "Falha"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="text-xs text-status-error">{log.errorMessage || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ── API Endpoints ── */}
          <TabsContent value="endpoints">
            <Card className="p-5 border-border">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">API Endpoints (Read-Only)</h3>
                <p className="text-xs text-muted-foreground">Estrutura da API interna — todos scoped por tenant_id com RBAC e plano</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Módulos RBAC</TableHead>
                    <TableHead>Plan-Gated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INTERNAL_API_ENDPOINTS.map(ep => (
                    <TableRow key={ep.path}>
                      <TableCell className="font-mono text-xs text-primary">{ep.path}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">GET</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ep.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ep.rbacModules.map(m => (
                            <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ep.planGated ? (
                          <Badge variant="outline" className="text-xs text-status-warning border-status-warning/30">Sim</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function DataIngestionSummary() {
  const unresolvedIssues = MOCK_VALIDATION_ISSUES.filter((v: any) => !v.resolved_flag);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <div className="p-4">
        <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          Problemas de Validação
        </h3>
        <div className="space-y-2">
          {unresolvedIssues.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Nenhum problema pendente
            </div>
          ) : (
            unresolvedIssues.map((issue: any) => (
              <div key={issue.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[issue.severity]}`}>
                    {issue.severity}
                  </Badge>
                  <span className="text-xs">{VALIDATION_ISSUE_LABELS[issue.issue_type]}</span>
                </div>
                <span className="text-xs text-muted-foreground">{issue.affected_record_count} registros</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
