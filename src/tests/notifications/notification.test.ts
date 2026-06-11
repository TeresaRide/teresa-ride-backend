jest.mock("../../config/db");

import db from "../../config/db";
import * as notificationService from "../../services/notification.service";
import { Notification } from "../../models/notification.model";

const queryMock = (db as unknown as { query: jest.Mock }).query;

describe("notification.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllNotifications retorna lista", async () => {
    const rows: Notification[] = [
      {
        id_notification: 1,
        email_subject: "Test",
        description: "msg",
        shipping_date: new Date(),
        type: "info",
        attachment_path: "text.pdf",
      },
    ];
    queryMock.mockImplementation((sql: string, cb: Function) => cb(null, rows));
    const res = await notificationService.getAllNotifications();
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM Notification",
      expect.any(Function)
    );
    expect(res).toEqual(rows);
  });

  test("getNotificationById retorna 1 registro", async () => {
    const row: any = {
      id_notification: 9,
      email_subject: "T",
      description: "M",
      shipping_date: new Date(),
      type: "info",
      attachment_path: "text.pdf",
    };
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, [row])
    );
    const res = await notificationService.getNotificationById(9);
    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM Notification WHERE id_notification = ?",
      [9],
      expect.any(Function)
    );
    expect(res).toEqual(row);
  });

  test("getNotificationById rechaza si no existe", async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, [])
    );
    await expect(notificationService.getNotificationById(9)).rejects.toThrow(
      "Notification not found"
    );
  });

  test("updateNotification retorna actualizado", async () => {
    const spyGet = jest
      .spyOn(notificationService, "getNotificationById")
      .mockResolvedValue({
        id_notification: 2,
        email_subject: "T2",
        description: "M2",
        shipping_date: new Date(),
        type: "info",
        attachment_path: "text.pdf",
      } as Notification);
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, { affectedRows: 1 })
    );
    const res = await notificationService.updateNotification(2, {
      email_subject: "T2",
    });
    expect(spyGet).toHaveBeenCalledWith(2);
    expect(res.email_subject).toBe("T2");
  });

  test("deleteNotification resuelve cuando affectedRows > 0", async () => {
    queryMock.mockImplementation((sql: string, params: any[], cb: Function) =>
      cb(null, { affectedRows: 1 })
    );
    await expect(
      notificationService.deleteNotification(2)
    ).resolves.toBeUndefined();
  });
});
