/**
 * Split a rich-text/plain-text body into display paragraphs. Every line break
 * starts a new paragraph; legacy HTML (<p>/<br>) is normalised and any
 * remaining tags are stripped so nothing is rendered as raw HTML.
 */
export function toParagraphs(body: string): string[] {
    return body
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split(/\n+/)
        .map((para) => para.trim())
        .filter(Boolean);
}
