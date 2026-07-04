const ActivityLog = require('../models/ActivityLog');

exports.listActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, managerId } = req.query;
    const filter = {};
    if (managerId) filter.manager = managerId;

    const [activities, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('manager', 'firstName lastName email')
        .populate('order', 'orderNumber')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      activities,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
