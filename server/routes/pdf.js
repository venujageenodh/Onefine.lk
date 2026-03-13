const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { requireAdminAuth } = require('../middleware/auth');

const GOLD = '#000000'; // Using solid black for text
const NAVY = '#1B2A4A';
const LIGHT_GRAY = '#F8F9FA';

function formatLKR(amount) {
    return `LKR ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
}

function buildHeader(doc, title, number, date) {
    // Top Left: Company Info
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(16).text('One Fine', 40, 40);
    doc.fillColor('#333').font('Helvetica').fontSize(9)
        .text('Venuja Geenodh', 40, 60)
        .text('20/9', 40, 72)
        .text('Green Terrance,Parakandeniya', 40, 84)
        .text('Imbulgoda', 40, 96)
        .text('📞 +94 70 345 1261  ✉ venujageenodh@gmail.com', 40, 108);

    // Top Right: Document Title
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(24).text(title, 40, 55, { align: 'right', width: doc.page.width - 80 });

    // Header Divider
    doc.moveTo(40, 125).lineTo(doc.page.width - 40, 125).strokeColor('#DDD').stroke();

    doc.y = 140;
}

function buildCustomerBox(doc, customer, number, date, title) {
    const y = 145;
    // Bill To Section (Left)
    doc.fillColor('#333').font('Helvetica-Bold').fontSize(9).text('BILL TO', 40, y);
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(11).text(customer.name.toUpperCase(), 40, y + 14);
    doc.fillColor('#333').font('Helvetica').fontSize(9)
        .text(customer.company || '', 40, y + 28)
        .text(customer.address || '', 40, y + 40)
        .text(customer.city || '', 40, y + 52)
        .text(`📞 ${customer.phone || ''}`, 40, y + 64)
        .text(customer.website || '', 40, y + 76);

    // Metadata Section (Right)
    const midX = doc.page.width - 240;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`${title}#`, midX, y + 14);
    doc.text(`${title} Date:`, midX, y + 32);

    doc.font('Helvetica').fontSize(10);
    doc.text(number, midX + 100, y + 14, { align: 'right', width: 100 });
    doc.text(date, midX + 100, y + 32, { align: 'right', width: 100 });

    doc.y = y + 100;
}

function buildItemsTable(doc, items) {
    const cols = { hash: 40, desc: 65, qty: 310, price: 370, total: 470 };
    const y = doc.y;

    // Table Header
    doc.rect(40, y, doc.page.width - 80, 22).fill('#F1F5F9');
    doc.fillColor('#1B2A4A').font('Helvetica-Bold').fontSize(9)
        .text('#', cols.hash + 5, y + 7)
        .text('DESCRIPTION', cols.desc, y + 7)
        .text('QTY', cols.qty, y + 7, { width: 40, align: 'center' })
        .text('PRICE', cols.price, y + 7, { width: 90, align: 'center' })
        .text('TOTAL', cols.total, y + 7, { width: 90, align: 'right' });

    let rowY = y + 22;
    doc.moveTo(40, rowY).lineTo(doc.page.width - 40, rowY).strokeColor('#1B2A4A').lineWidth(1).stroke();
    rowY += 10;

    items.forEach((item, i) => {
        const lineTotal = item.unitPrice * item.qty;
        const lineDiscount = lineTotal * (item.discount || 0) / 100;
        const net = lineTotal - lineDiscount;

        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(i + 1, cols.hash + 5, rowY)
            .font('Helvetica-Bold').text(item.name, cols.desc, rowY, { width: 230 });

        if (item.description) {
            doc.font('Helvetica').fontSize(8).fillColor('#666').text(item.description, cols.desc, doc.y + 2, { width: 230 });
        }

        const currentY = doc.y;
        doc.fillColor('#000').font('Helvetica').fontSize(10)
            .text(item.qty, cols.qty, rowY, { width: 40, align: 'center' })
            .text(formatLKR(item.unitPrice), cols.price, rowY, { width: 90, align: 'right' })
            .text(formatLKR(net), cols.total, rowY, { width: 90, align: 'right' });

        rowY = Math.max(currentY, rowY + 20) + 10;

        // Horizontal line between items if needed, or just padding
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

function buildFooter(doc) {
    const y = doc.y > doc.page.height - 200 ? doc.y : doc.page.height - 220;

    // Bottom Left: Terms and Instructions
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10).text('Terms & Conditions:', 40, y);
    doc.font('Helvetica').fontSize(8).text('• When making a bank transfer or cheque payment, credit the following account.', 40, y + 14, { width: 280 });

    doc.font('Helvetica-Bold').fontSize(10).text('Payment Instructions', 350, y);
    doc.font('Helvetica').fontSize(9)
        .text('Sampath Bank', 350, y + 14)
        .text('Kadawatha Branch', 350, y + 26)
        .text('0060 1000 9403', 350, y + 38)
        .text('ONE FINE', 350, y + 50);

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

        const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
        buildHeader(doc, 'INVOICE', invoice.invoiceNumber, dateStr);
        buildCustomerBox(doc, invoice.customer, invoice.invoiceNumber, dateStr, 'Invoice');

        buildItemsTable(doc, invoice.items);
        buildTotalsBox(doc, invoice);

        if (invoice.notes) {
            doc.fillColor('#555').fontSize(9).font('Helvetica-Bold').text('Notes:')
                .font('Helvetica').text(invoice.notes);
        }
        buildFooter(doc);
        doc.end();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
