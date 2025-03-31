
import { getApiEndpoint, getGenerationSettings } from "@/lib/localStorage";
import { toast } from "@/hooks/use-toast";

export const generateImage = async (prompt: string): Promise<string | null> => {
  const apiEndpoint = getApiEndpoint();
  if (!apiEndpoint) {
    toast({
      title: "API Endpoint Not Set",
      description: "Please configure the API endpoint in settings.",
      variant: "destructive",
    });
    return null;
  }

  const generationSettings = getGenerationSettings();

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        steps: generationSettings.steps,
        cfg_scale: generationSettings.cfg_scale,
        width: generationSettings.width,
        height: generationSettings.height,
        sampler_name: generationSettings.sampler_name,
        scheduler: generationSettings.scheduler,
        negative_prompt: generationSettings.negative_prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      return `data:image/png;base64,${data.images[0]}`;
    } else {
      console.error("API Response:", data);
      throw new Error("No images received from API");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    toast({
      title: "Image Generation Failed",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    return null;
  }
};
