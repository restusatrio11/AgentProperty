// src/lib/email.js

/**
 * Sends an email using the Resend REST API (no external npm dependencies required)
 * Fallback to logging the email if RESEND_API_KEY is not set
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("RESEND_API_KEY tidak dikonfigurasi. Menulis email ke log console:");
    console.log("=========================================");
    console.log(`FROM: Prime Property <${fromEmail}>`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log("HTML CONTENT:");
    console.log(html);
    console.log("=========================================");
    return { success: false, reason: "RESEND_API_KEY is missing (logged to console)" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Prime Property <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Email berhasil terkirim melalui Resend API:", data);
      return { success: true, data };
    } else {
      const errorData = await res.json().catch(() => null);
      const errorText = errorData ? JSON.stringify(errorData) : await res.text();
      console.error("Resend API mengembalikan error:", errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error("Gagal mengirim email melalui Resend API:", error);
    return { success: false, error: error.message };
  }
}
