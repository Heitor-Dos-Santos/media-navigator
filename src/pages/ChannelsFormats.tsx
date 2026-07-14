import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Tv, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

interface NamedItem {
  name: string;
}

interface StoredData {
  channels: NamedItem[];
  formats: NamedItem[];
}

const STORAGE_KEY = "channelsAndFormats";

const loadData = (): StoredData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return { channels: [], formats: [] };
};

const saveData = (data: StoredData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export default function ChannelsFormats() {
  const [data, setData] = useState<StoredData>(loadData);
  const [newChannel, setNewChannel] = useState("");
  const [newFormat, setNewFormat] = useState("");

  useEffect(() => { saveData(data); }, [data]);

  const addChannel = () => {
    const name = newChannel.trim();
    if (!name) return;
    if (data.channels.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Canal já cadastrado"); return;
    }
    setData((prev) => ({ ...prev, channels: [...prev.channels, { name }] }));
    setNewChannel("");
    toast.success("Canal adicionado");
  };

  const removeChannel = (name: string) => {
    setData((prev) => ({ ...prev, channels: prev.channels.filter((c) => c.name !== name) }));
    toast.success("Canal removido");
  };

  const addFormat = () => {
    const name = newFormat.trim();
    if (!name) return;
    if (data.formats.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Formato já cadastrado"); return;
    }
    setData((prev) => ({ ...prev, formats: [...prev.formats, { name }] }));
    setNewFormat("");
    toast.success("Formato adicionado");
  };

  const removeFormat = (name: string) => {
    setData((prev) => ({ ...prev, formats: prev.formats.filter((f) => f.name !== name) }));
    toast.success("Formato removido");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Canais e Formatos</h1>
            <PageInfoTooltip description="Cadastre canais (veículos) e formatos de mídia que serão utilizados no planejamento." />
          </div>
          <p className="text-muted-foreground">Gerencie a base de canais e formatos disponíveis para o planejamento de mídia</p>
        </div>

        <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tv className="w-4 h-4 text-primary" />
                Canais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  placeholder="Nome do canal..."
                  onKeyDown={(e) => e.key === "Enter" && addChannel()}
                />
                <Button onClick={addChannel} size="sm">
                  <Plus className="w-4 h-4 mr-1" />Adicionar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.channels.length === 0 && (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Nenhum canal cadastrado</TableCell></TableRow>
                  )}
                  {data.channels.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeChannel(c.name)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutGrid className="w-4 h-4 text-primary" />
                Formatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                  placeholder="Nome do formato..."
                  onKeyDown={(e) => e.key === "Enter" && addFormat()}
                />
                <Button onClick={addFormat} size="sm">
                  <Plus className="w-4 h-4 mr-1" />Adicionar
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formato</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.formats.length === 0 && (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Nenhum formato cadastrado</TableCell></TableRow>
                  )}
                  {data.formats.map((f) => (
                    <TableRow key={f.name}>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeFormat(f.name)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
