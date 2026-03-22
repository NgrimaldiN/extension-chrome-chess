function normalizeText(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const DIRECT_LOSS_PHRASES = [
  "you lost",
  "defeat",
  "lost by checkmate",
  "lost on time",
  "lost by resignation",
  "vous avez perdu",
  "defaite",
  "perdu par echec et mat",
  "perdu au temps",
  "perdu par abandon",
  "has perdido",
  "perdiste",
  "derrota",
  "perdido por jaque mate",
  "perdido por tiempo",
  "perdido por abandono",
  "voce perdeu",
  "derrota",
  "perdeu por xeque-mate",
  "perdeu no tempo",
  "perdeu por abandono",
  "du hast verloren",
  "niederlage",
  "durch schachmatt verloren",
  "auf zeit verloren",
  "durch aufgabe verloren",
  "hai perso",
  "sconfitta",
  "perso per scacco matto",
  "perso a tempo",
  "perso per abbandono",
  "je hebt verloren",
  "nederlaag",
  "verloren door schaakmat",
  "verloren op tijd",
  "verloren door opgave",
  "przegrales",
  "przegrana",
  "przegrales przez mata",
  "przegrales na czas",
  "przegrales przez poddanie",
  "kaybettin",
  "yenilgi",
  "mat ile kaybettin",
  "sureden kaybettin",
  "terk ederek kaybettin",
  "вы проиграли",
  "поражение",
  "проиграли матом",
  "проиграли по времени",
  "проиграли из-за сдачи",
  "チェックメイトで負けました",
  "時間切れで負けました",
  "投了で負けました",
  "負けました",
  "将死告负",
  "超时告负",
  "认输告负",
  "你输了",
  "失败",
].map(normalizeText);

const WINNER_HEADLINE_PHRASES = [
  "black won",
  "white won",
  "les noirs ont gagne",
  "les blancs ont gagne",
  "ganaron las negras",
  "ganaron las blancas",
  "las negras ganaron",
  "las blancas ganaron",
  "as pretas venceram",
  "as brancas venceram",
  "pretas venceram",
  "brancas venceram",
  "schwarz hat gewonnen",
  "weiss hat gewonnen",
  "weiß hat gewonnen",
  "il nero ha vinto",
  "il bianco ha vinto",
  "i neri hanno vinto",
  "i bianchi hanno vinto",
  "zwart won",
  "wit won",
  "czarne wygraly",
  "biale wygraly",
  "siyah kazandi",
  "beyaz kazandi",
  "черные победили",
  "белые победили",
  "黒の勝ち",
  "白の勝ち",
  "黑方胜",
  "白方胜",
].map(normalizeText);

const POST_GAME_PHRASES = [
  "game review",
  "analysis",
  "rematch",
  "new game",
  "bilan de la partie",
  "analyse",
  "nouvelle partie",
  "revision de la partida",
  "analisis",
  "nueva partida",
  "revancha",
  "revisao da partida",
  "analise",
  "nova partida",
  "spielanalyse",
  "neues spiel",
  "revisione della partita",
  "analisi",
  "nuova partita",
  "rivincita",
  "partijanalyse",
  "nieuwe partij",
  "analiza partii",
  "analiza",
  "nowa gra",
  "rewanz",
  "oyun analizi",
  "analiz",
  "yeni oyun",
  "rovans",
  "анализ партии",
  "анализ",
  "новая игра",
  "реванш",
  "ゲームレビュー",
  "解析",
  "新しいゲーム",
  "再戦",
  "对局回顾",
  "分析",
  "新对局",
  "再战",
].map(normalizeText);

const DECISIVE_ENDING_PHRASES = [
  "checkmate",
  "echec et mat",
  "jaque mate",
  "xeque-mate",
  "schachmatt",
  "scacco matto",
  "schaakmat",
  "mat",
  "timeout",
  "perdu au temps",
  "por tiempo",
  "no tempo",
  "auf zeit",
  "a tempo",
  "op tijd",
  "na czas",
  "sureden",
  "по времени",
  "resignation",
  "abandon",
  "abandono",
  "aufgabe",
  "abbandono",
  "opgave",
  "poddanie",
  "terk",
  "сдачи",
  "投了",
  "认输",
  "チェックメイト",
  "時間切れ",
  "将死",
  "超时",
].map(normalizeText);

const NEGATIVE_RATING_DELTA_CONTEXT_PHRASES = [
  "rating",
  "classement",
  "clasificacion",
  "classificacao",
  "wertung",
  "punteggio",
  "classifica",
  "ranking",
  "рейтинг",
  "レーティング",
  "等级分",
  "elo",
].map(normalizeText);

const NEGATIVE_RATING_DELTA_PATTERN = /\(-\d+\)/;

function hasPhrase(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function hasNegativeRatingDelta(text) {
  return (
    NEGATIVE_RATING_DELTA_PATTERN.test(text) &&
    hasPhrase(text, NEGATIVE_RATING_DELTA_CONTEXT_PHRASES)
  );
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

  if (hasPhrase(text, DIRECT_LOSS_PHRASES)) {
    reasons.push("direct-loss-text");
    score += 5;
  }

  if (hasPhrase(text, WINNER_HEADLINE_PHRASES)) {
    reasons.push("winner-headline");
    score += 3;
  }

  if (hasNegativeRatingDelta(text)) {
    reasons.push("negative-rating-delta");
    score += 5;
  }

  if (hasPhrase(text, POST_GAME_PHRASES)) {
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

  if (hasReliableLossContext && hasPhrase(text, DECISIVE_ENDING_PHRASES)) {
    reasons.push("decisive-ending-context");
    score += 1;
  }

  return {
    reasons,
    score,
    shouldLock: score >= 5,
  };
}
