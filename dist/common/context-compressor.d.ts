import { LLMParameters, LLMProvider, Message } from '@/types';
export declare abstract class ContextCompressor {
    abstract compress(messages: Message[]): Promise<Message[]>;
}
export declare class NoCompress extends ContextCompressor {
    compress(messages: Message[]): Promise<Message[]>;
}
export declare class SimpleQACompress extends ContextCompressor {
    compress(messages: Message[]): Promise<Message[]>;
}
export declare class SummaryCompress extends ContextCompressor {
    private params_copy;
    private llmProvider;
    private SystemMessage;
    private HistoryMessage;
    constructor(llmProvider: LLMProvider, params_copy: LLMParameters);
    compress(messages: Message[]): Promise<Message[]>;
}
