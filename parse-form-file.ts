import type { NextApiRequest } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs/promises";

export async function parseFormFile(
  req: NextApiRequest,
  fieldName: string
): Promise<File | undefined> {
  const form = new IncomingForm({ multiples: false });
  const files: { [key: string]: File } = {};

  form.on("file", (field, file) => {
      files[field] = file;
  });

  await new Promise<void>((resolve, reject) => {
    form.parse(req, (err, fields, _) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
  const file = files[fieldName];
  if (file) {
    const data = await fs.readFile(file.filepath);
    console.log(`Data: ${data}`); 
  }
  console.log(`File ${file}`)
  return file;
}
