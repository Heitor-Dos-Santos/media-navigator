import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageInfoTooltipProps {
  description: string;
}

export function PageInfoTooltip({ description }: PageInfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors focus:outline-none">
            <Info className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs text-sm">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
