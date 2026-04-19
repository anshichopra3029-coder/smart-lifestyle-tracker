import { useState } from "react";
import HeroLogo from "@/components/HeroLogo";
import AssessmentForm from "@/components/AssessmentForm";
import RiskCard from "@/components/RiskCard";
import EmergencyButton from "@/components/EmergencyButton";
import HistoryDashboard from "@/components/HistoryDashboard";
import Chatbot from "@/components/Chatbot";
import type { RiskResult } from "@/lib/health";
import { Droplet, HeartPulse, Scale, Sparkles, Shield, ShieldCheck } from "lucide-react";

interface ContextData {
  name?: string;
  emergencyName?: string;
  emergencyPhone?: string;
}

const Index = () => {
  const [result, setResult] = useState<RiskResult | null>(null);
  const [ctx, setCtx] = useState<ContextData>({});

  const handleResult = (r: RiskResult, c: ContextData) => {
    setResult(r);
    setCtx(c);
    
    // Improved scroll handling with proper error checking
    requestAnimationFrame(() => {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-none">HealthGuard <span className="text-gradient">AI</span></h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Lifestyle & Risk Insight</p>
            </div>
          </div>
          <EmergencyButton userName={ctx.name} contactName={ctx.emergencyName} contactPhone={ctx.emergencyPhone} />
        </div>
      </header>

      {/* Hero */}
      <section className="container py-10 sm:py-14">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-3 h-3" /> AI-powered health insights
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
              Track your lifestyle.<br/>
              <span className="text-gradient">Predict your health.</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-xl">
              Get a personalized risk profile for diabetes, hypertension, and obesity — plus a friendly AI assistant for healthy lifestyle guidance.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { icon: <HeartPulse className="w-4 h-4" />, label: "Heart Health" },
                { icon: <Droplet className="w-4 h-4" />, label: "Blood Sugar" },
                { icon: <Scale className="w-4 h-4" />, label: "Weight" },
                { icon: <Shield className="w-4 h-4" />, label: "Emergency SOS" }
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-card border border-border shadow-card">
                  <span className="text-primary">{b.icon}</span>{b.label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border rounded-3xl p-6 shadow-glow">
              <HeroLogo className="h-32 sm:h-40" />
              <p className="text-center text-xs text-muted-foreground mt-2">Live ECG · Beating with you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form + Results */}
      <main className="container pb-12 space-y-8">
        <AssessmentForm onResult={handleResult} />

        {result && (
          <section id="results" className="animate-fade-in space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-bold mb-1">Your Health Risk Profile</h2>
              <p className="text-sm text-muted-foreground mb-5">BMI: <span className="font-semibold text-foreground">{result.bmi}</span> · <span className="text-primary font-medium">{result.bmiCategory}</span></p>
              <div className="grid sm:grid-cols-3 gap-4">
                <RiskCard title="Type 2 Diabetes" level={result.diabetes.level} score={result.diabetes.score} icon={<Droplet className="w-4 h-4" />} />
                <RiskCard title="Hypertension" level={result.hypertension.level} score={result.hypertension.score} icon={<HeartPulse className="w-4 h-4" />} />
                <RiskCard title="Obesity" level={result.obesity.level} score={result.obesity.score} icon={<Scale className="w-4 h-4" />} />
              </div>
            </div>

            <div className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
              <h3 className="font-bold flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-primary" /> Personalized Tips</h3>
              <ul className="space-y-2">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="text-primary mt-0.5">✓</span><span>{t}</span></li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <HistoryDashboard />

        <footer className="text-center text-xs text-muted-foreground py-4">
          ⚠️ HealthGuard AI provides general lifestyle insights only — not a medical diagnosis. Consult a qualified healthcare provider for medical advice.
        </footer>
      </main>

      <Chatbot />
    </div>
  );
};

export default Index;