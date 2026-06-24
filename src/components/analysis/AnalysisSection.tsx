import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisSectionProps {
  title: string;
  subtitle?: string;
  accentColor: "cobalt" | "red" | "amber" | "gray";
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const accentColors = {
  cobalt: "border-l-[#0047AB]",
  red: "border-l-[#D64045]",
  amber: "border-l-[#D97706]",
  gray: "border-l-[#666666]",
};

export function AnalysisSection({
  title,
  subtitle,
  accentColor,
  children,
  defaultOpen = true,
}: AnalysisSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "bg-white border border-[#E5E5E5] rounded-lg mb-3 overflow-hidden border-l-[3px]",
        accentColors[accentColor]
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 min-h-[48px] text-left"
      >
        <span className="flex flex-col">
          <span className="text-[14px] font-bold text-[#1A1A1A] uppercase tracking-wide">
            {title}
          </span>
          {subtitle && (
            <span className="text-[12px] font-normal text-[#666666] normal-case tracking-normal mt-1">
              {subtitle}
            </span>
          )}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#999999]" />
        </motion.div>
      </button>


      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
