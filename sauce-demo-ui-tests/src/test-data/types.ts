export interface UserCredentials {
  username: string;
  password: string;
}

export interface Product {
  name: string;
  price?: number;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';
