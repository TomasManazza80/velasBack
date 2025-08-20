// BACK/services/userServices.js

const { where } = require("sequelize");
const { model, Sequelize } = require("../models/index");
const { authHash, createToken, compareHash } = require("./auth/auth");

const login = async (value) => {
  try {
    const user = await model.user.findOne({
      where: {
        email: value.email,
      },
    });

    if (!user) {
      console.log("NOT FOUND!");
      return "NOT FOUND!";
    } else {
      console.log("Contraseña ingresada:", value.password);
      console.log("Contraseña almacenada:", user.password);
      const isValidPassword = await compareHash(value.password, user.password);
      if (!isValidPassword) {
        console.log("La contraseña ingresada no coincide con la contraseña almacenada en la base de datos");
        return "Password wrong!";
      } else {
        const RetriveUpdate = {
          email: user.email,
          password: user.password,
        };
        const token = await createToken(RetriveUpdate);
        return { token, email: user.email };
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createUser = async (data) => {
  try {
    const EncyPass = await authHash(data.password);
    const userData = { ...data, password: EncyPass };
    const FinalData = await model.user.create(userData);
    return FinalData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUser = async (data) => {
  try {
    const user = await model.user.findOne({
      where: {
        id: data.id,
      },
    });

    if (!user) {
      console.log("NOT FOUND!");
      return "NOT FOUND!";
    } else {
      const hashedPassword = await authHash(data.password);
      const updatedUser = {
        name: data.name,
        number: data.number,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      };

      await user.update(updatedUser);
      return updatedUser;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const user = await model.user.destroy({
      where: {
        id,
      },
    });
    if (!user) {
      console.log("NOT FOUND!");
      return "NOT FOUND!";
    } else {
      return "User deleted successfully";
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getRoleByEmail = async (email) => {
  try {
    const user = await model.user.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      console.log("NOT FOUND!");
      return "NOT FOUND!";
    } else {
      return user.role;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await model.user.findAll();
    return users;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { login, createUser, updateUser, deleteUser, getRoleByEmail, getAllUsers };