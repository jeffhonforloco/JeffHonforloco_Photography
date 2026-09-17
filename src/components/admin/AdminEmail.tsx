import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Mail, 
  Send, 
  Edit, 
  Trash2, 
  Plus,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import apiUrl from '../../lib/api-base';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailSequence {
  id: number;
  contact_id: number;
  full_name?: string;
  email?: string;
  sequence_type: string;
  step_number: number;
  email_template: string;
  scheduled_for: string;
  sent_at?: string;
  status: string;
  last_error?: string;
  created_at: string;
}

const AdminEmail: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});

  useEffect(() => {
    fetchEmailData();
  }, []);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [templatesResponse, sequencesResponse] = await Promise.all([
        fetch(apiUrl('/api/v1/admin/email-templates'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(apiUrl('/api/v1/admin/email-sequences'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        if (templatesData.success) {
          setTemplates(templatesData.data);
        }
      }

      if (sequencesResponse.ok) {
        const sequencesData = await sequencesResponse.json();
        if (sequencesData.success) {
          setSequences(sequencesData.data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<EmailTemplate>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/admin/email-templates'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error('Failed to create email template');
      }

      const data = await response.json();
      if (data.success) {
        fetchEmailData(); // Refresh the list
        setIsDialogOpen(false);
        setEditForm({});
      } else {
        throw new Error(data.message || 'Failed to create email template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create email template');
    }
  };

  const updateTemplate = async (templateId: number, templateData: Partial<EmailTemplate>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/admin/email-templates/${templateId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update email template');
      }

      const data = await response.json();
      if (data.success) {
        fetchEmailData(); // Refresh the list
        setIsDialogOpen(false);
        setEditForm({});
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to update email template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email template');
    }
  };

  const deleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this email template?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/admin/email-templates/${templateId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete email template');
      }

      // Update local state
      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email template');
    }
  };

  const processDueEmails = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/admin/email-sequences/process'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to process email sequences');
      }

      fetchEmailData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process email sequences');
    } finally {
      setProcessing(false);
    }
  };

  const cancelSequence = async (sequenceId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/admin/email-sequences/cancel'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: [sequenceId] })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel email sequence');
      }

      fetchEmailData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel email sequence');
    }
  };

  const deleteSequence = async (sequenceId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl(`/api/v1/admin/email-sequences/${sequenceId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete email sequence row');
      }

      fetchEmailData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email sequence row');
    }
  };

  const [testTo, setTestTo] = useState('');
  const [testSending, setTestSending] = useState(false);

  const sendTestEmail = async () => {
    try {
      setTestSending(true);
      setNotice(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(apiUrl('/api/v1/admin/email/test'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: testTo.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }
      setNotice({ type: 'ok', text: `Test email sent to ${testTo.trim()}. Check the inbox (and spam folder).` });
      setTestTo('');
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to send test email'
      });
    } finally {
      setTestSending(false);
    }
  };

  const clearFailedRows = async () => {
    try {
      setProcessing(true);
      setNotice(null);
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const seqResponse = await fetch(apiUrl('/api/v1/admin/email-sequences?status=all'), {
        method: 'DELETE',
        headers
      });
      if (!seqResponse.ok) {
        throw new Error('Failed to clear email rows');
      }
      const seqData = await seqResponse.json();

      const leadsResponse = await fetch(apiUrl('/api/v1/admin/analytics/orphaned-leads'), {
        method: 'DELETE',
        headers
      });
      if (!leadsResponse.ok) {
        throw new Error('Failed to clear orphaned lead events');
      }
      const leadsData = await leadsResponse.json();

      setNotice({
        type: 'ok',
        text: `Cleared ${seqData.deleted ?? 0} failed/cancelled email rows and ${leadsData.deleted ?? 0} orphaned lead events.`
      });
      fetchEmailData();
    } catch (err) {
      setNotice({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to clear rows'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      is_active: template.is_active
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isEditing && selectedTemplate) {
      updateTemplate(selectedTemplate.id, editForm);
    } else {
      createTemplate(editForm);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      sent: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading email data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Manage email templates and sequences</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchEmailData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={processDueEmails} variant="outline" disabled={processing}>
            <Send className="h-4 w-4 mr-2" />
            {processing ? 'Processing...' : 'Process Due'}
          </Button>
          <Button onClick={() => {
            setEditForm({ is_active: true });
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates ({templates.length})</CardTitle>
          <CardDescription>
            Manage your email templates for automated sequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {notice && (
        <div className={notice.type === 'ok' ? 'rounded-md bg-green-50 p-3 text-sm text-green-800' : 'rounded-md bg-red-50 p-3 text-sm text-red-800'}>
          {notice.text}
        </div>
      )}

      {/* Send Test Email */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Email</CardTitle>
          <CardDescription>
            Verify email delivery instantly — sends one test email through the provider, no lead or contact needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500">Recipient email</label>
              <Input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="mt-1"
              />
            </div>
            <Button onClick={sendTestEmail} disabled={testSending || !testTo.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {testSending ? 'Sending...' : 'Send test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Sequences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Sequences ({sequences.length})</CardTitle>
              <CardDescription>
                Track automated email sequences
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearFailedRows} disabled={processing}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear failed & cancelled
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{sequence.full_name || `Contact #${sequence.contact_id}`}</p>
                        {sequence.email && <p className="text-xs text-muted-foreground">{sequence.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sequence.sequence_type}
                    </TableCell>
                    <TableCell>
                      Step {sequence.step_number}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sequence.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(sequence.scheduled_for).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {sequence.sent_at ? new Date(sequence.sent_at).toLocaleString() : sequence.last_error || 'Not sent'}
                    </TableCell>
                    <TableCell>
                      {sequence.status === 'pending' ? (
                        <Button variant="outline" size="sm" onClick={() => cancelSequence(sequence.id)} className="text-red-600 hover:text-red-700">
                          Cancel
                        </Button>
                      ) : (
                        sequence.status !== 'sent' && (
                          <Button variant="outline" size="sm" onClick={() => deleteSequence(sequence.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Email Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Email Template' : 'Create New Email Template'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the email template' : 'Create a new email template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Template Name</label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Subject</label>
              <Input
                value={editForm.subject || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Content</label>
              <Textarea
                value={editForm.content || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter email content (HTML supported)"
                className="mt-1"
                rows={10}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active || false}
                onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-500">
                Active Template
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditForm({});
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmail;
