import { flowConfirmDialog } from '../flowConfirmDialog';
import { flowAlertDialog } from '../flowAlertDialog';

export function dialogs() {
  var Flow = window.Flow;
  var __slice = [].slice;
  Flow.Dialogs = _ => {
    var showDialog;
    var _dialog;
    _dialog = Flow.Dataflow.signal(null);
    showDialog = (ctor, args, _go) => {
      var $dialog;
      var dialog;
      var go;
      var responded;
      responded = false;
      go = response => {
        if (!responded) {
          responded = true;
          $dialog.modal('hide');
          if (_go) {
            return _go(response);
          }
        }
      };
      _dialog(dialog = ctor(...[_].concat(args).concat(go)));
      $dialog = $(`#${dialog.template}`);
      $dialog.modal();
      $dialog.on('hidden.bs.modal', e => {
        if (!responded) {
          responded = true;
          _dialog(null);
          if (_go) {
            return _go(null);
          }
        }
      });
    };
    Flow.Dataflow.link(_.dialog, function () {
      var args;
      var ctor;
      var go;
      var _i;
      ctor = arguments[0], args = arguments.length >= 3 ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), go = arguments[_i++];
      return showDialog(ctor, args, go);
    });
    Flow.Dataflow.link(_.confirm, (message, opts, go) => showDialog(flowConfirmDialog, [
      message,
      opts
    ], go));
    Flow.Dataflow.link(_.alert, (message, opts, go) => showDialog(flowAlertDialog, [
      message,
      opts
    ], go));
    return {
      dialog: _dialog,
      template(dialog) {
        return `flow-${dialog.template}`;
      }
    };
  };
}
