
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, eventTitle, eventDate, eventLocation, name } = await req.json()

    if (!email || !eventTitle) {
      return new Response(
        JSON.stringify({ error: "Email and event title are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    // Generate a verification code - in a real app this would be stored and checked
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const emailResponse = await resend.emails.send({
      from: "Herd Events <onboarding@resend.dev>",
      to: [email],
      subject: `Verify your RSVP for: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6C5DD3;">Please Verify Your RSVP</h1>
          <p>Hello${name ? ' ' + name : ''},</p>
          <p>Thank you for registering for:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #6C5DD3; margin-top: 0;">${eventTitle}</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
          </div>
          
          <div style="background-color: #6C5DD3; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; margin: 0;">Your Verification Code</p>
            <h2 style="font-size: 24px; letter-spacing: 2px; margin: 10px 0;">${verificationCode}</h2>
            <p style="font-size: 14px; margin: 0;">Please use this code to verify your attendance</p>
          </div>
          
          <p>Please confirm your attendance by entering this code when prompted, or by replying to this email.</p>
          <p>We're looking forward to seeing you there!</p>
          <p>Best regards,<br>The Herd Team</p>
        </div>
      `,
    })

    console.log("RSVP verification email sent successfully:", emailResponse)

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error sending RSVP verification email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
