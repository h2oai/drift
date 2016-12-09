export function flowStatus(_) {
  const lodash = window._;
  const Flow = window.Flow;
  let defaultMessage;
  let onStatus;
  let _connections;
  let _isBusy;
  let _message;
  defaultMessage = 'Ready';
  _message = Flow.Dataflow.signal(defaultMessage);
  _connections = Flow.Dataflow.signal(0);
  _isBusy = Flow.Dataflow.lift(_connections, connections => connections > 0);
  onStatus = (category, type, data) => {
    let connections;
    console.debug('Status:', category, type, data);
    switch (category) {
      case 'server':
        switch (type) {
          case 'request':
            _connections(_connections() + 1);
            return lodash.defer(_message, `Requesting ${data}`);
          case 'response':
          case 'error':
            _connections(connections = _connections() - 1);
            if (connections) {
              return lodash.defer(_message, `Waiting for ${connections} responses...`);
            }
            return lodash.defer(_message, defaultMessage);
        }
    }
  };
  Flow.Dataflow.link(_.ready, () => Flow.Dataflow.link(_.status, onStatus));
  return {
    message: _message,
    connections: _connections,
    isBusy: _isBusy
  };
}

