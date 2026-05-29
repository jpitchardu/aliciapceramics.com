"use client";

import { useState } from "react";
import { TextInput } from "@/ui/TextInput";

type CodeInputStepProps = {
  onCodeValidated: (codeData: {
    id: string;
    code: string;
    name: string;
    earliestCompletionDate: string;
  }) => void;
};

export function CodeInputStep({ onCodeValidated }: CodeInputStepProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/validateBulkCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const result = await response.json();

      if (!result.success) {
        setError("Failed to validate code. Please try again.");
        return;
      }

      if (!result.valid) {
        setError(result.message || "Invalid code");
        return;
      }

      onCodeValidated(result.data);
    } catch {
      setError("Failed to validate code. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-form flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="space-y-8">
          <div className="space-y-3 text-center">
            <div className="text-7xl">🎟️</div>
            <h1 className="font-heading text-2xl text-earth-dark">
              BULK ORDER
            </h1>
            <p className="font-body text-lg text-earth-dark">
              Enter your bulk commission code to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Bulk Code"
              placeholder="Enter your code..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              required
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                <p className="font-body text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating}
              className="w-full bg-earth-dark text-earth-form font-button text-sm tracking-wider px-8 py-4 rounded-full transition-aliciap hover:bg-blue-border hover:text-earth-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "VALIDATING..." : "CONTINUE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
