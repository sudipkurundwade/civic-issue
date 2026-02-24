import 'dotenv/config';
import mongoose from 'mongoose';
import Issue from './src/models/Issue.js';
import Region from './src/models/Region.js';
import Department from './src/models/Department.js';

async function testDuplicate(description, regionName, departmentName, lat, lng) {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log(`Testing: "${description}" | Region: ${regionName} | Dept: ${departmentName} | Lat: ${lat}, Lng: ${lng}`);

        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const query = { createdAt: { $gte: since } };

        const candidates = await Issue.find(query)
            .select('description createdAt _id latitude longitude region requestedRegionName department requestedDepartmentName')
            .populate('region', 'name')
            .populate('department', 'name')
            .lean();

        console.log(`Found ${candidates.length} recent candidates.`);

        // AI Noise & Stop words reduction
        const AI_NOISE = new Set([
            'image', 'shows', 'photo', 'condition', 'clear', 'view', 'captured', 'appears', 'present', 'located', 'area', 'civic', 'issue', 'problem',
            'the', 'and', 'with', 'this', 'that', 'for', 'from', 'are', 'was', 'were', 'been', 'has', 'have', 'had', 'will', 'shall', 'should', 'could', 'would',
            'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than',
            'too', 'very', 'can', 'just', 'only', 'very'
        ]);

        const words = (text) => {
            const all = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
            const filtered = all.filter(w => !AI_NOISE.has(w));
            // Very basic stemming: remove 's' or 'es' from the end
            return new Set(filtered.map(w => w.replace(/(es|s)$/, '')));
        };

        const similarity = (a, b) => {
            const aW = words(a), bW = words(b);
            if (!aW.size || !bW.size) return 0;
            const intersection = [...aW].filter(w => bW.has(w)).length;
            const score = intersection / Math.max(aW.size, bW.size);
            return { score, aW: [...aW], bW: [...bW], intersection };
        };

        const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3;
            const φ1 = (lat1 * Math.PI) / 180;
            const φ2 = (lat2 * Math.PI) / 180;
            const Δφ = ((lat2 - lat1) * Math.PI) / 180;
            const Δλ = ((lon2 - lon1) * Math.PI) / 180;
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const uLat = parseFloat(lat);
        const uLng = parseFloat(lng);

        for (const c of candidates) {
            console.log(`\nComparing with Issue ${c._id}:`);
            console.log(`  Full Desc: "${c.description}"`);

            let dist = Infinity;
            if (!isNaN(uLat) && !isNaN(uLng) && c.latitude != null && c.longitude != null) {
                dist = getDistance(uLat, uLng, c.latitude, c.longitude);
                console.log(`  Distance: ${dist.toFixed(2)}m`);
                if (dist > 50) {
                    console.log(`    -> SKIP: Distance > 50m`);
                    continue;
                }
            } else {
                console.log(`  Distance: SKIPPED (missing coords)`);
            }

            // GRADUATED THRESHOLD
            let reqThreshold = 0.5;
            if (dist < 10) reqThreshold = 0.10;
            else if (dist < 30) reqThreshold = 0.30;
            else if (dist < 50) reqThreshold = 0.45;

            const simResult = similarity(description, c.description || '');
            console.log(`  Similarity: ${simResult.score.toFixed(2)} (Words: ${simResult.intersection} matched, Req: ${reqThreshold.toFixed(2)})`);
            console.log(`    Input words: [${simResult.aW.join(', ')}]`);
            console.log(`    Candidate words: [${simResult.bW.join(', ')}]`);
            if (simResult.score >= reqThreshold) {
                console.log(`  *** DUPLICATE FOUND ***`);
            }
        }

        console.log("\nTest done.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// Extract last 10 issues to see what's there
async function listLastIssues() {
    await mongoose.connect(process.env.DATABASE_URL);
    const issues = await Issue.find().sort({ createdAt: -1 }).limit(5).populate('region').populate('department').lean();
    console.log("Last 5 issues in DB:");
    issues.forEach(i => {
        console.log(`- ${i._id}: "${i.description?.slice(0, 30)}" | ${i.region?.name || i.requestedRegionName} | ${i.department?.name || i.requestedDepartmentName} | ${i.latitude}, ${i.longitude}`);
    });

    if (issues.length > 0) {
        const last = issues[0];
        console.log("\n--- VERIFICATION: TESTING SECOND AI-GENERATED DESCRIPTION ---");
        const aiDesc = "A close-up view of a significant road hazard featuring a large pothole and cracked asphalt on a public street. The deterioration is clearly visible and poses a danger to vehicles passing by. The surrounding pavement shows signs of wear and multiple gaps in the surface structure.";
        await testDuplicate(aiDesc, last.region?.name || last.requestedRegionName, last.department?.name || last.requestedDepartmentName, last.latitude, last.longitude);
    } else {
        process.exit(0);
    }
}

listLastIssues();
