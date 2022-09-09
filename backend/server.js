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
	// query is an array of keywords
	const query = req.query.q;
	collection = client.db("adverts").collection("ads");

	//* Returns all the ads if user types in all
	// if (query.toLowerCase() === "all") return res.json(await collection.find({}).toArray());

	if (query !== "") {
		try {
			// mongodb has its own search functions
			let result = await collection
				.aggregate([
					{
						$search: {
							// This is not inbuilt, it is a custom text index
							// It needs to be created before, in Atlas
							index: "keywords",
							text: {
								query: query,
								path: ["description", "primaryText", "heading"],
								// threshold for typos
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

// This function gets links for the companies from the companies table
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
