import fs from 'fs';
import {FinalOutput} from '../../application/types.js';
import {jsonUtils} from '../../infra/utils/JsonUtils.js';
import log from '../../infra/utils/Logger.js';

export class ConversationHistory {
    private history: string = '';

    constructor(private logFilePath: string = './conversation.log') {
    }

    getHistory(): string {
        return this.history;
    }

    updateHistory(userPrompt: string, output: FinalOutput): void {
        const logSummaries = output.agent_chain_log
            .map(log => `[${log.agent_name} 요약]: ${log.summation}`)
            .join('\n');

        this.history += `\n\nuser: ${userPrompt}\nassistant: ${logSummaries}\n[최종 답변 요약]: ${output.final_answer_summary}`;

        try {
            fs.appendFileSync(this.logFilePath,
                jsonUtils.stringify({
                    timestamp: new Date().toISOString(),
                    userInput: userPrompt,
                    output
                }, '대화 내용 저장') + '\n'
            );

            log.debug('대화 내용 저장 완료', 'SYSTEM', {
                historyLength: this.history.length
            });
        } catch (error) {
            log.error('대화 내용 저장 실패', 'SYSTEM', {error});
        }
    }
}
