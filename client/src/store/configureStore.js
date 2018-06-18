import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import rootReducer from '../reducers';


const getMiddleware = () => {
  const logger = createLogger();

  const middleware =
    process.env.NODE_ENV !== 'production'
    && process.env.NODE_ENV !== 'test'
      ? applyMiddleware(thunk, logger)
      : applyMiddleware(thunk);

  return middleware;
};

const configureStore = initialState => (
  createStore(
    rootReducer,
    initialState,
    compose(
      getMiddleware(),
      window.devToolsExtension ? window.devToolsExtension() : empty => empty,
    ),
  )
);

export default configureStore;
