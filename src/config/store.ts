import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducer";
import { initialState } from "./state";

const store = createStore(rootReducer, initialState, applyMiddleware(thunk));

export default store;
