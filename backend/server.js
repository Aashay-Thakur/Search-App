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
	const query = req.query.qs;

	/**
	 * Although the below method is not the most efficient,
	 * It was the only way I could think of to search for keywords in both the company and ads collections.
	 * Since Mongo 6.0, the $search operator can nest in $lookup, that would be a more easier way to do this.
	 */

	if (query !== "") {
		try {
			// Search company collection for typed query
			// Get their ids if hit
			const company = await db
				.collection("companies")
				.aggregate([
					{
						$search: {
							text: {
								query: query,
								path: "name",
							},
						},
					},
					{
						$project: {
							_id: 1,
						},
					},
				])
				.toArray();
			// Make an array of ids
			// (company ids, which are primary key for company collection and foreign key for ads collection)
			const companyIds = company.map((item) => item._id);
			// get the corresponing ads from ads collection
			const adsByCompany = await db
				.collection("ads")
				.find({ companyId: { $in: companyIds } })
				.project({ _id: 1 })
				.toArray();
			// Make an array of ids (ads ids, which are primary key for ads collection)
			// This array of ids if result from searching for the company name
			const adsByCompanyIds = adsByCompany.map((item) => item._id);

			// Search ads collection for typed query
			const ads = await db
				.collection("ads")
				.aggregate([
					{
						$search: {
							index: "keywords",
							text: {
								query: query,
								path: ["heading", "primaryText", "description"],
							},
						},
					},
					{
						$project: {
							_id: 1,
						},
					},
				])
				.toArray();
			// This array of ids if result from searching for the keywords
			// (heading, primaryText, description)
			const adsIds = ads.map((item) => item._id);

			// Combine the two arrays of ids
			// Union, so there are no duplicates
			// This is the final array of ids, from searching for both company name and keywords
			const resultIds = [...new Set([...adsByCompanyIds, ...adsIds])];

			// Get the ads from the final array of ids
			const result = await db
				.collection("ads")
				.aggregate([
					{
						$match: {
							_id: {
								$in: resultIds,
							},
						},
					},
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
