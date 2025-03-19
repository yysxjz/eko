import {VectorStorage} from "vector-storage";


export class MemoryChunk{
    task:string;
    steps?:string;
    fact?:string;
    type : "steps" | "fact";

    constructor(task: string, type: "steps" | "fact",steps?: string, fact?: string) {
        this.task = task;
        this.steps = steps;
        this.fact = fact;
        this.type = type;
    }

}

export class IndexDBStore {
    private vectorStore: VectorStorage<any>;

    constructor(openAIApiKey:string) {
        this.vectorStore = new VectorStorage({
            openAIApiKey: openAIApiKey,
            maxSizeInMB: 2, // 设置最大存储大小为 2MB
            debounceTime: 500, // 设置保存到 IndexedDB 的防抖时间为 500ms
        });
    }

    async getSteps(task:string): Promise<MemoryChunk> {
        const results = await this.vectorStore.similaritySearch({
            query: task,
            k:1,
            filterOptions:{
                include:{
                    metadata:{
                        type:"steps",
                    }
                }
            }
        });
        const  doc = results.similarItems[0]

        return {
            task:doc.metadata.task,
            steps:doc.text,
            type:"steps",
        };
    }


    async getFact(task:string): Promise<MemoryChunk> {
        const results = await this.vectorStore.similaritySearch({
            query: task,
            k:1,
            filterOptions:{
                include:{
                    metadata:{
                        type:"fact",
                    }
                }
            }
        });
        const  doc = results.similarItems[0]

        return {
            task:doc.metadata.task,
            steps:doc.text,
            type:"fact",
        };
    }

    async putSteps(steps:string,task:string): Promise<void> {
        steps = `task:${task}----steps:${steps}`
        await this.vectorStore.addText(steps,{
            type:"steps",
            task: task
        });
    }

    async putFact(fact:string,task:string): Promise<void> {
        fact = `task:${task}----fact:${fact}`
        await this.vectorStore.addText(fact,{
            type:"fact",
            task: task
        });
    }


    async testInit():Promise<MemoryChunk> {

        await this.putSteps("## Example：\n" +
            "任务：在Library Genesis查找生物学相关的书籍，下载到设备上。\n" +
            "流程/步骤：\n" +
            "1. **打开网站**：访问 Library Genesis 官网。  \n" +
            "2. **搜索书籍**：定位搜索框，输入“生物科学”并搜索。  \n" +
            "3. **选择书籍**：理解搜索结果，选择第一个结果。  \n" +
            "4. **跳转镜像**：点击“mirror”选项，跳转到镜像页\n" +
            "5. **开始下载**：点击“GET”按钮，启动下载。  \n" +
            "6. **完成任务**：确认下载完成。","在Library Genesis查找一本生物学相关的书籍，选择下载到设备上。")

        await this.putSteps("在填写表单时，将出发地从其他城市改为武汉，接着把目的地改为上海，" +
            "把日期填写为2025年4月1日到5月1日","在booking搜索2025年4月1日前后三十天内价格低于1000元的武汉到上海的机票")

        const re = await this.getSteps("在Library Genesis查找一本计算机相关的书籍，选择下载到设备上。")
        console.log(re)
        return re
    }


}