"use client";

import { useEffect, useState } from "react";
import { HistoryIcon, Loader2, PlusIcon } from "lucide-react";
import { MultimodalInput } from "@/components/assistant-chat/multimodal-input";
import { Messages } from "./messages";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChats } from "@/hooks/useChats";
import { LoadingContent } from "@/components/LoadingContent";
import { ExamplesDialog } from "@/components/assistant-chat/examples-dialog";
import { Tooltip } from "@/components/Tooltip";
import { type Chat as ChatType, useChat } from "@/providers/ChatProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";

const MAX_MESSAGES = 20;

export function Chat() {
  const { chatId, chat, input, setInput, handleSubmit, setNewChat } = useChat();

  useEffect(() => {
    if (!chatId) {
      setNewChat();
    }
  }, [chatId, setNewChat]);

  return (
    <ChatUI
      chat={chat}
      input={input}
      setInput={setInput}
      handleSubmit={handleSubmit}
    />
  );

  // return tab ? (
  //   <ResizablePanelGroup
  //     direction={isMobile ? "vertical" : "horizontal"}
  //     className="flex-grow"
  //   >
  //     <ResizablePanel defaultSize={65}>
  //       <AssistantTabs />
  //     </ResizablePanel>
  //     <ResizableHandle withHandle />
  //     <ResizablePanel className="overflow-y-auto" defaultSize={35}>
  //       {chatPanel}
  //     </ResizablePanel>
  //   </ResizablePanelGroup>
  // ) : (
  //   chatPanel
  // );
}

function ChatUI({
  chat: { messages, setMessages, status, stop, regenerate },
  input,
  setInput,
  handleSubmit,
}: {
  chat: ChatType;
  input: string;
  setInput: (input: string) => void;
  handleSubmit: () => void;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      <div className="flex items-center justify-between px-2 pt-2">
        <div>
          <SidebarTrigger name="chat-sidebar" />
          {messages.length > MAX_MESSAGES ? (
            <div className="rounded-md border border-red-200 bg-red-100 p-2 text-sm text-red-800">
              The chat is too long. Please start a new conversation.
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <NewChatButton />
          <ExamplesDialog setInput={setInput} />
          <ChatHistoryDropdown />
          {/* <OpenArtifactButton /> */}
        </div>
      </div>

      <Messages
        status={status}
        messages={messages}
        setMessages={setMessages}
        setInput={setInput}
        regenerate={regenerate}
        isArtifactVisible={false}
      />

      <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
        <MultimodalInput
          // chatId={chatId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          // attachments={attachments}
          // setAttachments={setAttachments}
          // messages={messages}
          setMessages={setMessages}
          // append={append}
        />
      </form>
    </div>
  );
}

function NewChatButton() {
  const { setNewChat } = useChat();

  return (
    <Tooltip content="Start a new conversation">
      <Button variant="ghost" size="icon" onClick={setNewChat}>
        <PlusIcon className="size-5" />
        <span className="sr-only">New Chat</span>
      </Button>
    </Tooltip>
  );
}

// function OpenArtifactButton() {
//   const [tab, setTab] = useQueryState("tab");

//   if (tab) return null;

//   const handleOpenArtifact = () => setTab("rules");

//   return (
//     <Tooltip content="Open side panel">
//       <Button variant="ghost" size="icon" onClick={handleOpenArtifact}>
//         <ArrowLeftToLineIcon className="size-5" />
//         <span className="sr-only">Open side panel</span>
//       </Button>
//     </Tooltip>
//   );
// }

function ChatHistoryDropdown() {
  const { setChatId } = useChat();
  const [shouldLoadChats, setShouldLoadChats] = useState(false);
  const { data, error, isLoading, mutate } = useChats(shouldLoadChats);

  return (
    <DropdownMenu>
      <Tooltip content="View previous conversations">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onMouseEnter={() => setShouldLoadChats(true)}
            onClick={() => mutate()}
          >
            <HistoryIcon className="size-5" />
            <span className="sr-only">Chat History</span>
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <LoadingContent
          loading={isLoading}
          error={error}
          loadingComponent={
            <DropdownMenuItem
              disabled
              className="flex items-center justify-center"
            >
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading chats...
            </DropdownMenuItem>
          }
          errorComponent={
            <DropdownMenuItem disabled>Error loading chats</DropdownMenuItem>
          }
        >
          {data && data.chats.length > 0 ? (
            data.chats.map((chatItem) => (
              <DropdownMenuItem
                key={chatItem.id}
                onSelect={() => {
                  setChatId(chatItem.id);
                }}
              >
                {`Chat from ${new Date(chatItem.createdAt).toLocaleString()}`}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              No previous chats found
            </DropdownMenuItem>
          )}
        </LoadingContent>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
