import { useState, useEffect } from 'react';
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

export const useEmailAutomation = () => {
  const [leads, setLeads] = useState<EmailLead[]>([]);
  const [stats, setStats] = useState<EmailStats>({
    totalLeads: 0,
    activeSequences: 0,
    completedSequences: 0,
    conversionRate: 0,
    thisWeekSignups: 0,
    thisMonthSignups: 0
  });
  const { toast } = useToast();

  // Load leads from localStorage on mount
  useEffect(() => {
    loadLeads();
  }, []);

  // Recalculate stats when leads change
  useEffect(() => {
    calculateStats();
  }, [leads]);

  const loadLeads = () => {
    try {
      const storedLeads = localStorage.getItem('emailSignups');
      if (storedLeads) {
        const parsedLeads: EmailLead[] = JSON.parse(storedLeads).map((lead: any) => ({
          id: lead.id || `lead_${Date.now()}_${Math.random()}`,
          email: lead.email,
          timestamp: lead.timestamp,
          status: lead.status || 'pending',
          source: lead.source || 'website',
          lastEmailSent: lead.lastEmailSent
        }));
        setLeads(parsedLeads);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalLeads = leads.length;
    const activeSequences = leads.filter(lead => 
      ['pending', 'welcomed', 'follow-up-1', 'follow-up-2', 'follow-up-3'].includes(lead.status)
    ).length;
    const completedSequences = leads.filter(lead => lead.status === 'completed').length;
    const conversionRate = totalLeads > 0 ? Math.round((completedSequences / totalLeads) * 100) : 0;
    
    const thisWeekSignups = leads.filter(lead => 
      new Date(lead.timestamp) > oneWeekAgo
    ).length;
    
    const thisMonthSignups = leads.filter(lead => 
      new Date(lead.timestamp) > oneMonthAgo
    ).length;

    setStats({
      totalLeads,
      activeSequences,
      completedSequences,
      conversionRate,
      thisWeekSignups,
      thisMonthSignups
    });
  };

  const addLead = (email: string, source: string = 'website') => {
    // Check if email already exists
    const existingLead = leads.find(lead => lead.email.toLowerCase() === email.toLowerCase());
    if (existingLead) {
      toast({
        title: "Already subscribed",
        description: "This email is already in the system",
        variant: "destructive"
      });
      return false;
    }

    const newLead: EmailLead = {
      id: `lead_${Date.now()}_${Math.random()}`,
      email,
      timestamp: new Date().toISOString(),
      status: 'pending',
      source
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    
    // Save to localStorage
    localStorage.setItem('emailSignups', JSON.stringify(updatedLeads));
    
    // Trigger welcome email sequence
    setTimeout(() => {
      triggerEmailSequence(newLead.id, 'welcome');
    }, 1000);

    return true;
  };

  const triggerEmailSequence = (leadId: string, emailType: string) => {
    // Mock email sending - replace with real email service when Supabase is connected
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const emailTemplates: Record<string, { subject: string; delay: number }> = {
      'welcome': { 
        subject: '📸 Your Model Prep Guide is Here!', 
        delay: 0 
      },
      'follow-up-1': { 
        subject: '3 Styling Secrets That Transform Every Photo', 
        delay: 48 
      },
      'follow-up-2': { 
        subject: 'Behind the Scenes: Creating Magazine-Worthy Shots', 
        delay: 120 
      },
      'follow-up-3': { 
        subject: 'Limited Spots Available - Let\'s Work Together', 
        delay: 192 
      }
    };

    const template = emailTemplates[emailType];
    if (!template) return;

    // Update lead status
    const statusMap: Record<string, EmailLead['status']> = {
      'welcome': 'welcomed',
      'follow-up-1': 'follow-up-1',
      'follow-up-2': 'follow-up-2',
      'follow-up-3': 'completed'
    };

    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: statusMap[emailType],
          lastEmailSent: new Date().toISOString()
        };
      }
      return l;
    });

    setLeads(updatedLeads);
    localStorage.setItem('emailSignups', JSON.stringify(updatedLeads));

    // Show success message
    toast({
      title: "Email Sent! 📧",
      description: `"${template.subject}" sent to ${lead.email}`,
    });

    // Schedule next email in sequence (mock timing)
    const nextEmailMap: Record<string, string> = {
      'welcome': 'follow-up-1',
      'follow-up-1': 'follow-up-2',
      'follow-up-2': 'follow-up-3'
    };

    const nextEmail = nextEmailMap[emailType];
    if (nextEmail) {
      // In production, this would be handled by the email service
      console.log(`Next email "${nextEmail}" scheduled for ${template.delay} hours from now`);
    }
  };

  const updateLeadStatus = (leadId: string, newStatus: EmailLead['status']) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: newStatus };
      }
      return lead;
    });

    setLeads(updatedLeads);
    localStorage.setItem('emailSignups', JSON.stringify(updatedLeads));
  };

  const getLeadsByStatus = (status: EmailLead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const getLeadsByDateRange = (startDate: Date, endDate: Date) => {
    return leads.filter(lead => {
      const leadDate = new Date(lead.timestamp);
      return leadDate >= startDate && leadDate <= endDate;
    });
  };

  const exportLeads = () => {
    const csvContent = [
      'Email,Status,Source,Signup Date,Last Email Sent',
      ...leads.map(lead => 
        `${lead.email},${lead.status},${lead.source},${lead.timestamp},${lead.lastEmailSent || 'None'}`
      )
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

    toast({
      title: "Export Complete",
      description: "Leads exported to CSV file",
    });
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
    loadLeads
  };
};