import { v4 as uuidv4 } from "uuid";

export function generateFileKey({
  filename,
  prefix,
}: {
  filename: string;
  prefix: string;
}): string {
  const ext = getFileExtension(filename);
  const uuid = uuidv4();
  const key = [prefix, `${uuid}.${ext}`].filter(Boolean).join("/");
  return key;
}

function getFileExtension(filename: string) {
  return filename.split(".").pop();
}
