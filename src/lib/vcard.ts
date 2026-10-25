export function escapeVCard(value: string) {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\r\n|\r|\n/g, "\\n");
}
