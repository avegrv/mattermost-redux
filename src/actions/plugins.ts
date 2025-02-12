// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'client';
import {bindClientFunc} from './helpers';

import {PluginTypes} from 'action_types';

import {ActionFunc} from 'types/actions';

export type MarketplacePluginFilter = {
    Page: number;
    PerPage: number;
    Filter: string;
    ServerVersion: string;
}

export function getMarketplacePlugins(filter: MarketplacePluginFilter): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getMarketplacePlugins,
        onSuccess: PluginTypes.RECEIVED_MARKETPLACE_PLUGINS,
        onFailure: PluginTypes.GET_MARKETPLACE_PLUGINS_FAILURE,
        params: [
            filter,
        ],
    });
}

