import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { verifyToken } from "../backend/firebase.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// Mongoose schema
const reportSchema = new mongoose.Schema({
    location: String,
    latitude: Number,
    longitude: Number,
    reportType: String,
    description: String,
    size: String,
    accessibility: String,
    name: String,
    phone: String,
    status: {
        type: String,
        default: 'Pending'
    },
    image: {
        data: Buffer,         // Store binary image data
        contentType: String   // Store MIME type like "image/jpeg"
    }
}, { timestamps: true });
const Report = mongoose.model("Report", reportSchema);

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // need Authorization for Firebase token
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});



// Multer setup (store file in memory to save in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API route
app.post("/api/reports", verifyToken, upload.single("image"), async (req, res) => {
  try {
   
    
    const { location, latitude, longitude, reportType, description, size, accessibility, name, phone } = req.body;

    const newReport = new Report({
      location,
      latitude,
      longitude,
      reportType,
      description,
      size,
      accessibility,
      name,
      phone,
      submittedBy: req.user ? req.user.uid : null,   // track Firebase user
      image: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      } : null
    });

    await newReport.save();
    res.json({ success: true, message: "Report saved successfully" });
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ success: false, message: "Error saving report" });
  }
});


// Get all reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find({});
        const reportsWithImages = reports.map(report => {
            if (report.image && report.image.data) {
                const base64 = report.image.data.toString('base64');
                return {
                    ...report.toObject(),
                    image: `data:${report.image.contentType};base64,${base64}`
                };
            }
            return report.toObject();
        });
        res.json(reportsWithImages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Delete one report (Admin only)
app.delete("/api/reports/:id", async (req, res) => {
    const { admin } = req.query;
    if (admin !== "true") {
        return res.status(403).json({ message: "Unauthorized" });
    }
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.json({ message: "Report deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting report" });
    }
});

// Delete all reports (Admin only)
app.delete('/api/reports', async (req, res) => {
    try {
        const { password } = req.query;
        if (password !== '12341234') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await Report.deleteMany({});
        res.json({ message: 'All reports deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reports' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
