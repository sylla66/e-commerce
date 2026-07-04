const Order = require('../models/Order');
const ApiError = require('../utils/apiError');
const { generateInvoice } = require('../services/invoiceService');

exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name slug')
      .populate('user', 'firstName lastName email')
      .populate('customFields.field');

    if (!order) throw new ApiError(404, 'Order not found');

    const userId = req.user._id.toString();
    const orderUserId = order.user._id?.toString() || order.user.toString();
    const isOwner = userId === orderUserId;
    const isStaff = req.user.role === 'admin' || req.user.role === 'manager';
    if (!isOwner && !isStaff) {
      throw new ApiError(403, 'Access denied');
    }

    const pdfBuffer = await generateInvoice(order);

    if (isStaff && !order.invoiceGeneratedAt) {
      const date = new Date();
      const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
      const count = await Order.countDocuments({ invoiceNumber: { $exists: true } });
      order.invoiceNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
      order.invoiceGeneratedAt = date;
      await order.save();
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${order.orderNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
