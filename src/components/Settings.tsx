
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiEndpoint, setApiEndpoint, getGenerationSettings, setGenerationSettings } from "@/lib/localStorage";
import { GenerationSettings as GenerationSettingsType } from "@/types";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Trash2 } from "lucide-react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
}

const samplers = [
  "Euler a",
  "Euler",
  "LMS",
  "Heun",
  "DPM2",
  "DPM2 a",
  "DPM++ 2S a",
  "DPM++ 2M",
  "DPM++ SDE",
  "DPM fast",
  "DPM adaptive",
  "LMS Karras",
  "DPM2 Karras",
  "DPM2 a Karras",
  "DPM++ 2S a Karras",
  "DPM++ 2M Karras",
  "DPM++ SDE Karras",
  "DDIM",
  "PLMS",
];

const schedulers = ["Automatic", "Karras", "Exponential", "Polyexponential", "DDIM Uniform"];

const Settings = ({ isOpen, onClose, onClearChat }: SettingsProps) => {
  const [apiEndpoint, setApiEndpointState] = useState("");
  const [settings, setSettings] = useState<GenerationSettingsType>({
    steps: 20,
    cfg_scale: 7,
    width: 512,
    height: 512,
    sampler_name: "Euler a",
    scheduler: "Automatic",
    negative_prompt: "",
  });

  useEffect(() => {
    if (isOpen) {
      setApiEndpointState(getApiEndpoint());
      setSettings(getGenerationSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiEndpoint.trim()) {
      toast({
        title: "API Endpoint Required",
        description: "Please enter an API endpoint URL",
        variant: "destructive",
      });
      return;
    }

    setApiEndpoint(apiEndpoint);
    setGenerationSettings(settings);

    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });

    onClose();
  };

  const handleClearChat = () => {
    onClearChat();
    toast({
      title: "Chat Cleared",
      description: "Your chat history has been cleared",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API endpoint and image generation settings
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiEndpoint" className="flex items-center gap-1">
              API Endpoint <AlertCircle className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input
              id="apiEndpoint"
              value={apiEndpoint}
              onChange={(e) => setApiEndpointState(e.target.value)}
              placeholder="https://your-api-endpoint.com/image"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of your Automatic1111 API endpoint
            </p>
          </div>

          <div className="space-y-4 mt-2">
            <h3 className="font-medium">Image Generation Settings</h3>

            <div className="grid gap-2">
              <Label>Steps: {settings.steps}</Label>
              <Slider
                value={[settings.steps]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => setSettings({ ...settings, steps: value[0] })}
              />
            </div>

            <div className="grid gap-2">
              <Label>CFG Scale: {settings.cfg_scale}</Label>
              <Slider
                value={[settings.cfg_scale]}
                min={1}
                max={20}
                step={0.5}
                onValueChange={(value) => setSettings({ ...settings, cfg_scale: value[0] })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={settings.width}
                  onChange={(e) => 
                    setSettings({ ...settings, width: parseInt(e.target.value) || 512 })
                  }
                  min={64}
                  max={2048}
                  step={8}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={settings.height}
                  onChange={(e) =>
                    setSettings({ ...settings, height: parseInt(e.target.value) || 512 })
                  }
                  min={64}
                  max={2048}
                  step={8}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sampler">Sampler</Label>
              <Select
                value={settings.sampler_name}
                onValueChange={(value) => setSettings({ ...settings, sampler_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sampler" />
                </SelectTrigger>
                <SelectContent>
                  {samplers.map((sampler) => (
                    <SelectItem key={sampler} value={sampler}>
                      {sampler}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scheduler">Scheduler</Label>
              <Select
                value={settings.scheduler}
                onValueChange={(value) => setSettings({ ...settings, scheduler: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scheduler" />
                </SelectTrigger>
                <SelectContent>
                  {schedulers.map((scheduler) => (
                    <SelectItem key={scheduler} value={scheduler}>
                      {scheduler}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="negativePrompt">Negative Prompt</Label>
              <Textarea
                id="negativePrompt"
                value={settings.negative_prompt}
                onChange={(e) =>
                  setSettings({ ...settings, negative_prompt: e.target.value })
                }
                placeholder="Elements to exclude from the generated image"
                className="resize-none h-20"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row space-y-2 sm:space-y-0 pt-2">
          <Button
            variant="destructive"
            onClick={handleClearChat}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat History
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
