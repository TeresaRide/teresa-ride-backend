import { Request, Response } from "express";
import * as notificationController from "../../controllers/notification.controller";
import * as notificationService from "../../services/notification.service";

jest.mock("../../services/notification.service", () => ({
  __esModule: true,
  getAllNotifications: jest.fn(),
  getNotificationById: jest.fn(),
  createNotification: jest.fn(),
  updateNotification: jest.fn(),
  deleteNotification: jest.fn(),
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

describe("notification.controller", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getAll retorna 200 con lista", async () => {
    (notificationService.getAllNotifications as jest.Mock).mockResolvedValue([
      { id_notification: 1 },
    ]);
    const res = createRes();
    await notificationController.getAllNotifications({} as Request, res as any);
    expect(res.json).toHaveBeenCalledWith([{ id_notification: 1 }]);
  });

  test("getAll maneja 500", async () => {
    (notificationService.getAllNotifications as jest.Mock).mockRejectedValue(
      new Error("x")
    );
    const res = createRes();
    await notificationController.getAllNotifications({} as Request, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getById retorna 200", async () => {
    (notificationService.getNotificationById as jest.Mock).mockResolvedValue({
      id_notification: 9,
    });
    const res = createRes();
    await notificationController.getNotificationById(
      { params: { id: "9" } } as any,
      res as any
    );
    expect(res.json).toHaveBeenCalledWith({ id_notification: 9 });
  });

  test("getById maneja 404", async () => {
    (notificationService.getNotificationById as jest.Mock).mockRejectedValue(
      new Error("no")
    );
    const res = createRes();
    await notificationController.getNotificationById(
      { params: { id: "x" } } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("create retorna 201", async () => {
    (notificationService.createNotification as jest.Mock).mockImplementation(
      async (n: any) => n
    );
    const res = createRes();
    await notificationController.createNotification(
      { body: { email_subject: "T" } } as any,
      res as any
    );
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ email_subject: "T" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("create maneja 400", async () => {
    (notificationService.createNotification as jest.Mock).mockRejectedValue(
      new Error("bad")
    );
    const res = createRes();
    await notificationController.createNotification(
      { body: {} } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("update retorna 200", async () => {
    (notificationService.updateNotification as jest.Mock).mockResolvedValue({
      id_notification: 2,
      email_subject: "Nuevo",
    });
    const res = createRes();
    await notificationController.updateNotification(
      { params: { id: "2" }, body: { email_subject: "Nuevo" } } as any,
      res as any
    );
    expect(res.json).toHaveBeenCalledWith({
      id_notification: 2,
      email_subject: "Nuevo",
    });
  });

  test("update maneja 400", async () => {
    (notificationService.updateNotification as jest.Mock).mockRejectedValue(
      new Error("no")
    );
    const res = createRes();
    await notificationController.updateNotification(
      { params: { id: "2" }, body: {} } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("remove retorna 204", async () => {
    (notificationService.deleteNotification as jest.Mock).mockResolvedValue(
      undefined
    );
    const res = createRes();
    await notificationController.deleteNotification(
      { params: { id: "3" } } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test("remove maneja 400", async () => {
    (notificationService.deleteNotification as jest.Mock).mockRejectedValue(
      new Error("no")
    );
    const res = createRes();
    await notificationController.deleteNotification(
      { params: { id: "3" } } as any,
      res as any
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
