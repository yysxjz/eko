import { LLMParameters, LLMProvider, LLMResponse, LLMStreamHandler, Message } from '@/types';
import { OpenaiProvider } from '@/services/llm/openai-provider';
import { ClaudeProvider } from '@/services/llm/claude-provider';
//生成工作流的小模型
export class GeneratorLLM implements LLMProvider {
  private readonly generatorLLM: OpenaiProvider | ClaudeProvider | undefined;
  private openaiModel = 'gpt-4o-mini';
  private claudeModel = 'claude-3-5-haiku-20241022';
  constructor(llmProvider: LLMProvider) {
    if (llmProvider instanceof OpenaiProvider) {
      this.generatorLLM = new OpenaiProvider(llmProvider.getClient, this.openaiModel);
    } else if (llmProvider instanceof ClaudeProvider) {
      this.generatorLLM = new ClaudeProvider(llmProvider.getClient, this.claudeModel);
    }
  }
  async generateStream(
    messages: Message[],
    params: LLMParameters,
    handler: LLMStreamHandler
  ): Promise<void> {
    if (!this.generatorLLM) {
      throw new Error('generatorLLM not set');
    }
    await this.generatorLLM.generateStream(messages, params, handler);
  }

  async generateText(messages: Message[], params: LLMParameters): Promise<LLMResponse> {
    if (!this.generatorLLM) {
      throw new Error('generatorLLM not set');
    }
    console.log(this.generatorLLM.getDefaultModel)
    return await this.generatorLLM.generateText(messages, params);
  }
}