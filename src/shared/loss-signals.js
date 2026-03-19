const DIRECT_LOSS_PATTERNS = [
  /\byou lost\b/,
  /\bvous avez perdu\b/,
  /\bdefaite\b/,
  /\bdefeat\b/,
  /\blost by checkmate\b/,
  /\blost on time\b/,
  /\blost by resignation\b/,
  /\bperdu par echec et mat\b/,
  /\bperdu au temps\b/,
  /\bperdu par abandon\b/,
];

const WINNER_HEADLINE_PATTERNS = [
  /\bblack won\b/,
  /\bwhite won\b/,
  /\bles noirs ont gagne\b/,
  /\bles blancs ont gagne\b/,
];

const POST_GAME_PATTERNS = [
  /\bgame review\b/,
  /\bbilan de la partie\b/,
  /\brematch\b/,
  /\banalysis\b/,
  /\banalyse\b/,
  /\bnouvelle partie\b/,
  /\bnew game\b/,
];

const DECISIVE_ENDING_PATTERNS = [
  /\bcheckmate\b/,
  /\bechec et mat\b/,
  /\btimeout\b/,
  /\bresignation\b/,
  /\babandon\b/,
];

const NEGATIVE_RATING_DELTA_PATTERNS = [
  /\byour new(?: [a-z]+)? rating\b[^.\n]{0,80}\(-\d+\)/,
  /\bvotre nouveau classement\b[^.\n]{0,80}\(-\d+\)/,
  /\b(?:rating|classement)\b[^.\n]{0,80}\(-\d+\)/,
];

function normalizeText(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hasPattern(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function inferLossFromScore(text, playerColor) {
  if (playerColor === "white" && /\b0-1\b/.test(text)) {
    return true;
  }

  if (playerColor === "black" && /\b1-0\b/.test(text)) {
    return true;
  }

  return false;
}

export function evaluateLossSignals({
  pageText = "",
  title = "",
  playerColor = "unknown",
} = {}) {
  const text = normalizeText(`${title} ${pageText}`);
  const reasons = [];
  let score = 0;

  if (hasPattern(text, DIRECT_LOSS_PATTERNS)) {
    reasons.push("direct-loss-text");
    score += 5;
  }

  if (hasPattern(text, WINNER_HEADLINE_PATTERNS)) {
    reasons.push("winner-headline");
    score += 3;
  }

  if (hasPattern(text, NEGATIVE_RATING_DELTA_PATTERNS)) {
    reasons.push("negative-rating-delta");
    score += 5;
  }

  if (hasPattern(text, POST_GAME_PATTERNS)) {
    reasons.push("post-game-context");
    score += 1;
  }

  if (inferLossFromScore(text, playerColor)) {
    reasons.push("loss-score");
    score += 4;
  }

  const hasReliableLossContext =
    reasons.includes("direct-loss-text") ||
    reasons.includes("negative-rating-delta") ||
    reasons.includes("loss-score");

  if (hasReliableLossContext && hasPattern(text, DECISIVE_ENDING_PATTERNS)) {
    reasons.push("decisive-ending-context");
    score += 1;
  }

  return {
    reasons,
    score,
    shouldLock: score >= 5,
  };
}
