import * as vscode from 'vscode';
import { logger } from '../logger/logger';
import { Constants } from '../util/constants';
import { Global } from '../util/util';
import axios from 'axios';
import { ChatMetadataStore } from './chatMetadata';
import { v4 as uuid } from "uuid";
import crypto from 'crypto';
import { ChatResultFeedbackKind } from 'vscode';


export default class ParticipantController {
  _participant?: vscode.ChatParticipant;
  _chatMetadataStore: ChatMetadataStore;
  private static ASSISTANT_URL_DOMAIN = "https://iq-fastapi.staging.cbdevx.com";


  constructor() {
    this._chatMetadataStore = new ChatMetadataStore();
  }


  createParticipant(context: vscode.ExtensionContext): vscode.ChatParticipant {
    this._participant = vscode.chat.createChatParticipant(
      Constants.CHAT_PARTICIPANT_ID,
      this.chatHandler.bind(this)
    );
    this._participant.iconPath = {
      light: vscode.Uri.joinPath(context.extensionUri, 'images', 'couchbase.png'),
      dark: vscode.Uri.joinPath(context.extensionUri, 'images', 'couchbase.png')
    };
    logger.info('Chat participant created');
    this._participant.onDidReceiveFeedback(this.handleFeedback.bind(this));
    return this._participant;
  }

  getParticipant(): vscode.ChatParticipant | undefined {
    return this._participant;
  }


  async chatHandler(
    ...args: [
      vscode.ChatRequest,
      vscode.ChatContext,
      vscode.ChatResponseStream,
      vscode.CancellationToken
    ]
  ): Promise<any> {
    const [request, , stream] = args;
    try {
      const hasBeenShownWelcomeMessageAlready = !!Global.state.get(
        Constants.COPILOT_HAS_BEEN_SHOWN_WELCOME_MESSAGE
      );

      const ensureTermsAccepted = async (): Promise<boolean> => {
        if (!hasBeenShownWelcomeMessageAlready) {
          const selection = await vscode.window.showInformationMessage(
            vscode.l10n.t('Welcome to Couchbase Participant! To use this feature, you must accept our terms and conditions.'),
            { modal: true },
            vscode.l10n.t('Accept & Continue'),
            vscode.l10n.t('View Terms'),
            // vscode.l10n.t('Cancel')
          );
          if (selection === vscode.l10n.t('Accept & Continue')) {
            await Global.state?.update(Constants.COPILOT_HAS_BEEN_SHOWN_WELCOME_MESSAGE, true);
            stream.markdown(
              vscode.l10n.t(`Welcome to Couchbase Participant!\n\n
  Interact with your Couchbase clusters and ask questions related to Couchbase , available today in the Couchbase extension.\n\n`)
            );
            return true;
          }
          else if (selection === vscode.l10n.t('View Terms')) {
            vscode.env.openExternal(vscode.Uri.parse('https://www.couchbase.com/privacy-policy/'));
            vscode.env.openExternal(vscode.Uri.parse('https://www.couchbase.com/terms-of-use/'));

            return await ensureTermsAccepted();
          }

          else {
            await vscode.window.showInformationMessage(
              vscode.l10n.t('You must accept the terms to use Couchbase Participant features.')
            );
            return false;
          }


        }
        return true;
      };

      // Await the user's acceptance before proceeding
      const termsAccepted = await ensureTermsAccepted();
      if (!termsAccepted) {
        return;
      }

      switch (request.command) {
        case 'query':
        // TODO: Handle query request: By adding query promt template
        // return await this.handleQueryRequest(...args);
        case 'docs':
          return await this.handleDocsRequest(...args);
        default:
          return await this.handleDocsRequest(...args);
      }
    } catch (error) {
      throw error;
    }
  }

  async handleDocsRequest(
    ...args: [
      vscode.ChatRequest,
      vscode.ChatContext,
      vscode.ChatResponseStream,
      vscode.CancellationToken
    ]
  ): Promise<any> {
    const [request, context, stream, token] = args;
    const chatId = ChatMetadataStore.getChatIdFromHistoryOrNewChatId(
      context.history
    );
    let docsResult: {
      content?: string;
      docsChatbotMessageId?: string;
    } = {};
    try {

      docsResult = await this._handleDocsRequestWithChatbot({
        request,
        chatId,
        stream,
      });

      if (docsResult.content) {
        stream.markdown(docsResult.content);
      }
    } catch (error) {
      logger.error('Error handling docs request');
      throw error;
    }

    return ChatMetadataStore.docsRequestChatResult({
      chatId,
      docsChatbotMessageId: docsResult.docsChatbotMessageId
    });
  }



  async _handleDocsRequestWithChatbot({
    request,
    chatId,
    stream,
  }: {
    request: vscode.ChatRequest;
    chatId: string;
    stream: vscode.ChatResponseStream;
  }): Promise<
    any
  > {
    const prompt = request.prompt;
    stream.push(
      new vscode.ChatResponseProgressPart('Fetching from Couchbase documentation..')
    );
    let { docsChatbotConversationId } =
      this._chatMetadataStore.getChatMetadata(chatId) ?? {};

    if (!docsChatbotConversationId) {
      docsChatbotConversationId = uuid();
      this._chatMetadataStore.setChatMetadata(chatId, {
        docsChatbotConversationId,
      });
      logger.info('Docs chatbot created for chatId');
    }
    let result: any = {
      content: "",
      error: undefined,
      status: "",
      threadId: "",
      runId: "",
      tool_args: null
    };
    const hashedMachineId = crypto.createHash('sha256').update(vscode.env.machineId).digest('hex');
    const messageBody = JSON.stringify({
      "data": {
        messages: prompt,
        rag_config : {
          "version_profile":"latest",
          "document_source":"documentation"
      },
        thread_id: chatId,
        run_id: "vscode_copilot_run_" + uuid(),
        user_id: hashedMachineId
      }
    });
    const content = await axios.post(
      `${ParticipantController.ASSISTANT_URL_DOMAIN}/docs/rag_chat`,
      messageBody,
      {
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
        },
      }
    );
    if (content.data) {
      result.content = content.data.content || "";
      result.threadId = content.data.thread_id || "";
      result.runId = content.data.run_id || "";
      result.tool_args = content.data.tool_args || null;
      result.status = content.status.toString();
      this._chatMetadataStore.setChatMetadata(chatId, {
        docsChatbotConversationId: chatId,
        lastRunId: result.runId
      });
      return result;
    }
    return undefined;
  }

  async handleFeedback(
    review: vscode.ChatResultFeedback
  ): Promise<void> {
    try {
      const chatId = review.result.metadata?.chatId;
      const metadata = this._chatMetadataStore.getChatMetadata(chatId);
      const hashedMachineId = crypto.createHash('sha256').update(vscode.env.machineId).digest('hex');
      const unhelpfulReason =
      'unhelpfulReason' in review
        ? (review.unhelpfulReason as string)
        : undefined;
      const messageBody = JSON.stringify({
        "data": {
          thread_id: metadata?.docsChatbotConversationId || chatId,
          run_id: metadata?.lastRunId,
          user_id: hashedMachineId,
          is_upvote: review.kind === ChatResultFeedbackKind.Helpful,
          feedback_text: unhelpfulReason
        }
      });
      await axios.post(
        `${ParticipantController.ASSISTANT_URL_DOMAIN}/docs/feedback`,
        messageBody,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
    } catch (error) {
      logger.error(`Error sending feedback: ${error}`);
    }
  }

}