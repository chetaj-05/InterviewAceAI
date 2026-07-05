import * as authService from "../services/authService.js";

export const registerUser = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
