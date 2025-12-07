export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = {
  name?: string;
};

export interface FindAllCategoriesOptions {
  page?: number;
  limit?: number;
  includeProducts?: boolean;
}
