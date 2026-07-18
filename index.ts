import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import * as jose from "jose";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

const uri = process.env.MONGODB_URI as string;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const db = client.db("LearnTech");
const coursesCollection = db.collection("courses");

// JWT Authentication Middleware
const authenticateJWT = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).send({ message: "Unauthorized: Missing token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secretKey = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);

    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(403).send({ message: "Forbidden: Invalid or expired token" });
  }
};


app.get("/", (_req, res) => {
  res.send("Hello LearnTech Backend");
});


app.post("/courses", async (req, res) => {
  try {
    const courseData = req.body;

    const result = await coursesCollection.insertOne(courseData);

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to create course",
      error,
    });
  }
});


app.get("/courses", async (req, res) => {
  try {
    const result = await coursesCollection.find().toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch courses",
      error,
    });
  }
});


app.get("/courses/:id", async (req, res) => {
  try {
    const id = req.params.id as string;

    const result = await coursesCollection.findOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to get course",
      error,
    });
  }
});

// Delete Course
app.delete("/courses/:id", async (req, res) => {
  try {
    const id = req.params.id as string;

    const result = await coursesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "Course not found",
      });
    }

    res.send({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Delete failed",
      error,
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await client.connect();

    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
}

startServer();
