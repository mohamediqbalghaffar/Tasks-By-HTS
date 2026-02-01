
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDaysInMonth, getYear, getMonth, getDate } from 'date-fns';
import { useLanguage } from "@/contexts/LanguageContext";

interface WheelDatePickerProps {
  date?: Date | null;
  setDate: (date: Date) => void;
}

const years = Array.from({ length: 21 }, (_, i) => (new Date().getFullYear() - 10 + i).toString());
const months = Array.from({ length: 12 }, (_, i) => i);

export function WheelDatePicker({ date, setDate }: WheelDatePickerProps) {
    const { getDateFnsLocale } = useLanguage();
    const locale = getDateFnsLocale();

    const selectedDate = date || new Date();

    const [year, setYear] = React.useState<string>(getYear(selectedDate).toString());
    const [month, setMonth] = React.useState<string>(getMonth(selectedDate).toString());
    const [day, setDay] = React.useState<string>(getDate(selectedDate).toString());

    const daysInMonth = getDaysInMonth(new Date(parseInt(year), parseInt(month)));
    const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    
    const monthNames = React.useMemo(() => {
        return months.map(m => {
            const monthName = locale.localize?.month(m, { width: 'wide' });
            return monthName || (m + 1).toString();
        });
    }, [locale]);

    React.useEffect(() => {
        if (date) {
            setYear(getYear(date).toString());
            setMonth(getMonth(date).toString());
            setDay(getDate(date).toString());
        }
    }, [date]);
    
    React.useEffect(() => {
        // Adjust day if it's out of bounds for the new month/year
        const currentDay = parseInt(day, 10);
        if (currentDay > daysInMonth) {
            setDay(daysInMonth.toString());
        }
    }, [year, month, day, daysInMonth]);

    const handleDateChange = (newYear: string, newMonth: string, newDay: string) => {
        const currentHours = selectedDate.getHours();
        const currentMinutes = selectedDate.getMinutes();

        const fullDate = new Date(
            parseInt(newYear),
            parseInt(newMonth),
            parseInt(newDay),
            currentHours,
            currentMinutes
        );
        if (!isNaN(fullDate.getTime())) {
            setDate(fullDate);
        }
    };

    const handleYearChange = (newYear: string) => {
        setYear(newYear);
        handleDateChange(newYear, month, day);
    };

    const handleMonthChange = (newMonth: string) => {
        setMonth(newMonth);
        handleDateChange(year, newMonth, day);
    };

    const handleDayChange = (newDay: string) => {
        setDay(newDay);
        handleDateChange(year, month, newDay);
    };

  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
        <div>
          <Select value={day} onValueChange={handleDayChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {days.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {monthNames[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
           <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[90px]">
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
           </Select>
        </div>
    </div>
  );
}
