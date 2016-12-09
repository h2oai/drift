export function h2oCloudOutput(_, _go, _cloud) {
  const lodash = window._;
  const Flow = window.Flow;
  let avg;
  let createGrid;
  let createNodeRow;
  let createTotalRow;
  let format3f;
  let formatMilliseconds;
  let formatThreads;
  let prettyPrintBytes;
  let refresh;
  let sum;
  let toggleExpansion;
  let toggleRefresh;
  let updateCloud;
  let _exception;
  let _hasConsensus;
  let _headers;
  let _isBusy;
  let _isExpanded;
  let _isHealthy;
  let _isLive;
  let _isLocked;
  let _name;
  let _nodeCounts;
  let _nodes;
  let _size;
  let _sizes;
  let _uptime;
  let _version;
  _exception = Flow.Dataflow.signal(null);
  _isLive = Flow.Dataflow.signal(false);
  _isBusy = Flow.Dataflow.signal(false);
  _isExpanded = Flow.Dataflow.signal(false);
  _name = Flow.Dataflow.signal();
  _size = Flow.Dataflow.signal();
  _uptime = Flow.Dataflow.signal();
  _version = Flow.Dataflow.signal();
  _nodeCounts = Flow.Dataflow.signal();
  _hasConsensus = Flow.Dataflow.signal();
  _isLocked = Flow.Dataflow.signal();
  _isHealthy = Flow.Dataflow.signal();
  _nodes = Flow.Dataflow.signals();
  formatMilliseconds = ms => Flow.Util.fromNow(new Date(new Date().getTime() - ms));
  format3f = d3.format('.3f');
  _sizes = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB'
  ];
  prettyPrintBytes = bytes => {
    let i;
    if (bytes === 0) {
      return '-';
    }
    i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${_sizes[i]}`;
  };
  formatThreads = fjs => {
    let i;
    let max_lo;
    let s;
    let _i;
    let _j;
    let _k;
    let _ref;
    for (max_lo = _i = 120; _i > 0; max_lo = --_i) {
      if (fjs[max_lo - 1] !== -1) {
        break;
      }
    }
    s = '[';
    for (i = _j = 0; max_lo >= 0 ? _j < max_lo : _j > max_lo; i = max_lo >= 0 ? ++_j : --_j) {
      s += Math.max(fjs[i], 0);
      s += '/';
    }
    s += '.../';
    for (i = _k = 120, _ref = fjs.length - 1; _ref >= 120 ? _k < _ref : _k > _ref; i = _ref >= 120 ? ++_k : --_k) {
      s += fjs[i];
      s += '/';
    }
    s += fjs[fjs.length - 1];
    s += ']';
    return s;
  };
  sum = (nodes, attrOf) => {
    let node;
    let total;
    let _i;
    let _len;
    total = 0;
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      total += attrOf(node);
    }
    return total;
  };
  avg = (nodes, attrOf) => sum(nodes, attrOf) / nodes.length;
  _headers = [
    [
      '&nbsp;',
      true
    ],
    [
      'Name',
      true
    ],
    [
      'Ping',
      true
    ],
    [
      'Cores',
      true
    ],
    [
      'Load',
      true
    ],
    [
      'My CPU %',
      true
    ],
    [
      'Sys CPU %',
      true
    ],
    [
      'GFLOPS',
      true
    ],
    [
      'Memory Bandwidth',
      true
    ],
    [
      'Data (Used/Total)',
      true
    ],
    [
      'Data (% Cached)',
      true
    ],
    [
      'GC (Free / Total / Max)',
      true
    ],
    [
      'Disk (Free / Max)',
      true
    ],
    [
      'Disk (% Free)',
      true
    ],
    [
      'PID',
      false
    ],
    [
      'Keys',
      false
    ],
    [
      'TCP',
      false
    ],
    [
      'FD',
      false
    ],
    [
      'RPCs',
      false
    ],
    [
      'Threads',
      false
    ],
    [
      'Tasks',
      false
    ]
  ];
  createNodeRow = node => [
    node.healthy,
    node.ip_port,
    moment(new Date(node.last_ping)).fromNow(),
    node.num_cpus,
    format3f(node.sys_load),
    node.my_cpu_pct,
    node.sys_cpu_pct,
    format3f(node.gflops),
    `${prettyPrintBytes(node.mem_bw)} / s`,
    `${prettyPrintBytes(node.mem_value_size)} / ${prettyPrintBytes(node.total_value_size)}`,
    `${Math.floor(node.mem_value_size * 100 / node.total_value_size)}%`,
    `${prettyPrintBytes(node.free_mem)} / ${prettyPrintBytes(node.tot_mem)} / ${prettyPrintBytes(node.max_mem)}`,
    `${prettyPrintBytes(node.free_disk)} / ${prettyPrintBytes(node.max_disk)}`,
    `${Math.floor(node.free_disk * 100 / node.max_disk)}%`,
    node.pid,
    node.num_keys,
    node.tcps_active,
    node.open_fds,
    node.rpcs_active,
    formatThreads(node.fjthrds),
    formatThreads(node.fjqueue)
  ];
  createTotalRow = cloud => {
    let nodes;
    nodes = cloud.nodes;
    return [
      cloud.cloud_healthy,
      'TOTAL',
      '-',
      sum(nodes, node => node.num_cpus),
      format3f(sum(nodes, node => node.sys_load)),
      '-',
      '-',
      `${format3f(sum(nodes, node => node.gflops))}`,
      `${prettyPrintBytes(sum(nodes, node => node.mem_bw))} / s`,
      `${prettyPrintBytes(sum(nodes, node => node.mem_value_size))} / ${prettyPrintBytes(sum(nodes, node => node.total_value_size))}`,
      `${Math.floor(avg(nodes, node => node.mem_value_size * 100 / node.total_value_size))}%`,
      `${prettyPrintBytes(sum(nodes, node => node.free_mem))} / ${prettyPrintBytes(sum(nodes, node => node.tot_mem))} / ${prettyPrintBytes(sum(nodes, node => node.max_mem))}`,
      `${prettyPrintBytes(sum(nodes, node => node.free_disk))} / ${prettyPrintBytes(sum(nodes, node => node.max_disk))}`,
      `${Math.floor(avg(nodes, node => node.free_disk * 100 / node.max_disk))}%`,
      '-',
      sum(nodes, node => node.num_keys),
      sum(nodes, node => node.tcps_active),
      sum(nodes, node => node.open_fds),
      sum(nodes, node => node.rpcs_active),
      '-',
      '-'
    ];
  };
  createGrid = (cloud, isExpanded) => {
    let caption;
    let cell;
    let danger;
    let grid;
    let i;
    let nodeRows;
    let row;
    let showAlways;
    let success;
    let table;
    let tbody;
    let td;
    let tds;
    let th;
    let thead;
    let ths;
    let tr;
    let trs;
    let _ref;
    _ref = Flow.HTML.template('.grid', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'i.fa.fa-check-circle.text-success', 'i.fa.fa-exclamation-circle.text-danger'), grid = _ref[0], table = _ref[1], thead = _ref[2], tbody = _ref[3], tr = _ref[4], th = _ref[5], td = _ref[6], success = _ref[7], danger = _ref[8];
    nodeRows = lodash.map(cloud.nodes, createNodeRow);
    nodeRows.push(createTotalRow(cloud));
    ths = (() => {
      let _i;
      let _len;
      let _ref1;
      let _results;
      _results = [];
      for (_i = 0, _len = _headers.length; _i < _len; _i++) {
        _ref1 = _headers[_i], caption = _ref1[0], showAlways = _ref1[1];
        if (showAlways || isExpanded) {
          _results.push(th(caption));
        }
      }
      return _results;
    })();
    trs = (() => {
      let _i;
      let _len;
      let _results;
      _results = [];
      for (_i = 0, _len = nodeRows.length; _i < _len; _i++) {
        row = nodeRows[_i];
        tds = (() => {
          let _j;
          let _len1;
          let _results1;
          _results1 = [];
          for (i = _j = 0, _len1 = row.length; _j < _len1; i = ++_j) {
            cell = row[i];
            if (_headers[i][1] || isExpanded) {
              if (i === 0) {
                _results1.push(td(cell ? success() : danger()));
              } else {
                _results1.push(td(cell));
              }
            }
          }
          return _results1;
        })();
        _results.push(tr(tds));
      }
      return _results;
    })();
    return Flow.HTML.render('div', grid([table([
      thead(tr(ths)),
      tbody(trs)
    ])]));
  };
  updateCloud = (cloud, isExpanded) => {
    _name(cloud.cloud_name);
    _version(cloud.version);
    _hasConsensus(cloud.consensus);
    _uptime(formatMilliseconds(cloud.cloud_uptime_millis));
    _nodeCounts(`${(cloud.cloud_size - cloud.bad_nodes)} / ${cloud.cloud_size}`);
    _isLocked(cloud.locked);
    _isHealthy(cloud.cloud_healthy);
    return _nodes(createGrid(cloud, isExpanded));
  };
  toggleRefresh = () => _isLive(!_isLive());
  refresh = () => {
    _isBusy(true);
    return _.requestCloud((error, cloud) => {
      _isBusy(false);
      if (error) {
        _exception(Flow.Failure(_, new Flow.Error('Error fetching cloud status', error)));
        return _isLive(false);
      }
      updateCloud(_cloud = cloud, _isExpanded());
      if (_isLive()) {
        return lodash.delay(refresh, 2000);
      }
    });
  };
  Flow.Dataflow.act(_isLive, isLive => {
    if (isLive) {
      return refresh();
    }
  });
  toggleExpansion = () => _isExpanded(!_isExpanded());
  Flow.Dataflow.act(_isExpanded, isExpanded => updateCloud(_cloud, isExpanded));
  updateCloud(_cloud, _isExpanded());
  lodash.defer(_go);
  return {
    name: _name,
    size: _size,
    uptime: _uptime,
    version: _version,
    nodeCounts: _nodeCounts,
    hasConsensus: _hasConsensus,
    isLocked: _isLocked,
    isHealthy: _isHealthy,
    nodes: _nodes,
    isLive: _isLive,
    isBusy: _isBusy,
    toggleRefresh,
    refresh,
    isExpanded: _isExpanded,
    toggleExpansion,
    template: 'flow-cloud-output'
  };
}

