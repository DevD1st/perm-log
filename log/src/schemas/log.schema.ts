import mongoose from "mongoose";
import {
  LogLevelEnum,
  LogSchemaDto,
  PermLogEventsEnum,
} from "perm-log-library/build/util";

const LogSchema = new mongoose.Schema<LogSchemaDto>(
  {
    level: { required: true, type: String, enum: LogLevelEnum },
    messageType: { type: String, enum: PermLogEventsEnum },
    permId: { type: mongoose.Types.ObjectId },
    permNumber: { type: Number },
    reqContext: { type: {} },
  },
  {
    timestamps: true,
  }
);

const LogModel = mongoose.model("Log", LogSchema);
export default LogModel;
