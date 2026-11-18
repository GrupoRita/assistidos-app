export type Beneficiary = {
  id: string;
  code: string;
  name: string;
  socialName: string | null;
  phone: string | null;
  cpf: string | null;
  birthDate: string | null;
  registeredAt: string;
  dependents: number;
  cardUid: string | null;
  photoUrl: string | null;
  notes: string | null;
  active: boolean;
};

export type BeneficiaryInput = {
  name: string;
  cpf: string;
  socialName?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  registeredAt?: string | null;
  dependents?: number;
  cardUid?: string | null;
  notes?: string | null;
};

export type AssistanceService = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  durationMinutes: number | null;
  monthlyLimit: number | null;
  active: boolean;
  displayOrder: number;
};

export type AssistanceServiceInput = {
  name: string;
  description?: string | null;
  emoji?: string;
  durationMinutes?: number | null;
  monthlyLimit?: number | null;
  active?: boolean;
};

export type AssistanceRecord = {
  id: string;
  attendedAt: string;
  beneficiary: Pick<Beneficiary, 'id' | 'code' | 'name' | 'socialName' | 'photoUrl'>;
  service: Pick<AssistanceService, 'id' | 'name' | 'emoji'>;
};

export type Me = {
  organization: { id: string; name: string };
  user: { name: string | null; email: string };
};
