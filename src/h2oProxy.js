export function h2oProxy(_) {
  var lodash = window._;
  var Flow = window.Flow;
  var cacheModelBuilders;
  var composePath;
  var doDelete;
  var doGet;
  var doPost;
  var doPostJSON;
  var doPut;
  var doUpload;
  var download;
  var encodeArrayForPost;
  var encodeObject;
  var encodeObjectForPost;
  var getGridModelBuilderEndpoint;
  var getLines;
  var getModelBuilderEndpoint;
  var getModelBuilders;
  var http;
  var mapWithKey;
  var optsToString;
  var requestAbout;
  var requestAsDataFrame;
  var requestAsH2OFrameFromDF;
  var requestAsH2OFrameFromRDD;
  var requestAutoModelBuild;
  var requestCancelJob;
  var requestCloud;
  var requestColumnSummary;
  var requestCreateFrame;
  var requestDataFrames;
  var requestDeleteFrame;
  var requestDeleteModel;
  var requestDeleteObject;
  var requestEcho;
  var requestEndpoint;
  var requestEndpoints;
  var requestExec;
  var requestExportFrame;
  var requestExportModel;
  var requestFileGlob;
  var requestFlow;
  var requestFrame;
  var requestFrameSlice;
  var requestFrameSummary;
  var requestFrameSummarySlice;
  var requestFrameSummaryWithoutData;
  var requestFrames;
  var requestGrid;
  var requestGrids;
  var requestHelpContent;
  var requestHelpIndex;
  var requestImportFile;
  var requestImportFiles;
  var requestImportModel;
  var requestInspect;
  var requestIsStorageConfigured;
  var requestJob;
  var requestJobs;
  var requestLogFile;
  var requestModel;
  var requestModelBuild;
  var requestModelBuilder;
  var requestModelBuilders;
  var requestModelBuildersVisibility;
  var requestModelInputValidation;
  var requestModels;
  var requestNetworkTest;
  var requestObject;
  var requestObjectExists;
  var requestObjects;
  var requestPack;
  var requestPacks;
  var requestParseFiles;
  var requestParseSetup;
  var requestParseSetupPreview;
  var requestPartialDependence;
  var requestPartialDependenceData;
  var requestPojoPreview;
  var requestPredict;
  var requestPrediction;
  var requestPredictions;
  var requestProfile;
  var requestPutObject;
  var requestRDDs;
  var requestRemoveAll;
  var requestScalaCode;
  var requestScalaIntp;
  var requestSchema;
  var requestSchemas;
  var requestShutdown;
  var requestSplitFrame;
  var requestStackTrace;
  var requestTimeline;
  var requestUploadFile;
  var requestUploadObject;
  var requestWithOpts;
  var trackPath;
  var unwrap;
  var __gridModelBuilderEndpoints;
  var __modelBuilderEndpoints;
  var __modelBuilders;
  var _storageConfiguration;
  download = (type, url, go) => {
    if (url.substring(0, 1) === '/') {
      url = window.Flow.ContextPath + url.substring(1);
    }
    return $.ajax({
      dataType: type,
      url,
      success(data, status, xhr) {
        return go(null, data);
      },
      error(xhr, status, error) {
        return go(new Flow.Error(error));
      }
    });
  };
  optsToString = opts => {
    var str;
    if (opts != null) {
      str = ` with opts ${JSON.stringify(opts)}`;
      if (str.length > 50) {
        return `${str.substr(0, 50)}...`;
      }
      return str;
    }
    return '';
  };
  http = (method, path, opts, go) => {
    var req;
    if (path.substring(0, 1) === '/') {
      path = window.Flow.ContextPath + path.substring(1);
    }
    _.status('server', 'request', path);
    trackPath(path);
    req = (() => {
      switch (method) {
        case 'GET':
          return $.getJSON(path);
        case 'POST':
          return $.post(path, opts);
        case 'POSTJSON':
          return $.ajax({
            url: path,
            type: 'POST',
            contentType: 'application/json',
            cache: false,
            data: JSON.stringify(opts)
          });
        case 'PUT':
          return $.ajax({
            url: path,
            type: method,
            data: opts
          });
        case 'DELETE':
          return $.ajax({
            url: path,
            type: method
          });
        case 'UPLOAD':
          return $.ajax({
            url: path,
            type: 'POST',
            data: opts,
            cache: false,
            contentType: false,
            processData: false
          });
      }
    })();
    req.done((data, status, xhr) => {
      var error;
      _.status('server', 'response', path);
      try {
        return go(null, data);
      } catch (_error) {
        error = _error;
        return go(new Flow.Error(`Error processing ${method} ${path}`, error));
      }
    });
    return req.fail((xhr, status, error) => {
      var cause;
      var meta;
      var response;
      var serverError;
      _.status('server', 'error', path);
      response = xhr.responseJSON;
      cause = (meta = response != null ? response.__meta : void 0) && (meta.schema_type === 'H2OError' || meta.schema_type === 'H2OModelBuilderError') ? (serverError = new Flow.Error(response.exception_msg), serverError.stack = `${response.dev_msg} (${response.exception_type})\n  ${response.stacktrace.join('\n  ')}`, serverError) : (error != null ? error.message : void 0) ? new Flow.Error(error.message) : status === 'error' && xhr.status === 0 ? new Flow.Error('Could not connect to H2O. Your H2O cloud is currently unresponsive.') : new Flow.Error(`HTTP connection failure: status=${status}, code=${xhr.status}, error=${(error || '?')}`);
      return go(new Flow.Error(`Error calling ${method} ${path}${optsToString(opts)}`, cause));
    });
  };
  doGet = (path, go) => http('GET', path, null, go);
  doPost = (path, opts, go) => http('POST', path, opts, go);
  doPostJSON = (path, opts, go) => http('POSTJSON', path, opts, go);
  doPut = (path, opts, go) => http('PUT', path, opts, go);
  doUpload = (path, formData, go) => http('UPLOAD', path, formData, go);
  doDelete = (path, go) => http('DELETE', path, null, go);
  trackPath = path => {
    var base;
    var e;
    var name;
    var other;
    var root;
    var version;
    var _ref;
    var _ref1;
    try {
      _ref = path.split('/'), root = _ref[0], version = _ref[1], name = _ref[2];
      _ref1 = name.split('?'), base = _ref1[0], other = _ref1[1];
      if (base !== 'Typeahead' && base !== 'Jobs') {
        _.trackEvent('api', base, version);
      }
    } catch (_error) {
      e = _error;
    }
  };
  mapWithKey = (obj, f) => {
    var key;
    var result;
    var value;
    result = [];
    for (key in obj) {
      if ({}.hasOwnProperty.call(obj, key)) {
        value = obj[key];
        result.push(f(value, key));
      }
    }
    return result;
  };
  composePath = (path, opts) => {
    var params;
    if (opts) {
      params = mapWithKey(opts, (v, k) => `${k}=${v}`);
      return `${path}?${params.join('&')}`;
    }
    return path;
  };
  requestWithOpts = (path, opts, go) => doGet(composePath(path, opts), go);
  encodeArrayForPost = array => {
    if (array) {
      if (array.length === 0) {
        return null;
      }
      return `[${lodash.map(array, element => { if (lodash.isNumber(element)) { return element; } return `"${element}"`; }).join(',')} ]`;
    }
    return null;
  };
  encodeObject = source => {
    var k;
    var target;
    var v;
    target = {};
    for (k in source) {
      if ({}.hasOwnProperty.call(source, k)) {
        v = source[k];
        target[k] = encodeURIComponent(v);
      }
    }
    return target;
  };
  encodeObjectForPost = source => {
    var k;
    var target;
    var v;
    target = {};
    for (k in source) {
      if ({}.hasOwnProperty.call(source, k)) {
        v = source[k];
        target[k] = lodash.isArray(v) ? encodeArrayForPost(v) : v;
      }
    }
    return target;
  };
  unwrap = (go, transform) => (error, result) => {
    if (error) {
      return go(error);
    }
    return go(null, transform(result));
  };
  requestExec = (ast, go) => doPost('/99/Rapids', { ast }, (error, result) => {
    if (error) {
      return go(error);
    }
    if (result.error) {
      return go(new Flow.Error(result.error));
    }
    return go(null, result);
  });
  requestInspect = (key, go) => {
    var opts;
    opts = { key: encodeURIComponent(key) };
    return requestWithOpts('/3/Inspect', opts, go);
  };
  requestCreateFrame = (opts, go) => doPost('/3/CreateFrame', opts, go);
  requestSplitFrame = (frameKey, splitRatios, splitKeys, go) => {
    var opts;
    opts = {
      dataset: frameKey,
      ratios: encodeArrayForPost(splitRatios),
      dest_keys: encodeArrayForPost(splitKeys)
    };
    return doPost('/3/SplitFrame', opts, go);
  };
  requestFrames = go => doGet('/3/Frames', (error, result) => {
    if (error) {
      return go(error);
    }
    return go(null, result.frames);
  });
  requestFrame = (key, go) => doGet(`/3/Frames/${encodeURIComponent(key)}`, unwrap(go, result => lodash.head(result.frames)));
  requestFrameSlice = (key, searchTerm, offset, count, go) => doGet(`/3/Frames/${encodeURIComponent(key)}?column_offset=${offset}&column_count=${count}`, unwrap(go, result => lodash.head(result.frames)));
  requestFrameSummary = (key, go) => doGet(`/3/Frames/${encodeURIComponent(key)}/summary`, unwrap(go, result => lodash.head(result.frames)));
  requestFrameSummarySlice = (key, searchTerm, offset, count, go) => doGet(`/3/Frames/${encodeURIComponent(key)}/summary?column_offset=${offset}&column_count=${count}&_exclude_fields=frames/columns/data,frames/columns/domain,frames/columns/histogram_bins,frames/columns/percentiles`, unwrap(go, result => lodash.head(result.frames)));
  requestFrameSummaryWithoutData = (key, go) => doGet(`/3/Frames/${encodeURIComponent(key)}/summary?_exclude_fields=frames/chunk_summary,frames/distribution_summary,frames/columns/data,frames/columns/domain,frames/columns/histogram_bins,frames/columns/percentiles`, (error, result) => {
    if (error) {
      return go(error);
    }
    return go(null, lodash.head(result.frames));
  });
  requestDeleteFrame = (key, go) => doDelete(`/3/Frames/${encodeURIComponent(key)}`, go);
  requestExportFrame = (key, path, overwrite, go) => {
    var params;
    params = {
      path,
      force: overwrite ? 'true' : 'false'
    };
    return doPost(`/3/Frames/${encodeURIComponent(key)}/export`, params, go);
  };
  requestColumnSummary = (frameKey, column, go) => doGet(`/3/Frames/${encodeURIComponent(frameKey)}/columns/${encodeURIComponent(column)}/summary`, unwrap(go, result => lodash.head(result.frames)));
  requestJobs = go => doGet('/3/Jobs', (error, result) => {
    if (error) {
      return go(new Flow.Error('Error fetching jobs', error));
    }
    return go(null, result.jobs);
  });
  requestJob = (key, go) => doGet(`/3/Jobs/${encodeURIComponent(key)}`, (error, result) => {
    if (error) {
      return go(new Flow.Error(`Error fetching job \'${key}\'`, error));
    }
    return go(null, lodash.head(result.jobs));
  });
  requestCancelJob = (key, go) => doPost(`/3/Jobs/${encodeURIComponent(key)}/cancel`, {}, (error, result) => {
    if (error) {
      return go(new Flow.Error(`Error canceling job \'${key}\'`, error));
    }
    return go(null);
  });
  requestFileGlob = (path, limit, go) => {
    var opts;
    opts = {
      src: encodeURIComponent(path),
      limit
    };
    return requestWithOpts('/3/Typeahead/files', opts, go);
  };
  requestImportFiles = (paths, go) => {
    var tasks;
    tasks = lodash.map(paths, path => go => requestImportFile(path, go));
    return Flow.Async.iterate(tasks)(go);
  };
  requestImportFile = (path, go) => {
    var opts;
    opts = { path: encodeURIComponent(path) };
    return requestWithOpts('/3/ImportFiles', opts, go);
  };
  requestParseSetup = (sourceKeys, go) => {
    var opts;
    opts = { source_frames: encodeArrayForPost(sourceKeys) };
    return doPost('/3/ParseSetup', opts, go);
  };
  requestParseSetupPreview = (
    sourceKeys,
    parseType,
    separator,
    useSingleQuotes,
    checkHeader,
    columnTypes,
    go
  ) => {
    var opts;
    opts = {
      source_frames: encodeArrayForPost(sourceKeys),
      parse_type: parseType,
      separator,
      single_quotes: useSingleQuotes,
      check_header: checkHeader,
      column_types: encodeArrayForPost(columnTypes)
    };
    return doPost('/3/ParseSetup', opts, go);
  };
  requestParseFiles = (
    sourceKeys,
    destinationKey,
    parseType,
    separator,
    columnCount,
    useSingleQuotes,
    columnNames,
    columnTypes,
    deleteOnDone,
    checkHeader,
    chunkSize,
    go
  ) => {
    var opts;
    opts = {
      destination_frame: destinationKey,
      source_frames: encodeArrayForPost(sourceKeys),
      parse_type: parseType,
      separator,
      number_columns: columnCount,
      single_quotes: useSingleQuotes,
      column_names: encodeArrayForPost(columnNames),
      column_types: encodeArrayForPost(columnTypes),
      check_header: checkHeader,
      delete_on_done: deleteOnDone,
      chunk_size: chunkSize
    };
    return doPost('/3/Parse', opts, go);
  };
  requestPartialDependence = (opts, go) => doPost('/3/PartialDependence/', opts, go);
  requestPartialDependenceData = (key, go) => doGet(`/3/PartialDependence/${encodeURIComponent(key)}`, (error, result) => {
    if (error) {
      return go(error, result);
    }
    return go(error, result);
  });
  requestGrids = (go, opts) => doGet('/99/Grids', (error, result) => {
    if (error) {
      return go(error, result);
    }
    return go(error, result.grids);
  });
  requestModels = (go, opts) => requestWithOpts('/3/Models', opts, (error, result) => {
    if (error) {
      return go(error, result);
    }
    return go(error, result.models);
  });
  requestGrid = (key, opts, go) => {
    var params;
    params = void 0;
    if (opts) {
      params = {};
      if (opts.sort_by) {
        params.sort_by = encodeURIComponent(opts.sort_by);
      }
      if (opts.decreasing === true || opts.decreasing === false) {
        params.decreasing = opts.decreasing;
      }
    }
    return doGet(composePath(`/99/Grids/' + ${encodeURIComponent(key)}`, params), go);
  };
  requestModel = (key, go) => doGet(`/3/Models/${encodeURIComponent(key)}`, (error, result) => {
    if (error) {
      return go(error, result);
    }
    return go(error, lodash.head(result.models));
  });
  requestPojoPreview = (key, go) => download('text', `/3/Models.java/${encodeURIComponent(key)}/preview`, go);
  requestDeleteModel = (key, go) => doDelete(`/3/Models/${encodeURIComponent(key)}`, go);
  requestImportModel = (path, overwrite, go) => {
    var opts;
    opts = {
      dir: path,
      force: overwrite
    };
    return doPost('/99/Models.bin/not_in_use', opts, go);
  };
  requestExportModel = (key, path, overwrite, go) => doGet(`/99/Models.bin/${encodeURIComponent(key)}?dir=${encodeURIComponent(path)}&force=${overwrite}`, go);
  requestModelBuildersVisibility = go => doGet('/3/Configuration/ModelBuilders/visibility', unwrap(go, result => result.value));
  __modelBuilders = null;
  __modelBuilderEndpoints = null;
  __gridModelBuilderEndpoints = null;
  cacheModelBuilders = modelBuilders => {
    var gridModelBuilderEndpoints;
    var modelBuilder;
    var modelBuilderEndpoints;
    var _i;
    var _len;
    modelBuilderEndpoints = {};
    gridModelBuilderEndpoints = {};
    for (_i = 0, _len = modelBuilders.length; _i < _len; _i++) {
      modelBuilder = modelBuilders[_i];
      modelBuilderEndpoints[modelBuilder.algo] = `/${modelBuilder.__meta.schema_version}/ModelBuilders/${modelBuilder.algo}`;
      gridModelBuilderEndpoints[modelBuilder.algo] = `/99/Grid/${modelBuilder.algo}`;
    }
    __modelBuilderEndpoints = modelBuilderEndpoints;
    __gridModelBuilderEndpoints = gridModelBuilderEndpoints;
    return __modelBuilders = modelBuilders;
  };
  getModelBuilders = () => __modelBuilders;
  getModelBuilderEndpoint = algo => __modelBuilderEndpoints[algo];
  getGridModelBuilderEndpoint = algo => __gridModelBuilderEndpoints[algo];
  requestModelBuilders = go => {
    var modelBuilders;
    var visibility;
    if (modelBuilders = getModelBuilders()) {
      return go(null, modelBuilders);
    }
    visibility = 'Stable';
    return doGet('/3/ModelBuilders', unwrap(go, result => {
      var algo;
      var availableBuilders;
      var builder;
      var builders;
      builders = (() => {
        var _ref;
        var _results;
        _ref = result.model_builders;
        _results = [];
        for (algo in _ref) {
          if ({}.hasOwnProperty.call(_ref, algo)) {
            builder = _ref[algo];
            _results.push(builder);
          }
        }
        return _results;
      })();
      availableBuilders = (() => {
        var _i;
        var _j;
        var _len;
        var _len1;
        var _results;
        var _results1;
        switch (visibility) {
          case 'Stable':
            _results = [];
            for (_i = 0, _len = builders.length; _i < _len; _i++) {
              builder = builders[_i];
              if (builder.visibility === visibility) {
                _results.push(builder);
              }
            }
            return _results;
            // break; // no-unreachable
          case 'Beta':
            _results1 = [];
            for (_j = 0, _len1 = builders.length; _j < _len1; _j++) {
              builder = builders[_j];
              if (builder.visibility === visibility || builder.visibility === 'Stable') {
                _results1.push(builder);
              }
            }
            return _results1;
            // break; // no-unreachable
          default:
            return builders;
        }
      })();
      return cacheModelBuilders(availableBuilders);
    }));
  };
  requestModelBuilder = (algo, go) => doGet(getModelBuilderEndpoint(algo), go);
  requestModelInputValidation = (algo, parameters, go) => doPost(`${getModelBuilderEndpoint(algo)}/parameters`, encodeObjectForPost(parameters), go);
  requestModelBuild = (algo, parameters, go) => {
    _.trackEvent('model', algo);
    if (parameters.hyper_parameters) {
      parameters.hyper_parameters = flowPrelude.stringify(parameters.hyper_parameters);
      if (parameters.search_criteria) {
        parameters.search_criteria = flowPrelude.stringify(parameters.search_criteria);
      }
      return doPost(getGridModelBuilderEndpoint(algo), encodeObjectForPost(parameters), go);
    }
    return doPost(getModelBuilderEndpoint(algo), encodeObjectForPost(parameters), go);
  };
  requestAutoModelBuild = (parameters, go) => doPostJSON('/3/AutoMLBuilder', parameters, go);
  requestPredict = (destinationKey, modelKey, frameKey, options, go) => {
    var opt;
    var opts;
    opts = {};
    if (destinationKey) {
      opts.predictions_frame = destinationKey;
    }
    if (void 0 !== (opt = options.reconstruction_error)) {
      opts.reconstruction_error = opt;
    }
    if (void 0 !== (opt = options.deep_features_hidden_layer)) {
      opts.deep_features_hidden_layer = opt;
    }
    if (void 0 !== (opt = options.leaf_node_assignment)) {
      opts.leaf_node_assignment = opt;
    }
    if (void 0 !== (opt = options.exemplar_index)) {
      opts.exemplar_index = opt;
    }
    return doPost(`/3/Predictions/models/${encodeURIComponent(modelKey)}/frames/${encodeURIComponent(frameKey)}`, opts, (error, result) => {
      if (error) {
        return go(error);
      }
      return go(null, result);
    });
  };
  requestPrediction = (modelKey, frameKey, go) => doGet(`/3/ModelMetrics/models/${encodeURIComponent(modelKey)}/frames/${encodeURIComponent(frameKey)}`, (error, result) => {
    if (error) {
      return go(error);
    }
    return go(null, result);
  });
  requestPredictions = (modelKey, frameKey, _go) => {
    var go;
    go = (error, result) => {
      var prediction;
      var predictions;
      if (error) {
        return _go(error);
      }
      predictions = (() => {
        var _i;
        var _len;
        var _ref;
        var _results;
        _ref = result.model_metrics;
        _results = [];
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
        var _i;
        var _len;
        var _results;
        _results = [];
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
      return doGet(`/3/ModelMetrics/models/${encodeURIComponent(modelKey)}/frames/'${encodeURIComponent(frameKey)}`, go);
    } else if (modelKey) {
      return doGet(`/3/ModelMetrics/models/${encodeURIComponent(modelKey)}`, go);
    } else if (frameKey) {
      return doGet(`/3/ModelMetrics/frames/${encodeURIComponent(frameKey)}`, go);
    }
    return doGet('/3/ModelMetrics', go);
  };
  _storageConfiguration = null;
  requestIsStorageConfigured = go => {
    if (_storageConfiguration) {
      return go(null, _storageConfiguration.isConfigured);
    }
    return doGet('/3/NodePersistentStorage/configured', (error, result) => {
      _storageConfiguration = { isConfigured: error ? false : result.configured };
      return go(null, _storageConfiguration.isConfigured);
    });
  };
  requestObjects = (type, go) => doGet(`/3/NodePersistentStorage/${encodeURIComponent(type)}`, unwrap(go, result => result.entries));
  requestObjectExists = (type, name, go) => doGet(`/3/NodePersistentStorage/categories/${encodeURIComponent(type)}/names/${encodeURIComponent(name)}/exists`, (error, result) => go(null, error ? false : result.exists));
  requestObject = (type, name, go) => doGet(`/3/NodePersistentStorage/${encodeURIComponent(type)}/${encodeURIComponent(name)}`, unwrap(go, result => JSON.parse(result.value)));
  requestDeleteObject = (type, name, go) => doDelete(`/3/NodePersistentStorage/${encodeURIComponent(type)}/${encodeURIComponent(name)}`, go);
  requestPutObject = (type, name, value, go) => {
    var uri;
    uri = `/3/NodePersistentStorage/${encodeURIComponent(type)}`;
    if (name) {
      uri += `/${encodeURIComponent(name)}`;
    }
    return doPost(uri, { value: JSON.stringify(value, null, 2) }, unwrap(go, result => result.name));
  };
  requestUploadObject = (type, name, formData, go) => {
    var uri;
    uri = `/3/NodePersistentStorage.bin/${encodeURIComponent(type)}`;
    if (name) {
      uri += `/${encodeURIComponent(name)}`;
    }
    return doUpload(uri, formData, unwrap(go, result => result.name));
  };
  requestUploadFile = (key, formData, go) => doUpload(`/3/PostFile?destination_frame=${encodeURIComponent(key)}`, formData, go);
  requestCloud = go => doGet('/3/Cloud', go);
  requestTimeline = go => doGet('/3/Timeline', go);
  requestProfile = (depth, go) => doGet(`/3/Profiler?depth=${depth}`, go);
  requestStackTrace = go => doGet('/3/JStack', go);
  requestRemoveAll = go => doDelete('/3/DKV', go);
  requestEcho = (message, go) => doPost('/3/LogAndEcho', { message }, go);
  requestLogFile = (nodeIndex, fileType, go) => doGet(`/3/Logs/nodes/${nodeIndex}/files/${fileType}`, go);
  requestNetworkTest = go => doGet('/3/NetworkTest', go);
  requestAbout = go => doGet('/3/About', go);
  requestShutdown = go => doPost('/3/Shutdown', {}, go);
  requestEndpoints = go => doGet('/3/Metadata/endpoints', go);
  requestEndpoint = (index, go) => doGet(`/3/Metadata/endpoints/${index}`, go);
  requestSchemas = go => doGet('/3/Metadata/schemas', go);
  requestSchema = (name, go) => doGet(`/3/Metadata/schemas/${encodeURIComponent(name)}`, go);
  getLines = data => lodash.filter(data.split('\n'), line => {
    if (line.trim()) {
      return true;
    }
    return false;
  });
  requestPacks = go => download('text', '/flow/packs/index.list', unwrap(go, getLines));
  requestPack = (packName, go) => download('text', `/flow/packs/${encodeURIComponent(packName)}/index.list`, unwrap(go, getLines));
  requestFlow = (packName, flowName, go) => download('json', `/flow/packs/${encodeURIComponent(packName)}/${encodeURIComponent(flowName)}`, go);
  requestHelpIndex = go => download('json', '/flow/help/catalog.json', go);
  requestHelpContent = (name, go) => download('text', `/flow/help/${name}.html`, go);
  requestRDDs = go => doGet('/3/RDDs', go);
  requestDataFrames = go => doGet('/3/dataframes', go);
  requestScalaIntp = go => doPost('/3/scalaint', {}, go);
  requestScalaCode = (session_id, code, go) => doPost(`/3/scalaint/${session_id}`, { code }, go);
  requestAsH2OFrameFromRDD = (rdd_id, name, go) => {
    if (name === void 0) {
      return doPost(`/3/RDDs/${rdd_id}/h2oframe`, {}, go);
    }
    return doPost(`/3/RDDs/${rdd_id}/h2oframe`, { h2oframe_id: name }, go);
  };
  requestAsH2OFrameFromDF = (df_id, name, go) => {
    if (name === void 0) {
      return doPost(`/3/dataframes/${df_id}/h2oframe`, {}, go);
    }
    return doPost(`/3/dataframes/${df_id}/h2oframe`, { h2oframe_id: name }, go);
  };
  requestAsDataFrame = (hf_id, name, go) => {
    if (name === void 0) {
      return doPost(`/3/h2oframes/${hf_id}/dataframe`, {}, go);
    }
    return doPost(`/3/h2oframes/${hf_id}/dataframe`, { dataframe_id: name }, go);
  };
  Flow.Dataflow.link(_.requestInspect, requestInspect);
  Flow.Dataflow.link(_.requestCreateFrame, requestCreateFrame);
  Flow.Dataflow.link(_.requestSplitFrame, requestSplitFrame);
  Flow.Dataflow.link(_.requestFrames, requestFrames);
  Flow.Dataflow.link(_.requestFrame, requestFrame);
  Flow.Dataflow.link(_.requestFrameSlice, requestFrameSlice);
  Flow.Dataflow.link(_.requestFrameSummary, requestFrameSummary);
  Flow.Dataflow.link(_.requestFrameSummaryWithoutData, requestFrameSummaryWithoutData);
  Flow.Dataflow.link(_.requestFrameSummarySlice, requestFrameSummarySlice);
  Flow.Dataflow.link(_.requestDeleteFrame, requestDeleteFrame);
  Flow.Dataflow.link(_.requestExportFrame, requestExportFrame);
  Flow.Dataflow.link(_.requestColumnSummary, requestColumnSummary);
  Flow.Dataflow.link(_.requestJobs, requestJobs);
  Flow.Dataflow.link(_.requestJob, requestJob);
  Flow.Dataflow.link(_.requestCancelJob, requestCancelJob);
  Flow.Dataflow.link(_.requestFileGlob, requestFileGlob);
  Flow.Dataflow.link(_.requestImportFiles, requestImportFiles);
  Flow.Dataflow.link(_.requestImportFile, requestImportFile);
  Flow.Dataflow.link(_.requestParseSetup, requestParseSetup);
  Flow.Dataflow.link(_.requestParseSetupPreview, requestParseSetupPreview);
  Flow.Dataflow.link(_.requestParseFiles, requestParseFiles);
  Flow.Dataflow.link(_.requestPartialDependence, requestPartialDependence);
  Flow.Dataflow.link(_.requestPartialDependenceData, requestPartialDependenceData);
  Flow.Dataflow.link(_.requestGrids, requestGrids);
  Flow.Dataflow.link(_.requestModels, requestModels);
  Flow.Dataflow.link(_.requestGrid, requestGrid);
  Flow.Dataflow.link(_.requestModel, requestModel);
  Flow.Dataflow.link(_.requestPojoPreview, requestPojoPreview);
  Flow.Dataflow.link(_.requestDeleteModel, requestDeleteModel);
  Flow.Dataflow.link(_.requestImportModel, requestImportModel);
  Flow.Dataflow.link(_.requestExportModel, requestExportModel);
  Flow.Dataflow.link(_.requestModelBuilder, requestModelBuilder);
  Flow.Dataflow.link(_.requestModelBuilders, requestModelBuilders);
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
  Flow.Dataflow.link(_.requestExec, requestExec);
  Flow.Dataflow.link(_.requestRDDs, requestRDDs);
  Flow.Dataflow.link(_.requestDataFrames, requestDataFrames);
  Flow.Dataflow.link(_.requestScalaIntp, requestScalaIntp);
  Flow.Dataflow.link(_.requestScalaCode, requestScalaCode);
  Flow.Dataflow.link(_.requestAsH2OFrameFromDF, requestAsH2OFrameFromDF);
  Flow.Dataflow.link(_.requestAsH2OFrameFromRDD, requestAsH2OFrameFromRDD);
  return Flow.Dataflow.link(_.requestAsDataFrame, requestAsDataFrame);
}