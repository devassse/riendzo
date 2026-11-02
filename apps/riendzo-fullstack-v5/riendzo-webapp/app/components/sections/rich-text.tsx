import { sanitizeHtml } from "@/lib/cms/sanitize";

/**
 * Renders rich text written in the BackOffice editor.
 * The HTML is sanitised again here (allow-list), so even content edited by hand
 * in the data files can't inject scripts.
 */
export default function RichText({ html, className = "" }: { html?: string; className?: string }) {
    if (!html) return null;
    // eslint-disable-next-line react/no-danger
    return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
