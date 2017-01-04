import { download } from './download';
import { http } from './http';
import { doGet } from './doGet';
import { doPost } from './doPost';
import { doPostJSON } from './doPostJSON';
import { doUpload } from './doUpload';
import { doDelete } from './doDelete';
import { composePath } from './composePath';
import { requestWithOpts } from './requestWithOpts';
import { encodeArrayForPost } from './encodeArrayForPost';
import { encodeObjectForPost } from './encodeObjectForPost';
import { unwrap } from './unwrap';
import { requestSplitFrame } from './requestSplitFrame';
import { requestFrames } from './requestFrames';
import { requestFrameSlice } from './requestFrameSlice';
import { requestFrameSummary } from './requestFrameSummary';
import { requestFrameSummarySlice } from './requestFrameSummarySlice';
import { requestFrameSummaryWithoutData } from './requestFrameSummaryWithoutData';
import { requestDeleteFrame } from './requestDeleteFrame';
import { requestFileGlob } from './requestFileGlob';

import { flowPreludeFunction } from '../flowPreludeFunction';
const flowPrelude = flowPreludeFunction();

export function h2oProxy(_) {
  const lodash = window._;
  const Flow = window.Flow;
  const $ = window.jQuery;
  let _storageConfiguration;
  let _storageConfigurations;

  // abstracting out these two functions
  // produces an error
  // defer for now
  const requestImportFiles = (paths, go) => {
    const tasks = lodash.map(paths, path => go => requestImportFile(path, go));
    return Flow.Async.iterate(tasks)(go);
  };
  const requestImportFile = (path, go) => {
    const opts = { path: encodeURIComponent(path) };
    return requestWithOpts(_, '/3/ImportFiles', opts, go);
  };

  // setup a __ namespace for our modelBuilders cache
  _.__ = {};
  _.__.modelBuilders = null;
  _.__.modelBuilderEndpoints = null;
  _.__.gridModelBuilderEndpoints = null;
  const requestModelBuilder = (algo, go) => doGet(_, _.__.modelBuilderEndpoints[algo], go);
  const requestModelInputValidation = (algo, parameters, go) => doPost(_, `${_.__.modelBuilderEndpoints[algo]}/parameters`, encodeObjectForPost(parameters), go);
  const requestModelBuild = (algo, parameters, go) => {
    _.trackEvent('model', algo);
    if (parameters.hyper_parameters) {
      // super-hack: nest this object as stringified json
      parameters.hyper_parameters = flowPrelude.stringify(parameters.hyper_parameters);
      if (parameters.search_criteria) {
        parameters.search_criteria = flowPrelude.stringify(parameters.search_criteria);
      }
      return doPost(_, _.__.gridModelBuilderEndpoints[algo], encodeObjectForPost(parameters), go);
    }
    return doPost(_, _.__.modelBuilderEndpoints[algo], encodeObjectForPost(parameters), go);
  };
  const requestAutoModelBuild = (parameters, go) => doPostJSON(_, '/3/AutoMLBuilder', parameters, go);
  const requestPredict = (destinationKey, modelKey, frameKey, options, go) => {
    let opt;
    const opts = {};
    if (destinationKey) {
      opts.predictions_frame = destinationKey;
    }
    opt = options.reconstruction_error;
    if (void 0 !== opt) {
      opts.reconstruction_error = opt;
    }
    opt = options.deep_features_hidden_layer;
    if (void 0 !== opt) {
      opts.deep_features_hidden_layer = opt;
    }
    opt = options.leaf_node_assignment;
    if (void 0 !== opt) {
      opts.leaf_node_assignment = opt;
    }
    opt = options.exemplar_index;
    if (void 0 !== opt) {
      opts.exemplar_index = opt;
    }
    return doPost(_, `/3/Predictions/models/${encodeURIComponent(modelKey)}/frames/${encodeURIComponent(frameKey)}`, opts, (error, result) => {
      if (error) {
        return go(error);
      }
      return go(null, result);
    });
  };
  const requestPrediction = (modelKey, frameKey, go) => doGet(_, `/3/ModelMetrics/models/${encodeURIComponent(modelKey)}/frames/${encodeURIComponent(frameKey)}`, (error, result) => {
    if (error) {
      return go(error);
    }
    return go(null, result);
  });
  const requestPredictions = (modelKey, frameKey, _go) => {
    const go = (error, result) => {
      let prediction;
      if (error) {
        return _go(error);
      }
      //
      // TODO workaround for a filtering bug in the API
      //
      const predictions = (() => {
        let _i;
        let _len;
        const _ref = result.model_metrics;
        const _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          prediction = _ref[_i];
          if (modelKey && prediction.model.name !== modelKey) {
            _results.push(null);
          } else if (frameKey && prediction.frame.name !== frameKey) {
            _results.push(null);
          } else {
            _results.push(prediction);
          }
        }
        return _results;
      })();
      return _go(null, (() => {
        let _i;
        let _len;
        const _results = [];
        for (_i = 0, _len = predictions.length; _i < _len; _i++) {
          prediction = predictions[_i];
          if (prediction) {
            _results.push(prediction);
          }
        }
        return _results;
      })());
    };
    if (modelKey && frameKey) {
      return doGet(_, `/3/ModelMetrics/models/${encodeURIComponent(modelKey)}/frames/'${encodeURIComponent(frameKey)}`, go);
    } else if (modelKey) {
      return doGet(_, `/3/ModelMetrics/models/${encodeURIComponent(modelKey)}`, go);
    } else if (frameKey) {
      return doGet(_, `/3/ModelMetrics/frames/${encodeURIComponent(frameKey)}`, go);
    }
    return doGet(_, '/3/ModelMetrics', go);
  };
  _storageConfiguration = null;
  const requestIsStorageConfigured = go => {
    if (_storageConfiguration) {
      return go(null, _storageConfiguration.isConfigured);
    }
    return doGet(_, '/3/NodePersistentStorage/configured', (error, result) => {
      _storageConfiguration = { isConfigured: error ? false : result.configured };
      return go(null, _storageConfiguration.isConfigured);
    });
  };
  const requestObjects = (type, go) => doGet(_, `/3/NodePersistentStorage/${encodeURIComponent(type)}`, unwrap(go, result => result.entries));
  const requestObjectExists = (type, name, go) => doGet(_, `/3/NodePersistentStorage/categories/${encodeURIComponent(type)}/names/${encodeURIComponent(name)}/exists`, (error, result) => go(null, error ? false : result.exists));
  const requestObject = (type, name, go) => doGet(_, `/3/NodePersistentStorage/${encodeURIComponent(type)}/${encodeURIComponent(name)}`, unwrap(go, result => JSON.parse(result.value)));
  const requestDeleteObject = (type, name, go) => doDelete(_, `/3/NodePersistentStorage/${encodeURIComponent(type)}/${encodeURIComponent(name)}`, go);
  const requestPutObject = (type, name, value, go) => {
    let uri;
    uri = `/3/NodePersistentStorage/${encodeURIComponent(type)}`;
    if (name) {
      uri += `/${encodeURIComponent(name)}`;
    }
    return doPost(_, uri, { value: JSON.stringify(value, null, 2) }, unwrap(go, result => result.name));
  };
  const requestUploadObject = (type, name, formData, go) => {
    let uri;
    uri = `/3/NodePersistentStorage.bin/${encodeURIComponent(type)}`;
    if (name) {
      uri += `/${encodeURIComponent(name)}`;
    }
    return doUpload(_, uri, formData, unwrap(go, result => result.name));
  };
  const requestUploadFile = (key, formData, go) => doUpload(_, `/3/PostFile?destination_frame=${encodeURIComponent(key)}`, formData, go);
  const requestCloud = go => doGet(_, '/3/Cloud', go);
  const requestTimeline = go => doGet(_, '/3/Timeline', go);
  const requestProfile = (depth, go) => doGet(_, `/3/Profiler?depth=${depth}`, go);
  const requestStackTrace = go => doGet(_, '/3/JStack', go);
  const requestRemoveAll = go => doDelete(_, '/3/DKV', go);
  const requestEcho = (message, go) => doPost(_, '/3/LogAndEcho', { message }, go);
  const requestLogFile = (nodeIndex, fileType, go) => doGet(_, `/3/Logs/nodes/${nodeIndex}/files/${fileType}`, go);
  const requestNetworkTest = go => doGet(_, '/3/NetworkTest', go);
  const requestAbout = go => doGet(_, '/3/About', go);
  const requestShutdown = go => doPost(_, '/3/Shutdown', {}, go);
  const requestEndpoints = go => doGet(_, '/3/Metadata/endpoints', go);
  const requestEndpoint = (index, go) => doGet(_, `/3/Metadata/endpoints/${index}`, go);
  const requestSchemas = go => doGet(_, '/3/Metadata/schemas', go);
  const requestSchema = (name, go) => doGet(_, `/3/Metadata/schemas/${encodeURIComponent(name)}`, go);
  const getLines = data => lodash.filter(data.split('\n'), line => {
    if (line.trim()) {
      return true;
    }
    return false;
  });
  const requestPacks = go => download('text', '/flow/packs/index.list', unwrap(go, getLines));
  const requestPack = (packName, go) => download('text', `/flow/packs/${encodeURIComponent(packName)}/index.list`, unwrap(go, getLines));
  const requestFlow = (packName, flowName, go) => download('json', `/flow/packs/${encodeURIComponent(packName)}/${encodeURIComponent(flowName)}`, go);
  const requestHelpIndex = go => download('json', '/flow/help/catalog.json', go);
  const requestHelpContent = (name, go) => download('text', `/flow/help/${name}.html`, go);
  const requestRDDs = go => doGet(_, '/3/RDDs', go);
  const requestDataFrames = go => doGet(_, '/3/dataframes', go);
  const requestScalaIntp = go => doPost(_, '/3/scalaint', {}, go);
  const requestScalaCode = (sessionId, code, go) => doPost(_, `/3/scalaint/${sessionId}`, { code }, go);
  const requestAsH2OFrameFromRDD = (rddId, name, go) => {
    if (name === void 0) {
      return doPost(_, `/3/RDDs/${rddId}/h2oframe`, {}, go);
    }
    return doPost(_, `/3/RDDs/${rddId}/h2oframe`, { h2oframe_id: name }, go);
  };
  const requestAsH2OFrameFromDF = (dfId, name, go) => {
    if (name === void 0) {
      return doPost(_, `/3/dataframes/${dfId}/h2oframe`, {}, go);
    }
    return doPost(_, `/3/dataframes/${dfId}/h2oframe`, { h2oframe_id: name }, go);
  };
  const requestAsDataFrame = (hfId, name, go) => {
    if (name === void 0) {
      return doPost(_, `/3/h2oframes/${hfId}/dataframe`, {}, go);
    }
    return doPost(_, `/3/h2oframes/${hfId}/dataframe`, { dataframe_id: name }, go);
  };
  Flow.Dataflow.link(_.requestSplitFrame, requestSplitFrame);
  Flow.Dataflow.link(_.requestFrames, requestFrames);
  Flow.Dataflow.link(_.requestFrameSlice, requestFrameSlice);
  Flow.Dataflow.link(_.requestFrameSummary, requestFrameSummary);
  Flow.Dataflow.link(_.requestFrameSummaryWithoutData, requestFrameSummaryWithoutData);
  Flow.Dataflow.link(_.requestFrameSummarySlice, requestFrameSummarySlice);
  Flow.Dataflow.link(_.requestDeleteFrame, requestDeleteFrame);
  Flow.Dataflow.link(_.requestFileGlob, requestFileGlob);
  Flow.Dataflow.link(_.requestImportFiles, requestImportFiles);
  Flow.Dataflow.link(_.requestImportFile, requestImportFile);
  Flow.Dataflow.link(_.requestModelBuilder, requestModelBuilder);
  Flow.Dataflow.link(_.requestModelBuild, requestModelBuild);
  Flow.Dataflow.link(_.requestModelInputValidation, requestModelInputValidation);
  Flow.Dataflow.link(_.requestAutoModelBuild, requestAutoModelBuild);
  Flow.Dataflow.link(_.requestPredict, requestPredict);
  Flow.Dataflow.link(_.requestPrediction, requestPrediction);
  Flow.Dataflow.link(_.requestPredictions, requestPredictions);
  Flow.Dataflow.link(_.requestObjects, requestObjects);
  Flow.Dataflow.link(_.requestObject, requestObject);
  Flow.Dataflow.link(_.requestObjectExists, requestObjectExists);
  Flow.Dataflow.link(_.requestDeleteObject, requestDeleteObject);
  Flow.Dataflow.link(_.requestPutObject, requestPutObject);
  Flow.Dataflow.link(_.requestUploadObject, requestUploadObject);
  Flow.Dataflow.link(_.requestUploadFile, requestUploadFile);
  Flow.Dataflow.link(_.requestCloud, requestCloud);
  Flow.Dataflow.link(_.requestTimeline, requestTimeline);
  Flow.Dataflow.link(_.requestProfile, requestProfile);
  Flow.Dataflow.link(_.requestStackTrace, requestStackTrace);
  Flow.Dataflow.link(_.requestRemoveAll, requestRemoveAll);
  Flow.Dataflow.link(_.requestEcho, requestEcho);
  Flow.Dataflow.link(_.requestLogFile, requestLogFile);
  Flow.Dataflow.link(_.requestNetworkTest, requestNetworkTest);
  Flow.Dataflow.link(_.requestAbout, requestAbout);
  Flow.Dataflow.link(_.requestShutdown, requestShutdown);
  Flow.Dataflow.link(_.requestEndpoints, requestEndpoints);
  Flow.Dataflow.link(_.requestEndpoint, requestEndpoint);
  Flow.Dataflow.link(_.requestSchemas, requestSchemas);
  Flow.Dataflow.link(_.requestSchema, requestSchema);
  Flow.Dataflow.link(_.requestPacks, requestPacks);
  Flow.Dataflow.link(_.requestPack, requestPack);
  Flow.Dataflow.link(_.requestFlow, requestFlow);
  Flow.Dataflow.link(_.requestHelpIndex, requestHelpIndex);
  Flow.Dataflow.link(_.requestHelpContent, requestHelpContent);
  //
  // Sparkling-Water
  //
  Flow.Dataflow.link(_.requestRDDs, requestRDDs);
  Flow.Dataflow.link(_.requestDataFrames, requestDataFrames);
  Flow.Dataflow.link(_.requestScalaIntp, requestScalaIntp);
  Flow.Dataflow.link(_.requestScalaCode, requestScalaCode);
  Flow.Dataflow.link(_.requestAsH2OFrameFromDF, requestAsH2OFrameFromDF);
  Flow.Dataflow.link(_.requestAsH2OFrameFromRDD, requestAsH2OFrameFromRDD);
  return Flow.Dataflow.link(_.requestAsDataFrame, requestAsDataFrame);
}
