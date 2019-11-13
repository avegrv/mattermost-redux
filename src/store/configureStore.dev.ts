// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-undefined */
import reducerRegistry from './reducer_registry';
import devTools from 'remote-redux-devtools';

const windowAny = window as any;

const devToolsEnhancer = typeof windowAny !== 'undefined' && windowAny.__REDUX_DEVTOOLS_EXTENSION__ ? // eslint-disable-line no-underscore-dangle
    windowAny.__REDUX_DEVTOOLS_EXTENSION__ : // eslint-disable-line no-underscore-dangle
    () => {
        return devTools({
            name: 'Mattermost',
            hostname: 'localhost',
            port: 5678,
            realtime: true,
        });
    };
import serviceReducer from '../reducers';
import deepFreezeAndThrowOnMutation from 'utils/deep_freeze';
import initialState from './initial_state';
import {createReducer} from './helpers';
import {createMiddleware} from './middleware';
import {Reducer, Action} from 'types/actions';
import {GlobalState} from 'types/store';
import {createStore, compose, applyMiddleware} from 'redux';

/**
 * Configures and constructs the redux store. Accepts the following parameters:
 * preloadedState - Any preloaded state to be applied to the store after it is initially configured.
 * appReducer - An object containing any app-specific reducer functions that the client needs.
 * getAppReducer - A function that returns the appReducer as defined above. Only used in development to enable hot reloading.
 * clientOptions - An object containing additional options used when configuring the redux store. The following options are available:
 *     additionalMiddleware - func | array - Allows for single or multiple additional middleware functions to be passed in from the client side.
 *     enableBuffer - bool - default = true - If true, the store will buffer all actions until offline state rehydration occurs.
 *     enableThunk - bool - default = true - If true, include the thunk middleware automatically. If false, thunk must be provided as part of additionalMiddleware.
 */
export default function configureServiceStore(preloadedState: any, appReducer: any, getAppReducer: any, clientOptions: any) {
    const baseState = Object.assign({}, initialState, preloadedState);
    const loadReduxDevtools = process.env.NODE_ENV !== 'test'; //eslint-disable-line no-process-env

    const middlewares = createMiddleware(clientOptions);
    const store = createStore(
        createReducer(baseState, serviceReducer as any, appReducer),
        baseState,
        applyMiddleware(...middlewares, ...(loadReduxDevtools ? [devToolsEnhancer()] : []))
    );

    if ((module as any).hot) {
        // Enable Webpack hot module replacement for reducers
        (module as any).hot.accept(() => {
            const nextServiceReducer = require('../reducers').default; // eslint-disable-line global-require
            let nextAppReducer;
            if (getAppReducer) {
                nextAppReducer = getAppReducer(); // eslint-disable-line global-require
            }
            store.replaceReducer(createDevReducer(baseState, reducerRegistry.getReducers(), nextServiceReducer, nextAppReducer));
        });
    }

    return store;
}

function createDevReducer(baseState: any, ...reducers: any) {
    return enableFreezing(createReducer(baseState, ...reducers));
}

function enableFreezing(reducer: Reducer) {
    return (state: GlobalState, action: Action) => {
        const nextState = reducer(state, action);

        if (nextState !== state) {
            deepFreezeAndThrowOnMutation(nextState);
        }

        return nextState;
    };
}
