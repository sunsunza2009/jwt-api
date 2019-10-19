const express = require("express")
const app = express()
const port = process.env.PORT

app.listen(3000,()=>{console.log("Running on port "+port)})