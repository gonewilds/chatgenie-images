
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiEndpoint, setApiEndpoint, getGenerationSettings, setGenerationSettings, getComfyUISettings, setComfyUISettings } from "@/lib/localStorage";
import { GenerationSettings as GenerationSettingsType, ComfyUISettings as ComfyUISettingsType } from "@/types";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Trash2, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
}

const samplers = [
  "Euler a",
  "Euler",
  "LMS",
  "LCM",
  "Heun",
  "DPM2",
  "DPM2 a",
  "DPM++ 2S a",
  "DPM++ 2M",
  "DPM++ 2M SDE",
  "DPM++ 3M SDE",
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

const schedulers = ["Automatic", "Karras", "Exponential", "Polyexponential", "DDIM Uniform", "Simple"];

const SDWebUISettingsContent = ({ 
  apiEndpoint, 
  setApiEndpointState, 
  settings, 
  setSettings
}: { 
  apiEndpoint: string;
  setApiEndpointState: (value: string) => void;
  settings: GenerationSettingsType;
  setSettings: (settings: GenerationSettingsType) => void;
}) => (
  <div className="space-y-4">
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="apiEndpoint" className="flex items-center gap-1">
          API Endpoint <AlertCircle className="h-3 w-3 text-muted-foreground" />
        </Label>
        <Input
          id="apiEndpoint"
          value={apiEndpoint}
          onChange={(e) => setApiEndpointState(e.target.value)}
          placeholder="https://your-api-endpoint.com/sdapi/v1/txt2img"
        />
        <p className="text-xs text-muted-foreground">
          Enter the URL of your Automatic1111 API endpoint
        </p>
      </div>

      <div className="space-y-4 mt-1">
        <h3 className="font-medium text-base">Image Generation Settings</h3>

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
  </div>
);

const ComfyUISettingsContent = ({ 
  comfySettings, 
  setComfySettings
}: { 
  comfySettings: ComfyUISettingsType;
  setComfySettings: (settings: ComfyUISettingsType) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          setComfySettings({ ...comfySettings, workflow });
          toast({
            title: "Workflow Uploaded",
            description: "ComfyUI workflow has been successfully uploaded",
          });
        } catch (error) {
          toast({
            title: "Invalid JSON",
            description: "Please upload a valid JSON workflow file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="comfyEndpoint" className="flex items-center gap-1">
            ComfyUI API Endpoint <AlertCircle className="h-3 w-3 text-muted-foreground" />
          </Label>
          <Input
            id="comfyEndpoint"
            value={comfySettings.endpoint}
            onChange={(e) => setComfySettings({ ...comfySettings, endpoint: e.target.value })}
            placeholder="http://127.0.0.1:8188"
          />
          <p className="text-xs text-muted-foreground">
            Enter the URL of your ComfyUI API endpoint
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="workflowUpload" className="flex items-center gap-1">
            Workflow JSON <AlertCircle className="h-3 w-3 text-muted-foreground" />
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Workflow
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {comfySettings.workflow && (
              <span className="text-sm text-muted-foreground self-center">
                Workflow loaded
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Upload your ComfyUI workflow JSON file
          </p>
        </div>

        <div className="space-y-4 mt-1">
          <h3 className="font-medium text-base">Image Generation Settings</h3>

          <div className="grid gap-2">
            <Label>Steps: {comfySettings.steps}</Label>
            <Slider
              value={[comfySettings.steps]}
              min={1}
              max={50}
              step={1}
              onValueChange={(value) => setComfySettings({ ...comfySettings, steps: value[0] })}
            />
          </div>

          <div className="grid gap-2">
            <Label>CFG Scale: {comfySettings.cfg_scale}</Label>
            <Slider
              value={[comfySettings.cfg_scale]}
              min={1}
              max={20}
              step={0.5}
              onValueChange={(value) => setComfySettings({ ...comfySettings, cfg_scale: value[0] })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="comfyWidth">Width</Label>
              <Input
                id="comfyWidth"
                type="number"
                value={comfySettings.width}
                onChange={(e) => 
                  setComfySettings({ ...comfySettings, width: parseInt(e.target.value) || 512 })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comfyHeight">Height</Label>
              <Input
                id="comfyHeight"
                type="number"
                value={comfySettings.height}
                onChange={(e) =>
                  setComfySettings({ ...comfySettings, height: parseInt(e.target.value) || 512 })
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comfySampler">Sampler</Label>
            <Select
              value={comfySettings.sampler_name}
              onValueChange={(value) => setComfySettings({ ...comfySettings, sampler_name: value })}
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
            <Label htmlFor="comfyScheduler">Scheduler</Label>
            <Select
              value={comfySettings.scheduler}
              onValueChange={(value) => setComfySettings({ ...comfySettings, scheduler: value })}
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
            <Label htmlFor="comfyNegativePrompt">Negative Prompt</Label>
            <Textarea
              id="comfyNegativePrompt"
              value={comfySettings.negative_prompt}
              onChange={(e) =>
                setComfySettings({ ...comfySettings, negative_prompt: e.target.value })
              }
              placeholder="Elements to exclude from the generated image"
              className="resize-none h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [comfySettings, setComfySettings] = useState<ComfyUISettingsType>({
    endpoint: "",
    workflow: null,
    steps: 20,
    cfg_scale: 7,
    width: 512,
    height: 512,
    sampler_name: "Euler a",
    scheduler: "Automatic",
    negative_prompt: "",
  });
  const [activeTab, setActiveTab] = useState("sdwebui");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      setApiEndpointState(getApiEndpoint());
      setSettings(getGenerationSettings());
      setComfySettings(getComfyUISettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    if (activeTab === "sdwebui" && !apiEndpoint.trim()) {
      toast({
        title: "API Endpoint Required",
        description: "Please enter a SD WebUI API endpoint URL",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "comfyui" && !comfySettings.endpoint.trim()) {
      toast({
        title: "ComfyUI Endpoint Required",
        description: "Please enter a ComfyUI API endpoint URL",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "sdwebui") {
      setApiEndpoint(apiEndpoint);
      setGenerationSettings(settings);
    } else {
      setComfyUISettings(comfySettings);
    }

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

  const settingsContent = (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sdwebui">SD WebUI</TabsTrigger>
          <TabsTrigger value="comfyui">ComfyUI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sdwebui" className="space-y-4">
          <SDWebUISettingsContent
            apiEndpoint={apiEndpoint}
            setApiEndpointState={setApiEndpointState}
            settings={settings}
            setSettings={setSettings}
          />
        </TabsContent>
        
        <TabsContent value="comfyui" className="space-y-4">
          <ComfyUISettingsContent
            comfySettings={comfySettings}
            setComfySettings={setComfySettings}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-4 pt-2">
        <div className="flex justify-between items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleClearChat}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use Sheet for mobile and Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="px-4 py-8 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Configure your API endpoints and image generation settings
            </SheetDescription>
          </SheetHeader>
          
          {settingsContent}
          
          <SheetFooter className="mt-4">
            {/* Footer content rendered in settingsContent */}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API endpoints and image generation settings
          </DialogDescription>
        </DialogHeader>

        {settingsContent}

        <DialogFooter className="mt-4">
          {/* Footer content rendered in settingsContent */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
