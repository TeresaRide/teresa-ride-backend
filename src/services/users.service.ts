import db from "../config/db";
import { User } from "../models/user.model";

export const getAllUsers = (): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    db.query("SELECT  id_document, name, email, password, nationality, role, image_path FROM User", (err, results) => {
      if (err) reject(err);
      else resolve(results as User[]);
    });
  });
};

export const getUserById = (id_document: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id_document, name, email, password, nationality, role, image_path FROM User WHERE id_document = ?",
      [id_document],
      (err, results) => {
        if (err) return reject(err);
        const users = results as User[];
        if (!Array.isArray(users) || users.length === 0)
          return resolve(null);
        resolve(users[0]);
      }
    );
  });
};

export const getUserByEmail = (email: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id_document, name, email, password, nationality, role, image_path FROM User WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return reject(err);
        const users = results as User[];
        if (!Array.isArray(users) || users.length === 0)
          return resolve(null);
        resolve(users[0]);
      }
    );
  });
};

export const createUser = (user: User): Promise<User> => {
  return new Promise((resolve, reject) => {
    db.query("INSERT INTO User SET ?", user, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};

export const updateUser = (id_document: string, user: Partial<User>): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE User SET ? WHERE id_document = ?", [user, id_document], (err) => {
      if (err) return reject(err);
      getUserById(id_document)
        .then(resolve)
        .catch(reject);
    });
  });
};

export const deleteUser = (id_document: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM User WHERE id_document = ?", [id_document], (err, result) => {
      if (err) reject(err);
      else if ((result as any).affectedRows === 0)
        reject(new Error("User not found"));
      else resolve();
    });
  });
};
