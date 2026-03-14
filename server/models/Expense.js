const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    expenseNumber: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: [
        "Office",
        "Raw Materials",
        "Marketing",
        "Utilities",
        "Salary",
        "Logistics",
        "Other",
      ],
      default: "Other",
    },
    date: { type: Date, default: Date.now },
    addedBy: {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
      adminName: { type: String },
    },
    receiptImage: { type: String, default: "" },
  },
  { timestamps: true },
);

expenseSchema.pre("save", async function () {
  if (!this.expenseNumber) {
    const year = new Date().getFullYear();
    // find highest expense number for this year
    const lastExpense = await this.constructor
      .findOne({ expenseNumber: new RegExp(`^EXP-${year}-`) })
      .sort({ expenseNumber: -1 });

    let count = 0;
    if (lastExpense) {
      const parts = lastExpense.expenseNumber.split("-");
      if (parts.length === 3) {
        count = parseInt(parts[2], 10);
      }
    }
    this.expenseNumber = `EXP-${year}-${String(count + 1).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model("Expense", expenseSchema);
