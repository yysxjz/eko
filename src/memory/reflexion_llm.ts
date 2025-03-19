import {LLMProvider, Message} from '@/types';
import { IndexDBStore } from '@/memory/retriever';
import { OpenaiProvider } from '@/services/llm/openai-provider';

export class ReflexionLLM {
  private store: IndexDBStore;
  private client: LLMProvider;
  private historyMes:string



  constructor(param: OpenaiProvider) {
    this.client = param;
    this.store = new IndexDBStore(param.apikey);
    this.historyMes = "";
  }

  private buildInputMessages(messages: Awaited<Message[]>[]): Message[] {
      console.log("debug,the input messages is....")
      for(const message of messages){
          message.shift()
          for(const mes of message){
            if(JSON.stringify(mes).includes("base64")){
                continue;
            }
            this.historyMes += JSON.stringify(mes)
          }
      }
      console.log(this.historyMes)
    return [
      {
        role: 'system',
        content:
          "You are a helpful AI assistant. You need to summarize the system's execution steps from the " +
          'historical messages in JSON format. The output example is as follows:\n' +
          '\n' +
          '## Example:\n' +
          'Task: Find books related to computer science on Library Genesis and download them to the device.\n' +
          'Process/Steps:\n' +
          '1. **Open the website**: Visit the official Library Genesis website.  \n' +
          '2. **Search for books**: Locate the search box, type in "computer science" and search.  \n' +
          '3. **Select a book**: Understand the search results and choose the first result.  \n' +
          '4. **Redirect to mirror**: Click on the "mirror" option to be redirected to the mirror page.  \n' +
          '5. **Start downloading**: Click the "GET" button to initiate the download.  \n' +
          '6. **Complete the task**: Confirm that the download is complete.\n' +
          '\n' +
          'Note that the content of the above output is unrelated to the historical records you will process. ' +
          'You only need to refer to the format and granularity. Besides the steps returned, ' +
          'you do not need to output any other content.',
      },
      {
        role: 'user',
        content: `Here is the historical messages+${this.historyMes}`,
      },
    ];
  }

  public async init(){
      await this.store.testInit();
  }

  public async setReflexion(
    messages: Awaited<Message[]>[],
    task: string | undefined
  ): Promise<void> {
    const input = this.buildInputMessages(messages);
    console.log("debug,the reflexion input is....")
    console.log(input);
    const output = await this.client.generateText(input, {
      model: 'gpt-4o',
      temperature: 0,
    });

    console.log("debug,the reflexion output is....")
      console.log(output);
    if (typeof output.textContent === 'string'&&typeof task ==="string") {
      await this.store.putSteps(output.textContent, task);
    } else {
      console.log('error to get reflexion text');
    }
  }

  public async getReflexion(
    task: string | undefined
  ): Promise<string | undefined> {
    if (typeof task === 'string') {
      const reflexion = await this.store.getSteps(task);
      if (reflexion) {
        return reflexion.steps;
      }
    }
    return undefined;
  }
}
