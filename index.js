import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
async function connectDB() {
    try {
        // await client.connect();
        const db = client.db("DevScout");
        const developersCollection = db.collection("developers");
        app.post("/developers", async (req, res) => {
            const developerData = req.body;
            const result = await developersCollection.insertOne(developerData);
            res.send(result);
        });
        app.get("/developers", async (req, res) => {
            const result = await developersCollection.find().toArray();
            res.send(result);
        });
        app.get("/developers/:id", async (req, res) => {
            const id = req.params.id;
            const result = await developersCollection.findOne({
                _id: new ObjectId(id),
            });
            res.send(result);
        });
        app.delete("/developers/:id", async (req, res) => {
            const id = req.params.id;
            const result = await developersCollection.deleteOne({
                _id: new ObjectId(id),
            });
            if (result.deletedCount === 0) {
                return res.status(404).send({
                    message: "Developer not found",
                });
            }
            res.send({
                success: true,
                message: "Developer deleted successfully",
            });
        });
        console.log("MongoDB Connected");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}
connectDB();
app.get("/", (_req, res) => {
    res.send("Hello DevScout Backend");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map