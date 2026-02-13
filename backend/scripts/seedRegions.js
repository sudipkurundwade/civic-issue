import 'dotenv/config'; // Load .env file
import mongoose from 'mongoose';
import Region from '../src/models/Region.js'; // Adjust path as needed based on where you run this

export const regions = [
    "Gadhinglaj",
    "Jaysingpur",
    "Panahala",
    "Murgud",
    "Kurundwad",
    "Kagal",
    "Wadgaon (Hatkanangale)",
    "Malkapur (Shahuwadi)",
    "Ajara",
    "Chandgad",
    "Hupari",
    "Kolhapur",
    "Ichalkaranji"
];

const seedRegions = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
        if (!uri) {
            console.error('MONGODB_URI or DATABASE_URL is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        let createdCount = 0;
        let skippedCount = 0;

        for (const name of regions) {
            const cleanName = name.trim();
            const existing = await Region.findOne({ name: cleanName });
            if (!existing) {
                await Region.create({ name: cleanName });
                console.log(`Created region: ${cleanName}`);
                createdCount++;
            } else {
                console.log(`Skipped existing region: ${cleanName}`);
                skippedCount++;
            }
        }

        console.log(`\nSeeding complete. Created: ${createdCount}, Skipped: ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding regions:', error);
        process.exit(1);
    }
};

seedRegions();
