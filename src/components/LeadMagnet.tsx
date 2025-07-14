import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Star, Eye, Share2, Copy, FileText } from 'lucide-react';

interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl: string;
  downloadCount: number;
  conversionRate: number;
  type: 'pdf' | 'checklist' | 'guide' | 'template';
}

const LeadMagnet = () => {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([
    {
      id: 'model-prep-guide',
      title: 'Ultimate Model Prep Guide',
      description: 'Complete preparation guide for looking like a cover star at your next editorial shoot.',
      downloadUrl: '/downloads/model-prep-guide.pdf',
      thumbnailUrl: '/images/prep-guide-thumbnail.jpg',
      downloadCount: 247,
      conversionRate: 23.5,
      type: 'pdf'
    },
    {
      id: 'posing-checklist',
      title: 'Pro Posing Checklist',
      description: 'Essential poses and techniques used in high-fashion photography.',
      downloadUrl: '/downloads/posing-checklist.pdf',
      thumbnailUrl: '/images/posing-checklist-thumbnail.jpg',
      downloadCount: 189,
      conversionRate: 31.2,
      type: 'checklist'
    },
    {
      id: 'styling-secrets',
      title: 'Styling Secrets Guide',
      description: 'Professional styling tips that transform any photoshoot.',
      downloadUrl: '/downloads/styling-secrets.pdf',
      thumbnailUrl: '/images/styling-secrets-thumbnail.jpg',
      downloadCount: 156,
      conversionRate: 28.7,
      type: 'guide'
    }
  ]);

  const [newMagnet, setNewMagnet] = useState({
    title: '',
    description: '',
    type: 'pdf' as LeadMagnet['type']
  });

  const { toast } = useToast();

  const generateMagnetContent = (type: LeadMagnet['type'], title: string) => {
    const templates = {
      pdf: {
        content: `# ${title}

## Table of Contents
1. Introduction
2. Pre-Shoot Preparation
3. During the Shoot
4. Post-Shoot Tips
5. Bonus Resources

## Introduction
Welcome to your complete guide for ${title.toLowerCase()}...

## Pre-Shoot Preparation
• Skincare routine (start 1 week before)
• Hydration protocol
• Sleep and nutrition tips
• What to bring checklist

## During the Shoot
• Communication with your photographer
• Posing fundamentals
• Energy and confidence tips
• Wardrobe management

## Post-Shoot Tips
• Image selection process
• Social media usage rights
• Building your portfolio
• Networking opportunities

## Bonus Resources
• Emergency touch-up kit
• Inspiration mood boards
• Professional contacts list

---
*Created by Jeff Honforloco Photography*`,
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`
      },
      checklist: {
        content: `# ${title}

## Essential Items Checklist
□ Clean, moisturized skin
□ Well-rested (8+ hours sleep)
□ Hydrated (plenty of water)
□ Light, healthy meal
□ Comfortable undergarments
□ Multiple outfit options
□ Touch-up makeup kit
□ Hair ties/styling tools
□ Positive attitude & confidence

## 24 Hours Before
□ Avoid alcohol
□ Drink extra water
□ Get good sleep
□ Avoid new skincare products
□ Confirm shoot details

## Day of Shoot
□ Arrive 15 minutes early
□ Bring snacks
□ Wear comfortable shoes
□ Have phone charged
□ Bring inspiration images

## Posing Reminders
□ Chin slightly forward
□ Shoulders back
□ Soft hands
□ Elongate neck
□ Engage core
□ Shift weight to back foot
□ Keep expressions natural

---
*Professional tips from Jeff Honforloco*`,
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-checklist.pdf`
      },
      guide: {
        content: `# ${title}

## Chapter 1: Foundation
Understanding the fundamentals of ${title.toLowerCase()}...

## Chapter 2: Preparation
Step-by-step preparation process...

## Chapter 3: Execution
Professional techniques and tips...

## Chapter 4: Troubleshooting
Common challenges and solutions...

## Chapter 5: Advanced Tips
Pro-level strategies for exceptional results...

## Resources
• Recommended products
• Professional contacts
• Further reading
• Online communities

---
*Expert guide by Jeff Honforloco Photography*`,
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-guide.pdf`
      },
      template: {
        content: `# ${title}

## Template Overview
This template provides a framework for ${title.toLowerCase()}...

## Instructions
1. Download and customize
2. Fill in your specific details
3. Use as reference during shoots
4. Share with your team

## Customization Areas
• Personal branding
• Specific requirements
• Timeline adjustments
• Contact information

---
*Template by Jeff Honforloco Photography*`,
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-template.pdf`
      }
    };

    return templates[type];
  };

  const createLeadMagnet = () => {
    if (!newMagnet.title || !newMagnet.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    const content = generateMagnetContent(newMagnet.type, newMagnet.title);
    
    const magnet: LeadMagnet = {
      id: `magnet_${Date.now()}`,
      title: newMagnet.title,
      description: newMagnet.description,
      downloadUrl: `/downloads/${content.filename}`,
      thumbnailUrl: `/images/${newMagnet.type}-thumbnail.jpg`,
      downloadCount: 0,
      conversionRate: 0,
      type: newMagnet.type
    };

    setMagnets([...magnets, magnet]);
    setNewMagnet({ title: '', description: '', type: 'pdf' });

    // Store the content for later use
    localStorage.setItem(`lead_magnet_${magnet.id}`, JSON.stringify({
      ...magnet,
      content: content.content
    }));

    toast({
      title: "Lead Magnet Created! 🎉",
      description: `"${magnet.title}" is ready for distribution`,
    });
  };

  const copyMagnetUrl = (magnetId: string) => {
    const url = `${window.location.origin}/book?magnet=${magnetId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied!",
      description: "Lead magnet URL copied to clipboard",
    });
  };

  const downloadMagnet = (magnet: LeadMagnet) => {
    // Simulate download and increment counter
    const updatedMagnets = magnets.map(m => 
      m.id === magnet.id 
        ? { ...m, downloadCount: m.downloadCount + 1 }
        : m
    );
    setMagnets(updatedMagnets);

    // Get content from localStorage
    const storedContent = localStorage.getItem(`lead_magnet_${magnet.id}`);
    if (storedContent) {
      const content = JSON.parse(storedContent).content;
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = magnet.downloadUrl.split('/').pop() || 'download.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Download Started",
      description: `Downloading "${magnet.title}"`,
    });
  };

  const getTypeIcon = (type: LeadMagnet['type']) => {
    const icons = {
      pdf: FileText,
      checklist: Eye,
      guide: Star,
      template: Copy
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getTypeColor = (type: LeadMagnet['type']) => {
    const colors = {
      pdf: 'bg-red-500',
      checklist: 'bg-blue-500',
      guide: 'bg-green-500',
      template: 'bg-purple-500'
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Create New Lead Magnet */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Lead Magnet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Lead magnet title"
              value={newMagnet.title}
              onChange={(e) => setNewMagnet({...newMagnet, title: e.target.value})}
            />
            <select
              className="px-3 py-2 border rounded-md"
              value={newMagnet.type}
              onChange={(e) => setNewMagnet({...newMagnet, type: e.target.value as LeadMagnet['type']})}
            >
              <option value="pdf">PDF Guide</option>
              <option value="checklist">Checklist</option>
              <option value="guide">Complete Guide</option>
              <option value="template">Template</option>
            </select>
          </div>
          
          <Textarea
            placeholder="Description of what this lead magnet offers"
            value={newMagnet.description}
            onChange={(e) => setNewMagnet({...newMagnet, description: e.target.value})}
            rows={3}
          />
          
          <Button onClick={createLeadMagnet} className="w-full">
            Create Lead Magnet
          </Button>
        </CardContent>
      </Card>

      {/* Existing Lead Magnets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {magnets.map((magnet) => (
          <Card key={magnet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={`${getTypeColor(magnet.type)} text-white`}>
                  {getTypeIcon(magnet.type)}
                  <span className="ml-1">{magnet.type.toUpperCase()}</span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyMagnetUrl(magnet.id)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{magnet.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {magnet.description}
              </p>
              
              <div className="flex justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Download className="h-3 w-3" />
                  <span>{magnet.downloadCount} downloads</span>
                </span>
                <span className="text-green-600 font-medium">
                  {magnet.conversionRate}% conversion
                </span>
              </div>
              
              <Button
                onClick={() => downloadMagnet(magnet)}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Preview Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Magnet Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {magnets.map((magnet) => (
              <div key={magnet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={getTypeColor(magnet.type)}>
                    {getTypeIcon(magnet.type)}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{magnet.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {magnet.downloadCount} downloads • {magnet.conversionRate}% conversion
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {Math.round(magnet.downloadCount * (magnet.conversionRate / 100))} leads
                  </div>
                  <div className="text-xs text-muted-foreground">
                    generated
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadMagnet;
