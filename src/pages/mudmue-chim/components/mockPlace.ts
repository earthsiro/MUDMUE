export interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  review: string;
}

export const places: Place[] = [
  { id: 1, name: "ก๋วยเตี๋ยวเรืออยุธยา", lat: 13.7563, lng: 100.5018, rating: 4.5, review: "น้ำซุปเข้มข้น หมูนุ่มมาก" },
  { id: 2, name: "ข้าวมันไก่ประตูน้ำ", lat: 13.7477, lng: 100.5390, rating: 4, review: "ไก่นุ่ม น้ำจิ้มเด็ด" },
  { id: 3, name: "ข้าวขาหมูตรอกซุง", lat: 13.742, lng: 100.523, rating: 5, review: "ขาหมูนุ่ม น้ำราดฉ่ำ" },
];