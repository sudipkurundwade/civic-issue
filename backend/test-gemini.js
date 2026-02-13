// Test script for Gemini service
import { analyzeDescription, analyzeComments, calculateRankingScore } from './src/lib/geminiService.js';

console.log('Testing Gemini Service Integration...\n');

// Test 1: Analyze a severe description
console.log('Test 1: Analyzing severe issue description');
const severeDescription = 'Major water main break flooding the entire street. Multiple homes affected, water service disrupted. Immediate attention required!';
const severeScore = await analyzeDescription(severeDescription);
console.log(`Description: "${severeDescription}"`);
console.log(`Score: ${severeScore}/100\n`);

// Test 2: Analyze a minor description
console.log('Test 2: Analyzing minor issue description');
const minorDescription = 'Small graffiti on wall near park entrance';
const minorScore = await analyzeDescription(minorDescription);
console.log(`Description: "${minorDescription}"`);
console.log(`Score: ${minorScore}/100\n`);

// Test 3: Analyze urgent comments
console.log('Test 3: Analyzing urgent comments');
const urgentComments = [
    { text: 'This is a serious safety hazard! Someone could get hurt!' },
    { text: 'Please fix this immediately, it\'s getting worse' },
    { text: 'This needs urgent attention from the authorities' }
];
const urgentCommentsScore = await analyzeComments(urgentComments);
console.log(`Comments: ${urgentComments.map(c => c.text).join(', ')}`);
console.log(`Score: ${urgentCommentsScore}/100\n`);

// Test 4: Calculate full ranking score
console.log('Test 4: Calculating full ranking score');
const mockIssue = {
    description: 'Broken streetlight causing safety issues at night. Dark intersection, multiple near-miss accidents reported.',
    likes: ['user1', 'user2', 'user3', 'user4', 'user5'], // 5 likes
    comments: [
        { text: 'This is very dangerous, please fix soon!' },
        { text: 'I almost had an accident here last night' }
    ]
};
const ranking = await calculateRankingScore(mockIssue);
console.log(`Issue: "${mockIssue.description}"`);
console.log(`Likes: ${mockIssue.likes.length}`);
console.log(`Comments: ${mockIssue.comments.length}`);
console.log(`Ranking Score: ${ranking.rankingScore}/100`);
console.log(`  - Description Score: ${ranking.descriptionAnalysisScore}/100`);
console.log(`  - Comment Score: ${ranking.commentAnalysisScore}/100`);
console.log('\nTest completed successfully! ✓');
