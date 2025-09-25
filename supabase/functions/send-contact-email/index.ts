import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  type: 'contact' | 'booking' | 'newsletter';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service?: string;
  budget?: string;
  projectDate?: string;
  location?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ContactEmailRequest = await req.json();
    console.log("Received contact data:", requestData);

    const { type, name, email, phone, message, service, budget, projectDate, location } = requestData;

    // Email to Jeff
    const emailToJeff = await resend.emails.send({
      from: "Photography Website <noreply@resend.dev>",
      to: ["info@jeffhonforlocophotos.com"],
      subject: `New ${type} inquiry from ${name}`,
      html: generateEmailHtml({ type, name, email, phone, message, service, budget, projectDate, location }),
    });

    console.log("Email to Jeff sent:", emailToJeff);

    // Confirmation email to client (except for newsletter signups)
    if (type !== 'newsletter') {
      const confirmationEmail = await resend.emails.send({
        from: "Jeff Honforloco Photography <noreply@resend.dev>",
        to: [email],
        subject: "Thank you for your inquiry!",
        html: generateConfirmationHtml(name, type),
      });

      console.log("Confirmation email sent:", confirmationEmail);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully",
        emailToJeff: emailToJeff.data?.id,
        confirmationSent: type !== 'newsletter'
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

function generateEmailHtml(data: ContactEmailRequest): string {
  const { type, name, email, phone, message, service, budget, projectDate, location } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
        New ${type.charAt(0).toUpperCase() + type.slice(1)} Inquiry
      </h2>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #666; margin-bottom: 15px;">Contact Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
      </div>

      ${service ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #666; margin-bottom: 15px;">Project Details</h3>
          <p><strong>Service:</strong> ${service}</p>
          ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
          ${projectDate ? `<p><strong>Project Date:</strong> ${projectDate}</p>` : ''}
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        </div>
      ` : ''}

      ${message ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #666; margin-bottom: 15px;">Message</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>This inquiry was submitted through jeffhonforlocophotos.com</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}

function generateConfirmationHtml(name: string, type: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Thank you for your ${type} inquiry!</h2>
      
      <p>Hi ${name},</p>
      
      <p>Thank you for reaching out! I've received your message and will get back to you within 24 hours.</p>
      
      <p>In the meantime, feel free to check out my latest work on <a href="https://jeffhonforlocophotos.com" style="color: #000;">my portfolio</a>.</p>
      
      <p>Best regards,<br>
      <strong>Jeff Honforloco</strong><br>
      Hyper-creative photographer<br>
      <a href="mailto:info@jeffhonforlocophotos.com">info@jeffhonforlocophotos.com</a><br>
      <a href="tel:+646-379-4237">+646-379-4237</a></p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>Jeff Honforloco Photography | Providence, RI</p>
      </div>
    </div>
  `;
}

serve(handler);