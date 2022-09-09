type ESSSSubscription = (d: any) => void;
type SubKey = { name: string; id: string };

class ESSS {
  readonly ws: WebSocket;

  private subscriptions: Map<SubKey, ESSSSubscription> = new Map();

  constructor() {
    const ws = new WebSocket('ws://172.20.8.110:9003/ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({ model_update: 'model_update' }));
    };

    ws.onclose = () => {};

    ws.onmessage = (msg) => {
      const payload = JSON.parse(msg.data);

      if (payload.type !== 'UPDATED' || !payload.current) return;

      const data = payload.current;

      for (const [key, sub] of this.subscriptions) {
        const m = data[key.name];
        if (!m) continue;
        if (key.id && m.id !== key.id) continue;
        m && sub(m);
      }
    };

    this.ws = ws;
  }

  subscribe(model: string, onUpdate: ESSSSubscription) {
    const [name, id] = model.split('#');
    this.subscriptions.set(
      {
        name,
        id,
      },
      onUpdate,
    );
  }
}

export { ESSS };
