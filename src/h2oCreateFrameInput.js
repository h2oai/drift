import { flowPreludeFunction } from './flowPreludeFunction';
const flowPrelude = flowPreludeFunction();

export function h2oCreateFrameInput(_, _go) {
  const lodash = window._;
  const Flow = window.Flow;
  let createFrame;
  let _binaryFraction;
  let _binaryOnesFraction;
  let _categoricalFraction;
  let _columns;
  let _factors;
  let _hasResponse;
  let _integerFraction;
  let _integerRange;
  let _key;
  let _missingFraction;
  let _randomize;
  let _realRange;
  let _responseFactors;
  let _rows;
  let _seed;
  let _seed_for_column_types;
  let _stringFraction;
  let _timeFraction;
  let _value;
  _key = Flow.Dataflow.signal('');
  _rows = Flow.Dataflow.signal(10000);
  _columns = Flow.Dataflow.signal(100);
  _seed = Flow.Dataflow.signal(7595850248774472000);
  _seed_for_column_types = Flow.Dataflow.signal(-1);
  _randomize = Flow.Dataflow.signal(true);
  _value = Flow.Dataflow.signal(0);
  _realRange = Flow.Dataflow.signal(100);
  _categoricalFraction = Flow.Dataflow.signal(0.1);
  _factors = Flow.Dataflow.signal(5);
  _integerFraction = Flow.Dataflow.signal(0.5);
  _binaryFraction = Flow.Dataflow.signal(0.1);
  _binaryOnesFraction = Flow.Dataflow.signal(0.02);
  _timeFraction = Flow.Dataflow.signal(0);
  _stringFraction = Flow.Dataflow.signal(0);
  _integerRange = Flow.Dataflow.signal(1);
  _missingFraction = Flow.Dataflow.signal(0.01);
  _responseFactors = Flow.Dataflow.signal(2);
  _hasResponse = Flow.Dataflow.signal(false);
  createFrame = () => {
    let opts;
    opts = {
      dest: _key(),
      rows: _rows(),
      cols: _columns(),
      seed: _seed(),
      seed_for_column_types: _seed_for_column_types(),
      randomize: _randomize(),
      value: _value(),
      real_range: _realRange(),
      categorical_fraction: _categoricalFraction(),
      factors: _factors(),
      integer_fraction: _integerFraction(),
      binary_fraction: _binaryFraction(),
      binary_ones_fraction: _binaryOnesFraction(),
      time_fraction: _timeFraction(),
      string_fraction: _stringFraction(),
      integer_range: _integerRange(),
      missing_fraction: _missingFraction(),
      response_factors: _responseFactors(),
      has_response: _hasResponse()
    };
    return _.insertAndExecuteCell('cs', `createFrame ${flowPrelude.stringify(opts)}`);
  };
  lodash.defer(_go);
  return {
    key: _key,
    rows: _rows,
    columns: _columns,
    seed: _seed,
    seed_for_column_types: _seed_for_column_types,
    randomize: _randomize,
    value: _value,
    realRange: _realRange,
    categoricalFraction: _categoricalFraction,
    factors: _factors,
    integerFraction: _integerFraction,
    binaryFraction: _binaryFraction,
    binaryOnesFraction: _binaryOnesFraction,
    timeFraction: _timeFraction,
    stringFraction: _stringFraction,
    integerRange: _integerRange,
    missingFraction: _missingFraction,
    responseFactors: _responseFactors,
    hasResponse: _hasResponse,
    createFrame,
    template: 'flow-create-frame-input'
  };
}

