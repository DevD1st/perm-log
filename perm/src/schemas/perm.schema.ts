import mongoose, { Types } from "mongoose";
import { PermSchemaDto } from "perm-log-library/build/util";

const PermSchema = new mongoose.Schema<PermSchemaDto>(
  {
    permNumber: { type: Number, required: true },
    calculatedFactorial: { type: Number, required: true },
    appliedDelay: { type: Number, required: true },
  },
  { timestamps: true }
);

const PermModel = mongoose.model("Perm", PermSchema);

export default PermModel;
