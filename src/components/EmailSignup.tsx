import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEmailSequence } from '@/hooks/useEmailSequence';
import { supabase } from '@/integrations/supabase/client';

interface EmailFormData {
  email: string;
}

const EmailSignup = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmailFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLead } = useEmailAutomation();
  const { trackEmailSignup } = useAnalytics();
  const { addLead: addEmailLead } = useEmailSequence();

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    
    try {
      // Send newsletter signup via edge function
      const { data: result } = await supabase.functions.invoke('send-contact-email', {
        body: {
          type: 'newsletter',
          name: data.email.split('@')[0], // Use part of email as name for newsletter
          email: data.email
        }
      });

      if (result?.success) {
        // Add to local systems for tracking
        addLead(data.email, 'website');
        await addEmailLead(data.email);
        
        // Track analytics
        trackEmailSignup(data.email, 'homepage_signup');
        
        reset();
        toast({
          title: "Check your inbox! 📩",
          description: "Your prep guide is on its way. Welcome to Jeff's exclusive community!",
        });
      } else {
        throw new Error(result?.error || 'Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto text-center px-6">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            📩 Get the Free Prep Guide
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Join my list and get your free editorial shoot prep guide—plus insider tips and early access to booking windows.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Your email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="h-12 text-black placeholder:text-gray-500 border-0 focus:ring-2 focus:ring-white/20"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-2 text-left">{errors.email.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 px-8 bg-white text-black font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {isLoading ? 'Sending...' : 'Get the Guide'}
          </Button>
        </form>
        
        <p className="mt-6 text-sm text-gray-400">
          🎁 Free prep guide + exclusive photography tips • Unsubscribe anytime
        </p>
      </div>
    </section>
  );
};

export default EmailSignup;