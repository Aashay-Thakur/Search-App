const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 9000;
const URI = process.env.URI;
const client = new MongoClient(URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

var collection;

app.get("/search", async function (req, res) {
	const query = req.query.q;
	collection = client.db("adverts").collection("ads");
	if (query.toLowerCase() === "all")
		return res.json(await collection.find({}).toArray());
	if (query !== "") {
		try {
			let result = await collection
				.aggregate([
					{
						$search: {
							index: "keywords",
							text: {
								query: query,
								path: ["description", "primaryText", "heading"],
								fuzzy: {
									maxEdits: 1,
								},
							},
						},
					},
				])
				.toArray();
			const sendArray = await getLink(result);
			res.send(sendArray);
		} catch (e) {
			res.status(500).send({ message: e.message });
		}
	}
});

async function getLink(result) {
	try {
		collection = client.db("adverts").collection("companies");
		for (let i = 0; i < result.length; i++) {
			const company = await collection.findOne({
				_id: result[i].companyId,
			});
			result[i].link = company.url;
		}
		return result;
	} catch (e) {
		console.error(e);
	}
}

app.listen(PORT, async function () {
	console.log(`Server is running on port ${PORT}`);
	try {
		await client.connect();
		console.log("Connected to database");
	} catch (err) {
		console.error(err);
	}
});
