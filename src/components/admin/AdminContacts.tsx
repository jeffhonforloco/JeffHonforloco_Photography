import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Mail, Phone, Calendar, Star, Reply, Archive, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { ContactFilter } from '@/types/content';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  repliedAt?: string;
}

const AdminContacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactMessage[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      subject: 'Wedding Photography Inquiry',
      message: 'Hello! I am interested in booking your services for my wedding in June. Could we schedule a call to discuss packages and availability?',
      status: 'new',
      priority: 'high',
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      phone: '+1 (555) 987-6543',
      subject: 'Corporate Headshots',
      message: 'We need professional headshots for our executive team. Looking for a package that includes 8 people. What are your rates?',
      status: 'replied',
      priority: 'medium',
      createdAt: '2024-01-19T14:15:00Z',
      repliedAt: '2024-01-19T16:30:00Z'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      subject: 'Portfolio Shoot',
      message: 'I am an aspiring model and would love to work with you on building my portfolio. Do you offer model portfolio packages?',
      status: 'new',
      priority: 'medium',
      createdAt: '2024-01-18T09:45:00Z'
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'j.wilson@magazine.com',
      phone: '+1 (555) 456-7890',
      subject: 'Editorial Assignment',
      message: 'We are interested in commissioning you for an editorial shoot for our upcoming spring issue. The shoot would be in March.',
      status: 'archived',
      priority: 'high',
      createdAt: '2024-01-15T11:20:00Z',
      repliedAt: '2024-01-15T15:45:00Z'
    }
  ]);

  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');

  const filteredContacts = contacts.filter(contact => 
    filter === 'all' || contact.status === filter
  );

  const handleStatusChange = (id: string, status: ContactMessage['status']) => {
    setContacts(contacts =>
      contacts.map(contact =>
        contact.id === id
          ? { 
              ...contact, 
              status, 
              repliedAt: status === 'replied' ? new Date().toISOString() : contact.repliedAt 
            }
          : contact
      )
    );
  };

  const handleReply = (contact: ContactMessage) => {
    // In a real app, this would send an email
    handleStatusChange(contact.id, 'replied');
    setReplyMessage('');
    setSelectedContact(null);
    toast({
      title: "Reply Sent",
      description: `Reply sent to ${contact.name}`,
    });
  };

  const handleDelete = (id: string) => {
    setContacts(contacts => contacts.filter(contact => contact.id !== id));
    toast({
      title: "Message Deleted",
      description: "Contact message has been removed.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'replied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage client inquiries and communications</p>
        </div>
        
        <div className="flex gap-2">
          {['all', 'new', 'replied', 'archived'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as ContactFilter)}
              className="capitalize"
            >
              {status} ({contacts.filter(c => status === 'all' || c.status === status).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className={`${contact.status === 'new' ? 'border-blue-200 dark:border-blue-800' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{contact.subject}</CardTitle>
                    <Badge className={getPriorityColor(contact.priority)}>
                      {contact.priority}
                    </Badge>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">{contact.name}</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {contact.status === 'new' && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedContact(contact);
                              setReplyMessage(`Hi ${contact.name},\n\nThank you for your inquiry about ${contact.subject.toLowerCase()}. `);
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Reply to {contact.name}</DialogTitle>
                            <DialogDescription>
                              Responding to: {contact.subject}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-sm font-medium mb-1">Original Message:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{contact.message}</p>
                            </div>
                            
                            <Textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Type your reply..."
                              rows={8}
                            />
                            
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedContact(null)}>
                                Cancel
                              </Button>
                              <Button onClick={() => selectedContact && handleReply(selectedContact)}>
                                Send Reply
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(contact.id, contact.status === 'archived' ? 'new' : 'archived')}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{contact.message}</p>
              {contact.repliedAt && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Replied on {new Date(contact.repliedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No messages found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'No contact messages yet.' : `No ${filter} messages.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminContacts;