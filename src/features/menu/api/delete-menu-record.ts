import type { MenuActionResult } from "../types";

export async function deleteMenuRecord(path: string): Promise<MenuActionResult> {
  try {
    const response = await fetch(path, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null) as { success?: boolean; message?: string } | null;
    const message = payload?.message?.trim();

    if (response.ok && payload?.success) {
      return { success: true, message: message || "Deleted successfully." };
    }
    return {
      success: false,
      message: message || `Delete request failed with status ${response.status}.`,
    };
  } catch {
    return {
      success: false,
      message: "The delete request could not reach the server. Check the connection and try again.",
    };
  }
}
