/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module-alias")(process.cwd());
import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import cors from "cors";
import express from "express";
import multer from "multer";

const PUBLIC_PATH = path.resolve(__dirname, "../public");

const corsOptions: cors.CorsOptions = {
  origin: true,
};

const allowedExtensions = [".jpg", ".png", ".svg"];
const PORT = 3010;
export const run = async (): Promise<void> => {
  const log = GetLogger("data");
  const app = express();

  app.use(cors(corsOptions));

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      log.debug.log("destination for file %O", { file });
      const uploadPath = req.params[0];
      const basePath = path.resolve(
        __dirname,
        "../public",
        path.dirname(uploadPath),
      );
      if (!fs.existsSync(basePath)) {
        log.debug.log("Destination not found, creating...");
        fs.mkdirSync(basePath, { recursive: true });
      }
      cb(null, basePath);
    },
    filename: (req, file, cb) => {
      const uploadPath = req.params[0];
      const fileName = path.basename(uploadPath);
      log.debug.log("File name %O", { fileName });
      cb(null, file.originalname);
    },
  });

  app.post("/public/*", (req, res, next) => {
    // const uploadPath = (req.params as any)[0];
    // const basePath = path.dirname(uploadPath);
    // const fileName = path.basename(basePath);
    // const dest = path.resolve(__dirname, "../public", basePath)
    // log.debug.log("Uploading to %s with name %s", dest);

    const upload = multer({
      storage: diskStorage,
      // dest,
      fileFilter: (req, file, cb) => {
        // eslint-disable-next-line
        log.debug.log("Filtering file %O", file);
        if (allowedExtensions.includes(path.extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: {
        fileSize: 1024 * 100,
      },
    });

    return upload.single("file")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        log.error.log("MulterError %O", err);
        // A Multer error occurred when uploading.
        next(err);
        return;
      } else if (err) {
        // An unknown error occurred when uploading.
        log.error.log("Unknown error %O", err);
        next(err);
        return;
      }

      const uploadPath = (req.params as any)[0];
      const basePath = path.dirname(uploadPath);
      log.debug.log("File %O", req.file);
      const fileName = req.file?.originalname;
      const Location = `http://localhost:3010/public/${basePath}/${fileName}`;
      log.debug.log("Avatar file saved at %s", Location);
      return res.status(200).send({
        data: {
          Location,
        },
      });
    });
  });

  app.use(
    "/public",
    (req, _, next) => {
      log.debug.log("[%s] path %s", req.method, req.url);
      next();
    },
    express.static(PUBLIC_PATH),
  );

  app.listen(PORT, () => log.debug.log("Server listen on %d", PORT));
};

run()
  // eslint-disable-next-line no-console
  .catch(console.error);
