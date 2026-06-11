export interface Reservation {
  id_reservation: number;        
  id_document: string;           
  id_trip?: number | null;       
  license_plate?: string | null; 
  date_reservacion: string;      
  total_amount: number;          
  is_active: boolean;           
  final_date: string;            
}
