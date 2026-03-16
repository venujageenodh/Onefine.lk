const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { requireAdminAuth } = require('../middleware/auth');

const GOLD = '#000000'; // Using solid black for text
const NAVY = '#1B2A4A';
const LIGHT_GRAY = '#F8F9FA';

function formatLKR(amount) {
    return `LKR ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

function cleanText(text) {
    if (!text) return '';
    // Strip emojis and non-standard characters that break PDFKit's default fonts
    return text.toString().replace(/[^\x00-\x7F]/g, '');
}

function buildHeader(doc, title, number, date) {
    // Top Left: Company Info
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(16).text('One Fine', 40, 40);
    doc.fillColor('#333').font('Helvetica').fontSize(9)
        .text('Venuja Geenodh', 40, 60)
        .text('20/9', 40, 72)
        .text('Green Terrance,Parakandeniya', 40, 84)
        .text('Imbulgoda', 40, 96)
        .text('Phone: +94 70 345 1261  Email: venujageenodh@gmail.com', 40, 108);

    // Top Right: Document Title
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(24).text(cleanText(title), 40, 55, { align: 'right', width: doc.page.width - 80 });

    // Header Divider
    doc.moveTo(40, 125).lineTo(doc.page.width - 40, 125).strokeColor('#DDD').stroke();

    doc.y = 140;
}

function buildCustomerBox(doc, customer, number, date, title) {
    const y = 145;
    // Bill To Section (Left)
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(9).text('BILL TO', 40, y);
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(11).text(cleanText(customer.name).toUpperCase(), 40, y + 14);
    doc.fillColor('#333').font('Helvetica').fontSize(9)
        .text(cleanText(customer.company), 40, y + 28)
        .text(cleanText(customer.address), 40, y + 40)
        .text(cleanText(customer.city), 40, y + 52)
        .text(`Phone: ${cleanText(customer.phone)}`, 40, y + 64)
        .text(cleanText(customer.website), 40, y + 76);

    // Metadata Section (Right)
    const midX = doc.page.width - 240;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`${cleanText(title)}#`, midX, y + 14);
    doc.text(`${cleanText(title)} Date:`, midX, y + 32);

    doc.font('Helvetica').fontSize(10);
    doc.text(cleanText(number), midX + 100, y + 14, { align: 'right', width: 100 });
    doc.text(cleanText(date), midX + 100, y + 32, { align: 'right', width: 100 });

    doc.y = y + 100;
}

function buildItemsTable(doc, items) {
    const cols = { hash: 40, desc: 65, qty: 245, price: 290, disc: 375, total: 450 };
    const y = doc.y;

    // Table Header
    doc.rect(40, y, doc.page.width - 80, 22).fill('#F1F5F9');
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(9)
        .text('#', cols.hash + 5, y + 7)
        .text('DESCRIPTION', cols.desc, y + 7)
        .text('QTY', cols.qty, y + 7, { width: 40, align: 'center' })
        .text('PRICE', cols.price, y + 7, { width: 80, align: 'right' })
        .text('DISC.', cols.disc, y + 7, { width: 70, align: 'right' })
        .text('TOTAL', cols.total, y + 7, { width: 100, align: 'right' });

    let rowY = y + 22;
    doc.moveTo(40, rowY).lineTo(doc.page.width - 40, rowY).strokeColor('#1B2A4A').lineWidth(1).stroke();
    rowY += 10;

    items.forEach((item, i) => {
        const lineTotal = (item.unitPrice || 0) * (item.qty || 0);
        const lineDiscount = lineTotal * (item.discount || 0) / 100;
        const net = lineTotal - lineDiscount;

        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(i + 1, cols.hash + 5, rowY)
            .font('Helvetica-Bold').text(cleanText(item.name), cols.desc, rowY, { width: 170 });

        if (item.description || item.customization) {
            doc.font('Helvetica').fontSize(8).fillColor('#666').text(cleanText(item.description || item.customization), cols.desc, doc.y + 2, { width: 170 });
        }

        let maxY = doc.y;
        
        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(item.qty || 1, cols.qty, rowY, { width: 40, align: 'center' });
            
        if (item.unitPrice !== undefined && !item.hidePrice) {
            doc.text(formatLKR(item.unitPrice), cols.price, rowY, { width: 80, align: 'right' });
            
            if (item.discount > 0) {
                doc.font('Helvetica-Bold').text(`${item.discount}%`, cols.disc, rowY, { width: 70, align: 'right' })
                   .font('Helvetica').fontSize(8).fillColor('#E85D75').text(`-${formatLKR(lineDiscount)}`, cols.disc, doc.y + 2, { width: 70, align: 'right' });
            } else {
                doc.fillColor('#94A3B8').text('-', cols.disc, rowY, { width: 70, align: 'right' });
            }
            maxY = Math.max(maxY, doc.y);

            doc.fillColor('#000').fontSize(10).font('Helvetica-Bold').text(formatLKR(net), cols.total, rowY, { width: 100, align: 'right' });
        }

        rowY = Math.max(maxY, rowY + 20) + 10;

        // Horizontal line between items if needed, or just padding
        doc.moveTo(40, rowY - 5).lineTo(doc.page.width - 40, rowY - 5).strokeColor('#EEE').lineWidth(0.5).stroke();
    });

    doc.y = rowY;
}

function buildDeliveryItemsTable(doc, items) {
    const cols = { hash: 40, desc: 65, qty: 450 };
    const y = doc.y;

    // Table Header
    doc.rect(40, y, doc.page.width - 80, 22).fill('#F1F5F9');
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(9)
        .text('#', cols.hash + 5, y + 7)
        .text('DESCRIPTION', cols.desc, y + 7)
        .text('QTY', cols.qty, y + 7, { width: 60, align: 'center' });

    let rowY = y + 22;
    doc.moveTo(40, rowY).lineTo(doc.page.width - 40, rowY).strokeColor('#1B2A4A').lineWidth(1).stroke();
    rowY += 10;

    items.forEach((item, i) => {
        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(i + 1, cols.hash + 5, rowY)
            .font('Helvetica-Bold').text(cleanText(item.name), cols.desc, rowY, { width: 350 });

        if (item.description || item.customization) {
            doc.font('Helvetica').fontSize(8).fillColor('#666').text(cleanText(item.description || item.customization), cols.desc, doc.y + 2, { width: 350 });
        }

        const currentY = doc.y;
        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(item.qty || 1, cols.qty, rowY, { width: 60, align: 'center' });

        rowY = Math.max(currentY, rowY + 20) + 10;

        doc.moveTo(40, rowY - 5).lineTo(doc.page.width - 40, rowY - 5).strokeColor('#EEE').lineWidth(0.5).stroke();
    });

    doc.y = rowY;
}

function buildTotalsBox(doc, data, balanceOnly = false) {
    const x = doc.page.width - 260;
    let y = doc.y + 5;

    const rowHeight = 22;

    const addRow = (label, value, isBold = false, hasBg = false) => {
        if (hasBg) {
            doc.rect(x, y, 220, rowHeight).fill('#F1F5F9');
        }
        doc.fillColor('#333').font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
            .text(label, x + 10, y + 6);
        doc.text(value, x + 100, y + 6, { align: 'right', width: 110 });

        doc.moveTo(x, y + rowHeight).lineTo(x + 220, y + rowHeight).strokeColor('#DDD').lineWidth(0.5).stroke();
        y += rowHeight;
    };

    addRow('SUB TOTAL', formatLKR(data.subtotal));
    if (data.discountAmount > 0) addRow('DISCOUNT', `- ${formatLKR(data.discountAmount)}`);
    addRow('TOTAL', formatLKR(data.total), true);

    if (data.balanceDue !== undefined) {
        addRow('PAID', `- ${formatLKR(data.amountPaid || 0)}`);
        addRow('BALANCE DUE', formatLKR(data.balanceDue), true, true);
    }

    doc.y = y + 40;
}

function buildFooter(doc, showPayment = true) {
    const y = doc.y > doc.page.height - 200 ? doc.y : doc.page.height - 220;

    // Bottom Left: Terms and Instructions
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10).text('Terms & Conditions:', 40, y);
    doc.font('Helvetica').fontSize(8).text('• When making a bank transfer or cheque payment, credit the following account.', 40, y + 14, { width: 280 });

    if (showPayment) {
        doc.font('Helvetica-Bold').fontSize(10).text('Payment Instructions', 350, y);
        doc.font('Helvetica').fontSize(9)
            .text('Sampath Bank', 350, y + 14)
            .text('Kadawatha Branch', 350, y + 26)
            .text('0060 1000 9403', 350, y + 38)
            .text('ONE FINE', 350, y + 50);
    }

    // Signature Area
    const sigY = y + 100;
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(12).text('For, ONE FINE', 0, sigY, { align: 'right', width: doc.page.width - 40 });

    doc.moveTo(doc.page.width - 180, sigY + 60).lineTo(doc.page.width - 40, sigY + 60).strokeColor('#000').stroke();
    doc.font('Helvetica').fontSize(8).text('AUTHORIZED SIGNATURE', doc.page.width - 180, sigY + 65, { width: 140, align: 'center' });
}

// GET /api/pdf/quotation/:id
router.get('/quotation/:id', requireAdminAuth, async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return res.status(404).json({ error: 'Not found' });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Quotation-${quotation.qNumber}.pdf"`);
        doc.pipe(res);

        const dateStr = new Date(quotation.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
        buildHeader(doc, 'QUOTATION', quotation.qNumber, dateStr);
        buildCustomerBox(doc, quotation.customer, quotation.qNumber, dateStr, 'Quotation');

        if (quotation.validUntil) {
            doc.fillColor('#888').fontSize(8)
                .text(`Valid until: ${new Date(quotation.validUntil).toLocaleDateString('en-GB')}`, { align: 'right' });
        }

        buildItemsTable(doc, quotation.items);
        buildTotalsBox(doc, quotation);

        if (quotation.notes) {
            doc.moveDown().fillColor('#555').fontSize(9).font('Helvetica-Bold').text('Notes:')
                .font('Helvetica').text(cleanText(quotation.notes));
        }
        buildFooter(doc, false);
        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/pdf/proforma/:id
router.get('/proforma/:id', requireAdminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Not found' });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Proforma-${order.orderNumber}.pdf"`);
        doc.pipe(res);

        const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
        buildHeader(doc, 'PROFORMA INVOICE', order.orderNumber, dateStr);
        buildCustomerBox(doc, order.customer, order.orderNumber, dateStr, 'Order');
        
        if (order.description) {
            doc.moveDown();
            doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(12).text(cleanText(order.description).toUpperCase(), 40);
            doc.y += 10;
        }

        buildItemsTable(doc, order.items);
        buildTotalsBox(doc, order);

        if (order.notes) {
            doc.fillColor('#555').fontSize(9).font('Helvetica-Bold').text('Notes:')
                .font('Helvetica').text(cleanText(order.notes));
        }
        buildFooter(doc, true);
        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/pdf/delivery/:id
router.get('/delivery/:id', requireAdminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Not found' });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="DeliveryNote-${order.orderNumber}.pdf"`);
        doc.pipe(res);

        const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        buildHeader(doc, 'DELIVERY NOTE', order.orderNumber, dateStr);
        buildCustomerBox(doc, order.customer, order.orderNumber, dateStr, 'Order');

        buildDeliveryItemsTable(doc, order.items);

        if (order.notes) {
            doc.y += 20;
            doc.fillColor('#555').fontSize(9).font('Helvetica-Bold').text('Notes:')
                .font('Helvetica').text(cleanText(order.notes));
        }
        
        // Delivery Signature Area
        const y = doc.y > doc.page.height - 150 ? doc.y : doc.page.height - 150;
        doc.moveTo(40, y).lineTo(200, y).strokeColor('#000').stroke();
        doc.moveTo(doc.page.width - 200, y).lineTo(doc.page.width - 40, y).strokeColor('#000').stroke();
        
        doc.font('Helvetica').fontSize(8)
            .text('RECEIVED BY (SIGNATURE)', 40, y + 5, { width: 160, align: 'center' })
            .text('DATE', doc.page.width - 200, y + 5, { width: 160, align: 'center' });

        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/pdf/receipt/:id
router.get('/receipt/:id', requireAdminAuth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('invoiceId').populate('orderId');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        const doc = new PDFDocument({ margin: 40, size: 'A5' }); // Use A5 for receipts
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Receipt-${payment._id.toString().slice(-6)}.pdf"`);
        doc.pipe(res);

        const dateStr = new Date(payment.date || payment.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
        
        // Top Left: Company Info
        doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(16).text('One Fine', 40, 40);
        doc.fillColor('#333').font('Helvetica').fontSize(8)
            .text('Imbulgoda, Sri Lanka', 40, 60)
            .text('Phone: +94 70 345 1261', 40, 72);

        // Top Right: Title
        doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(18).text('RECEIPT', 40, 40, { align: 'right', width: doc.page.width - 80 });
        
        doc.moveTo(40, 95).lineTo(doc.page.width - 40, 95).strokeColor('#DDD').stroke();

        doc.y = 110;
        
        let relatedDoc = payment.invoiceId || payment.orderId;
        let relatedDocType = payment.invoiceId ? 'Invoice' : (payment.orderId ? 'Order' : '');
        let relatedNum = relatedDoc ? (relatedDoc.invoiceNumber || relatedDoc.orderNumber) : '';
        let customer = relatedDoc ? relatedDoc.customer : null;

        if (customer) {
            doc.fillColor('#333').font('Helvetica-Bold').fontSize(10).text('RECEIVED FROM', 40, doc.y);
            doc.fillColor('#000').font('Helvetica').fontSize(11).text(cleanText(customer.name).toUpperCase(), 40, doc.y + 4);
            doc.y += 15;
        }

        doc.rect(40, doc.y, doc.page.width - 80, 120).fill('#F8F9FA').stroke('#EEE');
        
        const contentY = doc.y + 15;
        doc.fillColor('#555').font('Helvetica-Bold').fontSize(9)
            .text('Receipt Date:', 60, contentY)
            .text('Payment Method:', 60, contentY + 20)
            .text('Reference:', 60, contentY + 40);
            
        if (relatedNum) {
            doc.text(`For ${relatedDocType}:`, 60, contentY + 60);
        }

        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(dateStr, 150, contentY)
            .text(cleanText(payment.method), 150, contentY + 20)
            .text(cleanText(payment.reference || '-'), 150, contentY + 40);
            
        if (relatedNum) {
            doc.text(cleanText(relatedNum), 150, contentY + 60);
        }

        // Amount Box
        doc.rect(40, contentY + 90, doc.page.width - 80, 40).fill('#1B2A4A');
        doc.fillColor('#FFF').font('Helvetica-Bold').fontSize(10).text('AMOUNT RECEIVED', 60, contentY + 105);
        doc.fillColor('#C9A84C').font('Helvetica-Bold').fontSize(16).text(formatLKR(payment.amount), 60, contentY + 100, { align: 'right', width: doc.page.width - 140 });

        // Footer
        const sigY = doc.page.height - 80;
        doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(10).text('For, ONE FINE', 0, sigY, { align: 'right', width: doc.page.width - 40 });
        doc.moveTo(doc.page.width - 160, sigY + 35).lineTo(doc.page.width - 40, sigY + 35).strokeColor('#000').stroke();
        doc.font('Helvetica').fontSize(7).text('AUTHORIZED SIGNATURE', doc.page.width - 160, sigY + 40, { width: 120, align: 'center' });

        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
