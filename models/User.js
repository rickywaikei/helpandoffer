import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      data: { type: String },
      contentType: { type: String },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
    },
    badge: {
      type: Number,
      required: false,
      default: "0",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", UserSchema);
export default User;