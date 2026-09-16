import { AlertTriangle, ShieldAlert, FileWarning } from "lucide-react";

const FLAG_META: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  injection_suspected: {
    label: "Possible manipulation attempt",
    icon: ShieldAlert,
    classes: "bg-rose-500/15 text-rose-400",
  },
  unreadable: {
    label: "Resume could not be read",
    icon: FileWarning,
    classes: "bg-secondary text-muted-foreground",
  },
  bias_filter_triggered: {
    label: "Bias filter applied",
    icon: AlertTriangle,
    classes: "bg-amber-500/15 text-amber-400",
  },
};

export function FlagBadge({ flag }: { flag: string }) {
  const meta = FLAG_META[flag] ?? { label: flag, icon: AlertTriangle, classes: "bg-secondary text-muted-foreground" };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.classes}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
