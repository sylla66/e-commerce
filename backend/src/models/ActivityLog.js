const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['update_status', 'contact_customer', 'note_added', 'tracking_added', 'custom_fields_updated', 'invoice_downloaded'],
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String },
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
