import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { uploadFileToS3, updateFileOnS3 } from "@/lib/amazon-s3";
import formidable from "formidable";
import FormData from "form-data";
import fs from "fs";
import Post, { IPost } from "@/models/Post";
import { parseForm } from "@/lib/parseForm";

// IMPORTANT: Prevents next from trying to parse the form
export const config = {
  api: {
    bodyParser: false,
  },
};
type formidableData = {
  fields: formidable.Fields;
  files: formidable.Files;
};
interface uploadFile {
  success: boolean;
  signedUrl?: string;
  message: string;
  key?: string;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await connectDB();

  switch (method) {
    case "GET": {
      const data = req.query.data;
      res.status(200).json({ success: true, httpStatus: "200", data: data });
    }
    case "PUT": {
      try {
        const { fields, files }: formidableData = await parseForm(req);
        const { post_id, visibility, body, link, originalFilename } = fields;
        const parsedFile: formidable.File = files.file as formidable.File;

        console.log("parsed file");
        let url,
          newFilename,
          newURL: string = "";
        if (!post_id) {
          return res.status(400).json({
            success: false,
            message: "postId is required to update the post",
          });
        }

        const postToUpdate = await Post.findById(post_id);
        if (!postToUpdate) {
          res.status(404).json({ error: "Post not found" });
        }
        console.log(`Post: ${postToUpdate}`);
        if (visibility) postToUpdate.visibility = visibility;
        if (body) postToUpdate.content.body = body;
        if (link) postToUpdate.content.link = link;

        console.log("easy changes made");
        if (parsedFile) {
          url = parsedFile.filepath;
          const buffer: Buffer = fs.readFileSync(url);
          newFilename = parsedFile.originalFilename;
          newURL = await updateFileOnS3(buffer, originalFilename as string);
          postToUpdate.content.image.signURL = newURL;
          postToUpdate.content.image.filename = newFilename;
        }
        const post = postToUpdate.save();
        res.status(200).json({ sucess: true, Post: post });
      } catch (e) {
        res.status(400).json({ error: e });
      }
    }
    case "POST": {
      try {
        //grab the file and fields
        const { fields, files }: formidableData = await parseForm(req);
        const {
          username,
          email,
          body,
          user_id,
          community_id,
          main_platform,
          facebook_post_id,
          instagram_post_id,
          visibility,
          link,
        }: formidable.Fields = fields;
        const parsedFile: formidable.File = files.file as formidable.File;

        //if there is a file, grab data
        if (parsedFile) {
          // Create image post
          const url: string = parsedFile.filepath;
          const buffer: Buffer = fs.readFileSync(url);
          let signedURL: string = "";

          //check for buffer failure
          if (!buffer) {
            res.status(400).json({
              success: false,
              error: "Could not parse buffer from file",
            });
          }

          signedURL = await uploadFileToS3(
            buffer,
            parsedFile.originalFilename!
          );
          if (signedURL === "") {
            res
              .status(500)
              .json({ status: false, message: "could not upload to S3" });
          }
          const newPost: IPost = new Post({
            user_id: user_id,
            username: username,
            email: email,
            community_id: community_id,
            main_platform: main_platform,
            content: {
              body: body,
              image: {
                signUrl: signedURL,
                originalFilename: parsedFile.originalFilename,
              },
            },
            visibility: visibility,
          });
          newPost.save();
          res.status(200).json({
            status: true,
            Post: newPost,
          });
        } else {
        }
      } catch (err) {
        res
          .status(401)
          .json({ status: false, message: "could not parse file" });
      }
    }
  }
}
