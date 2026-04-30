import { ContentAngle, PlatformContent } from '../../ai/ai.types';

const platformIcons: Record<string, string> = {
  TikTok: '🎵',
  Instagram: '📸',
  Facebook: '👥',
  X: '𝕏',
};

const angleOrder: ContentAngle[] = ['educational', 'engagement', 'inspiration'];

const angleMeta: Record<ContentAngle, { label: string; icon: string; color: string; bg: string }> = {
  educational: { label: 'Educatief', icon: '📚', color: '#0e7490', bg: '#ecfeff' },
  engagement: { label: 'Engagement', icon: '💬', color: '#7c3aed', bg: '#f5f3ff' },
  inspiration: { label: 'Inspiratie', icon: '✨', color: '#b45309', bg: '#fffbeb' },
};

function renderAngleCard(item: PlatformContent): string {
  const meta = angleMeta[item.angle];
  const hashtags = item.hashtags.map((h) => `#${h}`).join(' ');

  const imageBlock = item.imageUrl
    ? `<img src="${item.imageUrl}" alt="${item.platform} - ${meta.label}" width="100%" style="display:block;border-radius:8px;margin-bottom:12px;" />`
    : '';

  return `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:14px;">
      <div style="display:inline-block;background:${meta.bg};color:${meta.color};font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;margin-bottom:12px;">
        ${meta.icon} ${meta.label}
      </div>
      ${imageBlock}
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:10px;">
        <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${item.postText}</p>
      </div>
      <p style="margin:0 0 6px;font-size:13px;color:#6366f1;font-weight:500;">
        ${hashtags}
      </p>
      <p style="margin:0;font-size:13px;color:#059669;font-style:italic;">
        💡 ${item.callToAction}
      </p>
    </div>`;
}

function renderPlatformGroup(platform: string, items: PlatformContent[]): string {
  const icon = platformIcons[platform] || '📱';

  const sorted = [...items].sort(
    (a, b) => angleOrder.indexOf(a.angle) - angleOrder.indexOf(b.angle),
  );

  const cards = sorted.map(renderAngleCard).join('');

  return `
    <div style="background:#f3f4f6;border-radius:12px;padding:18px;margin-bottom:24px;">
      <h2 style="margin:0 0 14px;font-size:19px;color:#111827;">
        ${icon} ${platform}
      </h2>
      ${cards}
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

  const byPlatform = new Map<string, PlatformContent[]>();
  for (const item of content) {
    const list = byPlatform.get(item.platform) ?? [];
    list.push(item);
    byPlatform.set(item.platform, list);
  }

  const contentHtml = Array.from(byPlatform.entries())
    .map(([platform, items]) => renderPlatformGroup(platform, items))
    .join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dagelijkse content</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#ffffff;">TDM Socials — Dagelijkse Content</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#e0e7ff;">${today}</p>
    </div>

    <div style="background:#ffffff;padding:24px;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Hoi <strong>${clientName}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
        Hier is je content voor vandaag, op maat gemaakt voor de <strong>${industry}</strong>-branche. Per platform vind je <strong>3 verschillende invalshoeken</strong>: educatief, engagement en inspiratie. Kies wat past, kopieer de tekst, download de afbeelding en plaats het direct — of verspreid de drie posts over de week.
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
