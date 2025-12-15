import { ReactNode, useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface GuideTooltipProps {
  children: ReactNode;
  content: string;
  showIcon?: boolean;
}

const GUIDE_KEY = "moneya_guide_enabled";

export function useGuideMode() {
  const [guideEnabled, setGuideEnabled] = useState(() => {
    const stored = localStorage.getItem(GUIDE_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    localStorage.setItem(GUIDE_KEY, String(guideEnabled));
  }, [guideEnabled]);

  return { guideEnabled, setGuideEnabled };
}

export function GuideTooltip({ children, content, showIcon = false }: GuideTooltipProps) {
  const { guideEnabled } = useGuideMode();

  if (!guideEnabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="relative inline-flex items-center group">
            {children}
            {showIcon && (
              <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse opacity-75" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-[250px] bg-popover border-border text-popover-foreground p-3"
        >
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}