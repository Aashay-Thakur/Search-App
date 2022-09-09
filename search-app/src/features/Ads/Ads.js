import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAds } from "./adsSlice";
import axios from "axios";
import Ad from "../Ad/Ad";

const Ads = () => {
	const keywords = useSelector((state) => state.input.keywords);
	const dispatch = useDispatch();

	useEffect(() => {
		async function getData() {
			try {
				if (keywords !== [] || keywords[0] !== undefined) {
					const result = await axios({
						method: "get",
						url: "http://localhost:9000/search",
						params: {
							q: keywords.join(" "),
						},
					});
					dispatch(updateAds({ ads: result.data }));
				}
			} catch (e) {
				console.error(e);
			}
		}
		getData();
	}, [dispatch, keywords]);

	return (
		<div className="adsContainer">
			<div className="row l12 m12 s12">
				<Ad />
			</div>
		</div>
	);
};

export default Ads;
