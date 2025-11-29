import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Extract email content from Resend webhook
    const { from, to, subject, html, text } = payload;
    
    // Extract user email from the "to" field (the original sender)
    const adminEmail = from?.email || from;
    const userEmail = to?.[0]?.email || to;

    console.log('Admin email:', adminEmail);
    console.log('User email:', userEmail);

    if (!userEmail) {
      throw new Error('User email not found in webhook');
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      console.error('Error finding user profile:', profileError);
      throw new Error('User profile not found');
    }

    console.log('Found user profile:', profile.id);

    // Parse the email body (text or html)
    const messageContent = text || html?.replace(/<[^>]*>/g, '') || '';
    
    // Remove any quoted text (replies often include previous messages)
    const cleanMessage = messageContent.split(/On .* wrote:|>|From:|Sent:/)[0].trim();

    console.log('Inserting admin reply message:', cleanMessage);

    // Insert admin's reply as a new message
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: profile.id,
        message: cleanMessage,
        is_admin: true,
      });

    if (insertError) {
      console.error('Error inserting message:', insertError);
      throw insertError;
    }

    console.log('Admin reply posted successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in receive-chat-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
