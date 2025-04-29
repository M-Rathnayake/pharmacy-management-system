const express = require("express");
const mongoose =require("mongoose");
const bodyParser =require("body-parser");
const cors =require("cors");
const dotenv =require("dotenv");
require("dotenv").config();

const app = express();
const PORT= process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;

app.use(cors());
app.use(bodyParser.json());

//database connection - connecting the backend node.js to mongodb
 mongoose.connect(URL,{
     useNewUrlParser: true,
     useUnifiedTopology: true
 });

mongoose.connect(URL)
    .then(() => console.log("Mongodb Connection Successful!"))
    .catch((err) => console.log("MongoDB Connection Failed!", err));

const connection = mongoose.connection;
connection.once("open", () =>{
     console.log("Mongodb Connection Successful!");
 })

//to support frontend and backend communication
app.use(cors({
    origin: "http://localhost:3000", // Change this to your frontend URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

//import models
const ProfitLoss = require("./models/ProfitLoss");
const BankBook = require("./models/BankBook")

// Import Routes
const bankBookRoutes = require("./routes/bankBookRoutes");
const balanceSheetRoutes = require("./routes/balanceSheetRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const pettyCashRoutes = require("./routes/pettyCashRoutes");
const profitLossRoutes = require("./routes/profitLossRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const pdfRoutes = require('./routes/pdfRoutes');
// Use Routes
app.use("/api/bankbook", bankBookRoutes);
app.use("/api/balancesheet", balanceSheetRoutes);
app.use("/api/Employee", employeeRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/pettycash", pettyCashRoutes);
app.use("/api/profitloss", profitLossRoutes);
app.use("/api/salaries", salaryRoutes);
app.use('/api', pdfRoutes);

//start server
app.listen(PORT ,()=>{
    console.log(`Server is running on port number : ${PORT}`);
})


