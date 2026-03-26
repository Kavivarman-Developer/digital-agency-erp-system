const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  email: String,
  role: String,
  loginTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("LoginHistory", loginHistorySchema);