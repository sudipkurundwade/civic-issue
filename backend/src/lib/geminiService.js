import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Analyzes an issue description using Gemini AI
 * Returns a score from 0-100 based on severity, urgency, and clarity
 */
export async function analyzeDescription(description) {
  try {
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return 50; // Default neutral score for empty descriptions
    }

    const prompt = `You are analyzing a civic issue report description. Rate the following description on a scale of 0-100 based on:
- Severity: How serious is the issue? (safety hazards, infrastructure damage = higher score)
- Urgency: How quickly does this need attention? (immediate danger = higher score)
- Clarity: How well-described is the issue? (clear, detailed = higher score)

Description: "${description}"

Respond with ONLY a number between 0-100. No explanation, just the number.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the score from the response
    const score = parseInt(text);

    // Validate the score is within range
    if (isNaN(score) || score < 0 || score > 100) {
      console.warn('Invalid score from Gemini, using default:', text);
      return 50;
    }

    return score;
  } catch (error) {
    console.error('Error analyzing description with Gemini:', error);
    return 50; // Default neutral score on error
  }
}

/**
 * Analyzes comments on an issue using Gemini AI
 * Returns a score from 0-100 based on sentiment, urgency signals, and engagement
 */
export async function analyzeComments(comments) {
  try {
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return 50; // Default neutral score for no comments
    }

    // Extract comment texts
    const commentTexts = comments
      .map(c => c.text || '')
      .filter(text => text.trim().length > 0)
      .slice(0, 20); // Limit to 20 most recent comments to avoid token limits

    if (commentTexts.length === 0) {
      return 50;
    }

    const commentsString = commentTexts.join('\n- ');

    const prompt = `You are analyzing comments on a civic issue report. Rate the overall comment thread on a scale of 0-100 based on:
- Sentiment: Are people concerned/supportive? (high concern = higher score)
- Urgency signals: Do comments indicate this needs immediate attention? (urgent language = higher score)
- Community engagement: Is there active discussion and agreement? (high engagement = higher score)

Comments:
- ${commentsString}

Respond with ONLY a number between 0-100. No explanation, just the number.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the score from the response
    const score = parseInt(text);

    // Validate the score is within range
    if (isNaN(score) || score < 0 || score > 100) {
      console.warn('Invalid score from Gemini, using default:', text);
      return 50;
    }

    return score;
  } catch (error) {
    console.error('Error analyzing comments with Gemini:', error);
    return 50; // Default neutral score on error
  }
}

/**
 * Calculates the overall ranking score for an issue
 * Combines likes, description analysis, and comment analysis
 */
export async function calculateRankingScore(issue) {
  try {
    // Get like count (normalize to 0-100 scale, assuming max 100 likes for normalization)
    const likeCount = Array.isArray(issue.likes) ? issue.likes.length : 0;
    const normalizedLikes = Math.min(likeCount * 10, 100); // 10 likes = 100 score

    // Get or calculate description analysis score
    let descriptionScore = issue.descriptionAnalysisScore;
    if (descriptionScore == null) {
      descriptionScore = await analyzeDescription(issue.description);
    }

    // Get or calculate comment analysis score
    let commentScore = issue.commentAnalysisScore;
    if (commentScore == null) {
      commentScore = await analyzeComments(issue.comments || []);
    }

    // Calculate weighted ranking score
    // Likes: 30%, Description: 35%, Comments: 35%
    const rankingScore = (
      normalizedLikes * 0.30 +
      descriptionScore * 0.35 +
      commentScore * 0.35
    );

    return {
      rankingScore: Math.round(rankingScore),
      descriptionAnalysisScore: descriptionScore,
      commentAnalysisScore: commentScore,
    };
  } catch (error) {
    console.error('Error calculating ranking score:', error);
    return {
      rankingScore: 50,
      descriptionAnalysisScore: 50,
      commentAnalysisScore: 50,
    };
  }
}
