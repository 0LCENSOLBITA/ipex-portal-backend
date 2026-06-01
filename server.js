const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
path: __dirname + "/.env"
});

const app = express();

app.use(cors({
origin:[
"http://localhost:8080",
"https://lovable.dev",
"https://ipex-project.olcengsolbita.workers.dev"
]
}));

app.use(express.json());

app.use((req,res,next)=>{
console.log(
`${req.method} ${req.url}`
);
next();
});

app.use(
"/uploads",
express.static(
path.join(
__dirname,
"uploads"
)
)
);

app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/business-units", require("./routes/businessUnitRoutes"));
app.use("/api/project-types", require("./routes/projectTypeRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

app.get("/", (req,res)=>{
res.send("API is running...");
});

app.use((err,req,res,next)=>{
console.error(err.stack);

res.status(500).json({
error:"Something went wrong"
});
});

const PORT =
process.env.PORT || 5000;

mongoose.connect(
process.env.MONGO_URI
)
.then(()=>{
console.log(
"MongoDB connected"
);

app.listen(PORT,()=>{
console.log(
`Server running on ${PORT}`
);
});
})
.catch((err)=>{
console.error(
err
);
});