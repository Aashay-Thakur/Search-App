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

/**
 ** Although the below method is not the most efficient,
 ** It was the only way I could think of to search for keywords in both the company and ads collections.
 ** Since Mongo 6.0, the $search operator can nest in $lookup, that would be a more easier way to do this.
 */

const db = client.db("adverts");

/**
 * This function is used to merge the company and ads collections into one collection: search coll.
 * Mongodb explains this in their documentation as on-demand materialized view: https://www.mongodb.com/docs/manual/core/materialized-views/
 * Once merged, we can use the search index "keywords" created on Atlas to look for keywords in specific fields.
 */
async function merge() {
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
				// replace so that it doens't repeat the same ads
				whenMatched: "replace",
				whenNotMatched: "insert",
			},
		},
	]);

	console.log("Merged");
}

app.get("/search", async function (req, res) {
	const query = req.query.q;

	if (query !== "") {
		try {
			// collections can be merged here, but since this runs on every request.
			// It would be better to make a seperate trigger to call the merge function.
			//? await merge();

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
								fuzzy: {
									// typo threshold
									maxEdits: 2,
								},
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
		// better to merge it once on startup, than on every request.
		await merge();
	} catch (err) {
		console.error(err);
	}
});
