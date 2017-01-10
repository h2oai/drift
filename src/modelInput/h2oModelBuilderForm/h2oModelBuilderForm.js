import { parameterTemplateOf } from './parameterTemplateOf';
import { collectParameters } from './collectParameters';

import { createControlFromParameter } from '../createControlFromParameter';
import { postModelInputValidationRequest } from '../../h2oProxy/postModelInputValidationRequest';

import { flowPreludeFunction } from '../../flowPreludeFunction';
const flowPrelude = flowPreludeFunction();

export function h2oModelBuilderForm(_, _algorithm, _parameters) {
  const lodash = window._;
  const Flow = window.Flow;
  let control;
  let _i;
  let _j;
  let _k;
  let _len;
  let _len1;
  let _len2;
  const _exception = Flow.Dataflow.signal(null);
  const _validationFailureMessage = Flow.Dataflow.signal('');
  const _hasValidationFailures = Flow.Dataflow.lift(_validationFailureMessage, flowPrelude.isTruthy);
  const _gridStrategies = [
    'Cartesian',
    'RandomDiscrete',
  ];
  const _isGrided = Flow.Dataflow.signal(false);
  const _gridId = Flow.Dataflow.signal(`grid-${Flow.Util.uuid()}`);
  const _gridStrategy = Flow.Dataflow.signal('Cartesian');
  const _isGridRandomDiscrete = Flow.Dataflow.lift(_gridStrategy, strategy => strategy !== _gridStrategies[0]);
  const _gridMaxModels = Flow.Dataflow.signal(1000);
  const _gridMaxRuntime = Flow.Dataflow.signal(28800);
  const _gridStoppingRounds = Flow.Dataflow.signal(0);
  const _gridStoppingMetrics = [
    'AUTO',
    'deviance',
    'logloss',
    'MSE',
    'AUC',
    'lift_top_group',
    'r2',
    'misclassification',
  ];
  const _gridStoppingMetric = Flow.Dataflow.signal(_gridStoppingMetrics[0]);
  const _gridStoppingTolerance = Flow.Dataflow.signal(0.001);
  const _parametersByLevel = lodash.groupBy(_parameters, parameter => parameter.level);
  const _controlGroups = lodash.map([
    'critical',
    'secondary',
    'expert',
  ], type => {
    const controls = lodash.filter(lodash.map(_parametersByLevel[type], createControlFromParameter), a => {
      if (a) {
        return true;
      }
      return false;
    });
      // Show/hide grid settings if any controls are grid-ified.
    lodash.forEach(controls, control => Flow.Dataflow.react(control.isGrided, () => {
      let isGrided;
      let _i;
      let _len;
      isGrided = false;
      for (_i = 0, _len = controls.length; _i < _len; _i++) {
        control = controls[_i];
        if (control.isGrided()) {
          _isGrided(isGrided = true);
          break;
        }
      }
      if (!isGrided) {
        return _isGrided(false);
      }
    }));
    return controls;
  });
  const criticalControls = _controlGroups[0];
  const secondaryControls = _controlGroups[1];
  const expertControls = _controlGroups[2];
  const _form = [];
  if (criticalControls.length) {
    _form.push({
      kind: 'group',
      title: 'Parameters',
    });
    for (_i = 0, _len = criticalControls.length; _i < _len; _i++) {
      control = criticalControls[_i];
      _form.push(control);
    }
  }
  if (secondaryControls.length) {
    _form.push({
      kind: 'group',
      title: 'Advanced',
    });
    for (_j = 0, _len1 = secondaryControls.length; _j < _len1; _j++) {
      control = secondaryControls[_j];
      _form.push(control);
    }
  }
  if (expertControls.length) {
    _form.push({
      kind: 'group',
      title: 'Expert',
    });
    for (_k = 0, _len2 = expertControls.length; _k < _len2; _k++) {
      control = expertControls[_k];
      _form.push(control);
    }
  }
  // looks tightly coupled
  const findFormField = name => lodash.find(_form, field => field.name === name);
  ((() => {
    const _ref = lodash.map([
      'training_frame',
      'validation_frame',
      'response_column',
      'ignored_columns',
      'offset_column',
      'weights_column',
      'fold_column',
    ], findFormField);
    const trainingFrameParameter = _ref[0];
    const validationFrameParameter = _ref[1];
    const responseColumnParameter = _ref[2];
    const ignoredColumnsParameter = _ref[3];
    const offsetColumnsParameter = _ref[4];
    const weightsColumnParameter = _ref[5];
    const foldColumnParameter = _ref[6];
    if (trainingFrameParameter) {
      if (responseColumnParameter || ignoredColumnsParameter) {
        return Flow.Dataflow.act(trainingFrameParameter.value, frameKey => {
          if (frameKey) {
            _.requestFrameSummaryWithoutData(_, frameKey, (error, frame) => {
              let columnLabels;
              let columnValues;
              if (!error) {
                columnValues = lodash.map(frame.columns, column => column.label);
                columnLabels = lodash.map(frame.columns, column => {
                  const missingPercent = 100 * column.missing_count / frame.rows;
                  return {
                    type: column.type === 'enum' ? `enum(${column.domain_cardinality})` : column.type,
                    value: column.label,
                    missingPercent,
                    missingLabel: missingPercent === 0 ? '' : `${Math.round(missingPercent)}% NA`,
                  };
                });
                if (responseColumnParameter) {
                  responseColumnParameter.values(columnValues);
                }
                if (ignoredColumnsParameter) {
                  ignoredColumnsParameter.values(columnLabels);
                }
                if (weightsColumnParameter) {
                  weightsColumnParameter.values(columnValues);
                }
                if (foldColumnParameter) {
                  foldColumnParameter.values(columnValues);
                }
                if (offsetColumnsParameter) {
                  offsetColumnsParameter.values(columnValues);
                }
                if (responseColumnParameter && ignoredColumnsParameter) {
                    // Mark response column as 'unavailable' in ignored column list.
                  return Flow.Dataflow.lift(responseColumnParameter.value, responseVariableName => {
                      // FIXME
                      // ignoredColumnsParameter.unavailableValues [ responseVariableName ]
                  });
                }
              }
            });
          }
        });
      }
    }
  })());
    //
    // The 'checkForErrors' parameter exists so that we can conditionally choose
    // to ignore validation errors. This is because we need the show/hide states
    // for each field the first time around, but not the errors/warnings/info
    // messages.
    //
    // Thus, when this function is called during form init, checkForErrors is
    //  passed in as 'false', and during form submission, checkForErrors is
    //  passsed in as 'true'.
    //
  const performValidations = (checkForErrors, go) => {
    _exception(null);
    const parameters = collectParameters(
      true,
      _controlGroups,
      control,
      _gridId,
      _gridStrategy,
      _gridMaxModels,
      _gridMaxRuntime,
      _gridStoppingRounds,
      _gridStoppingTolerance,
      _gridStoppingMetric
    );
    if (parameters.hyper_parameters) {
        // parameter validation fails with hyper_parameters, so skip.
      return go();
    }
    _validationFailureMessage('');
    return postModelInputValidationRequest(_, _algorithm, parameters, (error, modelBuilder) => {
      let controls;
      let hasErrors;
      let validation;
      let validations;
      let validationsByControlName;
      let _l;
      let _len3;
      let _len4;
      let _len5;
      let _m;
      let _n;
      if (error) {
        return _exception(Flow.failure(_, new Flow.Error('Error fetching initial model builder state', error)));
      }
      hasErrors = false;
      if (modelBuilder.messages.length) {
        validationsByControlName = lodash.groupBy(modelBuilder.messages, validation => validation.field_name);
        for (_l = 0, _len3 = _controlGroups.length; _l < _len3; _l++) {
          controls = _controlGroups[_l];
          for (_m = 0, _len4 = controls.length; _m < _len4; _m++) {
            control = controls[_m];
            validations = validationsByControlName[control.name];
            if (validations) {
              for (_n = 0, _len5 = validations.length; _n < _len5; _n++) {
                validation = validations[_n];
                if (validation.message_type === 'TRACE') {
                  control.isVisible(false);
                } else {
                  control.isVisible(true);
                  if (checkForErrors) {
                    switch (validation.message_type) {
                      case 'INFO':
                        control.hasInfo(true);
                        control.message(validation.message);
                        break;
                      case 'WARN':
                        control.hasWarning(true);
                        control.message(validation.message);
                        break;
                      case 'ERRR':
                        control.hasError(true);
                        control.message(validation.message);
                        hasErrors = true;
                        break;
                      default:
                          // do nothing
                    }
                  }
                }
              }
            } else {
              control.isVisible(true);
              control.hasInfo(false);
              control.hasWarning(false);
              control.hasError(false);
              control.message('');
            }
          }
        }
      }
      if (hasErrors) {
          // Do not pass go(). Do not collect $200.
        return _validationFailureMessage('Your model parameters have one or more errors. Please fix them and try again.');
      }
        // Proceed with form submission
      _validationFailureMessage('');
      return go();
    });
  };
  const createModel = () => {
    _exception(null);
    return performValidations(true, () => {
      const parameters = collectParameters(
        false,
        _controlGroups,
        control,
        _gridId,
        _gridStrategy,
        _gridMaxModels,
        _gridMaxRuntime,
        _gridStoppingRounds,
        _gridStoppingTolerance,
        _gridStoppingMetric
      );
      return _.insertAndExecuteCell('cs', `buildModel \'${_algorithm}\', ${flowPrelude.stringify(parameters)}`);
    });
  };
  const _revalidate = value => {
      // HACK: ko seems to be raising change notifications when dropdown boxes are initialized.
    if (value !== void 0) {
      return performValidations(false, () => {
      });
    }
  };
  const revalidate = lodash.throttle(_revalidate, 100, { leading: false });

    // Kick off validations (minus error checking) to get hidden parameters
  performValidations(false, () => {
    let controls;
    let _l;
    let _len3;
    let _len4;
    let _m;
    for (_l = 0, _len3 = _controlGroups.length; _l < _len3; _l++) {
      controls = _controlGroups[_l];
      for (_m = 0, _len4 = controls.length; _m < _len4; _m++) {
        control = controls[_m];
        Flow.Dataflow.react(control.value, revalidate);
      }
    }
  });
  return {
    form: _form,
    isGrided: _isGrided,
    gridId: _gridId,
    gridStrategy: _gridStrategy,
    gridStrategies: _gridStrategies,
    isGridRandomDiscrete: _isGridRandomDiscrete,
    gridMaxModels: _gridMaxModels,
    gridMaxRuntime: _gridMaxRuntime,
    gridStoppingRounds: _gridStoppingRounds,
    gridStoppingMetrics: _gridStoppingMetrics,
    gridStoppingMetric: _gridStoppingMetric,
    gridStoppingTolerance: _gridStoppingTolerance,
    exception: _exception,
    parameterTemplateOf,
    createModel,
    hasValidationFailures: _hasValidationFailures,
    validationFailureMessage: _validationFailureMessage,
  };
}
