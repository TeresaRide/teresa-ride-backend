import express from "express";
import { User } from "../models/user.model";
import * as userService from "../services/users.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request as ExRequest } from "express";
import { uploadToCloudinary } from "../utils/cloudinary";


export interface RequestWithAuth extends ExRequest {
  authUser?: User;
}

export const getAll = async (req: RequestWithAuth, res: express.Response) => {
  try {
    if (!req.authUser || req.authUser.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};


export const getById = async (req: RequestWithAuth, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!req.authUser) return res.status(401).json({ error: "No autorizado" });
    if (req.authUser.role !== "admin" && req.authUser.id_document !== id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const user = await userService.getUserById(id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found", error });
  }
};


export const update = async (req: RequestWithAuth, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!req.authUser) return res.status(401).json({ error: "No autorizado" });
    if (req.authUser.role !== "admin" && req.authUser.id_document !== id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    let updateData: any = { ...req.body };
    if (req.body.password && req.body.password.trim() !== "") {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete updateData.password;
    }

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'teresaride/users');
      updateData.image_path = uploaded.url;
    }

    const user = await userService.updateUser(id, updateData);
    res.json(user);
  } catch (error) {
    res
      .status(404)
      .json({ message: "User not found or error updating", error });
  }
};

export const remove = async (req: RequestWithAuth, res: express.Response) => {
  try {
    const { id } = req.params;
    if (!req.authUser || req.authUser.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res
      .status(404)
      .json({ message: "User not found or error deleting", error });
  }
};

export const registerUser = async (req: RequestWithAuth, res: express.Response) => {
  const { id_document, name, email, password, nationality, role } = req.body;

  try {
    const existingEmail = await userService.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }
    const existingId = await userService.getUserById(id_document);
    if (existingId) {
      return res
        .status(400)
        .json({ error: "La cédula/pasaporte ya está registrada" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRole: "user" | "admin" = "user";
    let image_path: string | undefined = undefined;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'teresaride/users');
      image_path = uploaded.url;
    }

    const newUser: User = {
      id_document,
      name,
      email,
      password: hashedPassword,
      nationality,
      role: userRole,
      image_path,
    };

    const savedUser = await userService.createUser(newUser);

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registrando usuario" });
  }
};

export const registerUserAdmin = async (req: RequestWithAuth, res: express.Response) => {
  const { id_document, name, email, password, nationality, role } = req.body;
  try {
    const existingEmail = await userService.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const existingId = await userService.getUserById(id_document);
    if (existingId) {
      return res
        .status(400)
        .json({ error: "La cédula/pasaporte ya está registrada" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userRole: "user" | "admin" = "admin";
    if (req.authUser && req.authUser.role === "admin" && role === "admin") {
      userRole = "admin";
    }

    let image_path: string | undefined = undefined;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'teresaride/users');
      image_path = uploaded.url;
    }

    const newUser: User = {
      id_document,
      name,
      email,
      password: hashedPassword,
      nationality,
      role: userRole,
      image_path,
    };

    const savedUser = await userService.createUser(newUser);

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registrando usuario" });
  }
};

// ===========================
// Login de usuario
// ===========================
export const loginUser = async (
  req: RequestWithAuth,
  res: express.Response
) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(401).json({ error: "Contraseña incorrecta" });

  // Crear token JWT
  const token = jwt.sign(
    { id_document: user.id_document, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );

  res.json({ token, user });
};

// ===========================
// Actualizar perfil de usuario
// ===========================
export const updateProfile = async (
  req: RequestWithAuth,
  res: express.Response
) => {
  try {
    if (!req.authUser) return res.status(401).json({ error: "No autorizado" });
    const userId = req.authUser.id_document;
    const { name, nationality } = req.body;
    let image_path: string | undefined = undefined;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'teresaride/users');
      image_path = uploaded.url;
    }
    const updateData: any = { name, nationality };
    if (image_path) updateData.image_path = image_path;

    const updatedUser = await userService.updateUser(userId, updateData);
    res.json({ message: "Perfil actualizado", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Error actualizando perfil" });
  }
};

// ===========================
// Obtener perfil del usuario
// ===========================
export const getMe = async (req: RequestWithAuth, res: express.Response) => {
  if (!req.authUser) return res.status(401).json({ error: "No autorizado" });
  const user = await userService.getUserById(req.authUser.id_document);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(user);
};
