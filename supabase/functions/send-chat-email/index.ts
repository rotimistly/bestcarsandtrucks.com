import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message_id } = await req.json();
    
    console.log('Fetching message:', message_id);

    // Get the message details
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('*, profiles(email, full_name)')
      .eq('id', message_id)
      .single();

    if (messageError || !message) {
      console.error('Error fetching message:', messageError);
      throw new Error('Message not found');
    }

    console.log('Message found:', message);

    // Get user email from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', message.user_id)
      .single();

    const userEmail = profile?.email || 'unknown@user.com';
    const userName = profile?.full_name || 'User';

    console.log('Sending email to admin...');

    // Send email to admin
    const { error: emailError } = await resend.emails.send({
      from: 'BestCarsAndTrucks <onboarding@resend.dev>',
      to: ['bestcarsandtrucks4@gmail.com'],
      reply_to: userEmail,
      subject: `New message from ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Customer Support Message</h2>
          <p><strong>From:</strong> ${userName} (${userEmail})</p>
          <p><strong>Message ID:</strong> ${message_id}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p>${message.message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            Reply to this email to respond to the customer. Your reply will appear on the website.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-chat-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
