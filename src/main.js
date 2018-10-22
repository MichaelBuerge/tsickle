#!/usr/bin/env node
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/main", ["require", "exports", "fs", "minimist", "mkdirp", "path", "tsickle/src/typescript", "tsickle/src/cli_support", "tsickle/src/tsickle", "tsickle/src/tsickle"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var minimist = require("minimist");
    var mkdirp = require("mkdirp");
    var path = require("path");
    var ts = require("tsickle/src/typescript");
    var cliSupport = require("tsickle/src/cli_support");
    var tsickle = require("tsickle/src/tsickle");
    var tsickle_1 = require("tsickle/src/tsickle");
    function usage() {
        console.error("usage: tsickle [tsickle options] -- [tsc options]\n\nexample:\n  tsickle --externs=foo/externs.js -- -p src --noImplicitAny\n\ntsickle flags are:\n  --externs=PATH        save generated Closure externs.js to PATH\n  --typed               [experimental] attempt to provide Closure types instead of {?}\n  --enableAutoQuoting   automatically apply quotes to property accesses\n  --untyped             No types (emits ? in type annotations, no forward declarations).\n");
    }
    /**
     * Parses the command-line arguments, extracting the tsickle settings and
     * the arguments to pass on to tsc.
     */
    function loadSettingsFromArgs(args) {
        var e_1, _a;
        var settings = {};
        var parsedArgs = minimist(args);
        try {
            for (var _b = __values(Object.keys(parsedArgs)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var flag = _c.value;
                switch (flag) {
                    case 'h':
                    case 'help':
                        usage();
                        process.exit(0);
                        break;
                    case 'externs':
                        settings.externsPath = parsedArgs[flag];
                        break;
                    case 'typed':
                        settings.isTyped = true;
                        break;
                    case 'verbose':
                        settings.verbose = true;
                        break;
                    case 'enableAutoQuoting':
                        settings.enableAutoQuoting = true;
                        break;
                    case 'untyped':
                        settings.untyped = true;
                        break;
                    case '_':
                        // This is part of the minimist API, and holds args after the '--'.
                        break;
                    default:
                        console.error("unknown flag '--" + flag + "'");
                        usage();
                        process.exit(1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Arguments after the '--' arg are arguments to tsc.
        var tscArgs = parsedArgs['_'];
        return { settings: settings, tscArgs: tscArgs };
    }
    /**
     * Determine the lowest-level common parent directory of the given list of files.
     */
    function getCommonParentDirectory(fileNames) {
        var pathSplitter = /[\/\\]+/;
        var commonParent = fileNames[0].split(pathSplitter);
        for (var i = 1; i < fileNames.length; i++) {
            var thisPath = fileNames[i].split(pathSplitter);
            var j = 0;
            while (thisPath[j] === commonParent[j]) {
                j++;
            }
            commonParent.length = j; // Truncate without copying the array
        }
        if (commonParent.length === 0) {
            return '/';
        }
        else {
            return commonParent.join(path.sep);
        }
    }
    exports.getCommonParentDirectory = getCommonParentDirectory;
    /**
     * Loads the tsconfig.json from a directory.
     *
     * TODO(martinprobst): use ts.findConfigFile to match tsc behaviour.
     *
     * @param args tsc command-line arguments.
     */
    function loadTscConfig(args) {
        var _a;
        // Gather tsc options/input files from command line.
        var _b = ts.parseCommandLine(args), options = _b.options, fileNames = _b.fileNames, errors = _b.errors;
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // Store file arguments
        var tsFileArguments = fileNames;
        // Read further settings from tsconfig.json.
        var projectDir = options.project || '.';
        var configFileName = path.join(projectDir, 'tsconfig.json');
        var _c = ts.readConfigFile(configFileName, function (path) { return fs.readFileSync(path, 'utf-8'); }), json = _c.config, error = _c.error;
        if (error) {
            return { options: {}, fileNames: [], errors: [error] };
        }
        (_a = ts.parseJsonConfigFileContent(json, ts.sys, projectDir, options, configFileName), options = _a.options, fileNames = _a.fileNames, errors = _a.errors);
        if (errors.length > 0) {
            return { options: {}, fileNames: [], errors: errors };
        }
        // if file arguments were given to the typescript transpiler then transpile only those files
        fileNames = tsFileArguments.length > 0 ? tsFileArguments : fileNames;
        return { options: options, fileNames: fileNames, errors: [] };
    }
    /**
     * Compiles TypeScript code into Closure-compiler-ready JS.
     */
    function toClosureJS(options, fileNames, settings, writeFile) {
        // Use absolute paths to determine what files to process since files may be imported using
        // relative or absolute paths
        var absoluteFileNames = fileNames.map(function (i) { return path.resolve(i); });
        var compilerHost = ts.createCompilerHost(options);
        var program = ts.createProgram(absoluteFileNames, options, compilerHost);
        var filesToProcess = new Set(absoluteFileNames);
        var rootModulePath = options.rootDir || getCommonParentDirectory(absoluteFileNames);
        var transformerHost = {
            shouldSkipTsickleProcessing: function (fileName) {
                return !filesToProcess.has(path.resolve(fileName));
            },
            shouldIgnoreWarningsForPath: function (fileName) { return false; },
            pathToModuleName: function (context, fileName) {
                return cliSupport.pathToModuleName(rootModulePath, context, fileName);
            },
            fileNameToModuleId: function (fileName) { return path.relative(rootModulePath, fileName); },
            es5Mode: true,
            googmodule: true,
            transformDecorators: true,
            transformTypesToClosure: true,
            typeBlackListPaths: new Set(),
            enableAutoQuoting: settings.enableAutoQuoting,
            untyped: settings.untyped,
            logWarning: function (warning) { return console.error(ts.formatDiagnostics([warning], compilerHost)); },
            options: options,
            host: compilerHost,
        };
        var diagnostics = ts.getPreEmitDiagnostics(program);
        if (diagnostics.length > 0) {
            return {
                diagnostics: diagnostics,
                modulesManifest: new tsickle_1.ModulesManifest(),
                externs: {},
                emitSkipped: true,
                emittedFiles: [],
            };
        }
        return tsickle.emitWithTsickle(program, transformerHost, compilerHost, options, undefined, writeFile);
    }
    exports.toClosureJS = toClosureJS;
    function main(args) {
        var _a = loadSettingsFromArgs(args), settings = _a.settings, tscArgs = _a.tscArgs;
        var config = loadTscConfig(tscArgs);
        if (config.errors.length) {
            console.error(ts.formatDiagnostics(config.errors, ts.createCompilerHost(config.options)));
            return 1;
        }
        if (config.options.module !== ts.ModuleKind.CommonJS) {
            // This is not an upstream TypeScript diagnostic, therefore it does not go
            // through the diagnostics array mechanism.
            console.error('tsickle converts TypeScript modules to Closure modules via CommonJS internally. ' +
                'Set tsconfig.js "module": "commonjs"');
            return 1;
        }
        // Run tsickle+TSC to convert inputs to Closure JS files.
        var result = toClosureJS(config.options, config.fileNames, settings, function (filePath, contents) {
            mkdirp.sync(path.dirname(filePath));
            fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
        });
        if (result.diagnostics.length) {
            console.error(ts.formatDiagnostics(result.diagnostics, ts.createCompilerHost(config.options)));
            return 1;
        }
        if (settings.externsPath) {
            mkdirp.sync(path.dirname(settings.externsPath));
            fs.writeFileSync(settings.externsPath, tsickle.getGeneratedExterns(result.externs, config.options.rootDir || ''));
        }
        return 0;
    }
    // CLI entry point
    if (require.main === module) {
        process.exit(main(process.argv.splice(2)));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFVQSx1QkFBeUI7SUFDekIsbUNBQXFDO0lBQ3JDLCtCQUFpQztJQUNqQywyQkFBNkI7SUFDN0IsMkNBQW1DO0lBRW5DLG9EQUE0QztJQUM1Qyw2Q0FBcUM7SUFDckMsK0NBQTBDO0lBb0IxQztRQUNFLE9BQU8sQ0FBQyxLQUFLLENBQUMsbWRBVWYsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILDhCQUE4QixJQUFjOztRQUMxQyxJQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztZQUNsQyxLQUFtQixJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO2dCQUF2QyxJQUFNLElBQUksV0FBQTtnQkFDYixRQUFRLElBQUksRUFBRTtvQkFDWixLQUFLLEdBQUcsQ0FBQztvQkFDVCxLQUFLLE1BQU07d0JBQ1QsS0FBSyxFQUFFLENBQUM7d0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsTUFBTTtvQkFDUixLQUFLLFNBQVM7d0JBQ1osUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hDLE1BQU07b0JBQ1IsS0FBSyxPQUFPO3dCQUNWLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUN4QixNQUFNO29CQUNSLEtBQUssU0FBUzt3QkFDWixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDeEIsTUFBTTtvQkFDUixLQUFLLG1CQUFtQjt3QkFDdEIsUUFBUSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQzt3QkFDbEMsTUFB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QUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLGFBQWEsQ0FDWixRQUFRLENBQUMsV0FBVyxFQUNwQixPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG1pbmltaXN0IGZyb20gJ21pbmltaXN0JztcbmltcG9ydCAqIGFzIG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbmltcG9ydCAqIGFzIGNsaVN1cHBvcnQgZnJvbSAnLi9jbGlfc3VwcG9ydCc7XG5pbXBvcnQgKiBhcyB0c2lja2xlIGZyb20gJy4vdHNpY2tsZSc7XG5pbXBvcnQge01vZHVsZXNNYW5pZmVzdH0gZnJvbSAnLi90c2lja2xlJztcblxuLyoqIFRzaWNrbGUgc2V0dGluZ3MgcGFzc2VkIG9uIHRoZSBjb21tYW5kIGxpbmUuICovXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzIHtcbiAgLyoqIElmIHByb3ZpZGVkLCBtb2RpZnkgcXVvdGluZyBvZiBwcm9wZXJ0eSBhY2Nlc3NlcyB0byBtYXRjaCB0aGUgdHlwZSBkZWNsYXJhdGlvbi4gKi9cbiAgZW5hYmxlQXV0b1F1b3Rpbmc/OiBib29sZWFuO1xuXG4gIC8qKiBJZiBwcm92aWRlZCwgcGF0aCB0byBzYXZlIGV4dGVybnMgdG8uICovXG4gIGV4dGVybnNQYXRoPzogc3RyaW5nO1xuXG4gIC8qKiBJZiBwcm92aWRlZCwgYXR0ZW1wdCB0byBwcm92aWRlIHR5cGVzIHJhdGhlciB0aGFuIHs/fS4gKi9cbiAgaXNUeXBlZD86IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUsIGxvZyBpbnRlcm5hbCBkZWJ1ZyB3YXJuaW5ncyB0byB0aGUgY29uc29sZS4gKi9cbiAgdmVyYm9zZT86IGJvb2xlYW47XG5cbiAgLyoqIE5vIHR5cGVzIChlbWl0cyA/IGluIHR5cGUgYW5ub3RhdGlvbnMsIG5vIGZvcndhcmQgZGVjbGFyYXRpb25zKS4gKi9cbiAgdW50eXBlZD86IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHVzYWdlKCkge1xuICBjb25zb2xlLmVycm9yKGB1c2FnZTogdHNpY2tsZSBbdHNpY2tsZSBvcHRpb25zXSAtLSBbdHNjIG9wdGlvbnNdXG5cbmV4YW1wbGU6XG4gIHRzaWNrbGUgLS1leHRlcm5zPWZvby9leHRlcm5zLmpzIC0tIC1wIHNyYyAtLW5vSW1wbGljaXRBbnlcblxudHNpY2tsZSBmbGFncyBhcmU6XG4gIC0tZXh0ZXJucz1QQVRIICAgICAgICBzYXZlIGdlbmVyYXRlZCBDbG9zdXJlIGV4dGVybnMuanMgdG8gUEFUSFxuICAtLXR5cGVkICAgICAgICAgICAgICAgW2V4cGVyaW1lbnRhbF0gYXR0ZW1wdCB0byBwcm92aWRlIENsb3N1cmUgdHlwZXMgaW5zdGVhZCBvZiB7P31cbiAgLS1lbmFibGVBdXRvUXVvdGluZyAgIGF1dG9tYXRpY2FsbHkgYXBwbHkgcXVvdGVzIHRvIHByb3BlcnR5IGFjY2Vzc2VzXG4gIC0tdW50eXBlZCAgICAgICAgICAgICBObyB0eXBlcyAoZW1pdHMgPyBpbiB0eXBlIGFubm90YXRpb25zLCBubyBmb3J3YXJkIGRlY2xhcmF0aW9ucykuXG5gKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIGNvbW1hbmQtbGluZSBhcmd1bWVudHMsIGV4dHJhY3RpbmcgdGhlIHRzaWNrbGUgc2V0dGluZ3MgYW5kXG4gKiB0aGUgYXJndW1lbnRzIHRvIHBhc3Mgb24gdG8gdHNjLlxuICovXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3NGcm9tQXJncyhhcmdzOiBzdHJpbmdbXSk6IHtzZXR0aW5nczogU2V0dGluZ3MsIHRzY0FyZ3M6IHN0cmluZ1tdfSB7XG4gIGNvbnN0IHNldHRpbmdzOiBTZXR0aW5ncyA9IHt9O1xuICBjb25zdCBwYXJzZWRBcmdzID0gbWluaW1pc3QoYXJncyk7XG4gIGZvciAoY29uc3QgZmxhZyBvZiBPYmplY3Qua2V5cyhwYXJzZWRBcmdzKSkge1xuICAgIHN3aXRjaCAoZmxhZykge1xuICAgICAgY2FzZSAnaCc6XG4gICAgICBjYXNlICdoZWxwJzpcbiAgICAgICAgdXNhZ2UoKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2V4dGVybnMnOlxuICAgICAgICBzZXR0aW5ncy5leHRlcm5zUGF0aCA9IHBhcnNlZEFyZ3NbZmxhZ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHlwZWQnOlxuICAgICAgICBzZXR0aW5ncy5pc1R5cGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd2ZXJib3NlJzpcbiAgICAgICAgc2V0dGluZ3MudmVyYm9zZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZW5hYmxlQXV0b1F1b3RpbmcnOlxuICAgICAgICBzZXR0aW5ncy5lbmFibGVBdXRvUXVvdGluZyA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW50eXBlZCc6XG4gICAgICAgIHNldHRpbmdzLnVudHlwZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ18nOlxuICAgICAgICAvLyBUaGlzIGlzIHBhcnQgb2YgdGhlIG1pbmltaXN0IEFQSSwgYW5kIGhvbGRzIGFyZ3MgYWZ0ZXIgdGhlICctLScuXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5lcnJvcihgdW5rbm93biBmbGFnICctLSR7ZmxhZ30nYCk7XG4gICAgICAgIHVzYWdlKCk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH1cbiAgLy8gQXJndW1lbnRzIGFmdGVyIHRoZSAnLS0nIGFyZyBhcmUgYXJndW1lbnRzIHRvIHRzYy5cbiAgY29uc3QgdHNjQXJncyA9IHBhcnNlZEFyZ3NbJ18nXTtcbiAgcmV0dXJuIHtzZXR0aW5ncywgdHNjQXJnc307XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIHRoZSBsb3dlc3QtbGV2ZWwgY29tbW9uIHBhcmVudCBkaXJlY3Rvcnkgb2YgdGhlIGdpdmVuIGxpc3Qgb2YgZmlsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21tb25QYXJlbnREaXJlY3RvcnkoZmlsZU5hbWVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhdGhTcGxpdHRlciA9IC9bXFwvXFxcXF0rLztcbiAgY29uc3QgY29tbW9uUGFyZW50ID0gZmlsZU5hbWVzWzBdLnNwbGl0KHBhdGhTcGxpdHRlcik7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZmlsZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgdGhpc1BhdGggPSBmaWxlTmFtZXNbaV0uc3BsaXQocGF0aFNwbGl0dGVyKTtcbiAgICBsZXQgaiA9IDA7XG4gICAgd2hpbGUgKHRoaXNQYXRoW2pdID09PSBjb21tb25QYXJlbnRbal0pIHtcbiAgICAgIGorKztcbiAgICB9XG4gICAgY29tbW9uUGFyZW50Lmxlbmd0aCA9IGo7ICAvLyBUcnVuY2F0ZSB3aXRob3V0IGNvcHlpbmcgdGhlIGFycmF5XG4gIH1cbiAgaWYgKGNvbW1vblBhcmVudC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJy8nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb21tb25QYXJlbnQuam9pbihwYXRoLnNlcCk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb2FkcyB0aGUgdHNjb25maWcuanNvbiBmcm9tIGEgZGlyZWN0b3J5LlxuICpcbiAqIFRPRE8obWFydGlucHJvYnN0KTogdXNlIHRzLmZpbmRDb25maWdGaWxlIHRvIG1hdGNoIHRzYyBiZWhhdmlvdXIuXG4gKlxuICogQHBhcmFtIGFyZ3MgdHNjIGNvbW1hbmQtbGluZSBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIGxvYWRUc2NDb25maWcoYXJnczogc3RyaW5nW10pOlxuICAgIHtvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGZpbGVOYW1lczogc3RyaW5nW10sIGVycm9yczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gIC8vIEdhdGhlciB0c2Mgb3B0aW9ucy9pbnB1dCBmaWxlcyBmcm9tIGNvbW1hbmQgbGluZS5cbiAgbGV0IHtvcHRpb25zLCBmaWxlTmFtZXMsIGVycm9yc30gPSB0cy5wYXJzZUNvbW1hbmRMaW5lKGFyZ3MpO1xuICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge29wdGlvbnM6IHt9LCBmaWxlTmFtZXM6IFtdLCBlcnJvcnN9O1xuICB9XG5cbiAgLy8gU3RvcmUgZmlsZSBhcmd1bWVudHNcbiAgY29uc3QgdHNGaWxlQXJndW1lbnRzID0gZmlsZU5hbWVzO1xuXG4gIC8vIFJlYWQgZnVydGhlciBzZXR0aW5ncyBmcm9tIHRzY29uZmlnLmpzb24uXG4gIGNvbnN0IHByb2plY3REaXIgPSBvcHRpb25zLnByb2plY3QgfHwgJy4nO1xuICBjb25zdCBjb25maWdGaWxlTmFtZSA9IHBhdGguam9pbihwcm9qZWN0RGlyLCAndHNjb25maWcuanNvbicpO1xuICBjb25zdCB7Y29uZmlnOiBqc29uLCBlcnJvcn0gPVxuICAgICAgdHMucmVhZENvbmZpZ0ZpbGUoY29uZmlnRmlsZU5hbWUsIHBhdGggPT4gZnMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGYtOCcpKTtcbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIHtvcHRpb25zOiB7fSwgZmlsZU5hbWVzOiBbXSwgZXJyb3JzOiBbZXJyb3JdfTtcbiAgfVxuICAoe29wdGlvbnMsIGZpbGVOYW1lcywgZXJyb3JzfSA9XG4gICAgICAgdHMucGFyc2VKc29uQ29uZmlnRmlsZUNvbnRlbnQoanNvbiwgdHMuc3lzLCBwcm9qZWN0RGlyLCBvcHRpb25zLCBjb25maWdGaWxlTmFtZSkpO1xuICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge29wdGlvbnM6IHt9LCBmaWxlTmFtZXM6IFtdLCBlcnJvcnN9O1xuICB9XG5cbiAgLy8gaWYgZmlsZSBhcmd1bWVudHMgd2VyZSBnaXZlbiB0byB0aGUgdHlwZXNjcmlwdCB0cmFuc3BpbGVyIHRoZW4gdHJhbnNwaWxlIG9ubHkgdGhvc2UgZmlsZXNcbiAgZmlsZU5hbWVzID0gdHNGaWxlQXJndW1lbnRzLmxlbmd0aCA+IDAgPyB0c0ZpbGVBcmd1bWVudHMgOiBmaWxlTmFtZXM7XG5cbiAgcmV0dXJuIHtvcHRpb25zLCBmaWxlTmFtZXMsIGVycm9yczogW119O1xufVxuXG4vKipcbiAqIENvbXBpbGVzIFR5cGVTY3JpcHQgY29kZSBpbnRvIENsb3N1cmUtY29tcGlsZXItcmVhZHkgSlMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0Nsb3N1cmVKUyhcbiAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIGZpbGVOYW1lczogc3RyaW5nW10sIHNldHRpbmdzOiBTZXR0aW5ncyxcbiAgICB3cml0ZUZpbGU/OiB0cy5Xcml0ZUZpbGVDYWxsYmFjayk6IHRzaWNrbGUuRW1pdFJlc3VsdCB7XG4gIC8vIFVzZSBhYnNvbHV0ZSBwYXRocyB0byBkZXRlcm1pbmUgd2hhdCBmaWxlcyB0byBwcm9jZXNzIHNpbmNlIGZpbGVzIG1heSBiZSBpbXBvcnRlZCB1c2luZ1xuICAvLyByZWxhdGl2ZSBvciBhYnNvbHV0ZSBwYXRoc1xuICBjb25zdCBhYnNvbHV0ZUZpbGVOYW1lcyA9IGZpbGVOYW1lcy5tYXAoaSA9PiBwYXRoLnJlc29sdmUoaSkpO1xuXG4gIGNvbnN0IGNvbXBpbGVySG9zdCA9IHRzLmNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zKTtcbiAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0oYWJzb2x1dGVGaWxlTmFtZXMsIG9wdGlvbnMsIGNvbXBpbGVySG9zdCk7XG4gIGNvbnN0IGZpbGVzVG9Qcm9jZXNzID0gbmV3IFNldChhYnNvbHV0ZUZpbGVOYW1lcyk7XG4gIGNvbnN0IHJvb3RNb2R1bGVQYXRoID0gb3B0aW9ucy5yb290RGlyIHx8IGdldENvbW1vblBhcmVudERpcmVjdG9yeShhYnNvbHV0ZUZpbGVOYW1lcyk7XG4gIGNvbnN0IHRyYW5zZm9ybWVySG9zdDogdHNpY2tsZS5Uc2lja2xlSG9zdCA9IHtcbiAgICBzaG91bGRTa2lwVHNpY2tsZVByb2Nlc3Npbmc6IChmaWxlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gIWZpbGVzVG9Qcm9jZXNzLmhhcyhwYXRoLnJlc29sdmUoZmlsZU5hbWUpKTtcbiAgICB9LFxuICAgIHNob3VsZElnbm9yZVdhcm5pbmdzRm9yUGF0aDogKGZpbGVOYW1lOiBzdHJpbmcpID0+IGZhbHNlLFxuICAgIHBhdGhUb01vZHVsZU5hbWU6IChjb250ZXh0LCBmaWxlTmFtZSkgPT5cbiAgICAgICAgY2xpU3VwcG9ydC5wYXRoVG9Nb2R1bGVOYW1lKHJvb3RNb2R1bGVQYXRoLCBjb250ZXh0LCBmaWxlTmFtZSksXG4gICAgZmlsZU5hbWVUb01vZHVsZUlkOiAoZmlsZU5hbWUpID0+IHBhdGgucmVsYXRpdmUocm9vdE1vZHVsZVBhdGgsIGZpbGVOYW1lKSxcbiAgICBlczVNb2RlOiB0cnVlLFxuICAgIGdvb2dtb2R1bGU6IHRydWUsXG4gICAgdHJhbnNmb3JtRGVjb3JhdG9yczogdHJ1ZSxcbiAgICB0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZTogdHJ1ZSxcbiAgICB0eXBlQmxhY2tMaXN0UGF0aHM6IG5ldyBTZXQoKSxcbiAgICBlbmFibGVBdXRvUXVvdGluZzogc2V0dGluZ3MuZW5hYmxlQXV0b1F1b3RpbmcsXG4gICAgdW50eXBlZDogc2V0dGluZ3MudW50eXBlZCxcbiAgICBsb2dXYXJuaW5nOiAod2FybmluZykgPT4gY29uc29sZS5lcnJvcih0cy5mb3JtYXREaWFnbm9zdGljcyhbd2FybmluZ10sIGNvbXBpbGVySG9zdCkpLFxuICAgIG9wdGlvbnMsXG4gICAgaG9zdDogY29tcGlsZXJIb3N0LFxuICB9O1xuICBjb25zdCBkaWFnbm9zdGljcyA9IHRzLmdldFByZUVtaXREaWFnbm9zdGljcyhwcm9ncmFtKTtcbiAgaWYgKGRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGlhZ25vc3RpY3MsXG4gICAgICBtb2R1bGVzTWFuaWZlc3Q6IG5ldyBNb2R1bGVzTWFuaWZlc3QoKSxcbiAgICAgIGV4dGVybnM6IHt9LFxuICAgICAgZW1pdFNraXBwZWQ6IHRydWUsXG4gICAgICBlbWl0dGVkRmlsZXM6IFtdLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHRzaWNrbGUuZW1pdFdpdGhUc2lja2xlKFxuICAgICAgcHJvZ3JhbSwgdHJhbnNmb3JtZXJIb3N0LCBjb21waWxlckhvc3QsIG9wdGlvbnMsIHVuZGVmaW5lZCwgd3JpdGVGaWxlKTtcbn1cblxuZnVuY3Rpb24gbWFpbihhcmdzOiBzdHJpbmdbXSk6IG51bWJlciB7XG4gIGNvbnN0IHtzZXR0aW5ncywgdHNjQXJnc30gPSBsb2FkU2V0dGluZ3NGcm9tQXJncyhhcmdzKTtcbiAgY29uc3QgY29uZmlnID0gbG9hZFRzY0NvbmZpZyh0c2NBcmdzKTtcbiAgaWYgKGNvbmZpZy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5lcnJvcih0cy5mb3JtYXREaWFnbm9zdGljcyhjb25maWcuZXJyb3JzLCB0cy5jcmVhdGVDb21waWxlckhvc3QoY29uZmlnLm9wdGlvbnMpKSk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBpZiAoY29uZmlnLm9wdGlvbnMubW9kdWxlICE9PSB0cy5Nb2R1bGVLaW5kLkNvbW1vbkpTKSB7XG4gICAgLy8gVGhpcyBpcyBub3QgYW4gdXBzdHJlYW0gVHlwZVNjcmlwdCBkaWFnbm9zdGljLCB0aGVyZWZvcmUgaXQgZG9lcyBub3QgZ29cbiAgICAvLyB0aHJvdWdoIHRoZSBkaWFnbm9zdGljcyBhcnJheSBtZWNoYW5pc20uXG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ3RzaWNrbGUgY29udmVydHMgVHlwZVNjcmlwdCBtb2R1bGVzIHRvIENsb3N1cmUgbW9kdWxlcyB2aWEgQ29tbW9uSlMgaW50ZXJuYWxseS4gJyArXG4gICAgICAgICdTZXQgdHNjb25maWcuanMgXCJtb2R1bGVcIjogXCJjb21tb25qc1wiJyk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvLyBSdW4gdHNpY2tsZStUU0MgdG8gY29udmVydCBpbnB1dHMgdG8gQ2xvc3VyZSBKUyBmaWxlcy5cbiAgY29uc3QgcmVzdWx0ID0gdG9DbG9zdXJlSlMoXG4gICAgICBjb25maWcub3B0aW9ucywgY29uZmlnLmZpbGVOYW1lcywgc2V0dGluZ3MsIChmaWxlUGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSA9PiB7XG4gICAgICAgIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShmaWxlUGF0aCkpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBjb250ZW50cywge2VuY29kaW5nOiAndXRmLTgnfSk7XG4gICAgICB9KTtcbiAgaWYgKHJlc3VsdC5kaWFnbm9zdGljcy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKHRzLmZvcm1hdERpYWdub3N0aWNzKHJlc3VsdC5kaWFnbm9zdGljcywgdHMuY3JlYXRlQ29tcGlsZXJIb3N0KGNvbmZpZy5vcHRpb25zKSkpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgaWYgKHNldHRpbmdzLmV4dGVybnNQYXRoKSB7XG4gICAgbWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKHNldHRpbmdzLmV4dGVybnNQYXRoKSk7XG4gICAgZnMud3JpdGVGaWxlU3luYyhcbiAgICAgICAgc2V0dGluZ3MuZXh0ZXJuc1BhdGgsXG4gICAgICAgIHRzaWNrbGUuZ2V0R2VuZXJhdGVkRXh0ZXJucyhyZXN1bHQuZXh0ZXJucywgY29uZmlnLm9wdGlvbnMucm9vdERpciB8fCAnJykpO1xuICB9XG4gIHJldHVybiAwO1xufVxuXG4vLyBDTEkgZW50cnkgcG9pbnRcbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBwcm9jZXNzLmV4aXQobWFpbihwcm9jZXNzLmFyZ3Yuc3BsaWNlKDIpKSk7XG59XG4iXX0=