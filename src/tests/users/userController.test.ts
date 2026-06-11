import { Request, Response } from "express";
import * as userController from "../../controllers/users.controller";
import * as userService from "../../services/users.service";

jest.mock("../../services/users.service", () => ({
  __esModule: true,
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

type ResMock = Pick<Response, "status" | "json" | "send"> & {
  statusCode?: number;
};
const createRes = (): ResMock => {
  const res: any = {};
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("users.controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getAll retorna 200 con lista", async () => {
    (userService.getAllUsers as jest.Mock).mockResolvedValue([
      { id_document: "1" },
    ]);
    const res = createRes();
    await userController.getAll(
      { authUser: { role: "admin" } } as any,
      res as any
    );
    expect(res.json).toHaveBeenCalledWith([{ id_document: "1" }]);
  });

  test("getAll maneja 403 si no es admin", async () => {
    const res = createRes();
    await userController.getAll(
      { authUser: { role: "user" } } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getById retorna 200", async () => {
    (userService.getUserById as jest.Mock).mockResolvedValue({
      id_document: "9",
    });
    const res = createRes();
    await userController.getById(
      { params: { id: "9" }, authUser: { role: "admin" } } as any,
      res as any
    );
    expect(res.json).toHaveBeenCalledWith({ id_document: "9" });
  });

  test("getById maneja 401", async () => {
    const res = createRes();
    await userController.getById({ params: { id: "9" } } as any, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("getById maneja 403", async () => {
    const res = createRes();
    await userController.getById(
      {
        params: { id: "9" },
        authUser: { role: "user", id_document: "8" },
      } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("update retorna 200", async () => {
    (userService.updateUser as jest.Mock).mockResolvedValue({
      id_document: "2",
      name: "Nuevo",
    });
    const res = createRes();
    await userController.update(
      {
        params: { id: "2" },
        authUser: { role: "admin" },
        body: { name: "Nuevo" },
      } as any,
      res as any
    );
    expect(res.json).toHaveBeenCalledWith({ id_document: "2", name: "Nuevo" });
  });

  test("update maneja 401", async () => {
    const res = createRes();
    await userController.update(
      { params: { id: "2" }, body: {} } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("remove retorna 204", async () => {
    (userService.deleteUser as jest.Mock).mockResolvedValue(undefined);
    const res = createRes();
    await userController.remove(
      { params: { id: "3" }, authUser: { role: "admin" } } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test("remove maneja 403", async () => {
    const res = createRes();
    await userController.remove(
    { params: { id: "3" }, authUser: { role: "user" } } as any,
    res as any
    );
    expect(res.status).toHaveBeenCalledWith(403);
});

test("remove maneja 404", async () => {
    (userService.deleteUser as jest.Mock).mockRejectedValue(new Error("no"));
    const res = createRes();
    await userController.remove(
    { params: { id: "3" }, authUser: { role: "admin" } } as any,
    res as any
    );
    expect(res.status).toHaveBeenCalledWith(404);
});
});
