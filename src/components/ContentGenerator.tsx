import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Instagram, FileText, Sparkles, Camera } from 'lucide-react';

interface ContentPiece {
  id: string;
  type: 'instagram-carousel' | 'blog-post' | 'email-template' | 'social-caption';
  title: string;
  content: string;
  createdAt: string;
  platform?: string;
}

interface InstagramSlide {
  slideNumber: number;
  title: string;
  content: string;
  designNotes: string;
}

const ContentGenerator = () => {
  const [contents, setContents] = useState<ContentPiece[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [contentType, setContentType] = useState<ContentPiece['type']>('instagram-carousel');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const { toast } = useToast();

  const instagramTemplates = {
    'model-prep': {
      title: 'Ultimate Model Prep Guide',
      slides: [
        {
          slideNumber: 1,
          title: 'Look Like a Cover Star',
          content: 'Ultimate Prep Guide for Editorial Shoots\nBy Jeff Honforloco Photography\n\n📸 Swipe for pro secrets →',
          designNotes: 'Hero slide with bold typography, your signature style'
        },
        {
          slideNumber: 2,
          title: 'What to Expect',
          content: '✨ What to Expect:\n\n• Moodboarding & creative direction\n• Wardrobe styling & lighting setup\n• Professional retouching\n• Gallery-ready final images',
          designNotes: 'Clean list format with elegant icons'
        },
        {
          slideNumber: 3,
          title: 'How to Prepare',
          content: '💫 How to Prepare:\n\n• Hydrate & rest well (crucial!)\n• Bring 2-3 outfit options\n• Arrive with clean hair & skin\n• Come with positive energy',
          designNotes: 'Lifestyle imagery background with overlay text'
        },
        {
          slideNumber: 4,
          title: 'Posing Secrets',
          content: '📸 Posing Secrets:\n\n• Elongate your neck\n• Chin slightly forward\n• Keep hands soft & natural\n• Shift weight to back foot\n• Trust your photographer',
          designNotes: 'Behind-the-scenes photo with posing tips'
        },
        {
          slideNumber: 5,
          title: 'Call to Action',
          content: '✨ Ready to Book?\n\nGet your free prep guide & book your shoot today!\n\n👆 Link in bio\n📱 Visit jeffhonforlocophotos.com/contact\n\n#JeffHonforloco #EditorialPhotography #ModelPrep',
          designNotes: 'Strong CTA with your best portfolio image'
        }
      ]
    },
    'behind-scenes': {
      title: 'Behind the Scenes Magic',
      slides: [
        {
          slideNumber: 1,
          title: 'Behind the Magic',
          content: 'See How Magazine Covers Are Made\n\nBehind the Scenes with Jeff Honforloco\n\n📸 Swipe for the process →',
          designNotes: 'Dynamic behind-the-scenes hero image'
        },
        {
          slideNumber: 2,
          title: 'The Concept',
          content: '💡 Every Great Shot Starts With:\n\n• A clear creative vision\n• Mood board development\n• Location scouting\n• Team coordination',
          designNotes: 'Mood board collage visual'
        },
        {
          slideNumber: 3,
          title: 'The Setup',
          content: '🎬 On Set:\n\n• Professional lighting setup\n• Multiple camera angles\n• Hair & makeup touch-ups\n• Constant communication',
          designNotes: 'Equipment and setup photography'
        },
        {
          slideNumber: 4,
          title: 'The Details',
          content: '✨ The Details Matter:\n\n• Perfect lighting angles\n• Wardrobe adjustments\n• Expression coaching\n• Capturing the magic moment',
          designNotes: 'Close-up details of the process'
        },
        {
          slideNumber: 5,
          title: 'The Result',
          content: '🔥 The Final Result\n\nFrom concept to cover-worthy image.\n\nReady to create your own magic?\n\n📩 DM to book your session\n🔗 Link in bio',
          designNotes: 'Before/after or final glamorous result'
        }
      ]
    },
    'styling-tips': {
      title: '5 Styling Secrets',
      slides: [
        {
          slideNumber: 1,
          title: 'Styling Secrets',
          content: '5 Styling Secrets That Transform Every Photo\n\nPro tips from editorial fashion shoots\n\n👗 Swipe to learn →',
          designNotes: 'Fashion-forward hero image'
        },
        {
          slideNumber: 2,
          title: 'Color Psychology',
          content: '🎨 Secret #1: Color Psychology\n\n• Certain colors photograph better\n• Cool tones = sophisticated\n• Warm tones = approachable\n• Neutrals = timeless elegance',
          designNotes: 'Color palette examples'
        },
        {
          slideNumber: 3,
          title: 'Texture Play',
          content: '✨ Secret #2: Texture Play\n\n• Mix smooth & textured fabrics\n• Adds visual depth\n• Creates interesting shadows\n• Elevates simple outfits',
          designNotes: 'Texture detail shots'
        },
        {
          slideNumber: 4,
          title: 'Silhouette Power',
          content: '👗 Secret #3: Silhouette Matters\n\n• The right fit creates power\n• Structured pieces = confidence\n• Flowing fabrics = movement\n• Proportions tell a story',
          designNotes: 'Silhouette comparison images'
        },
        {
          slideNumber: 5,
          title: 'Book Your Session',
          content: '💫 Ready to Apply These Secrets?\n\nLet\'s create magazine-worthy images together.\n\n📸 Book your styling consultation\n🔗 Link in bio\n\n#StylingSecrets #FashionPhotography',
          designNotes: 'Strong portfolio image with CTA'
        }
      ]
    }
  };

  const generateInstagramCarousel = (templateKey?: string) => {
    const template = templateKey ? instagramTemplates[templateKey as keyof typeof instagramTemplates] : null;
    
    if (template) {
      const content = template.slides.map(slide => 
        `**Slide ${slide.slideNumber}: ${slide.title}**\n\n${slide.content}\n\n*Design Note: ${slide.designNotes}*\n\n---\n`
      ).join('\n');

      return {
        title: template.title,
        content: `# Instagram Carousel: ${template.title}\n\n${content}\n\n## Hashtag Suggestions:\n#JeffHonforloco #EditorialPhotography #FashionPhotography #BehindTheScenes #ModelPrep #BeautyPhotography #PhotographyTips #NYC #CreativeDirection\n\n## Posting Schedule:\nBest times: Tuesday-Thursday, 11 AM or 7 PM EST\nUse Stories to tease the carousel 1 hour before posting.`
      };
    }

    // Custom generation based on inputs
    const customSlides = [
      {
        slideNumber: 1,
        title: 'Hook Slide',
        content: `${topic}\n\nProfessional insights for ${targetAudience}\n\n📸 Swipe to learn more →`,
        designNotes: 'Eye-catching hero image with bold text overlay'
      },
      {
        slideNumber: 2,
        title: 'Value Slide 1',
        content: `💡 Key Insight #1:\n\n${keyPoints.split(',')[0] || 'Professional preparation is everything'}\n\nThis is what separates amateur from professional results.`,
        designNotes: 'Clean, minimal design with icon'
      },
      {
        slideNumber: 3,
        title: 'Value Slide 2',
        content: `✨ Key Insight #2:\n\n${keyPoints.split(',')[1] || 'Details make the difference'}\n\nSmall adjustments create major impact.`,
        designNotes: 'Behind-the-scenes or detail shot'
      },
      {
        slideNumber: 4,
        title: 'Value Slide 3',
        content: `🎯 Key Insight #3:\n\n${keyPoints.split(',')[2] || 'Professional guidance matters'}\n\nWorking with experts elevates your results.`,
        designNotes: 'Professional work example'
      },
      {
        slideNumber: 5,
        title: 'Call to Action',
        content: `Ready to elevate your ${topic.toLowerCase()}?\n\nLet's work together to create something extraordinary.\n\n📩 DM to get started\n🔗 Link in bio\n\n#JeffHonforloco`,
        designNotes: 'Strong portfolio piece with clear CTA'
      }
    ];

    const content = customSlides.map(slide => 
      `**Slide ${slide.slideNumber}: ${slide.title}**\n\n${slide.content}\n\n*Design Note: ${slide.designNotes}*\n\n---\n`
    ).join('\n');

    return {
      title: topic || 'Custom Instagram Carousel',
      content: `# Instagram Carousel: ${topic}\n\n${content}\n\n## Target Audience: ${targetAudience}\n\n## Hashtag Suggestions:\n#JeffHonforloco #Photography #EditorialPhotography #Professional #Creative #${topic.replace(/\s+/g, '')}`
    };
  };

  const generateBlogPost = () => {
    return {
      title: `${topic}: A Professional Guide`,
      content: `# ${topic}: A Professional Guide

## Introduction

${topic} is a crucial aspect of professional photography that can make or break your final results. In this comprehensive guide, I'll share insights from years of fashion and editorial photography experience.

## Understanding the Fundamentals

When working with ${targetAudience}, it's essential to understand that every detail matters. The difference between good and extraordinary lies in the preparation and execution.

### Key Points to Remember:

${keyPoints.split(',').map((point, index) => `${index + 1}. ${point.trim()}`).join('\n')}

## Professional Techniques

Through my work with top brands and magazines, I've developed specific techniques that consistently deliver exceptional results.

### The Process

1. **Initial Consultation**: Understanding your vision and goals
2. **Preparation Phase**: Detailed planning and coordination
3. **Execution**: Professional shooting with expert guidance
4. **Post-Production**: Careful editing and retouching
5. **Delivery**: Gallery-ready final images

## Tips for Success

- Always prioritize quality over quantity
- Invest in professional guidance
- Pay attention to details
- Trust the creative process
- Communicate openly with your team

## Conclusion

${topic} requires expertise, experience, and artistic vision. Whether you're working on a personal project or commercial campaign, the right approach makes all the difference.

Ready to bring your vision to life? [Contact me](/contact) to discuss your next project.

---

*Jeff Honforloco is a fashion and editorial photographer based in New York, specializing in beauty, fashion, and lifestyle photography for top brands and publications.*`
    };
  };

  const generateEmailTemplate = () => {
    return {
      title: `Email: ${topic}`,
      content: `Subject: ${topic} - Exclusive Insights from Jeff Honforloco

Hi [First Name],

Hope this email finds you inspired and ready to create something beautiful!

I wanted to share some exclusive insights about ${topic} based on my recent work with ${targetAudience}.

Here's what I've learned:

${keyPoints.split(',').map((point, index) => `${index + 1}. ${point.trim()}`).join('\n')}

These insights come from real-world experience working with top brands and publications. The difference they make in the final results is remarkable.

If you're interested in applying these concepts to your own project, I'd love to help bring your vision to life.

You can:
• Reply to this email with your questions
• Book a consultation at [website link]
• Follow along for more tips on Instagram @jeffhonforloco

Looking forward to creating something extraordinary together!

Best regards,
Jeff Honforloco

P.S. I have a few spots opening up next month for new projects. If you've been thinking about working together, now's the perfect time to reach out.

---

[Unsubscribe] | [Update Preferences] | [View Online]`
    };
  };

  const generateSocialCaption = () => {
    return {
      title: `Social Caption: ${topic}`,
      content: `${topic} ✨

Working with ${targetAudience} has taught me that the magic is in the details.

Key insights:
${keyPoints.split(',').map(point => `• ${point.trim()}`).join('\n')}

Every shoot is a collaboration, every image tells a story.

What story do you want to tell?

📸 Book your session → link in bio

#JeffHonforloco #Photography #${topic.replace(/\s+/g, '')} #Luxury #Professional #Creative #NYC #Editorial #Fashion #Beauty

---

Alternative shorter version:

${topic} magic ✨

The secret? ${keyPoints.split(',')[0]?.trim() || 'Professional preparation and attention to detail'}.

Ready to create something extraordinary?
📩 DM me

#JeffHonforloco #Photography #Professional`
    };
  };

  const generateContent = () => {
    if (!topic) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic to generate content",
        variant: "destructive"
      });
      return;
    }

    let generated;
    switch (contentType) {
      case 'instagram-carousel':
        generated = generateInstagramCarousel();
        break;
      case 'blog-post':
        generated = generateBlogPost();
        break;
      case 'email-template':
        generated = generateEmailTemplate();
        break;
      case 'social-caption':
        generated = generateSocialCaption();
        break;
      default:
        return;
    }

    const newContent: ContentPiece = {
      id: `content_${Date.now()}`,
      type: contentType,
      title: generated.title,
      content: generated.content,
      createdAt: new Date().toISOString()
    };

    setContents([newContent, ...contents]);
    
    // Save to localStorage
    localStorage.setItem('generated_content', JSON.stringify([newContent, ...contents]));

    toast({
      title: "Content Generated! 🎉",
      description: `${contentType.replace('-', ' ')} created successfully`,
    });
  };

  const applyTemplate = (templateKey: string) => {
    const generated = generateInstagramCarousel(templateKey);
    
    const newContent: ContentPiece = {
      id: `content_${Date.now()}`,
      type: 'instagram-carousel',
      title: generated.title,
      content: generated.content,
      createdAt: new Date().toISOString()
    };

    setContents([newContent, ...contents]);
    localStorage.setItem('generated_content', JSON.stringify([newContent, ...contents]));

    toast({
      title: "Template Applied! 📸",
      description: `${generated.title} carousel created`,
    });
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied! 📋",
      description: "Content copied to clipboard",
    });
  };

  const downloadContent = (piece: ContentPiece) => {
    const blob = new Blob([piece.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${piece.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: ContentPiece['type']) => {
    const icons = {
      'instagram-carousel': Instagram,
      'blog-post': FileText,
      'email-template': FileText,
      'social-caption': Camera
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-1 ${activeTab === 'create' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Content
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'library' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('library')}
        >
          Content Library
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Quick Instagram Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => applyTemplate('model-prep')}
                >
                  <div className="font-medium">Model Prep Guide</div>
                  <div className="text-sm text-muted-foreground text-left">
                    5-slide carousel about preparation for shoots
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => applyTemplate('behind-scenes')}
                >
                  <div className="font-medium">Behind the Scenes</div>
                  <div className="text-sm text-muted-foreground text-left">
                    Show your creative process and expertise
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => applyTemplate('styling-tips')}
                >
                  <div className="font-medium">Styling Secrets</div>
                  <div className="text-sm text-muted-foreground text-left">
                    Professional styling tips that transform photos
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Content Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Content Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Content topic (e.g., 'Beauty Photography Tips')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <select
                  className="px-3 py-2 border rounded-md"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentPiece['type'])}
                >
                  <option value="instagram-carousel">Instagram Carousel</option>
                  <option value="blog-post">Blog Post</option>
                  <option value="email-template">Email Template</option>
                  <option value="social-caption">Social Caption</option>
                </select>
              </div>

              <Input
                placeholder="Target audience (e.g., 'aspiring models', 'brand managers')"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />

              <Textarea
                placeholder="Key points to cover (comma-separated)"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={3}
              />

              <Button onClick={generateContent} className="w-full">
                Generate Content
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'library' && (
        <div className="space-y-4">
          {contents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No content generated yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Switch to the Create tab to generate your first piece of content.
                </p>
              </CardContent>
            </Card>
          ) : (
            contents.map((piece) => (
              <Card key={piece.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        {getTypeIcon(piece.type)}
                        <span>{piece.type.replace('-', ' ')}</span>
                      </Badge>
                      <h3 className="font-medium">{piece.title}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyContent(piece.content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadContent(piece)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(piece.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                      {piece.content.substring(0, 500)}
                      {piece.content.length > 500 && '...'}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;