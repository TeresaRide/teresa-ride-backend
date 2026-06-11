export interface Review {
    id_review: string;
    id_reservation: string;
    comment: string;
    rating: number;
    date_review: Date;
    type: 'Vehicle' | 'Trip';
}