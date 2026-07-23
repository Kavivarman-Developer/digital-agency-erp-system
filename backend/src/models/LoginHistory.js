import mongoose from "mongoose";

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

export default mongoose.model("LoginHistory", loginHistorySchema);