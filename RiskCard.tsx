import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Risk } from "@/lib/health";

interface Props { title: string; level: Risk; score: number; icon: React.ReactNode; }

const levelStyles: Record<Risk, string> = {
  Low: "text-success bg-success/10",
  Medium: "text-warning bg-warning/10",
  High: "text-danger bg-danger/10",
};

const RiskCard = ({ title, level, score, icon }: Props) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-soft transition-all hover:-translate-y-1 animate-scale-in">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
        <h4 className="font-semibold text-card-foreground">{title}</h4>
      </div>
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", levelStyles[level])}>{level}</span>
    </div>
    <Progress value={score} className="h-2" />
    <p className="text-xs text-muted-foreground mt-2">Risk score: {score}/100</p>
  </div>
);

export default RiskCard;
