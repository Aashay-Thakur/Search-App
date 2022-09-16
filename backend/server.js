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

const db = client.db("adverts");

app.get("/search", async function (req, res) {
	const query = req.query.q;

	/**
	 * Although the below method is not the most efficient,
	 * It was the only way I could think of to search for keywords in both the company and ads collections.
	 * Since Mongo 6.0, the $search operator can nest in $lookup, that would be a more easier way to do this.
	 */

	if (query !== "") {
		try {
			db.collection("ads").aggregate([
				{
					$lookup: {
						from: "companies",
						localField: "companyId",
						foreignField: "_id",
						as: "company",
					},
				},
				{
					$unwind: "$company",
				},
				{
					$merge: {
						into: "search",
						on: "_id",
						whenMatched: "replace",
						whenNotMatched: "insert",
					},
				},
			]);

			const result = await db
				.collection("search")
				.aggregate([
					{
						$search: {
							index: "keywords",
							text: {
								query: query,
								path: [
									"company.name",
									"heading",
									"description",
									"primaryText",
								],
							},
						},
					},
				])
				.toArray();

			res.send(result);
		} catch (e) {
			console.log(e);
			res.status(500).send({ message: e.message });
		}
	}
});

app.listen(PORT, async function () {
	console.log(`Server is running on port ${PORT}`);
	try {
		await client.connect();
		console.log("Connected to database");
	} catch (err) {
		console.error(err);
	}
});
