
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { set } from "date-fns";

interface TimePickerProps {
  date?: Date | null;
  setDate: (date: Date) => void;
}

const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export function TimePicker({ date, setDate }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<string>(date ? (date.getHours() % 12 || 12).toString() : '12');
  const [selectedMinute, setSelectedMinute] = React.useState<string>(date ? date.getMinutes().toString().padStart(2, "0") : '00');
  const [period, setPeriod] = React.useState<"AM" | "PM">(date ? (date.getHours() >= 12 ? "PM" : "AM") : "AM");

  const handleTimeChange = () => {
    let hour = parseInt(selectedHour, 10);
    if (period === "PM" && hour !== 12) {
      hour += 12;
    }
    if (period === "AM" && hour === 12) {
      hour = 0;
    }
    const newDate = set(date || new Date(), {
      hours: hour,
      minutes: parseInt(selectedMinute, 10),
    });
    setDate(newDate);
  };
  
  React.useEffect(handleTimeChange, [selectedHour, selectedMinute, period]);
  
  React.useEffect(() => {
    if (date) {
      const currentHour = date.getHours();
      setSelectedHour((currentHour % 12 || 12).toString());
      setSelectedMinute(date.getMinutes().toString().padStart(2, '0'));
      setPeriod(currentHour >= 12 ? 'PM' : 'AM');
    }
  }, [date]);


  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div>
          <Label htmlFor="hours-select" className="sr-only">Hour</Label>
          <Select value={selectedHour} onValueChange={setSelectedHour}>
            <SelectTrigger id="hours-select" className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hours12.map((hour) => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="font-bold">:</span>
        <div>
          <Label htmlFor="minutes-select" className="sr-only">Minute</Label>
          <Select value={selectedMinute} onValueChange={setSelectedMinute}>
            <SelectTrigger id="minutes-select" className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {minutesArray.map((minute) => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
           <Select value={period} onValueChange={(value) => setPeriod(value as "AM" | "PM")}>
                <SelectTrigger className="w-[75px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
           </Select>
        </div>
    </div>
  );
}
