import { flowPreludeFunction } from './flowPreludeFunction';
const flowPrelude = flowPreludeFunction();

export function h2oImportFilesOutput(_, _go, _importResults) {
  const lodash = window._;
  const Flow = window.Flow;
  let createImportView;
  let parse;
  let _allFrames;
  let _canParse;
  let _importViews;
  let _title;
  _allFrames = lodash.flatten(lodash.compact(lodash.map(_importResults, result => result.destination_frames)));
  _canParse = _allFrames.length > 0;
  _title = `${_allFrames.length} / ${_importResults.length} files imported.`;
  createImportView = result => ({
    files: result.files,
    template: 'flow-import-file-output'
  });
  _importViews = lodash.map(_importResults, createImportView);
  parse = () => {
    let paths;
    paths = lodash.map(_allFrames, flowPrelude.stringify);
    return _.insertAndExecuteCell('cs', `setupParse source_frames: [ ${paths.join(',')} ]`);
  };
  lodash.defer(_go);
  return {
    title: _title,
    importViews: _importViews,
    canParse: _canParse,
    parse,
    template: 'flow-import-files-output',
    templateOf(view) {
      return view.template;
    }
  };
}

