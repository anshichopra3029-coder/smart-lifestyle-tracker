// Rule-based health risk scoring for HealthGuard AI

export type Risk = "Low" | "Medium" | "High";

export interface AssessmentInput {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  screen_time_hours: number;
  alcohol: "Yes" | "No";
  alcohol_frequency?: string;
  activity_level: "Low" | "Moderate" | "High";
  sleep_hours: number;
  diet_type: "Healthy" | "Average" | "Unhealthy";
}

export interface RiskResult {
  bmi: number;
  bmiCategory: string;
  diabetes: { score: number; level: Risk };
  hypertension: { score: number; level: Risk };
  obesity: { score: number; level: Risk };
  tips: string[];
}

export function calcBMI(height_cm: number, weight_kg: number): number {
  if (!height_cm || !weight_kg) return 0;
  const m = height_cm / 100;
  return +(weight_kg / (m * m)).toFixed(1);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

const toLevel = (score: number): Risk => (score >= 65 ? "High" : score >= 35 ? "Medium" : "Low");

export function assessRisks(input: AssessmentInput): RiskResult {
  const bmi = calcBMI(input.height_cm, input.weight_kg);
  const cat = bmiCategory(bmi);

  // Diabetes score
  let d = 10;
  if (input.age >= 45) d += 20; else if (input.age >= 35) d += 10;
  if (bmi >= 30) d += 25; else if (bmi >= 25) d += 15;
  if (input.activity_level === "Low") d += 15; else if (input.activity_level === "Moderate") d += 5;
  if (input.diet_type === "Unhealthy") d += 20; else if (input.diet_type === "Average") d += 10;
  if (input.sleep_hours < 6 || input.sleep_hours > 9) d += 10;
  if (input.screen_time_hours >= 8) d += 5;

  // Hypertension score
  let h = 10;
  if (input.age >= 50) h += 25; else if (input.age >= 40) h += 15;
  if (bmi >= 30) h += 20; else if (bmi >= 25) h += 10;
  if (input.alcohol === "Yes") h += input.alcohol_frequency === "Daily" ? 20 : 10;
  if (input.activity_level === "Low") h += 15;
  if (input.diet_type === "Unhealthy") h += 15;
  if (input.sleep_hours < 6) h += 10;
  if (input.screen_time_hours >= 10) h += 5;

  // Obesity score
  let o = 5;
  if (bmi >= 30) o += 50; else if (bmi >= 27) o += 35; else if (bmi >= 25) o += 20;
  if (input.activity_level === "Low") o += 15; else if (input.activity_level === "Moderate") o += 5;
  if (input.diet_type === "Unhealthy") o += 20; else if (input.diet_type === "Average") o += 10;
  if (input.screen_time_hours >= 8) o += 10;
  if (input.sleep_hours < 6) o += 5;

  d = Math.min(100, d); h = Math.min(100, h); o = Math.min(100, o);

  const tips: string[] = [];
  if (cat === "Overweight" || cat === "Obese") tips.push("Aim for a 5–10% weight reduction through balanced diet & exercise.");
  if (cat === "Underweight") tips.push("Increase nutrient-dense calories: nuts, dairy, whole grains, lean proteins.");
  if (input.activity_level === "Low") tips.push("Add 30 minutes of brisk walking, 5 days a week.");
  if (input.diet_type !== "Healthy") tips.push("Fill half your plate with vegetables & fruits; reduce ultra-processed foods.");
  if (input.sleep_hours < 7) tips.push("Target 7–9 hours of sleep with a consistent bedtime.");
  if (input.screen_time_hours >= 6) tips.push("Take a 20-second screen break every 20 minutes (20-20-20 rule).");
  if (input.alcohol === "Yes") tips.push("Limit alcohol — max 1 drink/day for women, 2 for men.");
  if (tips.length === 0) tips.push("Great habits! Keep consistent and schedule annual checkups.");

  return {
    bmi,
    bmiCategory: cat,
    diabetes: { score: d, level: toLevel(d) },
    hypertension: { score: h, level: toLevel(h) },
    obesity: { score: o, level: toLevel(o) },
    tips,
  };
}
