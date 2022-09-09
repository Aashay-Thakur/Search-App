import { useDispatch } from "react-redux";
import { updateInput } from "./inputSlice";
// eslint-disable-next-line
import M from "materialize-css";
import "./Input.scss";

const Input = () => {
	const dispatch = useDispatch();
	const debounceTimer = 500;

	return (
		<div className="inputContainer">
			<div className="row">
				<div className="col l12 m12 s12">
					<div className="input-field">
						<input
							id="search"
							type="text"
							onInput={(event) => {
								// Debouncing the input
								// Too many dispatches and too many requests to the server
								setTimeout(() => {
									dispatch(
										updateInput({
											value: event.target.value,
										})
									);
								}, debounceTimer);
							}}
							autoComplete="off"
						/>
						<label htmlFor="search">Search</label>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Input;
