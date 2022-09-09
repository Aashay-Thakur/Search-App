import { useSelector } from "react-redux";
import "./Ad.scss";

const Ad = () => {
	const ads = useSelector((state) => state.ads.ads);

	return (
		<div>
			{ads.map((ad) => {
				return (
					<div className="col s12 m6 l4" key={ad._id}>
						<div className="card sticky-action">
							<div className="card-image waves-effect waves-block waves-light">
								<img
									className="activator"
									src={ad.imageUrl}
									alt=""
									onError={(e) => {
										e.preventDefault();
										e.target.onError = null;
										e.target.src =
											"https://via.placeholder.com/600x400";
									}}
								/>
							</div>
							<div className="card-content">
								<span className="card-title activator grey-text text-darken-4">
									<i className="material-icons right">
										more_vert
									</i>
									{ad.heading}
								</span>
								<hr />
								<p className="description">{ad.description}</p>
								<div className="card-action">
									<p>
										<a
											href={ad.link}
											target="_blank"
											rel="noreferrer">
											{ad.CTA}
										</a>
									</p>
								</div>
							</div>
							<div className="card-reveal">
								<span className="card-title grey-text text-darken-4">
									<i className="material-icons right">
										close
									</i>
									{ad.heading}
								</span>
								<hr />
								<p className="reveal-text">{ad.primaryText}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Ad;
