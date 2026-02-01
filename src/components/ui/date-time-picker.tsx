
"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import { Save, X, Calendar, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WheelDatePicker } from "./wheel-date-picker";

interface DateTimePickerProps {
  date: Date | null | undefined;
  onSave: (date: Date | null) => void;
  triggerButton: React.ReactNode;
  align?: "start" | "center" | "end";
  onSelectDefault?: () => void;
}

export function DateTimePicker({ date, onSave, triggerButton, align = "center", onSelectDefault }: DateTimePickerProps) {
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date || undefined);
  const [showPicker, setShowPicker] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTempDate(date || undefined);
      setShowPicker(false); // Reset to options view whenever opened
    }
  }, [isOpen, date]);

  const handleSave = () => {
    onSave(tempDate || null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleDefaultClick = () => {
    if (onSelectDefault) {
      onSelectDefault();
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        {!showPicker && onSelectDefault ? (
          <div className="p-4 flex flex-col gap-3 min-w-[240px]">
            <Button
              variant="outline"
              className="h-12 justify-start gap-3 hover:bg-primary/5 hover:text-primary hover:border-primary/50"
              onClick={handleDefaultClick}
            >
              <Settings2 className="h-5 w-5" />
              <span className="font-semibold">{t('reminderDefaultRule')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-3 hover:bg-primary/5 hover:text-primary hover:border-primary/50"
              onClick={() => setShowPicker(true)}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">{t('useCustomSelection')}</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              <WheelDatePicker
                date={tempDate}
                setDate={(d) => setTempDate(d)}
              />
              <div className="border-t border-border w-full" />
              <TimePicker date={tempDate} setDate={setTempDate} />
            </div>
            <div className="p-3 border-t border-border flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('cancel')}
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('saveChanges')}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
