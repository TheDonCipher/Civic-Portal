import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: "One special character",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

function calculateStrength(password: string): {
  score: number;
  level: "weak" | "fair" | "good" | "strong";
  color: string;
} {
  if (!password) {
    return { score: 0, level: "weak", color: "bg-gray-200" };
  }

  const metRequirements = requirements.filter((req) => req.test(password)).length;
  const score = (metRequirements / requirements.length) * 100;

  if (score < 40) {
    return { score, level: "weak", color: "bg-red-500" };
  } else if (score < 60) {
    return { score, level: "fair", color: "bg-orange-500" };
  } else if (score < 80) {
    return { score, level: "good", color: "bg-yellow-500" };
  } else {
    return { score, level: "strong", color: "bg-green-500" };
  }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = calculateStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Password strength
          </span>
          <span
            className={cn(
              "text-xs font-medium capitalize",
              {
                "text-red-600": strength.level === "weak",
                "text-orange-600": strength.level === "fair",
                "text-yellow-600": strength.level === "good",
                "text-green-600": strength.level === "strong",
              }
            )}
          >
            {strength.level}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-300", strength.color)}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
        <div className="grid grid-cols-1 gap-1">
          {requirements.map((requirement, index) => {
            const isMet = requirement.test(password);
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  {
                    "text-green-600": isMet,
                    "text-muted-foreground": !isMet,
                  }
                )}
              >
                {isMet ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
                <span>{requirement.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact version for inline display
export function CompactPasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = calculateStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 bg-gray-200 rounded-full h-1">
        <div
          className={cn("h-1 rounded-full transition-all duration-300", strength.color)}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <span
        className={cn(
          "text-xs font-medium capitalize",
          {
            "text-red-600": strength.level === "weak",
            "text-orange-600": strength.level === "fair",
            "text-yellow-600": strength.level === "good",
            "text-green-600": strength.level === "strong",
          }
        )}
      >
        {strength.level}
      </span>
    </div>
  );
}

export default PasswordStrength;
