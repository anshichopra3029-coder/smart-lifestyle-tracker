import { useState } from "react";
import { Search, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = {
  id: string; created_at: string; name: string; user_id: string;
  bmi: number; bmi_category: string;
  diabetes_risk: string; hypertension_risk: string; obesity_risk: string;
};

const riskColor = (r: string) =>
  r === "High" ? "text-danger bg-danger/10" : r === "Medium" ? "text-warning bg-warning/10" : "text-success bg-success/10";

const HistoryDashboard = () => {
  const [uid, setUid] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchHistory = async () => {
    if (!uid.trim()) { toast.error("Enter a User ID"); return; }
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase
      .from("assessments")
      .select("id, created_at, name, user_id, bmi, bmi_category, diabetes_risk, hypertension_risk, obesity_risk")
      .eq("user_id", uid.trim())
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error("Failed to load history"); return; }
    setRows(data as Row[]);
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-card animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Assessment History</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Look up past assessments by your User ID.</p>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="Enter User ID" onKeyDown={(e) => e.key === "Enter" && fetchHistory()} />
        <Button onClick={fetchHistory} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
        </Button>
      </div>

      {searched && !loading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No assessments found for that User ID.</p>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center p-3 rounded-xl border border-border hover:bg-accent/40 transition-colors">
            <div className="col-span-2 sm:col-span-2">
              <p className="font-medium text-sm truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
            </div>
            <div className="text-xs"><span className="text-muted-foreground">BMI</span><br/><span className="font-semibold">{r.bmi} {r.bmi_category}</span></div>
            <span className={cn("text-xs font-semibold px-2 py-1 rounded-full text-center", riskColor(r.diabetes_risk))}>Diab: {r.diabetes_risk}</span>
            <span className={cn("text-xs font-semibold px-2 py-1 rounded-full text-center", riskColor(r.hypertension_risk))}>HTN: {r.hypertension_risk}</span>
            <span className={cn("text-xs font-semibold px-2 py-1 rounded-full text-center", riskColor(r.obesity_risk))}>Obes: {r.obesity_risk}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistoryDashboard;
