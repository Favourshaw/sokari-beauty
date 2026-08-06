/**
 * Read the XSRF-TOKEN cookie Laravel sets, for sending as the X-XSRF-TOKEN
 * header on manual `fetch` requests (Inertia's router does this automatically).
 */
export function csrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}
