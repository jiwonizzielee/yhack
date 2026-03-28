const express = require("express");
const app = express();
const auth = require("./middleware/auth");
app.get("/protected", auth, (req, res) => {
    res.send("You are logged in!");
})