import { useState } from "react";
import { Phone, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props { contactName?: string; contactPhone?: string; userName?: string; }

const EmergencyButton = ({ contactName, contactPhone, userName }: Props) => {
  const [open, setOpen] = useState(false);
  const phone = contactPhone?.replace(/[^+\d]/g, "");
  const msg = encodeURIComponent(`🚨 Emergency alert from ${userName || "a HealthGuard AI user"}. Please respond or call back immediately.`);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="destructive"
        size="lg"
        className="relative shadow-glow"
      >
        <span className="absolute inset-0 rounded-md pulse-ring" />
        <AlertTriangle className="w-5 h-5" />
        Emergency SOS
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Emergency Alert
            </DialogTitle>
            <DialogDescription>
              {phone
                ? `Reach your emergency contact ${contactName ? `(${contactName})` : ""} immediately.`
                : "Add an emergency contact in the form above to enable quick-dial."}
            </DialogDescription>
          </DialogHeader>

          {phone ? (
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              <Button asChild size="lg" className="w-full">
                <a href={`tel:${phone}`}><Phone className="w-4 h-4" /> Call {contactName || "Contact"}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <a href={`sms:${phone}?body=${msg}`}><MessageSquare className="w-4 h-4" /> Send SMS</a>
              </Button>
            </div>
          ) : null}

          <div className="mt-2 p-3 rounded-xl bg-destructive/10 text-sm">
            <p className="font-semibold text-destructive">For life-threatening situations:</p>
            <p className="text-muted-foreground mt-1">Call your local emergency number immediately (e.g., 112 / 911 / 102).</p>
            <Button asChild variant="destructive" size="sm" className="mt-2">
              <a href="tel:112"><Phone className="w-4 h-4" /> Call 112</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyButton;
