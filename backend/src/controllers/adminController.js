const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalOrders,
      totalRevenue,
      monthOrders,
      monthRevenue,
      ordersByStatus,
      totalProducts,
      totalCategories,
      totalUsers,
      lowStockProducts,
      dailySales,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments(),
      Product.find({ stock: { $lte: 5 }, isActive: true }).sort('stock').limit(10).select('name slug stock images'),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthOrders,
        monthRevenue: monthRevenue[0]?.total || 0,
        totalProducts,
        totalCategories,
        totalUsers,
      },
      ordersByStatus: ordersByStatus.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      lowStock: lowStockProducts,
      dailySales,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
};

exports.exportOrdersCSV = async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort('-createdAt')
      .lean();

    const header = 'N° commande;Date;Client;Email;Téléphone;Sous-total;Livraison;Suppléments;Total;Statut;Ville;Pays\n';
    const rows = orders.map((o) => {
      const u = o.user || {};
      return [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString('fr-FR'),
        `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        u.email || '',
        u.phone || '',
        o.subtotal || 0,
        o.shippingCost || 0,
        o.totalSurcharges || 0,
        o.totalAmount || 0,
        o.status,
        o.shippingAddress?.city || '',
        o.shippingAddress?.country || '',
      ].join(';');
    });

    const csv = '\ufeff' + header + rows.join('\n');

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="commandes-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
