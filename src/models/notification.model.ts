export interface Notification {
    id_notification?: number;
    email_subject: string;
    description: string;
    shipping_date: Date | string;
    type: string;
    attachment_path?: string; 
}