// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import serviceReducer from '../reducers';

import {createReducer} from './helpers';
import initialState from './initial_state';
import {createMiddleware} from './middleware';
import {createStore, applyMiddleware} from 'redux';

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
export default function configureServiceStore(preloadedState: any, appReducer: any, getAppReducer: any, clientOptions = {}) {
    const baseState = Object.assign({}, initialState, preloadedState);
    const middlewares = createMiddleware(clientOptions);
    return createStore(
        createReducer(baseState, serviceReducer as any, appReducer),
        baseState,
        applyMiddleware(...middlewares)
    );
}
