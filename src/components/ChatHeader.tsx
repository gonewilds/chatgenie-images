
import { Button } from "@/components/ui/button";
import { Settings } from "@/components/Settings";
import { MessageSquare, Settings as SettingsIcon } from "lucide-react";

interface ChatHeaderProps {
  onOpenSettings: () => void;
}

const ChatHeader = ({ onOpenSettings }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">ChatGenie</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        aria-label="Settings"
      >
        <SettingsIcon className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default ChatHeader;
