export function h2oColumnSummaryOutput(_, _go, frameKey, frame, columnName) {
  var lodash = window._;
  var Flow = window.Flow;
  var column;
  var impute;
  var inspect;
  var renderPlot;
  var table;
  var _characteristicsPlot;
  var _distributionPlot;
  var _domainPlot;
  var _summaryPlot;
  column = lodash.head(frame.columns);
  _characteristicsPlot = Flow.Dataflow.signal(null);
  _summaryPlot = Flow.Dataflow.signal(null);
  _distributionPlot = Flow.Dataflow.signal(null);
  _domainPlot = Flow.Dataflow.signal(null);
  renderPlot = function (target, render) {
    return render(function (error, vis) {
      if (error) {
        return console.debug(error);
      }
      return target(vis.element);
    });
  };
  if (table = _.inspect('characteristics', frame)) {
    renderPlot(_characteristicsPlot, _.plot(function (g) {
      return g(g.rect(g.position(g.stack(g.avg('percent'), 0), 'All'), g.fillColor('characteristic')), g.groupBy(g.factor(g.value('All')), 'characteristic'), g.from(table));
    }));
  }
  if (table = _.inspect('distribution', frame)) {
    renderPlot(_distributionPlot, _.plot(function (g) {
      return g(g.rect(g.position('interval', 'count'), g.width(g.value(1))), g.from(table));
    }));
  }
  if (table = _.inspect('summary', frame)) {
    renderPlot(_summaryPlot, _.plot(function (g) {
      return g(g.schema(g.position('min', 'q1', 'q2', 'q3', 'max', 'column')), g.from(table));
    }));
  }
  if (table = _.inspect('domain', frame)) {
    renderPlot(_domainPlot, _.plot(function (g) {
      return g(g.rect(g.position('count', 'label')), g.from(table), g.limit(1000));
    }));
  }
  impute = function () {
    return _.insertAndExecuteCell('cs', `imputeColumn frame: ${Flow.Prelude.stringify(frameKey)}, column: ${Flow.Prelude.stringify(columnName)}`);
  };
  inspect = function () {
    return _.insertAndExecuteCell('cs', `inspect getColumnSummary ${Flow.Prelude.stringify(frameKey)}, ${Flow.Prelude.stringify(columnName)}`);
  };
  lodash.defer(_go);
  return {
    label: column.label,
    characteristicsPlot: _characteristicsPlot,
    summaryPlot: _summaryPlot,
    distributionPlot: _distributionPlot,
    domainPlot: _domainPlot,
    impute,
    inspect,
    template: 'flow-column-summary-output'
  };
};
  