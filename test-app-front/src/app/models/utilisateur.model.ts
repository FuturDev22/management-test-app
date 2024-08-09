export interface Utilisateur {
    id?: number;
    name?: string;
    email?: string;
    password?: string;
    role?: 'Administrateur' | 'Testeur' | 'Manager';
  }
  