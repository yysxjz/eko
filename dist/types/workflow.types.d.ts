import { Action, ExecutionContext, Tool } from "./action.types";
import { LLMProvider } from "./llm.types";
import { ExecutionLogger } from "@/utils/execution-logger";
import { ExportFileParam } from "./tools.types";
import { WorkflowResult } from "./eko.types";
export interface NodeOutput {
    name: string;
    description: string;
    value?: unknown;
}
export interface NodeInput {
    items: NodeOutput[];
}
export interface WorkflowNode {
    id: string;
    name: string;
    description?: string;
    dependencies: string[];
    action: Action;
    input: NodeInput;
    output: NodeOutput;
}
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    variables: Map<string, any>;
    llmProvider?: LLMProvider;
    setLogger(logger: ExecutionLogger): void;
    execute(callback?: WorkflowCallback): Promise<WorkflowResult>;
    cancel(): Promise<void>;
    addNode(node: WorkflowNode): void;
    removeNode(nodeId: string): void;
    getNode(nodeId: string): WorkflowNode;
    validateDAG(): boolean;
    getRawWorkflowJson(): string;
}
export interface WorkflowCallback {
    hooks: {
        beforeWorkflow?: (workflow: Workflow) => Promise<void>;
        beforeSubtask?: (subtask: WorkflowNode, context: ExecutionContext) => Promise<void>;
        beforeToolUse?: (tool: Tool<any, any>, context: ExecutionContext, input: any) => Promise<any>;
        afterToolUse?: (tool: Tool<any, any>, context: ExecutionContext, result: any) => Promise<any>;
        afterSubtask?: (subtask: WorkflowNode, context: ExecutionContext, result: any) => Promise<void>;
        afterWorkflow?: (workflow: Workflow, variables: Map<string, unknown>) => Promise<void>;
        onTabCreated?: (tabId: number) => Promise<void>;
        onLlmMessage?: (textContent: string) => Promise<void>;
        onLlmMessageUserSidePrompt?: (text: string, toolName: string) => Promise<void>;
        onHumanInputText?: (question: string) => Promise<string>;
        onHumanInputSingleChoice?: (question: string, choices: string[]) => Promise<string>;
        onHumanInputMultipleChoice?: (question: string, choices: string[]) => Promise<string[]>;
        onHumanOperate?: (reason: string) => Promise<string>;
        onSummaryWorkflow?: (summary: string) => Promise<void>;
        onExportFile?: (param: ExportFileParam) => Promise<void>;
    };
}
