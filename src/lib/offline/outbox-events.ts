// Tell every open screen (and other tabs) that the outbox changed
type Listener = () => void;

const listeners = new Set<Listener>();
let channel: BroadcastChannel | undefined;

function bus() {
  if (!channel && typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("kotila-outbox");
    channel.onmessage = () => listeners.forEach((l) => l());
  }
  return channel;
}

export function onOutboxChange(listener: Listener): () => void {
  bus();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function outboxChanged() {
  listeners.forEach((l) => l());
  bus()?.postMessage("changed");
}
