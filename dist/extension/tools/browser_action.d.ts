import { BrowserActionParam, BrowserActionResult } from '../../types/tools.types';
import { InputSchema, ExecutionContext } from '../../types/action.types';
import { ToolReturnsScreenshot } from './tool_returns_screenshot';
/**
 * Browser Use for general
 */
export declare class BrowserAction extends ToolReturnsScreenshot<BrowserActionParam> {
    name: string;
    description: string;
    input_schema: InputSchema;
    constructor();
    /**
     * browser
     *
     * @param {*} params { action: 'input_text', index: 1, text: 'string' }
     * @returns > { success: true, image?: { type: 'base64', media_type: 'image/jpeg', data: '/9j...' }, text?: string }
     */
    realExecute(context: ExecutionContext, params: BrowserActionParam): Promise<BrowserActionResult>;
    destroy(context: ExecutionContext): void;
}
