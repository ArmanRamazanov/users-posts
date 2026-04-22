import mongoose from "mongoose";

let retry = 3;

export const connectToDatabase = (cb: (err: any) => void) => {
  mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => {
      cb(null);
    })
    .catch((err) => {
      if (retry > 0 && process.env.NODE_ENV === "production") {
        retry--;
        setTimeout(() => connectToDatabase(cb), 5000);
      } else {
        cb(err);
      }
    });
};
