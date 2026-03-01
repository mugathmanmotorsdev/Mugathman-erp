import { resend } from "../resend"

export async function sendEmail(to: string, subject: string, html: string) {
    const { data, error } = await resend.emails.send({
        from: "Mugathman Motors <noreply@mugathmanmotors.com>",
        to: [to],
        subject: subject,
        html: html
    })

    return { data, error }
}