// Email automation utilities — imported by Contact.tsx and Book.tsx
import { apiService } from "@/lib/api-service";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  location: string;
  budget: string;
  message: string;
  projectDate?: string;
}

// Lead scoring covering all service categories
export function calculateLeadScore(formData: ContactFormData): number {
  let score = 0;
  const service = formData.service.toLowerCase();
  const budget = formData.budget.toLowerCase();

  // Service type
  if (service.includes("celebrity")) score += 40;
  else if (service.includes("wedding")) score += 38;
  else if (
    service.includes("corporate branding") ||
    service.includes("brand campaign")
  )
    score += 35;
  else if (service.includes("fashion")) score += 32;
  else if (
    service.includes("corporate event") ||
    service.includes("event")
  )
    score += 28;
  else if (service.includes("real estate")) score += 26;
  else if (
    service.includes("beauty") ||
    service.includes("cosmetic")
  )
    score += 24;
  else if (service.includes("engagement")) score += 22;
  else if (
    service.includes("sweet sixteen") ||
    service.includes("sweet 16") ||
    service.includes("quinceañera")
  )
    score += 18;
  else if (service.includes("headshot")) score += 16;
  else if (
    service.includes("graduation") ||
    service.includes("senior")
  )
    score += 14;

  // Budget
  if (budget.includes("50,000") || budget.includes("$50k")) score += 30;
  else if (budget.includes("25,000") || budget.includes("$25k")) score += 22;
  else if (budget.includes("10,000") || budget.includes("$10k")) score += 16;
  else if (budget.includes("5,000") || budget.includes("$5k")) score += 10;

  // Phone provided
  if (formData.phone) score += 10;

  // Project date urgency
  if (formData.projectDate) {
    const monthsOut =
      (new Date(formData.projectDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24 * 30);
    if (monthsOut <= 2) score += 18;
    else if (monthsOut <= 6) score += 10;
  }

  // High-value market
  const loc = formData.location.toLowerCase();
  const premiumCities = [
    "new york",
    "nyc",
    "los angeles",
    "miami",
    "paris",
    "london",
    "monaco",
    "chicago",
    "boston",
    "atlanta",
  ];
  if (premiumCities.some((c) => loc.includes(c))) score += 8;

  return Math.min(score, 100);
}

// Trigger immediate email notification + confirmation for a new inquiry
// Routes through the Cloudflare Worker at /api/v1/email/contact via apiService
export async function triggerEmailSequence(
  formData: ContactFormData
): Promise<void> {
  await apiService.sendContactEmail({
    full_name: formData.name,
    email: formData.email,
    phone: formData.phone,
    service_type: formData.service,
    budget_range: formData.budget,
    event_date: formData.projectDate,
    location: formData.location,
    message: formData.message,
  });
}

// Structured lead data for CRM hand-off
export function buildCRMRecord(
  formData: ContactFormData,
  leadScore: number
): Record<string, unknown> {
  return {
    name: formData.name,
    email: formData.email,
    phone: formData.phone ?? null,
    service: formData.service,
    budget: formData.budget,
    location: formData.location,
    message: formData.message,
    projectDate: formData.projectDate ?? null,
    leadScore,
    status: leadScore >= 70 ? "hot" : leadScore >= 45 ? "warm" : "cold",
    source: "website_contact_form",
    capturedAt: new Date().toISOString(),
    tags: [
      formData.service.toLowerCase().replace(/\s+/g, "_"),
      formData.location.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      `budget_${formData.budget.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    ],
  };
}

// Placeholder — replace with HubSpot/Salesforce SDK call when CRM is configured
export async function syncToCRM(
  formData: ContactFormData,
  leadScore: number
): Promise<void> {
  const _record = buildCRMRecord(formData, leadScore);
  // TODO: POST _record to your CRM endpoint
}

// This file exports utilities only — no rendered UI
export default null;
