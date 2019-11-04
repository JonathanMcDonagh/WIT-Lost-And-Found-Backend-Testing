let express = require("express")
let router = express.Router()

/* GET home page. */
router.get("/", function(req, res) {
  res.render("index", { title: "WIT Lost And Found" })
})

module.exports = router
