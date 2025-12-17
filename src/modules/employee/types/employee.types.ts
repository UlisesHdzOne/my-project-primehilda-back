export type CreateEmployeeInput = {
  name: string;
};

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
