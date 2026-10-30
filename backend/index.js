require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("./middlewares/logger");
const compression = require("compression");
const helmet = require("helmet");
const app = express();
const path = require("path");
const sequelize = require("./utils/db.js");
const userRoutes = require("./routes/userRoute.js");
const ngoRoutes = require("./routes/ngoRoute.js");
const adminRoutes = require("./routes/adminRoute.js");
const donationRoutes = require("./routes/donationRoutes.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(helmet())
app.use(compression());


Donation.belongsTo(User, {
  foreignKey: "userId",
  as: "donor"
});

Donation.belongsTo(NGO, {
  foreignKey: "ngoId",
  as: "ngo"
});
app.use("/email", require("./routes/emailRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/ngo", ngoRoutes);
app.use("/donation", donationRoutes);

app.get("/", (req, res) => {
  res.send("Hi");
});

sequelize
  .sync()
  .then(() => {
    console.log("Database connection is created...");

    app.listen(process.env.PORT, () =>
      console.log(`Server is running at PORT ${process.env.PORT}`),
    );
  })
  .catch((err) => {
    console.log("Error : ", err);
    return;
  });
