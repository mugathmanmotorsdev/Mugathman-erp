export function resetPasswordEmailHTML(name: string, token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    return `
        <h2>Hello ${name},</h2>

        <p>
        A request was received to reset the password for your account on the
        <strong>Mugathman Motors Management Software</strong>.
        </p>

        <p>
        To proceed, click the button below to reset your password.
        </p>

        <p style="margin:24px 0;">
        <a
            href="${resetUrl}"
            style="
            background:#000;
            color:#fff;
            padding:12px 20px;
            text-decoration:none;
            border-radius:4px;
            display:inline-block;
            "
        >
            Reset Password
        </a>
        </p>

        <p>
        If you did not request a password reset, no action is required.
        For security reasons, this link will expire after a limited time.
        </p>

        <p style="font-size:12px; color:#666;">
        This is an automated message from Mugathman Motors Management Software.
        </p>
    `
}