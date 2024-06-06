import { Router } from "express";
import multer from "multer";
import path from "path";

import { randomString, file, size_h } from "../helpers/utils.js";

const router = Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.resolve("files"));
	},
	filename: (req, file, cb) => {
		cb(null, randomString());
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 20 * 1024 * 1024,
	},
});

router.post("/file", upload.single("file"), async (req, res, next) => {
	try {
		const { path: _path, filename, size } = req.file;
		res.json({
			status: true,
			code: 200,
			result: {
				url: file(filename),
				...(process.env.CLEANUP_FILES === "true"
					? {
							expire_in: 24 * 60 * 60,
							expire_in_h: "24 hours",
					  }
					: (process.env.DELETE_AFTER_DOWNLOAD === "true" && {
							expire_in: 0,
							expire_in_h: "After download",
					  }) || {
							expire_in: 0,
							expire_in_h: "Never",
					  }),
				size,
				size_h: size_h(size),
			},
		});
	} catch (error) {
		next(error);
	}
});

export default router;
