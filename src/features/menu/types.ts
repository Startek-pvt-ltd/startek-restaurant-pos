export type CategoryRecord = {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  active: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MenuItemRecord = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  preparationTime: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MenuActionResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const MENU_MANAGER_ROLES = ["SUPER_ADMIN", "OWNER", "MANAGER"] as const;

