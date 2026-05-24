import { useState, useEffect } from 'react';
import { emailTemplates, getEmailTemplate } from '@/lib/email-templates';

interface EmailLead {
  email: string;
  signupDate: string;
  emailsSent: string[];
}

interface EmailSequence {
  templateName: keyof typeof emailTemplates;
  delayDays: number;
  sent: boolean;
}

export const useEmailSequence = () => {
  const [leads, setLeads] = useState<EmailLead[]>(() => {
    try {
      const stored = localStorage.getItem('email_leads');
      return stored ? (JSON.parse(stored) as EmailLead[]) : [];
    } catch {
      return [];
    }
  });
  const [pendingEmails, setPendingEmails] = useState<EmailLead[]>([]);

  // Email sequence configuration
  const emailSequence: EmailSequence[] = [
    { templateName: 'welcome', delayDays: 0, sent: false },
    { templateName: 'behindScenes', delayDays: 2, sent: false },
    { templateName: 'bookingOffer', delayDays: 5, sent: false }
  ];

  // Save leads to localStorage
  const saveLeads = (newLeads: EmailLead[]) => {
    localStorage.setItem('email_leads', JSON.stringify(newLeads));
    setLeads(newLeads);
  };

  // Add new lead and trigger email sequence
  const addLead = async (email: string) => {
    const newLead: EmailLead = {
      email,
      signupDate: new Date().toISOString(),
      emailsSent: []
    };

    const updatedLeads = [...leads, newLead];
    saveLeads(updatedLeads);

    // Send welcome email immediately
    await sendEmail(email, 'welcome');
    
    // Schedule follow-up emails
    scheduleFollowUpEmails(email);
    
    return true;
  };

  // Mock email sending function
  const sendEmail = async (email: string, templateName: keyof typeof emailTemplates) => {
    const template = getEmailTemplate(templateName, {
      prep_guide_url: '/api/download-guide' // Mock URL
    });
    
    if (template) {
      if (import.meta.env.DEV) {
        console.log(`📧 Sending email to ${email}:`, template);
      }
      
      // In production, this would call your email service
      // await fetch('/api/sendEmail', { ... });
      
      // Update lead's sent emails
      const updatedLeads = leads.map(lead => 
        lead.email === email 
          ? { ...lead, emailsSent: [...lead.emailsSent, templateName] }
          : lead
      );
      saveLeads(updatedLeads);
      
      return true;
    }
    return false;
  };

  // Schedule follow-up emails (mock implementation)
  const scheduleFollowUpEmails = (email: string) => {
    emailSequence.slice(1).forEach((sequence, index) => {
      setTimeout(() => {
        sendEmail(email, sequence.templateName);
      }, sequence.delayDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    });
  };

  // Get pending emails for a specific date range
  const getPendingEmails = (daysAgo: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    
    return leads.filter(lead => {
      const signupDate = new Date(lead.signupDate);
      const daysDiff = Math.floor((new Date().getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff === daysAgo;
    });
  };

  // Process scheduled emails (for admin dashboard)
  const processScheduledEmails = () => {
    const day2Leads = getPendingEmails(2);
    const day5Leads = getPendingEmails(5);
    
    day2Leads.forEach(lead => {
      if (!lead.emailsSent.includes('behindScenes')) {
        sendEmail(lead.email, 'behindScenes');
      }
    });
    
    day5Leads.forEach(lead => {
      if (!lead.emailsSent.includes('bookingOffer')) {
        sendEmail(lead.email, 'bookingOffer');
      }
    });
  };

  return {
    leads,
    addLead,
    sendEmail,
    processScheduledEmails,
    getPendingEmails
  };
};