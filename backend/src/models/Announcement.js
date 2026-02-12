import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 120,
        trim: true
    },
    category: {
        type: String,
        enum: [
            'Public Notice',
            'Emergency Alert',
            'Maintenance Notice',
            'Policy Update',
            'Awareness Campaign',
            'System Update'
        ],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    content: {
        type: String,
        default: '' // Optional description/content
    },
    image: {
        type: String, // Base64 string or URL
        default: null
    },
    targetRoles: [{
        type: String,
        enum: ['regional_admin', 'departmental_admin', 'citizen', 'super_admin']
    }],
    targetRegions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Region'
    }],
    targetDepartments: [{
        type: String
        // Enum can be validated at application level or strict list if static
    }],
    expiryDate: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorRole: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying of active/expired
announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ targetRegions: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
