import admin from "firebase-admin";
// import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf-8")
);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // contains uid, email
    next();
  } catch (err) {
    console.log("Invalid token:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
