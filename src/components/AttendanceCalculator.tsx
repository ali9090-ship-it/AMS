import { useState } from "react";
import { AnimatedCard } from "@/components/animations";

interface AttendanceCalculatorProps {
  targetPct: number;
  currentPresent: number;
  currentTotal: number;
}

export default function AttendanceCalculator({ targetPct, currentPresent, currentTotal }: AttendanceCalculatorProps) {
  const [target, setTarget] = useState(targetPct);
  
  // Math Patch 3: Handle edge cases
  const t = target / 100;
  const needed = currentTotal === 0 ? 0 : Math.max(0, Math.ceil((t * currentTotal - currentPresent) / (1 - t)));
  const canMissVal = currentTotal === 0 ? 0 : Math.max(0, Math.floor((currentPresent / t) - currentTotal));

  return (
    <AnimatedCard index={2} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-bold text-foreground mb-4">Attendance Calculator</h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Target Percentage (%)</label>
          <input 
            type="number" 
            value={target} 
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-accent/5 p-3 border border-accent/10">
            <p className="text-[10px] text-muted-foreground font-medium">To Recover</p>
            <p className="text-lg font-bold text-primary">{needed}</p>
            <p className="text-[9px] text-muted-foreground line-clamp-1">future classes</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
            <p className="text-[10px] text-muted-foreground font-medium">Max Absence</p>
            <p className="text-lg font-bold text-primary">{canMissVal}</p>
            <p className="text-[9px] text-muted-foreground line-clamp-1">allowed miss</p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
