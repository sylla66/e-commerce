const ActivityLog = require('../models/ActivityLog');
const StockMovement = require('../models/StockMovement');

exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, type, search } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let activities = [];
    let stockMovements = [];

    if (!type || type === 'activity') {
      const activityFilter = {};
      if (search) {
        activityFilter.$or = [
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      activities = await ActivityLog.find(activityFilter)
        .populate('manager', 'firstName lastName email role')
        .populate('order', 'orderNumber totalAmount status')
        .populate('product', 'name slug sku images')
        .sort('-createdAt')
        .lean();
    }

    if (!type || type === 'stock') {
      const stockFilter = {};
      if (search) {
        stockFilter.$or = [
          { reason: { $regex: search, $options: 'i' } },
        ];
      }
      stockMovements = await StockMovement.find(stockFilter)
        .populate('product', 'name slug sku images basePrice stock')
        .populate('user', 'firstName lastName email role')
        .sort('-createdAt')
        .lean();
    }

    const unified = [];

    for (const a of activities) {
      unified.push({
        _id: a._id,
        date: a.createdAt,
        type: 'activity',
        action: a.action,
        description: a.description,
        user: a.manager,
        order: a.order,
        product: a.product,
        metadata: a.metadata,
        details: getActivityDetails(a),
      });
    }

    for (const m of stockMovements) {
      unified.push({
        _id: m._id,
        date: m.createdAt,
        type: 'stock',
        action: m.reason,
        description: getStockDescription(m),
        user: m.user,
        product: m.product,
        previousStock: m.previousStock,
        newStock: m.newStock,
        delta: m.delta,
        reason: m.reason,
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        details: getStockDetails(m),
      });
    }

    unified.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = unified.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = unified.slice(start, start + limitNum);

    res.json({
      entries: paginated,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

function getActivityDetails(a) {
  const user = a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : 'Système';
  const orderRef = a.order ? `#${a.order.orderNumber}` : '';
  const productRef = a.product ? a.product.name : '';

  const labels = {
    update_status: 'Changement de statut',
    contact_customer: 'Contact client',
    note_added: 'Note ajoutée',
    tracking_added: 'Suivi ajouté',
    custom_fields_updated: 'Champs personnalisés mis à jour',
    invoice_downloaded: 'Facture téléchargée',
    product_created: 'Produit créé',
    product_updated: 'Produit modifié',
    product_deleted: 'Produit supprimé',
    category_created: 'Catégorie créée',
    category_updated: 'Catégorie modifiée',
    category_deleted: 'Catégorie supprimée',
    stock_updated: 'Stock mis à jour',
    user_created: 'Utilisateur créé',
    user_updated: 'Utilisateur modifié',
  };

  return {
    label: labels[a.action] || a.action,
    user,
    orderRef,
    productRef,
  };
}

function getStockDescription(m) {
  const productName = m.product ? m.product.name : 'Produit supprimé';
  const delta = m.delta > 0 ? `+${m.delta}` : m.delta;
  return `${productName} : ${m.previousStock} → ${m.newStock} (${delta})`;
}

function getStockDetails(m) {
  const labels = {
    order_created: 'Sortie stock (commande)',
    order_cancelled: 'Retour stock (annulation)',
    order_refunded: 'Retour stock (remboursement)',
    admin_update: 'Ajustement manuel',
    restock: 'Réapprovisionnement',
    manual: 'Manuel',
  };

  return {
    label: labels[m.reason] || m.reason,
    previousStock: m.previousStock,
    newStock: m.newStock,
    delta: m.delta,
  };
}
