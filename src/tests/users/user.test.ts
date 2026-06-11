jest.mock("../../config/db");

import db from "../../config/db";
import * as userService from "../../services/users.service";
import { User } from "../../models/user.model";

const queryMock = (db as unknown as { query: jest.Mock }).query;

describe("user.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllUsers retorna lista", async () => {
    const rows: User[] = [
      {
        id_document: "1",
        name: "Test",
        email: "a@a.com",
        password: "x",
        nationality: "CR",
        role: "user",
        image_path: "default.png",
      },
    ];
    queryMock.mockImplementation((sql: string, cb: Function) => cb(null, rows));
    const res = await userService.getAllUsers();
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT  id_document, name, email, password, nationality, role, image_path FROM User",
      expect.any(Function)
    );
    expect(res).toEqual(rows);
  });

  test("getUserById retorna 1 registro", async () => {
    const row: any = {
      id_document: "1",
      name: "Test",
      email: "a@a.com",
      password: "x",
      nationality: "CR",
      role: "user",
      image_path: "default.png",
    };
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, [row])
    );
    const res = await userService.getUserById("1");
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT id_document, name, email, password, nationality, role, image_path FROM User WHERE id_document = ?",
      ["1"],
      expect.any(Function)
    );
    expect(res).toEqual(row);
  });

  test("getUserById retorna null si no existe", async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, [])
    );
    const res = await userService.getUserById("X");
    expect(res).toBeNull();
  });

  test("getUserByEmail retorna 1 registro", async () => {
    const row: any = {
      id_document: "1",
      name: "Test",
      email: "a@a.com",
      password: "x",
      nationality: "CR",
      role: "user",
      image_path: "default.png",
    };
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, [row])
    );
    const res = await userService.getUserByEmail("a@a.com");
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT id_document, name, email, password, nationality, role, image_path FROM User WHERE email = ?",
      ["a@a.com"],
      expect.any(Function)
    );
    expect(res).toEqual(row);
  });

  test("getUserByEmail retorna null si no existe", async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, [])
    );
    const res = await userService.getUserByEmail("x@x.com");
    expect(res).toBeNull();
  });

  test("createUser inserta y retorna el usuario", async () => {
    const user: User = {
      id_document: "2",
      name: "Nuevo",
      email: "nuevo@a.com",
      password: "x",
      nationality: "CR",
      role: "user",
      image_path: "default.png",
    };
    queryMock.mockImplementation((sql: string, params: any, cb: Function) =>
      cb(null, { insertId: 2 })
    );
    const res = await userService.createUser(user);
    expect(res).toEqual(user);
  });

  test("updateUser retorna actualizado", async () => {
    const user: Partial<User> = { name: "Actualizado" };
    const updated: User = {
      id_document: "2",
      name: "Actualizado",
      email: "nuevo@a.com",
      password: "x",
      nationality: "CR",
      role: "user",
      image_path: "default.png",
    };
    jest.spyOn(userService, "getUserById").mockResolvedValue(updated);
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, { affectedRows: 1 })
    );
    const res = await userService.updateUser("2", user);
    expect(res).toEqual(updated);
  });

  test("deleteUser resuelve cuando affectedRows > 0", async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, { affectedRows: 1 })
    );
    await expect(userService.deleteUser("2")).resolves.toBeUndefined();
  });

  test("deleteUser rechaza cuando affectedRows = 0", async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, { affectedRows: 0 })
    );
    await expect(userService.deleteUser("2")).rejects.toThrow("User not found");
  });
});
