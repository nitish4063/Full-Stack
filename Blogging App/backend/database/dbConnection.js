import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Blogging_Application",
    })
    .then(() => console.log(`MongoDb Connected!!`))
    .catch((err) => console.log(`Error While Connecting MongoDb: ${err}`));
};
