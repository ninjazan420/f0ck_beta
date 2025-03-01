import Comment from '@/models/Comment';
import dbConnect from '@/lib/db/mongodb';

interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

export class SpamDetectionService {
  private static readonly SPAM_PATTERNS = [
    /\b(viagra|cialis|casino|poker|bet|gambling)\b/i,
    /https?:\/\/[^\s]+\.(ru|cn|tk|top|xyz|pw)\b/i,
    /\b(free|cheap|discount|offer|deal|buy|sell)\b.*\b(now|today|limited)\b/i,
  ];

  private static readonly SUSPICIOUS_PATTERNS = [
    /(.)\1{4,}/,  // Wiederholende Zeichen
    /[A-Z]{5,}/,  // Viele Großbuchstaben
    /\b(www|http)\b/i,  // URLs
    /\$\d+/,  // Geldbeträge
  ];

  static async checkForSpam(content: string, authorId: string): Promise<SpamCheckResult> {
    const reasons: string[] = [];
    let spamScore = 0;

    // Grundlegende Textanalyse
    if (content.length < 2) {
      reasons.push('Content too short');
      spamScore += 0.5;
    }

    // Spam-Pattern-Prüfung
    for (const pattern of this.SPAM_PATTERNS) {
      if (pattern.test(content)) {
        reasons.push('Contains spam keywords');
        spamScore += 0.7;
      }
    }

    // Verdächtige Pattern-Prüfung
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        reasons.push('Contains suspicious patterns');
        spamScore += 0.3;
      }
    }

    // Link-Analyse
    const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (urlCount > 2) {
      reasons.push('Too many URLs');
      spamScore += 0.4;
    }

    // Zeitbasierte Analyse (simuliert)
    const recentComments = await this.getRecentCommentCount(authorId, 5); // 5 Minuten
    if (recentComments > 5) {
      reasons.push('Too many comments in short time');
      spamScore += 0.6;
    }

    return {
      isSpam: spamScore >= 1.0,
      confidence: Math.min(spamScore, 1.0),
      reasons: [...new Set(reasons)] // Duplikate entfernen
    };
  }

  private static async getRecentCommentCount(authorId: string, minutes: number): Promise<number> {
    await dbConnect();
    
    const timeThreshold = new Date();
    timeThreshold.setMinutes(timeThreshold.getMinutes() - minutes);

    const count = await Comment.countDocuments({
      author: authorId,
      createdAt: { $gte: timeThreshold }
    });

    return count;
  }

  static sanitizeContent(content: string): string {
    return content
      .replace(/[^\w\s.,!?-]/g, '') // Entferne Sonderzeichen
      .replace(/\s+/g, ' ')         // Normalisiere Whitespace
      .trim();
  }
} 