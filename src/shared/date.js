function pad(value) {
  return String(value).padStart(2, "0");
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function toLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

export function addDaysToDateKey(dateKey, days) {
  const date = parseDateKey(dateKey);

  date.setUTCDate(date.getUTCDate() + days);

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join("-");
}

export function formatDateKeyForFrenchCopy(dateKey) {
  const date = parseDateKey(dateKey);

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
