const userService = require("../services/userServices");
const AllValidation = require("../validation/AllValidation");

const loginUser = async (req, res) => {
  try {
    const userdata = req.body;
    const { value, error } = AllValidation.fatchUser.validate(userdata);
    if (error !== undefined) {
      console.log("error", error);
      return res.status(400).send(error.details[0].message);
    }
    const response = await userService.login(value);
    if (response === "NOT FOUND!" || response === "Password wrong!") {
      return res.status(401).send(response);
    }
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).send("Token is required");
    }
    const response = await userService.googleLogin(token);
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const createUser = async (req, res) => {
  try {
    const userdata = req.body;
    userdata.recaptchaToken = 'dummy-token-for-validation';

    const { value, error } = AllValidation.createUser.validate(userdata);
    if (error !== undefined) {
      console.log("error", error);
      return res.status(400).send(error.details[0].message);
    }

    delete value.recaptchaToken;

    const user = await userService.createUser(value);
    if (!user) {
      return res.sendStatus(401);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getRole = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const response = await userService.getRoleByEmail(userEmail);
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const updateUser = async (req, res) => {
  try {
    const userdata = req.body;
    const { value, error } = AllValidation.updateUser.validate(userdata);
    if (error !== undefined) {
      console.log("error", error);
      return res.status(400).send(error.details[0].message);
    }
    const response = await userService.updateUser({ id: req.params.id, ...value });
    if (!response) {
      return res.sendStatus(404);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const response = await userService.getAllUsers();
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    if (!result) {
      return res.status(404).send("User not found");
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    return res.status(500).send("Internal Server Error: " + error.message);
  }
};

const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;
    console.log(`ATTEMPTING_UPDATE_ROLE [ID: ${id}] [ROLE: ${role}]`);

    const { value, error } = AllValidation.updateUserRole.validate({ role });

    if (error !== undefined) {
      console.log("VALIDATION_ERROR IN updateRole:", error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
      const response = await userService.updateUserRole(id, value.role);
      if (response === "NOT FOUND!") {
        console.log(`UPDATE_ROLE_FAILED: USER ${id} NOT FOUND`);
        res.status(404).send("User not found");
      } else {
        console.log(`UPDATE_ROLE_SUCCESS: USER ${id} ROLE -> ${value.role}`);
        res.status(200).send(response);
      }
    }
  } catch (error) {
    console.error("CRITICAL_ERROR IN updateRole CONTROLLER:", error);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};

module.exports = { loginUser, createUser, updateUser, deleteUser, getRole, getAllUsers, googleLogin, updateRole };