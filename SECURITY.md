# Security and privacy

`xinchao-dream-cloudmap` is a renderer. It does not fetch APIs, store tokens,
write cookies, or upload dream text.

- Give the component only the dream fields the current viewer is allowed to see.
- Keep OAuth, service and dashboard tokens on your server.
- Do not expose private dream text through a public JSON endpoint.
- Missing `lucidity` stays unknown; the renderer never invents a score.

Please report security issues privately to the repository owner instead of
opening an issue containing real dream text or credentials.
