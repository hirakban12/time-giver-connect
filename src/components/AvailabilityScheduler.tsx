import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface AvailabilitySchedulerProps {
  availability: AvailabilitySlot[];
  onAvailabilityChange: (slots: AvailabilitySlot[]) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AvailabilityScheduler = ({ availability, onAvailabilityChange }: AvailabilitySchedulerProps) => {
  const addSlot = () => {
    onAvailabilityChange([...availability, { day: "Monday", startTime: "09:00", endTime: "11:00" }]);
  };

  const removeSlot = (index: number) => {
    onAvailabilityChange(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };

    // Validate 2-hour limit
    if (field === "startTime" || field === "endTime") {
      const slot = updated[index];
      const start = new Date(`2000-01-01T${slot.startTime}`);
      const end = new Date(`2000-01-01T${slot.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (hours > 2) {
        toast.error("Maximum 2 hours per day allowed");
        return;
      }
      if (hours <= 0) {
        toast.error("End time must be after start time");
        return;
      }
    }

    onAvailabilityChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg">Availability Schedule (Max 2 hours per day)</Label>
        <Button type="button" onClick={addSlot} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Slot
        </Button>
      </div>

      <div className="space-y-3">
        {availability.map((slot, index) => (
          <div key={index} className="flex gap-2 items-end p-3 border rounded-lg bg-muted/30">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Day</Label>
              <Select value={slot.day} onValueChange={(value) => updateSlot(index, "day", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label className="text-xs">Start Time</Label>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label className="text-xs">End Time</Label>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeSlot(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {availability.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No availability slots added yet. Click "Add Slot" to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default AvailabilityScheduler;
