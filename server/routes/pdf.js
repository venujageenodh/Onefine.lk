const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { requireAdminAuth } = require('../middleware/auth');

const GOLD = '#C9A84C';
const NAVY = '#1B2A4A';

function formatLKR(amount) {
    return `Rs. ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

function buildHeader(doc, title, number, date) {
    doc.rect(0, 0, doc.page.width, 110).fill(NAVY);
    doc.fillColor('white')
        .font('Helvetica-Bold').fontSize(22).text('ONEFINE', 40, 30)
        .font('Helvetica').fontSize(9).fillColor(GOLD)
        .text('CORPORATE GIFTING — PREMIUM BRANDED PRODUCTS', 40, 55)
        .fillColor('white').fontSize(9)
        .text('info@onefine.lk  |  +94 70 123 4567  |  onefine.lk', 40, 68);

    doc.font('Helvetica-Bold').fontSize(18).fillColor(GOLD)
        .text(title, 40, 90, { align: 'right', width: doc.page.width - 80 });
    doc.font('Helvetica').fontSize(9).fillColor('white')
        .text(`${number} | ${date}`, 40, 112, { align: 'right', width: doc.page.width - 80 });

    doc.moveDown(6);
}

function buildCustomerBox(doc, customer) {
    const y = doc.y + 10;
    doc.roundedRect(40, y, 230, 90, 6).fillAndStroke('#F8F8F8', '#E5E5E5');
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9).text('BILL TO', 52, y + 10);
    doc.font('Helvetica').fontSize(9).fillColor('#333')
        .text(customer.name, 52, y + 22)
        .text(customer.company || '', 52, y + 34)
        .text(customer.address || '', 52, y + 46)
        .text(customer.city || '', 52, y + 58)
        .text(customer.phone || customer.email || '', 52, y + 70);
    doc.moveDown(7);
}

function buildItemsTable(doc, items) {
    const cols = { desc: 40, qty: 310, unit: 360, disc: 420, total: 480 };
    const y = doc.y + 5;

    // Header row
    doc.rect(40, y, doc.page.width - 80, 20).fill(NAVY);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(8)
        .text('DESCRIPTION', cols.desc + 4, y + 6)
        .text('QTY', cols.qty, y + 6)
        .text('UNIT PRICE', cols.unit, y + 6)
        .text('DISC%', cols.disc, y + 6)
        .text('TOTAL', cols.total, y + 6);

    let rowY = y + 20;
    let running = 0;
    items.forEach((item, i) => {
        const lineTotal = item.unitPrice * item.qty;
        const lineDiscount = lineTotal * (item.discount || 0) / 100;
        const net = lineTotal - lineDiscount;
        running += net;
        const bg = i % 2 === 0 ? 'white' : '#F5F7FA';
        doc.rect(40, rowY, doc.page.width - 80, 20).fill(bg);
        doc.fillColor('#222').font('Helvetica').fontSize(8)
            .text(`${item.name}${item.description ? ' — ' + item.description : ''}`, cols.desc + 4, rowY + 6, { width: 260 })
            .text(item.qty, cols.qty, rowY + 6)
            .text(formatLKR(item.unitPrice), cols.unit, rowY + 6)
            .text(item.discount ? `${item.discount}%` : '—', cols.disc, rowY + 6)
            .text(formatLKR(net), cols.total, rowY + 6);
        rowY += 20;
    });

    doc.y = rowY + 5;
    return running;
}

function buildTotalsBox(doc, data) {
    const x = doc.page.width - 220;
    let y = doc.y + 10;
    const rows = [
        ['Subtotal', formatLKR(data.subtotal)],
        data.discountAmount > 0 ? ['Discount', `- ${formatLKR(data.discountAmount)}`] : null,
        data.deliveryCharge > 0 ? ['Delivery', formatLKR(data.deliveryCharge)] : null,
        data.taxAmount > 0 ? [`Tax (${data.tax}%)`, formatLKR(data.taxAmount)] : null,
    ].filter(Boolean);

    rows.forEach(([label, val]) => {
        doc.fillColor('#555').font('Helvetica').fontSize(9).text(label, x, y);
        doc.text(val, x + 80, y, { align: 'right', width: 100 });
        y += 16;
    });
    // Total
    doc.rect(x - 10, y, 190, 24).fill(NAVY);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
        .text('TOTAL', x, y + 7)
        .text(formatLKR(data.total), x + 80, y + 7, { align: 'right', width: 100 });
    doc.y = y + 40;
}

function buildFooter(doc) {
    const y = doc.page.height - 60;
    doc.rect(0, y, doc.page.width, 60).fill(NAVY);
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(8)
        .text('Thank you for choosing OneFine!', 40, y + 10);
    doc.fillColor('white').font('Helvetica').fontSize(7)
        .text('OneFine Corporate Gifting  |  info@onefine.lk  |  onefine.lk  |  +94 70 123 4567', 40, y + 22)
        .text('Bank: Commercial Bank  |  A/C: 1234567890  |  Branch: Colombo', 40, y + 36);
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

        buildHeader(doc, 'QUOTATION', quotation.qNumber,
            new Date(quotation.createdAt).toLocaleDateString('en-GB'));
        buildCustomerBox(doc, quotation.customer);
        if (quotation.validUntil) {
            doc.fillColor('#888').fontSize(8)
                .text(`Valid until: ${new Date(quotation.validUntil).toLocaleDateString('en-GB')}`, { align: 'right' });
        }
        buildItemsTable(doc, quotation.items);
        buildTotalsBox(doc, quotation);
        if (quotation.notes) {
            doc.moveDown().fillColor('#555').fontSize(9).font('Helvetica-Bold').text('Notes:')
                .font('Helvetica').text(quotation.notes);
        }
        buildFooter(doc);
        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/pdf/invoice/:id
router.get('/invoice/:id', requireAdminAuth, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Not found' });
        const payments = await Payment.find({ invoiceId: invoice._id }).sort({ date: 1 });

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
        doc.pipe(res);

        buildHeader(doc, 'INVOICE', invoice.invoiceNumber,
            new Date(invoice.createdAt).toLocaleDateString('en-GB'));
        buildCustomerBox(doc, invoice.customer);
        buildItemsTable(doc, invoice.items);
        buildTotalsBox(doc, invoice);

        // Payment history
        if (payments.length > 0) {
            doc.moveDown().fillColor(NAVY).font('Helvetica-Bold').fontSize(10).text('PAYMENT HISTORY');
            doc.rect(40, doc.y + 4, doc.page.width - 80, 18).fill(NAVY);
            const hy = doc.y + 4;
            doc.fillColor('white').font('Helvetica-Bold').fontSize(8)
                .text('DATE', 52, hy + 5).text('METHOD', 160, hy + 5)
                .text('REFERENCE', 260, hy + 5).text('AMOUNT', 430, hy + 5);
            let py = hy + 18;
            payments.forEach((p, i) => {
                const bg = i % 2 === 0 ? 'white' : '#F5F7FA';
                doc.rect(40, py, doc.page.width - 80, 18).fill(bg);
                doc.fillColor('#333').font('Helvetica').fontSize(8)
                    .text(new Date(p.date).toLocaleDateString('en-GB'), 52, py + 5)
                    .text(p.method, 160, py + 5)
                    .text(p.reference || '—', 260, py + 5)
                    .text(formatLKR(p.amount), 430, py + 5);
                py += 18;
            });
            doc.y = py + 10;

            // Balance due
            const balanceBg = invoice.paymentStatus === 'PAID' ? '#22c55e' : '#ef4444';
            doc.rect(doc.page.width - 220, doc.y, 180, 26).fill(balanceBg);
            doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
                .text(invoice.paymentStatus === 'PAID' ? 'PAID IN FULL' : `BALANCE DUE: ${formatLKR(invoice.balanceDue)}`,
                    doc.page.width - 220, doc.y + 7, { width: 180, align: 'center' });
            doc.moveDown(3);
        }

        if (invoice.notes) {
            doc.fillColor('#555').fontSize(9).font('Helvetica-Bold').text('Notes:')
                .font('Helvetica').text(invoice.notes);
        }
        buildFooter(doc);
        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
