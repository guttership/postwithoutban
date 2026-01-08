import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendAccessEmailParams {
  to: string;
  accessToken: string;
}

export async function sendAccessEmail({ to, accessToken }: SendAccessEmailParams) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const accessUrl = `${baseUrl}/access?token=${accessToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "PostWithoutBan <onboarding@resend.dev>", // Utilise ton domaine vérifié en production
      to: [to],
      subject: "🎉 Votre accès à PostWithoutBan",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #f4f4f5; font-size: 24px; margin: 0;">
                <span style="color: #ea580c;">Post</span>WithoutBan
              </h1>
            </div>
            
            <!-- Content -->
            <div style="background-color: #18181b; border-radius: 12px; padding: 32px; text-align: center;">
              <h2 style="color: #f4f4f5; font-size: 20px; margin: 0 0 16px 0;">
                Merci pour votre achat !
              </h2>
              <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Vous avez maintenant un accès à vie à PostWithoutBan.<br>
                Cliquez sur le bouton ci-dessous pour accéder à l'application.
              </p>
              
              <!-- CTA Button -->
              <a href="${accessUrl}" style="display: inline-block; background-color: #ea580c; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Accéder à l'application
              </a>
              
              <p style="color: #71717a; font-size: 14px; margin: 24px 0 0 0;">
                Ce lien est personnel et vous permet d'accéder à l'app depuis n'importe quel appareil.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #52525b; font-size: 12px; margin: 0;">
                PostWithoutBan - Reddit strategy for indie hackers
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error };
    }

    console.log("✉️ Email envoyé:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}
