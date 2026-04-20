import { PlatformContent } from '../../ai/ai.types';

const platformIcons: Record<string, string> = {
  TikTok: '🎵',
  Instagram: '📸',
  Facebook: '👥',
  X: '𝕏',
};

function renderContent(item: PlatformContent): string {
  const icon = platformIcons[item.platform] || '📱';
  const hashtags = item.hashtags.map((h) => `#${h}`).join(' ');

  const imageBlock = item.imageUrl
    ? `<img src="${item.imageUrl}" alt="${item.platform}" width="100%" style="display:block;border-radius:8px;margin-bottom:12px;" />`
    : '';

  return `
    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">
        ${icon} ${item.platform}
      </h2>
      ${imageBlock}
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
        <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${item.postText}</p>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#6366f1;font-weight:500;">
        ${hashtags}
      </p>
      <p style="margin:0;font-size:13px;color:#059669;font-style:italic;">
        💡 ${item.callToAction}
      </p>
    </div>`;
}

export function buildContentEmailHtml(
  clientName: string,
  industry: string,
  content: PlatformContent[],
): string {
  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const contentHtml = content.map(renderContent).join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dagelijkse content</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#111827;">TDM Socials — Dagelijkse Content</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#e0e7ff;">${today}</p>
    </div>

    <div style="background:#ffffff;padding:24px;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 20px;font-size:15px;color:#374151;">
        Hoi <strong>${clientName}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        Hier is je klaar-om-te-posten content voor vandaag, op maat gemaakt voor de <strong>${industry}</strong>-branche. Kopieer de tekst, download de afbeelding en plaats het direct!
      </p>

      ${contentHtml}

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Je ontvangt dit bericht omdat je bent aangemeld voor dagelijkse content van TDM Socials.<br/>
        Afbeeldingen zijn beschikbaar tot 1 jaar na verzending.<br/>
        info@tdmsocials.nl
      </p>
    </div>
  </div>
</body>
</html>`;
}
