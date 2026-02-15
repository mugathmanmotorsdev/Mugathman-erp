// lib/emails/activationEmail.ts
export function activationEmailHTML(
  userName: string,
  activationToken: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const activationUrl = `${baseUrl}/activation?token=${activationToken}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Activate your account</title>
      </head>
      <body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
        <h2>Hello ${userName},</h2>

        <p>
        You have been added as a user to the <strong>Mugathman Motors Management Software</strong>.
        </p>

        <p>
        To gain access to the system, you are required to activate your account by clicking the button below.
        </p>

        <p style="margin:24px 0;">
          <a
            href="${activationUrl}"
            style="
              background:#000;
              color:#fff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:4px;
              display:inline-block;
            "
          >
            Activate Account
          </a>
        </p>

        <p>
        If you were not expecting this invitation, please contact the system administrator.
        </p>

        <p style="font-size:12px; color:#666;">
        This is an automated message from Mugathman Motors Management Software.
        </p>

      </body>
    </html>
  `;
}
