import "server-only";
import { getSettingsBundle } from "./settings-service";
export async function getPrinterSettings() { const settings=await getSettingsBundle(); return {...settings.printer,...settings.receipt}; }
