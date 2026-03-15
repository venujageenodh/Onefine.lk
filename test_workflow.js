const http = require('http');

const API_BASE = 'http://localhost:4000/api';
const ADMIN_EMAIL = 'owner@onefine.lk';
const ADMIN_PASSWORD = 'onefine';

function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
                } else {
                    reject({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function testWorkflow() {
    console.log('--- STARTING E2E LOGIC TEST (STRICT SCHEMA) ---');
    
    let token;
    try {
        console.log('1. Authentication...');
        const loginRes = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
        });
        token = loginRes.token;
        console.log('   ✅ Token acquired');
    } catch (err) {
        console.error('   ❌ Auth failed:', err);
        return;
    }

    const authHeaders = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 2. Create Quotation - Matching Schema
    let quotationId;
    try {
        console.log('2. Creating Quotation...');
        const qRes = await request(`${API_BASE}/quotations`, {
            method: 'POST',
            headers: authHeaders,
            body: {
                customer: {
                    name: 'Automated Test Client',
                    phone: '0771112233',
                    email: 'auto@onefine.com',
                    city: 'Colombo'
                },
                items: [{ 
                    name: 'Premium Gift Box', 
                    qty: 10, 
                    unitPrice: 2000 
                }],
                subtotal: 20000,
                total: 20000,
                status: 'SENT'
            }
        });
        quotationId = qRes._id;
        console.log(`   ✅ Quotation ${qRes.qNumber} created`);
    } catch (err) {
        console.error('   ❌ Quotation failed:', err.body || err);
        return;
    }

    // 3. Convert to Order
    let orderId;
    try {
        console.log('3. Converting to Order...');
        const cRes = await request(`${API_BASE}/quotations/${quotationId}/convert`, {
            method: 'POST',
            headers: authHeaders
        });
        orderId = cRes.orderId;
        console.log(`   ✅ Order ${orderId} initialized`);
    } catch (err) {
        console.error('   ❌ Conversion failed:', err.body || err);
        return;
    }

    // 4. Update Status (Fulfillment)
    try {
        console.log('4. Stepping through Fulfillment Stages...');
        await request(`${API_BASE}/biz/orders/${orderId}/status`, {
            method: 'PUT',
            headers: authHeaders,
            body: { status: 'PROCESSING', note: 'Bot: Processing started' }
        });
        console.log('   ✅ Stage: PROCESSING');
        
        await request(`${API_BASE}/biz/orders/${orderId}/status`, {
            method: 'PUT',
            headers: authHeaders,
            body: { status: 'DISPATCHED', note: 'Bot: Dispatched' }
        });
        console.log('   ✅ Stage: DISPATCHED');
    } catch (err) {
        console.error('   ❌ Status updates failed:', err.body || err);
    }

    // 5. Payments
    try {
        console.log('5. Registering Settlements...');
        const iRes = await request(`${API_BASE}/invoices?orderId=${orderId}`, {
            method: 'GET', headers: authHeaders
        });
        const inv = iRes.invoices[0];
        console.log(`   ✅ Active Invoice: ${inv.invoiceNumber}`);

        await request(`${API_BASE}/invoices/${inv._id}/payment`, {
            method: 'POST', headers: authHeaders,
            body: { amount: 20000, method: 'BANK', reference: 'Paid in Full' }
        });
        console.log('   ✅ Payment recorded');

        const vInv = await request(`${API_BASE}/invoices/${inv._id}`, {
            method: 'GET', headers: authHeaders
        });
        console.log(`   ✅ Payout Status: ${vInv.paymentStatus}`);
    } catch (err) {
        console.error('   ❌ Payments failed:', err.body || err);
    }

    // 6. Complete
    try {
        await request(`${API_BASE}/biz/orders/${orderId}/status`, {
            method: 'PUT',
            headers: authHeaders,
            body: { status: 'COMPLETED', note: 'Bot: Cycle Finished' }
        });
        console.log('6. ✅ Workflow COMPLETED successfully');
    } catch (err) {
        console.error('   ❌ Closure failed:', err.body || err);
    }

    console.log('--- TEST FINISHED ---');
}

testWorkflow();
