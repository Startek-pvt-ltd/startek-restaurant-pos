export type MenuItemDeleteMode = "archive" | "hard-delete";
export type CategoryDeleteMode = "archive" | "blocked" | "hard-delete";

export function menuItemDeleteMode(orderItemCount: number): MenuItemDeleteMode {
  return orderItemCount > 0 ? "archive" : "hard-delete";
}

export function categoryDeleteMode(activeItemCount: number, totalItemCount: number): CategoryDeleteMode {
  if (activeItemCount > 0) return "blocked";
  return totalItemCount > 0 ? "archive" : "hard-delete";
}
