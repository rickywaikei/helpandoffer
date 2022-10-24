// ./models/Helpcase.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const HelpcaseSchema = new Schema (
    {
        title: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Types.ObjectId,
            required: true, 
        },
        offer: {
            type: String,
            required: false,
        },
        offermsg: {
            type: String,
            required: false,
        },
        solved: {
            type: Boolean,
            required: false,
            default: false,
        },
        solveddate: {
            type: Date,
            required: false, 
            default: null,
        },
    },
    { timestamps: true },
);

const Helpcase = mongoose.model("helpcases", HelpcaseSchema);
export default Helpcase;