
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HUME_API_KEY = Deno.env.get('HUME_API_KEY');
const HUME_API_URL = "https://api.hume.ai/v0/synthesize/text";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Converting text to speech: "${text}"`);
    
    const response = await fetch(HUME_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': HUME_API_KEY
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId || "natural-en-male-alan",
        output_format: "mp3"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Hume API error:', errorData);
      throw new Error(`Hume API error: ${response.status} ${errorData.message || response.statusText}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log(`Successfully converted text to speech, audio length: ${base64Audio.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioContent: base64Audio 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
