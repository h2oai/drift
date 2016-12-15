import { flowHeading } from '../flowHeading';
import { flowCoffeescript } from '../flowCoffeescript';
import { flowRaw } from '../flowRaw';
import { flowStatus } from '../flowStatus';
import { flowSidebar } from '../flowSidebar';
import { flowCell } from '../flowCell';
import { flowFileOpenDialog } from '../flowFileOpenDialog';
import { flowFileUploadDialog } from '../flowFileUploadDialog';
import { flowMarkdown } from '../flowMarkdown';
import { flowPreludeFunction } from '../flowPreludeFunction';
const flowPrelude = flowPreludeFunction();

export function notebook() {
  const lodash = window._;
  const Flow = window.Flow;
  const Mousetrap = window.Mousetrap;
  const $ = window.jQuery;
  const __slice = [].slice;
  Flow.renderers = (_, _sandbox) => ({
    h1() {
      return flowHeading(_, 'h1');
    },

    h2() {
      return flowHeading(_, 'h2');
    },

    h3() {
      return flowHeading(_, 'h3');
    },

    h4() {
      return flowHeading(_, 'h4');
    },

    h5() {
      return flowHeading(_, 'h5');
    },

    h6() {
      return flowHeading(_, 'h6');
    },

    md() {
      return flowMarkdown(_);
    },

    cs(guid) {
      return flowCoffeescript(_, guid, _sandbox);
    },

    sca(guid) {
      return flowCoffeescript(_, guid, _sandbox);
    },

    raw() {
      return flowRaw(_);
    },
  });
  Flow.notebook = (_, _renderers) => {
    let menuCell;
    let _clipboardCell;
    let _lastDeletedCell;
    let _selectedCell;
    let _selectedCellIndex;
    const _localName = Flow.Dataflow.signal('Untitled Flow');
    Flow.Dataflow.react(_localName, name => {
      document.title = `H2O${(name && name.trim() ? `- ${name}` : '')}`;
      return document.title;
    });
    const _remoteName = Flow.Dataflow.signal(null);
    const _isEditingName = Flow.Dataflow.signal(false);
    const editName = () => _isEditingName(true);
    const saveName = () => _isEditingName(false);
    const _cells = Flow.Dataflow.signals([]);
    _selectedCell = null;
    _selectedCellIndex = -1;
    _clipboardCell = null;
    _lastDeletedCell = null;
    const _areInputsHidden = Flow.Dataflow.signal(false);
    const _areOutputsHidden = Flow.Dataflow.signal(false);
    const _isSidebarHidden = Flow.Dataflow.signal(false);
    const _isRunningAll = Flow.Dataflow.signal(false);
    const _runningCaption = Flow.Dataflow.signal('Running');
    const _runningPercent = Flow.Dataflow.signal('0%');
    const _runningCellInput = Flow.Dataflow.signal('');
    const _status = flowStatus(_);
    const _sidebar = flowSidebar(_, _cells);
    const _about = Flow.about(_);
    const _dialogs = Flow.dialogs(_);
    const _initializeInterpreter = () => _.requestScalaIntp((error, response) => {
      if (error) {
        return _.scalaIntpId(-1);
      }
      return _.scalaIntpId(response.sessionId);
    });
    const serialize = () => {
      let cell;
      const cells = (() => {
        let _i;
        let _len;
        const _ref = _cells();
        const _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          _results.push({
            type: cell.type(),
            input: cell.input(),
          });
        }
        return _results;
      })();
      return {
        version: '1.0.0',
        cells,
      };
    };
    const deserialize = (localName, remoteName, doc) => {
      let cell;
      let _i;
      let _len;
      _localName(localName);
      _remoteName(remoteName);
      const cells = (() => {
        let _i;
        let _len;
        const _ref = doc.cells;
        const _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          _results.push(createCell(cell.type, cell.input));
        }
        return _results;
      })();
      _cells(cells);
      selectCell(lodash.head(cells));
      const _ref = _cells();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (!cell.isCode()) {
          cell.execute();
        }
      }
    };
    function createCell(type, input) {
      if (type == null) {
        type = 'cs';
      }
      if (input == null) {
        input = '';
      }
      return flowCell(_, _renderers, type, input);
    }
    const checkConsistency = () => {
      let cell;
      let i;
      let selectionCount;
      let _i;
      let _len;
      selectionCount = 0;
      const _ref = _cells();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        cell = _ref[i];
        if (!cell) {
          console.error(`index ${i} is empty`);
        } else {
          if (cell.isSelected()) {
            selectionCount++;
          }
        }
      }
      if (selectionCount !== 1) {
        console.error(`selected cell count = ${selectionCount}`);
      }
    };
    function selectCell(target, scrollIntoView, scrollImmediately) {
      if (scrollIntoView == null) {
        scrollIntoView = true;
      }
      if (scrollImmediately == null) {
        scrollImmediately = false;
      }
      if (_selectedCell === target) {
        return;
      }
      if (_selectedCell) {
        _selectedCell.isSelected(false);
      }
      _selectedCell = target;
      _selectedCell.isSelected(true);
      _selectedCellIndex = _cells.indexOf(_selectedCell);
      checkConsistency();
      if (scrollIntoView) {
        lodash.defer(() => _selectedCell.scrollIntoView(scrollImmediately));
      }
      return _selectedCell;
    }
    const cloneCell = cell => createCell(cell.type(), cell.input());
    const switchToCommandMode = () => _selectedCell.isActive(false);
    const switchToEditMode = () => {
      _selectedCell.isActive(true);
      return false;
    };
    const convertCellToCode = () => _selectedCell.type('cs');
    const convertCellToHeading = level => () => {
      _selectedCell.type(`h${level}`);
      return _selectedCell.execute();
    };
    const convertCellToMarkdown = () => {
      _selectedCell.type('md');
      return _selectedCell.execute();
    };
    const convertCellToRaw = () => {
      _selectedCell.type('raw');
      return _selectedCell.execute();
    };
    const convertCellToScala = () => _selectedCell.type('sca');
    const copyCell = () => {
      _clipboardCell = _selectedCell;
      return _clipboardCell;
    };
    const cutCell = () => {
      copyCell();
      return removeCell();
    };
    const deleteCell = () => {
      _lastDeletedCell = _selectedCell;
      return removeCell();
    };
    function removeCell() {
      let removedCell;
      const cells = _cells();
      if (cells.length > 1) {
        if (_selectedCellIndex === cells.length - 1) {
          removedCell = lodash.head(_cells.splice(_selectedCellIndex, 1));
          selectCell(cells[_selectedCellIndex - 1]);
        } else {
          removedCell = lodash.head(_cells.splice(_selectedCellIndex, 1));
          selectCell(cells[_selectedCellIndex]);
        }
        if (removedCell) {
          _.saveClip('trash', removedCell.type(), removedCell.input());
        }
      }
    }
    const insertCell = (index, cell) => {
      _cells.splice(index, 0, cell);
      selectCell(cell);
      return cell;
    };
    const insertAbove = cell => insertCell(_selectedCellIndex, cell);
    const insertBelow = cell => insertCell(_selectedCellIndex + 1, cell);
    const appendCell = cell => insertCell(_cells().length, cell);
    const insertCellAbove = (type, input) => insertAbove(createCell(type, input));
    const insertCellBelow = (type, input) => insertBelow(createCell(type, input));
    const insertNewCellAbove = () => insertAbove(createCell('cs'));
    const insertNewCellBelow = () => insertBelow(createCell('cs'));
    const insertNewScalaCellAbove = () => insertAbove(createCell('sca'));
    const insertNewScalaCellBelow = () => insertBelow(createCell('sca'));
    const insertCellAboveAndRun = (type, input) => {
      const cell = insertAbove(createCell(type, input));
      cell.execute();
      return cell;
    };
    const insertCellBelowAndRun = (type, input) => {
      const cell = insertBelow(createCell(type, input));
      cell.execute();
      return cell;
    };
    const appendCellAndRun = (type, input) => {
      const cell = appendCell(createCell(type, input));
      cell.execute();
      return cell;
    };
    const moveCellDown = () => {
      const cells = _cells();
      if (_selectedCellIndex !== cells.length - 1) {
        _cells.splice(_selectedCellIndex, 1);
        _selectedCellIndex++;
        _cells.splice(_selectedCellIndex, 0, _selectedCell);
      }
    };
    const moveCellUp = () => {
      let cells;
      if (_selectedCellIndex !== 0) {
        cells = _cells();
        _cells.splice(_selectedCellIndex, 1);
        _selectedCellIndex--;
        _cells.splice(_selectedCellIndex, 0, _selectedCell);
      }
    };
    const mergeCellBelow = () => {
      let nextCell;
      const cells = _cells();
      if (_selectedCellIndex !== cells.length - 1) {
        nextCell = cells[_selectedCellIndex + 1];
        if (_selectedCell.type() === nextCell.type()) {
          nextCell.input(`${_selectedCell.input()}\n${nextCell.input()}`);
          removeCell();
        }
      }
    };
    const splitCell = () => {
      let cursorPosition;
      let input;
      let left;
      let right;
      if (_selectedCell.isActive()) {
        input = _selectedCell.input();
        if (input.length > 1) {
          cursorPosition = _selectedCell.getCursorPosition();
          if (
            cursorPosition > 0 &&
            cursorPosition < input.length - 1
          ) {
            left = input.substr(0, cursorPosition);
            right = input.substr(cursorPosition);
            _selectedCell.input(left);
            insertCell(_selectedCellIndex + 1, createCell('cs', right));
            _selectedCell.isActive(true);
          }
        }
      }
    };
    const pasteCellAbove = () => {
      if (_clipboardCell) {
        return insertCell(_selectedCellIndex, cloneCell(_clipboardCell));
      }
    };
    const pasteCellBelow = () => {
      if (_clipboardCell) {
        return insertCell(_selectedCellIndex + 1, cloneCell(_clipboardCell));
      }
    };
    const undoLastDelete = () => {
      if (_lastDeletedCell) {
        insertCell(_selectedCellIndex + 1, _lastDeletedCell);
      }
      _lastDeletedCell = null;
      return _lastDeletedCell;
    };
    const runCell = () => {
      _selectedCell.execute();
      return false;
    };
    const runCellAndInsertBelow = () => {
      _selectedCell.execute(() => insertNewCellBelow());
      return false;
    };
    const runCellAndSelectBelow = () => {
      _selectedCell.execute(() => selectNextCell());
      return false;
    };
    const checkIfNameIsInUse = (name, go) => _.requestObjectExists('notebook', name, (error, exists) => go(exists));
    const storeNotebook = (localName, remoteName) => _.requestPutObject('notebook', localName, serialize(), error => {
      if (error) {
        return _.alert(`Error saving notebook: ${error.message}`);
      }
      _remoteName(localName);
      _localName(localName);
      if (remoteName !== localName) {
        return _.requestDeleteObject('notebook', remoteName, error => {
          if (error) {
            _.alert(`Error deleting remote notebook [${remoteName}]: ${error.message}`);
          }
          return _.saved();
        });
      }
      return _.saved();
    });
    const saveNotebook = () => {
      const localName = Flow.Util.sanitizeName(_localName());
      if (localName === '') {
        return _.alert('Invalid notebook name.');
      }
      const remoteName = _remoteName();
      if (remoteName) {
        storeNotebook(localName, remoteName);
      }
      checkIfNameIsInUse(localName, isNameInUse => {
        if (isNameInUse) {
          return _.confirm('A notebook with that name already exists.\nDo you want to replace it with the one you\'re saving?', {
            acceptCaption: 'Replace',
            declineCaption: 'Cancel',
          }, accept => {
            if (accept) {
              return storeNotebook(localName, remoteName);
            }
          });
        }
        return storeNotebook(localName, remoteName);
      });
    };
    const promptForNotebook = () => _.dialog(flowFileOpenDialog, result => {
      let error;
      let filename;
      let _ref;
      if (result) {
        error = result.error;
        filename = result.filename;
        if (error) {
          _ref = error.message;
          return _.growl(_ref != null ? _ref : error);
        }
        loadNotebook(filename);
        return _.loaded();
      }
    });
    const uploadFile = () => _.dialog(flowFileUploadDialog, result => {
      let error;
      let _ref;
      if (result) {
        error = result.error;
        if (error) {
          _ref = error.message;
          return _.growl((_ref) != null ? _ref : error);
        }
        _.growl('File uploaded successfully!');
        return _.insertAndExecuteCell('cs', `setupParse source_frames: [ ${flowPrelude.stringify(result.result.destination_frame)}]`);
      }
    });
    const toggleInput = () => _selectedCell.toggleInput();
    const toggleOutput = () => _selectedCell.toggleOutput();
    const toggleAllInputs = () => {
      let cell;
      let _i;
      let _len;
      let _ref;
      const wereHidden = _areInputsHidden();
      _areInputsHidden(!wereHidden);
      if (wereHidden) {
        _ref = _cells();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          cell.autoResize();
        }
      }
    };
    const toggleAllOutputs = () => _areOutputsHidden(!_areOutputsHidden());
    const toggleSidebar = () => _isSidebarHidden(!_isSidebarHidden());
    const showBrowser = () => {
      _isSidebarHidden(false);
      return _.showBrowser();
    };
    const showOutline = () => {
      _isSidebarHidden(false);
      return _.showOutline();
    };
    const showClipboard = () => {
      _isSidebarHidden(false);
      return _.showClipboard();
    };
    function selectNextCell() {
      const cells = _cells();
      if (_selectedCellIndex !== cells.length - 1) {
        selectCell(cells[_selectedCellIndex + 1]);
      }
      return false;
    }
    const selectPreviousCell = () => {
      let cells;
      if (_selectedCellIndex !== 0) {
        cells = _cells();
        selectCell(cells[_selectedCellIndex - 1]);
      }
      return false;
    };
    const displayKeyboardShortcuts = () => $('#keyboardHelpDialog').modal();
    const findBuildProperty = caption => {
      let entry;
      if (Flow.BuildProperties) {
        entry = lodash.find(Flow.BuildProperties, entry => entry.caption === caption);
        if (entry) {
          return entry.value;
        }
        return void 0;
      }
      return void 0;
    };
    const getBuildProperties = () => {
      const projectVersion = findBuildProperty('H2O Build project version');
      return [
        findBuildProperty('H2O Build git branch'),
        projectVersion,
        projectVersion ? lodash.last(projectVersion.split('.')) : void 0,
        findBuildProperty('H2O Build git hash') || 'master',
      ];
    };
    const displayDocumentation = () => {
      const _ref = getBuildProperties();
      const gitBranch = _ref[0];
      const projectVersion = _ref[1];
      const buildVersion = _ref[2];
      const gitHash = _ref[3];
      if (buildVersion && buildVersion !== '99999') {
        return window.open(`http://h2o-release.s3.amazonaws.com/h2o/${gitBranch}/${buildVersion}/docs-website/h2o-docs/index.html`, '_blank');
      }
      return window.open(`https://github.com/h2oai/h2o-3/blob/${gitHash}/h2o-docs/src/product/flow/README.md`, '_blank');
    };
    const displayFAQ = () => {
      const _ref = getBuildProperties();
      const gitBranch = _ref[0];
      const projectVersion = _ref[1];
      const buildVersion = _ref[2];
      const gitHash = _ref[3];
      if (buildVersion && buildVersion !== '99999') {
        return window.open(`http://h2o-release.s3.amazonaws.com/h2o/${gitBranch}/${buildVersion}/docs-website/h2o-docs/index.html`, '_blank');
      }
      return window.open(`https://github.com/h2oai/h2o-3/blob/${gitHash}/h2o-docs/src/product/howto/FAQ.md`, '_blank');
    };
    const executeCommand = command => () => _.insertAndExecuteCell('cs', command);
    const displayAbout = () => $('#aboutDialog').modal();
    const shutdown = () => _.requestShutdown((error, result) => {
      if (error) {
        return _.growl(`Shutdown failed: ${error.message}`, 'danger');
      }
      return _.growl('Shutdown complete!', 'warning');
    });
    const showHelp = () => {
      _isSidebarHidden(false);
      return _.showHelp();
    };
    const createNotebook = () => _.confirm('This action will replace your active notebook.\nAre you sure you want to continue?', {
      acceptCaption: 'Create New Notebook',
      declineCaption: 'Cancel',
    }, accept => {
      let currentTime;
      if (accept) {
        currentTime = new Date().getTime();
        return deserialize('Untitled Flow', null, {
          cells: [{
            type: 'cs',
            input: '',
          }],
        });
      }
    });
    const duplicateNotebook = () => deserialize(`Copy of ${_localName()}`, null, serialize());
    const openNotebook = (name, doc) => deserialize(name, null, doc);
    function loadNotebook(name) {
      return _.requestObject('notebook', name, (error, doc) => {
        let _ref;
        if (error) {
          _ref = error.message;
          return _.alert((_ref) != null ? _ref : error);
        }
        return deserialize(name, name, doc);
      });
    }

    const exportNotebook = () => {
      const remoteName = _remoteName();
      if (remoteName) {
        return window.open(`/3/NodePersistentStorage.bin/notebook/${remoteName}`, '_blank');
      }
      return _.alert('Please save this notebook before exporting.');
    };
    const goToH2OUrl = url => () => window.open(window.Flow.ContextPath + url, '_blank');
    const goToUrl = url => () => window.open(url, '_blank');
    const executeAllCells = (fromBeginning, go) => {
      let cellIndex;
      let cells;
      _isRunningAll(true);
      cells = _cells().slice(0);
      const cellCount = cells.length;
      cellIndex = 0;
      if (!fromBeginning) {
        cells = cells.slice(_selectedCellIndex);
        cellIndex = _selectedCellIndex;
      }
      const executeNextCell = () => {
        let cell;
        if (_isRunningAll()) {
          cell = cells.shift();
          if (cell) {
            cell.scrollIntoView(true);
            cellIndex++;
            _runningCaption(`Running cell ${cellIndex} of ${cellCount}`);
            _runningPercent(`${Math.floor(100 * cellIndex / cellCount)}%`);
            _runningCellInput(cell.input());
            return cell.execute(errors => {
              if (errors) {
                return go('failed', errors);
              }
              return executeNextCell();
            });
          }
          return go('done');
        }
        return go('aborted');
      };
      return executeNextCell();
    };
    const runAllCells = fromBeginning => {
      if (fromBeginning == null) {
        fromBeginning = true;
      }
      return executeAllCells(fromBeginning, status => {
        _isRunningAll(false);
        switch (status) {
          case 'aborted':
            return _.growl('Stopped running your flow.', 'warning');
          case 'failed':
            return _.growl('Failed running your flow.', 'danger');
          default:
            return _.growl('Finished running your flow!', 'success');
        }
      });
    };
    const continueRunningAllCells = () => runAllCells(false);
    const stopRunningAll = () => _isRunningAll(false);
    const clearCell = () => {
      _selectedCell.clear();
      return _selectedCell.autoResize();
    };
    const clearAllCells = () => {
      let cell;
      let _i;
      let _len;
      const _ref = _cells();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        cell.clear();
        cell.autoResize();
      }
    };
    const notImplemented = () => {
    };
    const pasteCellandReplace = notImplemented;
    const mergeCellAbove = notImplemented;
    const startTour = notImplemented;
    const createMenu = (label, items) => ({
      label,
      items,
    });
    const createMenuHeader = label => ({
      label,
      action: null,
    });
    const createShortcutHint = shortcut => `<span style=\'float:right\'>${lodash.map(shortcut, key => `<kbd>${key}</kbd>`).join(' ')}</span>`;
    const createMenuItem = (label, action, shortcut) => {
      const kbds = shortcut ? createShortcutHint(shortcut) : '';
      return {
        label: `${lodash.escape(label)}${kbds}`,
        action,
      };
    };
    const menuDivider = {
      label: null,
      action: null,
    };
    const _menus = Flow.Dataflow.signal(null);
    menuCell = [
      createMenuItem('Run Cell', runCell, [
        'ctrl',
        'enter',
      ]),
      menuDivider,
      createMenuItem('Cut Cell', cutCell, ['x']),
      createMenuItem('Copy Cell', copyCell, ['c']),
      createMenuItem('Paste Cell Above', pasteCellAbove, [
        'shift',
        'v',
      ]),
      createMenuItem('Paste Cell Below', pasteCellBelow, ['v']),
      createMenuItem('Delete Cell', deleteCell, [
        'd',
        'd',
      ]),
      createMenuItem('Undo Delete Cell', undoLastDelete, ['z']),
      menuDivider,
      createMenuItem('Move Cell Up', moveCellUp, [
        'ctrl',
        'k',
      ]),
      createMenuItem('Move Cell Down', moveCellDown, [
        'ctrl',
        'j',
      ]),
      menuDivider,
      createMenuItem('Insert Cell Above', insertNewCellAbove, ['a']),
      createMenuItem('Insert Cell Below', insertNewCellBelow, ['b']),
      menuDivider,
      createMenuItem('Toggle Cell Input', toggleInput),
      createMenuItem('Toggle Cell Output', toggleOutput, ['o']),
      createMenuItem('Clear Cell Output', clearCell),
    ];
    const menuCellSW = [
      menuDivider,
      createMenuItem('Insert Scala Cell Above', insertNewScalaCellAbove),
      createMenuItem('Insert Scala Cell Below', insertNewScalaCellBelow),
    ];
    if (_.onSparklingWater) {
      menuCell = __slice.call(menuCell).concat(__slice.call(menuCellSW));
    }
    const initializeMenus = builder => {
      const modelMenuItems = lodash.map(builder, builder => createMenuItem(`${builder.algo_full_name}...`, executeCommand(`buildModel ${flowPrelude.stringify(builder.algo)}`))).concat([
        menuDivider,
        createMenuItem('List All Models', executeCommand('getModels')),
        createMenuItem('List Grid Search Results', executeCommand('getGrids')),
        createMenuItem('Import Model...', executeCommand('importModel')),
        createMenuItem('Export Model...', executeCommand('exportModel')),
      ]);
      return [
        createMenu('Flow', [
          createMenuItem('New Flow', createNotebook),
          createMenuItem('Open Flow...', promptForNotebook),
          createMenuItem('Save Flow', saveNotebook, ['s']),
          createMenuItem('Make a Copy...', duplicateNotebook),
          menuDivider,
          createMenuItem('Run All Cells', runAllCells),
          createMenuItem('Run All Cells Below', continueRunningAllCells),
          menuDivider,
          createMenuItem('Toggle All Cell Inputs', toggleAllInputs),
          createMenuItem('Toggle All Cell Outputs', toggleAllOutputs),
          createMenuItem('Clear All Cell Outputs', clearAllCells),
          menuDivider,
          createMenuItem('Download this Flow...', exportNotebook),
        ]),
        createMenu('Cell', menuCell),
        createMenu('Data', [
          createMenuItem('Import Files...', executeCommand('importFiles')),
          createMenuItem('Upload File...', uploadFile),
          createMenuItem('Split Frame...', executeCommand('splitFrame')),
          createMenuItem('Merge Frames...', executeCommand('mergeFrames')),
          menuDivider,
          createMenuItem('List All Frames', executeCommand('getFrames')),
          menuDivider,
          createMenuItem('Impute...', executeCommand('imputeColumn')),
        ]),
        createMenu('Model', modelMenuItems),
        createMenu('Score', [
          createMenuItem('Predict...', executeCommand('predict')),
          createMenuItem('Partial Dependence Plots...', executeCommand('buildPartialDependence')),
          menuDivider,
          createMenuItem('List All Predictions', executeCommand('getPredictions')),
        ]),
        createMenu('Admin', [
          createMenuItem('Jobs', executeCommand('getJobs')),
          createMenuItem('Cluster Status', executeCommand('getCloud')),
          createMenuItem('Water Meter (CPU meter)', goToH2OUrl('perfbar.html')),
          menuDivider,
          createMenuHeader('Inspect Log'),
          createMenuItem('View Log', executeCommand('getLogFile')),
          createMenuItem('Download Logs', goToH2OUrl('3/Logs/download')),
          menuDivider,
          createMenuHeader('Advanced'),
          createMenuItem('Create Synthetic Frame...', executeCommand('createFrame')),
          createMenuItem('Stack Trace', executeCommand('getStackTrace')),
          createMenuItem('Network Test', executeCommand('testNetwork')),
          createMenuItem('Profiler', executeCommand('getProfile depth: 10')),
          createMenuItem('Timeline', executeCommand('getTimeline')),
          createMenuItem('Shut Down', shutdown),
        ]),
        createMenu('Help', [
          createMenuItem('Assist Me', executeCommand('assist')),
          menuDivider,
          createMenuItem('Contents', showHelp),
          createMenuItem('Keyboard Shortcuts', displayKeyboardShortcuts, ['h']),
          menuDivider,
          createMenuItem('Documentation', displayDocumentation),
          createMenuItem('FAQ', displayFAQ),
          createMenuItem('H2O.ai', goToUrl('http://h2o.ai/')),
          createMenuItem('H2O on Github', goToUrl('https://github.com/h2oai/h2o-3')),
          createMenuItem('Report an issue', goToUrl('http://jira.h2o.ai')),
          createMenuItem('Forum / Ask a question', goToUrl('https://groups.google.com/d/forum/h2ostream')),
          menuDivider,
          createMenuItem('About', displayAbout),
        ]),
      ];
    };
    const setupMenus = () => _.requestModelBuilders((error, builders) => _menus(initializeMenus(error ? [] : builders)));
    const createTool = (icon, label, action, isDisabled) => {
      if (isDisabled == null) {
        isDisabled = false;
      }
      return {
        label,
        action,
        isDisabled,
        icon: `fa fa-${icon}`,
      };
    };
    const _toolbar = [
      [
        createTool('file-o', 'New', createNotebook),
        createTool('folder-open-o', 'Open', promptForNotebook),
        createTool('save', 'Save (s)', saveNotebook),
      ],
      [
        createTool('plus', 'Insert Cell Below (b)', insertNewCellBelow),
        createTool('arrow-up', 'Move Cell Up (ctrl+k)', moveCellUp),
        createTool('arrow-down', 'Move Cell Down (ctrl+j)', moveCellDown),
      ],
      [
        createTool('cut', 'Cut Cell (x)', cutCell),
        createTool('copy', 'Copy Cell (c)', copyCell),
        createTool('paste', 'Paste Cell Below (v)', pasteCellBelow),
        createTool('eraser', 'Clear Cell', clearCell),
        createTool('trash-o', 'Delete Cell (d d)', deleteCell),
      ],
      [
        createTool('step-forward', 'Run and Select Below', runCellAndSelectBelow),
        createTool('play', 'Run (ctrl+enter)', runCell),
        createTool('forward', 'Run All', runAllCells),
      ],
          [createTool('question-circle', 'Assist Me', executeCommand('assist'))],
    ];
    const normalModeKeyboardShortcuts = [
      [
        'enter',
        'edit mode',
        switchToEditMode,
      ],
      [
        'y',
        'to code',
        convertCellToCode,
      ],
      [
        'm',
        'to markdown',
        convertCellToMarkdown,
      ],
      [
        'r',
        'to raw',
        convertCellToRaw,
      ],
      [
        '1',
        'to heading 1',
        convertCellToHeading(1),
      ],
      [
        '2',
        'to heading 2',
        convertCellToHeading(2),
      ],
      [
        '3',
        'to heading 3',
        convertCellToHeading(3),
      ],
      [
        '4',
        'to heading 4',
        convertCellToHeading(4),
      ],
      [
        '5',
        'to heading 5',
        convertCellToHeading(5),
      ],
      [
        '6',
        'to heading 6',
        convertCellToHeading(6),
      ],
      [
        'up',
        'select previous cell',
        selectPreviousCell,
      ],
      [
        'down',
        'select next cell',
        selectNextCell,
      ],
      [
        'k',
        'select previous cell',
        selectPreviousCell,
      ],
      [
        'j',
        'select next cell',
        selectNextCell,
      ],
      [
        'ctrl+k',
        'move cell up',
        moveCellUp,
      ],
      [
        'ctrl+j',
        'move cell down',
        moveCellDown,
      ],
      [
        'a',
        'insert cell above',
        insertNewCellAbove,
      ],
      [
        'b',
        'insert cell below',
        insertNewCellBelow,
      ],
      [
        'x',
        'cut cell',
        cutCell,
      ],
      [
        'c',
        'copy cell',
        copyCell,
      ],
      [
        'shift+v',
        'paste cell above',
        pasteCellAbove,
      ],
      [
        'v',
        'paste cell below',
        pasteCellBelow,
      ],
      [
        'z',
        'undo last delete',
        undoLastDelete,
      ],
      [
        'd d',
        'delete cell (press twice)',
        deleteCell,
      ],
      [
        'shift+m',
        'merge cell below',
        mergeCellBelow,
      ],
      [
        's',
        'save notebook',
        saveNotebook,
      ],
      [
        'o',
        'toggle output',
        toggleOutput,
      ],
      [
        'h',
        'keyboard shortcuts',
        displayKeyboardShortcuts,
      ],
    ];
    if (_.onSparklingWater) {
      normalModeKeyboardShortcuts.push([
        'q',
        'to Scala',
        convertCellToScala,
      ]);
    }
    const editModeKeyboardShortcuts = [
      [
        'esc',
        'command mode',
        switchToCommandMode,
      ],
      [
        'ctrl+m',
        'command mode',
        switchToCommandMode,
      ],
      [
        'shift+enter',
        'run cell, select below',
        runCellAndSelectBelow,
      ],
      [
        'ctrl+enter',
        'run cell',
        runCell,
      ],
      [
        'alt+enter',
        'run cell, insert below',
        runCellAndInsertBelow,
      ],
      [
        'ctrl+shift+-',
        'split cell',
        splitCell,
      ],
      [
        'mod+s',
        'save notebook',
        saveNotebook,
      ],
    ];
    const toKeyboardHelp = shortcut => {
      const seq = shortcut[0];
      const caption = shortcut[1];
      const keystrokes = lodash.map(seq.split(/\+/g), key => `<kbd>${key}</kbd>`).join(' ');
      return {
        keystrokes,
        caption,
      };
    };
    const normalModeKeyboardShortcutsHelp = lodash.map(normalModeKeyboardShortcuts, toKeyboardHelp);
    const editModeKeyboardShortcutsHelp = lodash.map(editModeKeyboardShortcuts, toKeyboardHelp);
    const setupKeyboardHandling = mode => {
      let caption;
      let f;
      let shortcut;
      let _i;
      let _j;
      let _len;
      let _len1;
      let _ref;
      let _ref1;
      for (_i = 0, _len = normalModeKeyboardShortcuts.length; _i < _len; _i++) {
        _ref = normalModeKeyboardShortcuts[_i];
        shortcut = _ref[0];
        caption = _ref[1];
        f = _ref[2];
        Mousetrap.bind(shortcut, f);
      }
      for (_j = 0, _len1 = editModeKeyboardShortcuts.length; _j < _len1; _j++) {
        _ref1 = editModeKeyboardShortcuts[_j];
        shortcut = _ref1[0];
        caption = _ref1[1];
        f = _ref1[2];
        Mousetrap.bindGlobal(shortcut, f);
      }
    };
    const initialize = () => {
      setupKeyboardHandling('normal');
      setupMenus();
      Flow.Dataflow.link(_.load, loadNotebook);
      Flow.Dataflow.link(_.open, openNotebook);
      Flow.Dataflow.link(_.selectCell, selectCell);
      Flow.Dataflow.link(_.executeAllCells, executeAllCells);
      Flow.Dataflow.link(_.insertAndExecuteCell, (type, input) => lodash.defer(appendCellAndRun, type, input));
      Flow.Dataflow.link(_.insertCell, (type, input) => lodash.defer(insertCellBelow, type, input));
      Flow.Dataflow.link(_.saved, () => _.growl('Notebook saved.'));
      Flow.Dataflow.link(_.loaded, () => _.growl('Notebook loaded.'));
      executeCommand('assist')();
      _.setDirty();
      if (_.onSparklingWater) {
        return _initializeInterpreter();
      }
    };
    Flow.Dataflow.link(_.ready, initialize);
    return {
      name: _localName,
      isEditingName: _isEditingName,
      editName,
      saveName,
      menus: _menus,
      sidebar: _sidebar,
      status: _status,
      toolbar: _toolbar,
      cells: _cells,
      areInputsHidden: _areInputsHidden,
      areOutputsHidden: _areOutputsHidden,
      isSidebarHidden: _isSidebarHidden,
      isRunningAll: _isRunningAll,
      runningCaption: _runningCaption,
      runningPercent: _runningPercent,
      runningCellInput: _runningCellInput,
      stopRunningAll,
      toggleSidebar,
      shortcutsHelp: {
        normalMode: normalModeKeyboardShortcutsHelp,
        editMode: editModeKeyboardShortcutsHelp,
      },
      about: _about,
      dialogs: _dialogs,
      templateOf(view) {
        return view.template;
      },
    };
  };
}
