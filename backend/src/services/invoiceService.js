const PDFDocument = require('pdfkit');

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

async function generateInvoice(order) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100;
    let y = 50;

    doc.font('Helvetica-Bold').fontSize(22).text('FACTURE', 50, y, { align: 'center' });
    y += 35;

    doc.fontSize(9).fillColor('#666').text(`N° commande : ${order.orderNumber}`, 50, y);
    doc.text(`N° facture : ${order.invoiceNumber || '—'}`, 50, doc.y + 4);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-SN', { dateStyle: 'long' })}`, 50, doc.y + 4);

    const statusLabels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
    };
    doc.text(`Statut : ${statusLabels[order.status] || order.status}`, 50, doc.y + 4);

    doc.fillColor('#000');
    y = doc.y + 20;

    const user = order.user || {};
    doc.font('Helvetica-Bold').fontSize(11).text('Client', 50, y);
    doc.font('Helvetica').fontSize(10);
    doc.text(`${user.firstName || ''} ${user.lastName || ''}`, 50, doc.y + 4);
    doc.text(user.email || '', 50, doc.y + 4);

    if (order.shippingAddress) {
      doc.text(`${order.shippingAddress.street || ''}`, 50, doc.y + 4);
      doc.text(`${order.shippingAddress.city || ''}${order.shippingAddress.region ? ', ' + order.shippingAddress.region : ''}`, 50, doc.y + 4);
    }

    y = doc.y + 20;

    const tableTop = y;
    const colX = {
      product: 50,
      sku: 220,
      qty: 300,
      unitPrice: 360,
      total: 450,
    };

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#333');
    doc.text('Produit', colX.product, tableTop);
    doc.text('Réf.', colX.sku, tableTop);
    doc.text('Qté', colX.qty, tableTop, { width: 50, align: 'right' });
    doc.text('P.U.', colX.unitPrice, tableTop, { width: 70, align: 'right' });
    doc.text('Total', colX.total, tableTop, { width: 70, align: 'right' });

    doc.moveTo(50, tableTop + 18).lineTo(pageWidth + 50, tableTop + 18).strokeColor('#ddd').stroke();
    y = tableTop + 28;

    doc.font('Helvetica').fontSize(10).fillColor('#000');
    for (const item of order.items) {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      doc.text(item.name, colX.product, y, { width: colX.sku - colX.product - 10 });
      doc.text(item.sku || item.variantSku || '—', colX.sku, y);
      doc.text(String(item.quantity), colX.qty, y, { width: 50, align: 'right' });
      doc.text(formatCurrency(item.unitPrice), colX.unitPrice, y, { width: 70, align: 'right' });
      doc.text(formatCurrency(item.totalPrice), colX.total, y, { width: 70, align: 'right' });
      y += 20;
    }

    doc.moveTo(50, y + 4).lineTo(pageWidth + 50, y + 4).strokeColor('#ddd').stroke();
    y += 14;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Sous-total', colX.unitPrice, y, { width: 70, align: 'right' });
    doc.text(formatCurrency(order.subtotal), colX.total, y, { width: 70, align: 'right' });
    y += 18;

    if (order.shippingCost > 0) {
      doc.font('Helvetica').text('Livraison', colX.unitPrice, y, { width: 70, align: 'right' });
      doc.text(formatCurrency(order.shippingCost), colX.total, y, { width: 70, align: 'right' });
      y += 18;
    }

    for (const cf of order.customFields || []) {
      const label = cf.label || cf.name;
      const val = cf.type === 'percentage' ? `${cf.value}%` : formatCurrency(cf.amount || 0);
      doc.text(label, colX.unitPrice, y, { width: 70, align: 'right' });
      doc.text(val, colX.total, y, { width: 70, align: 'right' });
      y += 18;
    }

    doc.moveTo(colX.unitPrice - 10, y).lineTo(pageWidth + 50, y).strokeColor('#ccc').stroke();
    y += 10;

    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a1a1a');
    doc.text('Total', colX.unitPrice - 20, y, { width: 90, align: 'right' });
    doc.text(formatCurrency(order.totalAmount), colX.total, y, { width: 70, align: 'right' });

    y += 30;
    const statusBottom = y;

    if (order.notes) {
      doc.fontSize(9).fillColor('#666');
      doc.text(`Notes : ${order.notes}`, 50, statusBottom, { width: pageWidth });
    }

    doc.fontSize(8).fillColor('#999').text(
      'Facture générée le ' + new Date().toLocaleDateString('fr-SN', { dateStyle: 'long' }),
      50,
      doc.page.height - 60,
      { align: 'center' }
    );

    doc.end();
  });
}

module.exports = { generateInvoice };
