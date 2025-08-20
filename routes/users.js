var express = require("express");
var router = express.Router();
const { createUser, loginUser, getRole, updateUser, getAllUsers } = require("../controller/userController");

router.post("/createuser", createUser);
router.get("/getAllUsers", getAllUsers);
router.post("/login", loginUser);
router.get('/role/:email', getRole);
router.put("/updateuser/:id", updateUser);


module.exports = router;
