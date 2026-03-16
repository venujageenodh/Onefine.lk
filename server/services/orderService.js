const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const { adjustStock } = require('../routes/inventory');
const { logAction } = require('../utils/logger');

/**
 * Handles stock deduction for an order's items
 */
const deductStockForOrder = async (order) => {
    for (const item of order.items) {
        if (item.productId) {
            try {
                await adjustStock({
                    productId: item.productId,
                    type: 'OUT',
                    qty: item.qty,
                    reason: `Order ${order.orderNumber}`,
                    orderId: order._id,
                });
            } catch (e) {
                console.warn(`Stock deduct failed for product ${item.productId}:`, e.message);
            }
        }
    }
};

/**
 * Automatically generates an invoice for a confirmed order if it doesn't have one
 */
const generateInvoiceForOrder = async (order, admin) => {
    if (order.invoiceId) return order.invoiceId;

    const invoice = await Invoice.create({
        orderId: order._id,
        customer: order.customer,
        items: order.items.map(i => ({
            productId: i.productId,
            name: i.name,
            description: i.description,
            qty: i.qty,
            unitPrice: i.unitPrice,
            discount: i.discount || 0
        })),
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        notes: order.notes,
        description: order.description,
        createdBy: admin?._id || null,
    });

    order.invoiceId = invoice._id;
    await order.save();

    await logAction({
        action: 'AUTO_GENERATE_INVOICE',
        admin,
        resourceType: 'Order',
        resourceId: order._id,
        details: `Automatically generated Invoice ${invoice.invoiceNumber}`
    });

    return invoice._id;
};

module.exports = {
    deductStockForOrder,
    generateInvoiceForOrder
};
