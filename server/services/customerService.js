const Customer = require('../models/Customer');

/**
 * Update or create a customer record based on order data
 */
async function syncCustomerFromOrder(order) {
    if (!order.customer?.name) return;
    
    const { name, phone, email, address, city, company } = order.customer;
    
    // Try to find existing customer by email or phone
    let customer = null;
    if (email) customer = await Customer.findOne({ email });
    if (!customer && phone) customer = await Customer.findOne({ phone });
    
    if (customer) {
        // Update existing
        customer.name = name;
        if (phone) customer.phone = phone;
        if (email) customer.email = email;
        if (address) customer.address = address;
        if (city) customer.city = city;
        if (company) customer.company = company;
        
        // Update stats
        customer.totalSpend += order.total;
        customer.orderCount += 1;
        customer.lastOrderAt = order.createdAt;
        
        await customer.save();
    } else {
        // Create new
        await Customer.create({
            name, phone, email, address, city, company,
            totalSpend: order.total,
            orderCount: 1,
            lastOrderAt: order.createdAt
        });
    }
}

module.exports = {
    syncCustomerFromOrder
};
