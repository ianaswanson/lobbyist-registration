"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Step1PersonalInfo } from "./registration-steps/Step1PersonalInfo";
import { Step2EmployerInfo } from "./registration-steps/Step2EmployerInfo";
import { Step3Documentation } from "./registration-steps/Step3Documentation";
import { Step4Review } from "./registration-steps/Step4Review";
import { UploadedFile } from "@/components/FileUpload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

type RegistrationData = {
  // Step 1: Personal Information
  name: string;
  email: string;
  phone: string;
  address: string;
  hoursCurrentQuarter: number;

  // Step 2: Employer Information
  employerName: string;
  employerEmail: string;
  employerPhone: string;
  employerAddress: string;
  employerBusinessDescription: string;
  subjectsOfInterest: string;

  // Step 3: Documentation
  authorizationDocuments?: UploadedFile[];
};

interface LobbyistRegistrationWizardProps {
  userId: string;
}

export function LobbyistRegistrationWizard({
  userId,
}: LobbyistRegistrationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    hoursCurrentQuarter: 0,
    employerName: "",
    employerEmail: "",
    employerPhone: "",
    employerAddress: "",
    employerBusinessDescription: "",
    subjectsOfInterest: "",
  });

  const totalSteps = 4;

  const updateFormData = (data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/lobbyist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      setMessage({
        type: "success",
        text: data.message || "Registration submitted successfully!",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting registration:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to submit registration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* Progress Indicator */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                  step === currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : step < currentStep
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div
                  className={`mx-2 h-1 w-16 sm:w-24 ${
                    step < currentStep ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-gray-600">
          <span
            className={currentStep === 1 ? "font-semibold text-blue-600" : ""}
          >
            Personal Info
          </span>
          <span
            className={currentStep === 2 ? "font-semibold text-blue-600" : ""}
          >
            Employer
          </span>
          <span
            className={currentStep === 3 ? "font-semibold text-blue-600" : ""}
          >
            Documents
          </span>
          <span
            className={currentStep === 4 ? "font-semibold text-blue-600" : ""}
          >
            Review
          </span>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className="px-6 pt-6">
          <Alert
            className={`${
              message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertCircle
              className={`h-4 w-4 ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            />
            <AlertTitle
              className={
                message.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {message.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription
              className={
                message.type === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {message.text}
              {message.type === "success" && (
                <span className="ml-2 inline-block">
                  Redirecting to dashboard...
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6">
        {currentStep === 1 && (
          <Step1PersonalInfo
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
          />
        )}
        {currentStep === 2 && (
          <Step2EmployerInfo
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Documentation
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Review
            data={formData}
            onBack={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Draft Save Notice */}
      <div className="border-t bg-gray-50 px-6 py-3">
        <p className="text-xs text-gray-500">
          💾 Your progress is automatically saved as a draft. You can return
          later to complete your registration.
        </p>
      </div>
    </div>
  );
}
