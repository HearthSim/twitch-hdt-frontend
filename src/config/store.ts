import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { ActionTypes } from "./actions";
import rootReducer from "./reducer";
import { initialState, State } from "./state";

const store = createStore<State, ActionTypes, any, any>(
	rootReducer,
	initialState,
	applyMiddleware(thunk),
);

export default store;
