import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  service: string;
  location: string;
  budget: string;
  message: string;
  projectDate?: string;
}

interface EmailAutomationProps {
  onSubmit: (data: ContactFormData) => void;
  loading?: boolean;
}

// Email templates for different scenarios
const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome ${name} - Your Photography Inquiry`,
    template: 'welcome_inquiry',
    variables: { name }
  }),
  
  followUp24h: (name: string, service: string) => ({
    subject: `${name}, Let's Discuss Your ${service} Project`,
    template: 'follow_up_24h',
    variables: { name, service }
  }),
  
  followUp3d: (name: string, location: string) => ({
    subject: `${name}, Exclusive Photography Offer for ${location}`,
    template: 'follow_up_3d',
    variables: { name, location }
  }),
  
  followUp7d: (name: string) => ({
    subject: `${name}, Don't Miss Out - Limited Availability`,
    template: 'follow_up_7d',
    variables: { name }
  })
};

// Email automation workflows
export const triggerEmailSequence = async (formData: ContactFormData) => {
  try {
    // Immediate welcome email
    await sendEmail({
      to: formData.email,
      ...emailTemplates.welcome(formData.name),
      priority: 'high'
    });

    // Schedule follow-up emails
    await scheduleEmail({
      to: formData.email,
      ...emailTemplates.followUp24h(formData.name, formData.service),
      scheduleAfter: '24h'
    });

    await scheduleEmail({
      to: formData.email,
      ...emailTemplates.followUp3d(formData.name, formData.location),
      scheduleAfter: '3d'
    });

    await scheduleEmail({
      to: formData.email,
      ...emailTemplates.followUp7d(formData.name),
      scheduleAfter: '7d'
    });

    // Internal notification
    await sendEmail({
      to: 'info@jeffhonforlocophotos.com',
      subject: `New High-Value Inquiry from ${formData.name}`,
      template: 'internal_notification',
      variables: formData,
      priority: 'urgent'
    });

  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Email automation error:', error);
    }
  }
};

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, unknown>;
  priority?: string;
  scheduleAfter?: string;
}

// Mock email functions (replace with actual email service)
const sendEmail = async (_emailData: EmailPayload) => {
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const scheduleEmail = async (_emailData: EmailPayload) => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

// Lead scoring based on form data
export const calculateLeadScore = (formData: ContactFormData): number => {
  let score = 0;
  
  // Budget scoring
  if (formData.budget.includes('$50,000+')) score += 50;
  else if (formData.budget.includes('$25,000')) score += 35;
  else if (formData.budget.includes('$10,000')) score += 25;
  else if (formData.budget.includes('$5,000')) score += 15;
  
  // Service type scoring
  if (formData.service.includes('Celebrity')) score += 30;
  else if (formData.service.includes('Fashion')) score += 25;
  else if (formData.service.includes('Beauty')) score += 20;
  
  // Location scoring (high-value markets)
  const highValueLocations = ['NYC', 'Los Angeles', 'Paris', 'London', 'Monaco'];
  if (highValueLocations.some(loc => formData.location.includes(loc))) score += 20;
  
  // Phone number provided
  if (formData.phone) score += 10;
  
  // Project date soon
  if (formData.projectDate) {
    const projectDate = new Date(formData.projectDate);
    const now = new Date();
    const monthsFromNow = (projectDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsFromNow <= 3) score += 15;
  }
  
  return Math.min(score, 100); // Cap at 100
};

// CRM integration for lead management
export const syncToCRM = async (formData: ContactFormData, leadScore: number) => {
  const crmData = {
    ...formData,
    leadScore,
    source: 'website_contact_form',
    timestamp: new Date().toISOString(),
    status: leadScore >= 70 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold',
    tags: [
      formData.service.toLowerCase().replace(/\s+/g, '_'),
      formData.location.toLowerCase().replace(/\s+/g, '_'),
      `budget_${formData.budget.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    ]
  };

  // This would integrate with your CRM (HubSpot, Salesforce, etc.)
  console.log('Syncing to CRM:', crmData);
  
  // Mock API call
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// Main automation component
const EmailAutomation = ({ onSubmit, loading = false }: EmailAutomationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormSubmit = async (formData: ContactFormData) => {
    setIsProcessing(true);
    
    try {
      // Calculate lead score
      const leadScore = calculateLeadScore(formData);
      
      // Trigger email automation
      await triggerEmailSequence(formData);
      
      // Sync to CRM
      await syncToCRM(formData, leadScore);
      
      // Call parent submit handler
      onSubmit(formData);
      
      toast({
        title: "Success!",
        description: "Your inquiry has been submitted. You'll receive a confirmation email shortly.",
      });
      
    } catch (error) {
      console.error('Automation error:', error);
      toast({
        title: "Error",
        description: "There was an issue processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return null; // This is a utility component, actual form is in Contact.tsx
};

export default EmailAutomation;