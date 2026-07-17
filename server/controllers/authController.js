import * as authService from "../services/authService.js";

export const registerUser = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.json(user);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};
