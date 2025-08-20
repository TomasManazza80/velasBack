const userService = require("../services/userServices");
const AllValidation = require("../validation/AllValidation");

const loginUser = async (req, res) => {
  try {
    const userdata = req.body;
    const { value, error } = AllValidation.fatchUser.validate(userdata);
    if (error !== undefined) {
      console.log("error", error);
      res.status(400).send(error.details[0].message);
    } else {
      const response = await userService.login(value);
      if (response === "NOT FOUND!" || response === "Password wrong!") {
        res.status(401).send(response);
      } else {
        res.send(response);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const createUser = async (req, res) => {
  try {
    const userdata = req.body;
    const { value, error } = AllValidation.createUser.validate(userdata);
    if (error !== undefined) {
      console.log("error", error);
      res.status(400).send(error.details[0].message);
    } else {
      const user = await userService.createUser(value);
      if (!user) {
        res.sendStatus(401);
      } else {
        res.sendStatus(200);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const getRole = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const response = await userService.getRoleByEmail(userEmail);
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};



const updateUser = async (req, res) => {
  try {
    const userdata = req.body;
    const { value, error } = AllValidation.updateUser.validate(userdata);
    if (error !== undefined) {
      console.log("error", error);
      res.status(400).send(error.details[0].message);
    } else {
      const response = await userService.updateUser({ id: req.params.id, ...value });
      if (!response) {
        res.sendStatus(404); // Usuario no encontrado
      } else {
        res.sendStatus(200); // Usuario actualizado con éxito
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const response = await userService.getAllUsers();
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};




const deleteUser = async (req, res) => {};

module.exports = { loginUser, createUser, updateUser, deleteUser, getRole, getAllUsers };