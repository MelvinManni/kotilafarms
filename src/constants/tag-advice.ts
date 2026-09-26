// What to do when a pen observation keeps coming back (used by the weekly review)
import type { ObservationTag } from "@/constants/observation-tags";

export const TAG_ADVICE: Record<ObservationTag, { problem: string; action: string }> = {
  wet_litter: { problem: "wet litter keeps coming back", action: "change the sawdust around the drinkers and raise the drinker line a notch" },
  green_stool: { problem: "green droppings keep showing", action: "call the vet this week and ask about Newcastle or fowl typhoid; keep sick birds apart" },
  coughing: { problem: "birds keep coughing", action: "open the side curtains for air, check for ammonia smell, and tell the vet if it spreads" },
  lethargy: { problem: "dull, sleepy birds keep being seen", action: "check water and feed reach every corner, and weigh a few of the dull birds" },
  panting: { problem: "birds are panting from heat", action: "open the curtains fully in the afternoon, add drinkers, and give vitamin C in the water" },
  poor_appetite: { problem: "birds keep eating poorly", action: "check the feed for mould and a musty smell, and that it's fresh in the feeders each morning" },
};
