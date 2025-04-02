
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

    const emailResponse = await resend.emails.send({
      from: "Herd Events <onboarding@resend.dev>",
      to: [email],
      subject: `You're registered for: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6C5DD3;">Your Event Registration is Confirmed!</h1>
          <p>Hello${name ? ' ' + name : ''},</p>
          <p>You have successfully registered for the following event:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #6C5DD3; margin-top: 0;">${eventTitle}</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
          </div>
          <p>We're looking forward to seeing you there!</p>
          <p>Best regards,<br>The Herd Team</p>
        </div>
      `,
    })

    console.log("Email sent successfully:", emailResponse)

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
