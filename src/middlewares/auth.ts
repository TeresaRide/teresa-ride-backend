import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithAuth } from "../controllers/users.controller";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado: token faltante" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id_document: string;
      role: "admin" | "user";
    };
    (req as RequestWithAuth).authUser = {
      id_document: decoded.id_document,
      role: decoded.role,
    } as any;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  requireAuth(req, res, () => {
    const authUser = (req as RequestWithAuth).authUser;
    if (authUser?.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  });
};
