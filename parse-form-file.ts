import { NextApiRequest, NextApiResponse } from "next";
import mime from "mime";
import { join } from "path";
import * as dateFn from "date-fns";
import formidable from "formidable";
import { mkdir, stat } from "fs/promises";
export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.cwd(),
      `/uploads/${dateFn.format(Date.now(), "dd-MM-Y")}`
    );

    try {
      await stat(uploadDir);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.log(error);
        reject(error);
        return;
      }
    }

    const form = formidable({
      maxFiles: 2,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || "unknown"}-${uniqueSuffix}.${
          mime.getExtension(part.mimetype || "") || "unknown"
        }`;
        return filename;
      },
      filter: (part) => {
        return (
          part.name === "file" && (part.mimetype?.includes("image") || false)
        );
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else {
        if (req.body)
          Object.entries(req.body).forEach(([key, value]) => {
            fields[key] = value as string;
          });
        resolve({ fields, files });
      }
    });
  });
};
