import { useDispatch, useSelector } from "react-redux";
import { updateInput } from "./inputSlice";
import "./Input.scss";
// eslint-disable-next-line
import M from "materialize-css";

const Input = () => {
	// eslint-disable-next-line no-unused-vars
	const input = useSelector((state) => state.input.value);
	// eslint-disable-next-line no-unused-vars
	const keywords = useSelector((state) => state.input.keywords);
	const dispatch = useDispatch();

	return (
		<div className="inputContainer">
			<div className="row">
				<div className="col l12 m12 s12">
					<div className="input-field">
						<input
							id="search"
							type="text"
							onInput={(event) =>
								dispatch(
									updateInput({ value: event.target.value })
								)
							}
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
