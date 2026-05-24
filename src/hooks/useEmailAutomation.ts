import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmailLead {
  id: string;
  email: string;
  timestamp: string;
  status: 'pending' | 'welcomed' | 'follow-up-1' | 'follow-up-2' | 'follow-up-3' | 'completed';
  source: string;
  lastEmailSent?: string;
}

interface EmailStats {
  totalLeads: number;
  activeSequences: number;
  completedSequences: number;
  conversionRate: number;
  thisWeekSignups: number;
  thisMonthSignups: number;
}

const EMAIL_TEMPLATES: Record<string, { subject: string; delay: number }> = {
  'welcome': { subject: '📸 Your Model Prep Guide is Here!', delay: 0 },
  'follow-up-1': { subject: '3 Styling Secrets That Transform Every Photo', delay: 48 },
  'follow-up-2': { subject: 'Behind the Scenes: Creating Magazine-Worthy Shots', delay: 120 },
  'follow-up-3': { subject: "Limited Spots Available - Let's Work Together", delay: 192 },
};

const STATUS_MAP: Record<string, EmailLead['status']> = {
  'welcome': 'welcomed',
  'follow-up-1': 'follow-up-1',
  'follow-up-2': 'follow-up-2',
  'follow-up-3': 'completed',
};

const parseLeadsFromStorage = (): EmailLead[] => {
  try {
    const storedLeads = localStorage.getItem('emailSignups');
    if (storedLeads) {
      return JSON.parse(storedLeads).map((lead: EmailLead) => ({
        id: lead.id || crypto.randomUUID(),
        email: lead.email,
        timestamp: lead.timestamp,
        status: lead.status || 'pending',
        source: lead.source || 'website',
        lastEmailSent: lead.lastEmailSent,
      }));
    }
  } catch {
    // silently ignore corrupt storage
  }
  return [];
};

export const useEmailAutomation = () => {
  const [leads, setLeads] = useState<EmailLead[]>(parseLeadsFromStorage);
  const { toast } = useToast();

  const stats = useMemo((): EmailStats => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalLeads = leads.length;
    const activeSequences = leads.filter(lead =>
      ['pending', 'welcomed', 'follow-up-1', 'follow-up-2', 'follow-up-3'].includes(lead.status)
    ).length;
    const completedSequences = leads.filter(lead => lead.status === 'completed').length;
    const conversionRate = totalLeads > 0 ? Math.round((completedSequences / totalLeads) * 100) : 0;
    const thisWeekSignups = leads.filter(lead => new Date(lead.timestamp) > oneWeekAgo).length;
    const thisMonthSignups = leads.filter(lead => new Date(lead.timestamp) > oneMonthAgo).length;

    return { totalLeads, activeSequences, completedSequences, conversionRate, thisWeekSignups, thisMonthSignups };
  }, [leads]);

  const loadLeads = () => {
    const refreshed = parseLeadsFromStorage();
    setLeads(refreshed);
  };

  const triggerEmailSequenceForLead = (lead: EmailLead, emailType: string) => {
    const template = EMAIL_TEMPLATES[emailType];
    if (!template) return;

    setLeads(prev => {
      const updated = prev.map(l =>
        l.id === lead.id
          ? { ...l, status: STATUS_MAP[emailType], lastEmailSent: new Date().toISOString() }
          : l
      );
      localStorage.setItem('emailSignups', JSON.stringify(updated));
      return updated;
    });

    toast({
      title: 'Email Sent! 📧',
      description: `"${template.subject}" sent to ${lead.email}`,
    });
  };

  const triggerEmailSequence = (leadId: string, emailType: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    triggerEmailSequenceForLead(lead, emailType);
  };

  const addLead = (email: string, source: string = 'website') => {
    const existingLead = leads.find(lead => lead.email.toLowerCase() === email.toLowerCase());
    if (existingLead) {
      toast({ title: 'Already subscribed', description: 'This email is already in the system', variant: 'destructive' });
      return false;
    }

    const newLead: EmailLead = {
      id: crypto.randomUUID(),
      email,
      timestamp: new Date().toISOString(),
      status: 'pending',
      source,
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    localStorage.setItem('emailSignups', JSON.stringify(updatedLeads));

    setTimeout(() => {
      triggerEmailSequenceForLead(newLead, 'welcome');
    }, 1000);

    return true;
  };

  const updateLeadStatus = (leadId: string, newStatus: EmailLead['status']) => {
    setLeads(prev => {
      const updated = prev.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
      localStorage.setItem('emailSignups', JSON.stringify(updated));
      return updated;
    });
  };

  const getLeadsByStatus = (status: EmailLead['status']) =>
    leads.filter(lead => lead.status === status);

  const getLeadsByDateRange = (startDate: Date, endDate: Date) =>
    leads.filter(lead => {
      const leadDate = new Date(lead.timestamp);
      return leadDate >= startDate && leadDate <= endDate;
    });

  const exportLeads = () => {
    const csvContent = [
      'Email,Status,Source,Signup Date,Last Email Sent',
      ...leads.map(lead =>
        `${lead.email},${lead.status},${lead.source},${lead.timestamp},${lead.lastEmailSent || 'None'}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Export Complete', description: 'Leads exported to CSV file' });
  };

  return {
    leads,
    stats,
    addLead,
    triggerEmailSequence,
    updateLeadStatus,
    getLeadsByStatus,
    getLeadsByDateRange,
    exportLeads,
    loadLeads,
  };
};
