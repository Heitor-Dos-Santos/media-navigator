import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreatableSelectProps {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  onCreateOption: (option: string) => void;
  placeholder?: string;
  className?: string;
}

export function CreatableSelect({
  value,
  options,
  onValueChange,
  onCreateOption,
  placeholder = "Selecionar...",
  className,
}: CreatableSelectProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleCreate = () => {
    if (newValue.trim()) {
      onCreateOption(newValue.trim());
      onValueChange(newValue.trim());
      setNewValue("");
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="flex gap-1">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Novo valor..."
          className="h-10 flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />
        <Button size="sm" onClick={handleCreate} className="h-10 px-3">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-10 px-2">
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsCreating(true)}
        className="h-10 px-2 shrink-0"
        title="Criar novo"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
