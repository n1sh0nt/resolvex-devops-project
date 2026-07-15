const mongoose = require('mongoose');

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Internet',
  'Classroom',
  'Laboratory',
  'Hostel',
  'Library',
  'Sports',
  'Security',
  'Cleanliness',
  'Water Supply',
  'Others',
];

const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: '' },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: { type: String, enum: CATEGORIES, required: true },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    location: { type: String, trim: true, default: '' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    images: [imageSchema],
    resolutionImages: [imageSchema],
    resolutionRemarks: { type: String, default: '' },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },

    timeline: [timelineEntrySchema],

    isFeedbackGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ title: 'text', description: 'text' });

complaintSchema.pre('save', async function generateTicketId(next) {
  if (this.ticketId) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model('Complaint').countDocuments();
  this.ticketId = `RX-${year}-${String(count + 1).padStart(5, '0')}`;
  if (!this.timeline || this.timeline.length === 0) {
    this.timeline = [
      { status: 'Pending', note: 'Complaint submitted', changedBy: this.submittedBy },
    ];
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
