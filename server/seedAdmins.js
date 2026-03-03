/**
 * Seed initial admin accounts for OneFine Business Management
 * Run: node server/seedAdmins.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
    name: String, email: String, passwordHash: String,
    role: String, permissions: [String], isActive: Boolean,
}, { timestamps: true });
const AdminUser = mongoose.model('AdminUser', adminUserSchema);

const admins = [
    { name: 'OneFine Owner', email: 'owner@onefine.lk', password: 'onefine@owner2024', role: 'OWNER', permissions: ['*'] },
    { name: 'Sales Admin', email: 'sales@onefine.lk', password: 'onefine@sales2024', role: 'SALES_ADMIN', permissions: [] },
    { name: 'Inventory Admin', email: 'inventory@onefine.lk', password: 'onefine@inv2024', role: 'INVENTORY_ADMIN', permissions: [] },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const a of admins) {
        const exists = await AdminUser.findOne({ email: a.email });
        if (exists) { console.log(`⏭️  Already exists: ${a.email}`); continue; }
        const passwordHash = await bcrypt.hash(a.password, 12);
        await AdminUser.create({ name: a.name, email: a.email, passwordHash, role: a.role, permissions: a.permissions, isActive: true });
        console.log(`✅ Created: ${a.email} (${a.role})`);
    }

    console.log('\n🎉 Admin accounts ready! Login at /biz-admin');
    console.log('─────────────────────────────────────────────');
    admins.forEach(a => console.log(`  ${a.role.padEnd(20)} ${a.email.padEnd(30)} ${a.password}`));
    console.log('─────────────────────────────────────────────');
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });
