function isChessHostname(hostname) {
  return hostname === "chess.com" || hostname.endsWith(".chess.com");
}

export function isChessUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }

    return isChessHostname(parsedUrl.hostname);
  } catch {
    return false;
  }
}

export function buildBlockedPageUrl(extensionBaseUrl, sourceUrl = "") {
  const blockedUrl = new URL("src/pages/blocked.html", extensionBaseUrl);

  if (sourceUrl) {
    blockedUrl.searchParams.set("from", sourceUrl);
  }

  return blockedUrl.toString();
}
