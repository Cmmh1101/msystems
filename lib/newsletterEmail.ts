// Wraps TipTap's HTML output in a minimal, self-contained email shell. Email
// clients strip <style> tags unpredictably and have poor CSS support, so this
// stays deliberately simple: inline-safe fonts, a max-width container, and
// real semantic tags (produced by TipTap itself) for bold/lists/alignment/
// links/images — no external stylesheet, since one wouldn't survive most
// inboxes anyway.
export function wrapNewsletterHtml(contentHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F5F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;color:#1C2530;line-height:1.6;">
      ${contentHtml}
      <hr style="border:none;border-top:1px solid rgba(28,37,48,0.12);margin:32px 0 16px;" />
      <p style="font-size:12px;color:#4A5568;">
        <a href="${unsubscribeUrl}" style="color:#4A5568;">Unsubscribe</a>
      </p>
    </div>
  </body>
</html>`;
}

// Best-effort plain-text fallback for the email's alternate text part —
// only needs to be readable, not a pixel-perfect reconstruction.
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, "[image: $1]")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
