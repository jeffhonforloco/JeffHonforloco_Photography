/**
 * Twilio SMS sending for service payment confirmations and shoot reminders.
 *
 * Uses Twilio's REST API directly (no SDK needed in Workers).
 * Requires env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 *
 * Never throws — SMS delivery must not break payment processing.
 */

interface TwilioEnv {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM_NUMBER?: string;
}

export async function sendSms(
  env: TwilioEnv,
  to: string,
  body: string,
): Promise<boolean> {
  try {
    const sid = env.TWILIO_ACCOUNT_SID?.trim();
    const token = env.TWILIO_AUTH_TOKEN?.trim();
    const from = env.TWILIO_FROM_NUMBER?.trim();
    if (!sid || !token || !from) {
      console.log('[twilio] not configured — skipping SMS');
      return false;
    }
    const toNum = to.trim();
    if (!toNum) return false;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
    const params = new URLSearchParams({
      To: toNum,
      From: from,
      Body: body.slice(0, 1600), // Twilio segment limit
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${sid}:${token}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[twilio] send failed:', res.status, errText.slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[twilio] send error:', e);
    return false;
  }
}
