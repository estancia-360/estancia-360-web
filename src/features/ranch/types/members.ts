export interface RanchMember {
  idUser: number;
  idRanch: number;
  role: { id: number; name: string };
  user: {
    id: number;
    fullname: string;
    paternalSurname: string;
    maternalSurname: string;
    email: string;
    ci: string;
    celphone: string | null;
  };
}
