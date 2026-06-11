export interface Trip {
  id_trip: number;
  origin: string;
  destination: string;
  price: number;
  start_date: string;   // si lo recibes desde JSON, usar string y luego convertir a Date si quieres
  final_date: string;   // idem
  people_count: number;
  description: string;
  image: string;
}
