export function flowAnalytics(_) {
  const lodash = window._;
  const Flow = window.Flow;
  Flow.Dataflow.link(_.trackEvent, (category, action, label, value) => lodash.defer(() => window.ga('send', 'event', category, action, label, value)));
  return Flow.Dataflow.link(_.trackException, description => lodash.defer(() => {
    _.requestEcho(`FLOW: ${description}`, () => {
    });
    return window.ga('send', 'exception', {
      exDescription: description,
      exFatal: false,
      appName: 'Flow',
      appVersion: Flow.Version
    });
  }));
}

