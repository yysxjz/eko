import {
    CloseTabInfo,
    TabInfo,
    TabManagementParam,
    TabManagementResult,
} from '../../types/tools.types';
import {Tool, InputSchema, ExecutionContext} from '../../types/action.types';
import {
    executeScript,
    getTabId,
    getWindowId,
    open_new_tab,
    sleep,
    waitForTabComplete,
} from '../utils';

/**
 * Browser tab management
 */
export class TabManagement implements Tool<TabManagementParam, TabManagementResult> {
    name: string;
    description: string;
    input_schema: InputSchema;

    constructor() {
        this.name = 'tab_management';
        this.description = 'Browser tab management, view and operate tabs.You can use this tool to' +
            'View all tabs with the tabId and title.Get current tab information (tabId, url, title).' +
            'Go back to the previous page in the current tab. And Close the current tab.';
        this.input_schema = {
            type: 'object',
            properties: {
                command: {
                    type: 'string',
                    description: `The command to perform. The available commands are:
* \`tab_all\`: View all tabs and return the tabId and title.
* \`current_tab\`: Get current tab information (tabId, url, title).
* \`go_back\`: Go back to the previous page in the current tab.
* \`close_tab\`: Close the current tab.`,
                    enum: ['tab_all', 'current_tab', 'go_back', 'close_tab'],
                },
            },
            required: ['command'],
        };
    }

    /**
     * Tab management
     *
     * @param {*} params { command: `new_tab [url]` | 'tab_all' | 'current_tab' | 'go_back' | 'close_tab' | 'switch_tab [tabId]'  }
     * @returns > { result, success: true }
     */
    async execute(
        context: ExecutionContext,
        params: TabManagementParam
    ): Promise<TabManagementResult> {
        if (params === null || !params.command) {
            throw new Error('Invalid parameters. Expected an object with a "command" property.');
        }
        let windowId = await getWindowId(context);
        let command = params.command.trim();
        if (command.startsWith('`')) {
            command = command.substring(1);
        }
        if (command.endsWith('`')) {
            command = command.substring(0, command.length - 1);
        }
        let result: TabManagementResult;
        if (command == 'tab_all') {
            result = [];
            let tabs = await context.ekoConfig.chromeProxy.tabs.query({windowId: windowId});
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i];
                let tabInfo: TabInfo = {
                    tabId: tab.id,
                    windowId: tab.windowId,
                    title: tab.title,
                    url: tab.url,
                };
                if (tab.active) {
                    tabInfo.active = true;
                }
                result.push(tabInfo);
            }
        } else if (command == 'current_tab') {
            let tabId = await getTabId(context);
            let tab = await context.ekoConfig.chromeProxy.tabs.get(tabId);
            let tabInfo: TabInfo = {tabId, windowId: tab.windowId, title: tab.title, url: tab.url};
            result = tabInfo;
        } else if (command == 'go_back') {
            let tabId = await getTabId(context);
            await context.ekoConfig.chromeProxy.tabs.goBack(tabId);
            let tab = await context.ekoConfig.chromeProxy.tabs.get(tabId);
            let tabInfo: TabInfo = {tabId, windowId: tab.windowId, title: tab.title, url: tab.url};
            result = tabInfo;
        } else if (command == 'close_tab') {
            let closedTabId = await getTabId(context);
            await context.ekoConfig.chromeProxy.tabs.remove(closedTabId);
            await sleep(100);
            let tabs = await context.ekoConfig.chromeProxy.tabs.query({active: true, currentWindow: true});
            if (tabs.length == 0) {
                tabs = await context.ekoConfig.chromeProxy.tabs.query({status: 'complete', currentWindow: true});
            }
            let tab = tabs[tabs.length - 1];
            if (!tab.active) {
                await context.ekoConfig.chromeProxy.tabs.update(tab.id as number, {active: true});
            }
            let newTabId = tab.id;
            context.variables.set('tabId', tab.id);
            context.variables.set('windowId', tab.windowId);
            let closeTabInfo: CloseTabInfo = {closedTabId, newTabId, newTabTitle: tab.title};
            result = closeTabInfo;
        } else {
            throw Error('Unknown command: ' + command);
        }
        return result;
    }

    destroy(context: ExecutionContext): void {
        let windowIds = context.variables.get('windowIds') as Array<number>;
        if (windowIds) {
            for (let i = 0; i < windowIds.length; i++) {
                context.ekoConfig.chromeProxy.windows.remove(windowIds[i]);
            }
        }
    }
}
