import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze a civic issue image using Gemini AI
 * @param {string} base64Image - Base64 encoded image data (without data:image prefix)
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns {Promise<string>} - AI-generated description of the civic issue
 */
export async function analyzeIssueImage(base64Image, mimeType = 'image/jpeg') {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are analyzing a civic issue photo submitted by a citizen. 
    
Please analyze this image and provide a clear, concise description of the civic issue shown. Focus on:
- What type of issue it is (e.g., pothole, garbage accumulation, broken streetlight, drainage problem, etc.)
- The severity/condition of the issue
- Any relevant details that would help authorities address it

Keep the description factual, professional, and under 150 words. Write in a way that would be suitable for a civic complaint form.

Description:`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        return text.trim();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to analyze image. Please try again or write the description manually.');
    }
}
