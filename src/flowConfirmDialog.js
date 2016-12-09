export function flowConfirmDialog(_, _message, _opts, _go) {
  const lodash = window._;
  const Flow = window.Flow;
  let accept;
  let decline;
  if (_opts == null) {
    _opts = {};
  }
  lodash.defaults(_opts, {
    title: 'Confirm',
    acceptCaption: 'Yes',
    declineCaption: 'No'
  });
  accept = () => _go(true);
  decline = () => _go(false);
  return {
    title: _opts.title,
    acceptCaption: _opts.acceptCaption,
    declineCaption: _opts.declineCaption,
    message: Flow.Util.multilineTextToHTML(_message),
    accept,
    decline,
    template: 'confirm-dialog'
  };
}

