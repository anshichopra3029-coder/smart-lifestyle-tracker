import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Activity } from "lucide-react";
import { calcBMI, bmiCategory, assessRisks, type RiskResult } from "@/lib/health";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  user_id: z.string().trim().min(1, "User ID required").max(40),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.string().min(1, "Select gender"),
  height_cm: z.coerce.number().min(50).max(260),
  weight_kg: z.coerce.number().min(10).max(400),
  screen_time_hours: z.coerce.number().min(0).max(24),
  alcohol: z.enum(["Yes", "No"]),
  alcohol_frequency: z.string().optional(),
  activity_level: z.enum(["Low", "Moderate", "High"]),
  sleep_hours: z.coerce.number().min(0).max(24),
  diet_type: z.enum(["Healthy", "Average", "Unhealthy"]),
  emergency_name: z.string().trim().max(80).optional(),
  emergency_phone: z.string().trim().max(20).optional(),
});

interface Props { onResult: (r: RiskResult, ctx: { name: string; emergencyName?: string; emergencyPhone?: string }) => void; }

const AssessmentForm = ({ onResult }: Props) => {
  const [form, setForm] = useState({
    name: "", user_id: "", age: "", gender: "", height_cm: "", weight_kg: "",
    screen_time_hours: "", alcohol: "No", alcohol_frequency: "",
    activity_level: "Moderate", sleep_hours: "", diet_type: "Average",
    emergency_name: "", emergency_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const liveBMI = useMemo(() => {
    const h = parseFloat(form.height_cm); const w = parseFloat(form.weight_kg);
    if (!h || !w) return null;
    const b = calcBMI(h, w);
    return { bmi: b, cat: bmiCategory(b) };
  }, [form.height_cm, form.weight_kg]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    const v = parsed.data;
    setSubmitting(true);
    const result = assessRisks({
      age: v.age, gender: v.gender, height_cm: v.height_cm, weight_kg: v.weight_kg,
      screen_time_hours: v.screen_time_hours, alcohol: v.alcohol,
      alcohol_frequency: v.alcohol_frequency, activity_level: v.activity_level,
      sleep_hours: v.sleep_hours, diet_type: v.diet_type,
    });

    const { error } = await supabase.from("assessments").insert({
      user_id: v.user_id, name: v.name, age: v.age, gender: v.gender,
      height_cm: v.height_cm, weight_kg: v.weight_kg, bmi: result.bmi, bmi_category: result.bmiCategory,
      screen_time_hours: v.screen_time_hours, alcohol: v.alcohol,
      alcohol_frequency: v.alcohol_frequency || null, activity_level: v.activity_level,
      sleep_hours: v.sleep_hours, diet_type: v.diet_type,
      emergency_name: v.emergency_name || null, emergency_phone: v.emergency_phone || null,
      diabetes_risk: result.diabetes.level, hypertension_risk: result.hypertension.level,
      obesity_risk: result.obesity.level,
      diabetes_score: result.diabetes.score, hypertension_score: result.hypertension.score,
      obesity_score: result.obesity.score,
    });
    setSubmitting(false);

    if (error) { console.error(error); toast.error("Failed to save assessment"); return; }
    toast.success("Assessment complete!");
    onResult(result, { name: v.name, emergencyName: v.emergency_name, emergencyPhone: v.emergency_phone });
  };

  return (
    <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Lifestyle Assessment</h2>
        <p className="text-sm text-muted-foreground mt-1">Fill in your details to get a personalized risk profile.</p>
      </div>

      {/* Identity */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" /></Field>
        <Field label="User ID"><Input value={form.user_id} onChange={(e) => set("user_id", e.target.value)} placeholder="unique-id-001" /></Field>
      </div>

      {/* Demographics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Age"><Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="30" /></Field>
        <Field label="Gender">
          <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sleep (hrs/day)"><Input type="number" step="0.5" value={form.sleep_hours} onChange={(e) => set("sleep_hours", e.target.value)} placeholder="7" /></Field>
      </div>

      {/* Body */}
      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <Field label="Height (cm)"><Input type="number" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} placeholder="170" /></Field>
        <Field label="Weight (kg)"><Input type="number" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} placeholder="65" /></Field>
        <div className="rounded-xl bg-gradient-soft border border-border p-3">
          <p className="text-xs text-muted-foreground">Live BMI</p>
          <p className="text-2xl font-bold text-gradient">{liveBMI ? liveBMI.bmi : "—"}</p>
          <p className="text-xs font-medium text-primary">{liveBMI ? liveBMI.cat : "Enter height & weight"}</p>
        </div>
      </div>

      {/* Lifestyle */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Screen Time (hrs/day)"><Input type="number" step="0.5" value={form.screen_time_hours} onChange={(e) => set("screen_time_hours", e.target.value)} placeholder="6" /></Field>
        <Field label="Physical Activity">
          <Select value={form.activity_level} onValueChange={(v) => set("activity_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Alcohol Consumption">
          <Select value={form.alcohol} onValueChange={(v) => set("alcohol", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="No">No</SelectItem>
              <SelectItem value="Yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {form.alcohol === "Yes" && (
          <Field label="Alcohol Frequency">
            <Select value={form.alcohol_frequency} onValueChange={(v) => set("alcohol_frequency", v)}>
              <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Occasionally">Occasionally</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Diet Type">
          <Select value={form.diet_type} onValueChange={(v) => set("diet_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Healthy">Healthy</SelectItem>
              <SelectItem value="Average">Average</SelectItem>
              <SelectItem value="Unhealthy">Unhealthy</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Emergency contact */}
      <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-destructive">Emergency Contact</h3>
          <p className="text-xs text-muted-foreground">Used by the SOS button to dial or text in an emergency.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Contact Name"><Input value={form.emergency_name} onChange={(e) => set("emergency_name", e.target.value)} placeholder="Mom / Spouse / Doctor" /></Field>
          <Field label="Phone Number"><Input type="tel" value={form.emergency_phone} onChange={(e) => set("emergency_phone", e.target.value)} placeholder="+1 555 123 4567" /></Field>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-gradient-hero shadow-glow hover:opacity-95">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : "Run Health Risk Analysis"}
      </Button>
    </form>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default AssessmentForm;
