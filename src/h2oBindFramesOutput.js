import { flowPreludeFunction } from './flowPreludeFunction';
const flowPrelude = flowPreludeFunction();

export function h2oBindFramesOutput(_, _go, key, result) {
  var lodash = window._;
  var Flow = window.Flow;
  var viewFrame;
  viewFrame = () => _.insertAndExecuteCell('cs', `getFrameSummary ${flowPrelude.stringify(key)}`);
  lodash.defer(_go);
  return {
    viewFrame,
    template: 'flow-bind-frames-output'
  };
}

