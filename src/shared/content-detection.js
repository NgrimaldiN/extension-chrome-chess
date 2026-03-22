function normalizeFingerprintText(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function buildLossFingerprint({ title = "", pageText = "" } = {}) {
  return normalizeFingerprintText(`${title} ${pageText}`).slice(0, 4000);
}

export function shouldReportLossFingerprint({
  fingerprint = "",
  lastReportedFingerprint = "",
} = {}) {
  return Boolean(fingerprint) && fingerprint !== lastReportedFingerprint;
}
