import React, { useRef, useId } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const baseId = useId();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const char = e.target.value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const otpArray = value.padEnd(length, " ").split("");
    otpArray[index] = char || " ";
    const updatedOtp = otpArray.join("").trimEnd();
    onChange(updatedOtp);

    // Auto-focus next field if a digit is entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const digitsOnly = pastedData.replace(/\D/g, "").slice(0, length);
    if (digitsOnly) {
      onChange(digitsOnly);
      const focusIndex = Math.min(digitsOnly.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 sm:gap-3 w-full"
      role="group"
      aria-label="One-Time Password Input"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          id={`${baseId}-${index}`}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ""}
          disabled={disabled}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${index + 1} of ${length}`}
          className="h-12 w-11 sm:h-14 sm:w-12 text-center text-lg sm:text-xl font-semibold bg-input text-foreground border border-border rounded-xl transition-all duration-150 focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed select-none"
        />
      ))}
    </div>
  );
};