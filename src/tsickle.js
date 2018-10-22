/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/tsickle", ["require", "exports", "tsickle/src/cli_support", "tsickle/src/decorator_downlevel_transformer", "tsickle/src/enum_transformer", "tsickle/src/externs", "tsickle/src/fileoverview_comment_transformer", "tsickle/src/googmodule", "tsickle/src/jsdoc_transformer", "tsickle/src/modules_manifest", "tsickle/src/quoting_transformer", "tsickle/src/transformer_util", "tsickle/src/typescript", "tsickle/src/externs", "tsickle/src/modules_manifest"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var cli_support_1 = require("tsickle/src/cli_support");
    var decorator_downlevel_transformer_1 = require("tsickle/src/decorator_downlevel_transformer");
    var enum_transformer_1 = require("tsickle/src/enum_transformer");
    var externs_1 = require("tsickle/src/externs");
    var fileoverview_comment_transformer_1 = require("tsickle/src/fileoverview_comment_transformer");
    var googmodule = require("tsickle/src/googmodule");
    var jsdoc_transformer_1 = require("tsickle/src/jsdoc_transformer");
    var modules_manifest_1 = require("tsickle/src/modules_manifest");
    var quoting_transformer_1 = require("tsickle/src/quoting_transformer");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    // Retained here for API compatibility.
    var externs_2 = require("tsickle/src/externs");
    exports.getGeneratedExterns = externs_2.getGeneratedExterns;
    var modules_manifest_2 = require("tsickle/src/modules_manifest");
    exports.ModulesManifest = modules_manifest_2.ModulesManifest;
    function mergeEmitResults(emitResults) {
        var e_1, _a;
        var diagnostics = [];
        var emitSkipped = true;
        var emittedFiles = [];
        var externs = {};
        var modulesManifest = new modules_manifest_1.ModulesManifest();
        try {
            for (var emitResults_1 = __values(emitResults), emitResults_1_1 = emitResults_1.next(); !emitResults_1_1.done; emitResults_1_1 = emitResults_1.next()) {
                var er = emitResults_1_1.value;
                diagnostics.push.apply(diagnostics, __spread(er.diagnostics));
                emitSkipped = emitSkipped || er.emitSkipped;
                emittedFiles.push.apply(emittedFiles, __spread(er.emittedFiles));
                Object.assign(externs, er.externs);
                modulesManifest.addManifest(er.modulesManifest);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (emitResults_1_1 && !emitResults_1_1.done && (_a = emitResults_1.return)) _a.call(emitResults_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return { diagnostics: diagnostics, emitSkipped: emitSkipped, emittedFiles: emittedFiles, externs: externs, modulesManifest: modulesManifest };
    }
    exports.mergeEmitResults = mergeEmitResults;
    function emitWithTsickle(program, host, tsHost, tsOptions, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers) {
        if (customTransformers === void 0) { customTransformers = {}; }
        var e_2, _a, e_3, _b;
        try {
            for (var _c = __values(program.getSourceFiles()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var sf = _d.value;
                cli_support_1.assertAbsolute(sf.fileName);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var tsickleDiagnostics = [];
        var typeChecker = program.getTypeChecker();
        var tsickleSourceTransformers = [];
        if (host.transformTypesToClosure) {
            // Only add @suppress {checkTypes} comments when also adding type annotations.
            tsickleSourceTransformers.push(fileoverview_comment_transformer_1.transformFileoverviewCommentFactory(tsickleDiagnostics));
            tsickleSourceTransformers.push(jsdoc_transformer_1.jsdocTransformer(host, tsOptions, tsHost, typeChecker, tsickleDiagnostics));
            if (host.enableAutoQuoting) {
                tsickleSourceTransformers.push(quoting_transformer_1.quotingTransformer(host, typeChecker, tsickleDiagnostics));
            }
            tsickleSourceTransformers.push(enum_transformer_1.enumTransformer(typeChecker, tsickleDiagnostics));
            tsickleSourceTransformers.push(decorator_downlevel_transformer_1.decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
        }
        else if (host.transformDecorators) {
            tsickleSourceTransformers.push(decorator_downlevel_transformer_1.decoratorDownlevelTransformer(typeChecker, tsickleDiagnostics));
        }
        var modulesManifest = new modules_manifest_1.ModulesManifest();
        var tsickleTransformers = { before: tsickleSourceTransformers };
        var tsTransformers = {
            before: __spread((customTransformers.beforeTsickle || []), (tsickleTransformers.before || []).map(function (tf) { return skipTransformForSourceFileIfNeeded(host, tf); }), (customTransformers.beforeTs || [])),
            after: __spread((customTransformers.afterTs || []), (tsickleTransformers.after || []).map(function (tf) { return skipTransformForSourceFileIfNeeded(host, tf); }))
        };
        if (host.transformTypesToClosure) {
            // See comment on remoteTypeAssertions.
            tsTransformers.before.push(jsdoc_transformer_1.removeTypeAssertions());
        }
        if (host.googmodule) {
            tsTransformers.after.push(googmodule.commonJsToGoogmoduleTransformer(host, modulesManifest, typeChecker, tsickleDiagnostics));
        }
        var writeFileDelegate = writeFile || tsHost.writeFile.bind(tsHost);
        var writeFileImpl = function (fileName, content, writeByteOrderMark, onError, sourceFiles) {
            cli_support_1.assertAbsolute(fileName);
            if (host.addDtsClutzAliases && transformer_util_1.isDtsFileName(fileName) && sourceFiles) {
                // Only bundle emits pass more than one source file for .d.ts writes. Bundle emits however
                // are not supported by tsickle, as we cannot annotate them for Closure in any meaningful
                // way anyway.
                if (!sourceFiles || sourceFiles.length > 1) {
                    throw new Error("expected exactly one source file for .d.ts emit, got " + sourceFiles.map(function (sf) { return sf.fileName; }));
                }
                var originalSource = sourceFiles[0];
                content = addClutzAliases(fileName, content, originalSource, typeChecker, host);
            }
            writeFileDelegate(fileName, content, writeByteOrderMark, onError, sourceFiles);
        };
        var _e = program.emit(targetSourceFile, writeFileImpl, cancellationToken, emitOnlyDtsFiles, tsTransformers), tsDiagnostics = _e.diagnostics, emitSkipped = _e.emitSkipped, emittedFiles = _e.emittedFiles;
        var externs = {};
        if (host.transformTypesToClosure) {
            var sourceFiles = targetSourceFile ? [targetSourceFile] : program.getSourceFiles();
            try {
                for (var sourceFiles_1 = __values(sourceFiles), sourceFiles_1_1 = sourceFiles_1.next(); !sourceFiles_1_1.done; sourceFiles_1_1 = sourceFiles_1.next()) {
                    var sourceFile = sourceFiles_1_1.value;
                    var isDts = transformer_util_1.isDtsFileName(sourceFile.fileName);
                    if (isDts && host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
                        continue;
                    }
                    var _f = externs_1.generateExterns(typeChecker, sourceFile, host, /* moduleResolutionHost */ host.host, tsOptions), output = _f.output, diagnostics = _f.diagnostics;
                    if (output) {
                        externs[sourceFile.fileName] = output;
                    }
                    if (diagnostics) {
                        tsickleDiagnostics.push.apply(tsickleDiagnostics, __spread(diagnostics));
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (sourceFiles_1_1 && !sourceFiles_1_1.done && (_b = sourceFiles_1.return)) _b.call(sourceFiles_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        // All diagnostics (including warnings) are treated as errors.
        // If the host decides to ignore warnings, just discard them.
        // Warnings include stuff like "don't use @type in your jsdoc"; tsickle
        // warns and then fixes up the code to be Closure-compatible anyway.
        tsickleDiagnostics = tsickleDiagnostics.filter(function (d) { return d.category === ts.DiagnosticCategory.Error ||
            !host.shouldIgnoreWarningsForPath(d.file.fileName); });
        return {
            modulesManifest: modulesManifest,
            emitSkipped: emitSkipped,
            emittedFiles: emittedFiles || [],
            diagnostics: __spread(tsDiagnostics, tsickleDiagnostics),
            externs: externs
        };
    }
    exports.emitWithTsickle = emitWithTsickle;
    /** Compares two strings and returns a number suitable for use in sort(). */
    function stringCompare(a, b) {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    }
    /**
     * A tsickle produced declaration file might be consumed be referenced by Clutz
     * produced .d.ts files, which use symbol names based on Closure's internal
     * naming conventions, so we need to provide aliases for all the exported symbols
     * in the Clutz naming convention.
     */
    function addClutzAliases(fileName, dtsFileContent, sourceFile, typeChecker, host) {
        var e_4, _a;
        var moduleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
        var moduleExports = moduleSymbol && typeChecker.getExportsOfModule(moduleSymbol);
        if (!moduleExports)
            return dtsFileContent;
        // .d.ts files can be transformed, too, so we need to compare the original node below.
        var origSourceFile = ts.getOriginalNode(sourceFile);
        // The module exports might be re-exports, and in the case of "export *" might not even be
        // available in the module scope, which makes them difficult to export. Avoid the problem by
        // filtering out symbols who do not have a declaration in the local module.
        var localExports = moduleExports.filter(function (e) {
            // If there are no declarations, be conservative and emit the aliases.
            if (!e.declarations)
                return true;
            // Skip default exports, they are not currently supported.
            // default is a keyword in typescript, so the name of the export being default means that it's a
            // default export.
            if (e.name === 'default')
                return false;
            // Otherwise check that some declaration is from the local module.
            return e.declarations.some(function (d) { return d.getSourceFile() === origSourceFile; });
        });
        if (!localExports.length)
            return dtsFileContent;
        // TypeScript 2.8 and TypeScript 2.9 differ on the order in which the
        // module symbols come out, so sort here to make the tests stable.
        localExports.sort(function (a, b) { return stringCompare(a.name, b.name); });
        var moduleName = host.pathToModuleName('', sourceFile.fileName);
        var clutzModuleName = moduleName.replace(/\./g, '$');
        // Clutz might refer to the name in two different forms (stemming from goog.provide and
        // goog.module respectively).
        // 1) global in clutz:   ಠ_ಠ.clutz.module$contents$path$to$module_Symbol...
        // 2) local in a module: ಠ_ಠ.clutz.module$exports$path$to$module.Symbol ..
        // See examples at:
        // https://github.com/angular/clutz/tree/master/src/test/java/com/google/javascript/clutz
        // Case (1) from above.
        var globalSymbols = '';
        // Case (2) from above.
        var nestedSymbols = '';
        try {
            for (var localExports_1 = __values(localExports), localExports_1_1 = localExports_1.next(); !localExports_1_1.done; localExports_1_1 = localExports_1.next()) {
                var symbol = localExports_1_1.value;
                globalSymbols +=
                    "\t\texport {" + symbol.name + " as module$contents$" + clutzModuleName + "_" + symbol.name + "}\n";
                nestedSymbols +=
                    "\t\texport {module$contents$" + clutzModuleName + "_" + symbol.name + " as " + symbol.name + "}\n";
                if (symbol.flags & ts.SymbolFlags.Class) {
                    globalSymbols += "\t\texport {" + symbol.name + " as module$contents$" + clutzModuleName + "_" + symbol.name + "_Instance}\n";
                    nestedSymbols += "\t\texport {module$contents$" + clutzModuleName + "_" + symbol.name + " as " + symbol.name + "_Instance}\n";
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (localExports_1_1 && !localExports_1_1.done && (_a = localExports_1.return)) _a.call(localExports_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        dtsFileContent += 'declare global {\n';
        dtsFileContent += "\tnamespace \u0CA0_\u0CA0.clutz {\n";
        dtsFileContent += globalSymbols;
        dtsFileContent += "\t}\n";
        dtsFileContent += "\tnamespace \u0CA0_\u0CA0.clutz.module$exports$" + clutzModuleName + " {\n";
        dtsFileContent += nestedSymbols;
        dtsFileContent += "\t}\n";
        dtsFileContent += '}\n';
        return dtsFileContent;
    }
    function skipTransformForSourceFileIfNeeded(host, delegateFactory) {
        return function (context) {
            var delegate = delegateFactory(context);
            return function (sourceFile) {
                if (host.shouldSkipTsickleProcessing(sourceFile.fileName)) {
                    return sourceFile;
                }
                return delegate(sourceFile);
            };
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNpY2tsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90c2lja2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBSUgsdURBQTZDO0lBQzdDLCtGQUFnRjtJQUNoRixpRUFBbUQ7SUFDbkQsK0NBQTBDO0lBQzFDLGlHQUF1RjtJQUN2RixtREFBMkM7SUFDM0MsbUVBQTBGO0lBQzFGLGlFQUFtRDtJQUNuRCx1RUFBeUQ7SUFDekQsaUVBQWlEO0lBQ2pELDJDQUFtQztJQUVuQyx1Q0FBdUM7SUFDdkMsK0NBQThDO0lBQXRDLHdDQUFBLG1CQUFtQixDQUFBO0lBQzNCLGlFQUE0RDtJQUEzQyw2Q0FBQSxlQUFlLENBQUE7SUE4QmhDLDBCQUFpQyxXQUF5Qjs7UUFDeEQsSUFBTSxXQUFXLEdBQW9CLEVBQUUsQ0FBQztRQUN4QyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO1FBQ2xDLElBQU0sT0FBTyxHQUFpQyxFQUFFLENBQUM7UUFDakQsSUFBTSxlQUFlLEdBQUcsSUFBSSxrQ0FBZSxFQUFFLENBQUM7O1lBQzlDLEtBQWlCLElBQUEsZ0JBQUEsU0FBQSxXQUFXLENBQUEsd0NBQUEsaUVBQUU7Z0JBQXpCLElBQU0sRUFBRSx3QkFBQTtnQkFDWCxXQUFXLENBQUMsSUFBSSxPQUFoQixXQUFXLFdBQVMsRUFBRSxDQUFDLFdBQVcsR0FBRTtnQkFDcEMsV0FBVyxHQUFHLFdBQVcsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDO2dCQUM1QyxZQUFZLENBQUMsSUFBSSxPQUFqQixZQUFZLFdBQVMsRUFBRSxDQUFDLFlBQVksR0FBRTtnQkFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNqRDs7Ozs7Ozs7O1FBQ0QsT0FBTyxFQUFDLFdBQVcsYUFBQSxFQUFFLFdBQVcsYUFBQSxFQUFFLFlBQVksY0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLGVBQWUsaUJBQUEsRUFBQyxDQUFDO0lBQzVFLENBQUM7SUFkRCw0Q0FjQztJQWtCRCx5QkFDSSxPQUFtQixFQUFFLElBQWlCLEVBQUUsTUFBdUIsRUFBRSxTQUE2QixFQUM5RixnQkFBZ0MsRUFBRSxTQUFnQyxFQUNsRSxpQkFBd0MsRUFBRSxnQkFBMEIsRUFDcEUsa0JBQXlDO1FBQXpDLG1DQUFBLEVBQUEsdUJBQXlDOzs7WUFDM0MsS0FBaUIsSUFBQSxLQUFBLFNBQUEsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFBLGdCQUFBLDRCQUFFO2dCQUF0QyxJQUFNLEVBQUUsV0FBQTtnQkFDWCw0QkFBYyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM3Qjs7Ozs7Ozs7O1FBRUQsSUFBSSxrQkFBa0IsR0FBb0IsRUFBRSxDQUFDO1FBQzdDLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM3QyxJQUFNLHlCQUF5QixHQUFnRCxFQUFFLENBQUM7UUFDbEYsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDaEMsOEVBQThFO1lBQzlFLHlCQUF5QixDQUFDLElBQUksQ0FBQyxzRUFBbUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDeEYseUJBQXlCLENBQUMsSUFBSSxDQUMxQixvQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUMxQix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsd0NBQWtCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFDM0Y7WUFDRCx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsa0NBQWUsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLHlCQUF5QixDQUFDLElBQUksQ0FBQywrREFBNkIsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1NBQ2hHO2FBQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDbkMseUJBQXlCLENBQUMsSUFBSSxDQUFDLCtEQUE2QixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7U0FDaEc7UUFDRCxJQUFNLGVBQWUsR0FBRyxJQUFJLGtDQUFlLEVBQUUsQ0FBQztRQUM5QyxJQUFNLG1CQUFtQixHQUEwQixFQUFDLE1BQU0sRUFBRSx5QkFBeUIsRUFBQyxDQUFDO1FBQ3ZGLElBQU0sY0FBYyxHQUEwQjtZQUM1QyxNQUFNLFdBQ0QsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLEVBQ3hDLENBQUMsbUJBQW1CLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLGtDQUFrQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUMxRixDQUFDLGtCQUFrQixDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FDdkM7WUFDRCxLQUFLLFdBQ0EsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQ2xDLENBQUMsbUJBQW1CLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLGtDQUFrQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUM3RjtTQUNGLENBQUM7UUFDRixJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUNoQyx1Q0FBdUM7WUFDdkMsY0FBYyxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQW9CLEVBQUUsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLGNBQWMsQ0FBQyxLQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsQ0FDakUsSUFBSSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsSUFBTSxpQkFBaUIsR0FBeUIsU0FBUyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNGLElBQU0sYUFBYSxHQUNmLFVBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsa0JBQTJCLEVBQzlELE9BQThDLEVBQzlDLFdBQXlDO1lBQ3hDLDRCQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksZ0NBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxXQUFXLEVBQUU7Z0JBQ3JFLDBGQUEwRjtnQkFDMUYseUZBQXlGO2dCQUN6RixjQUFjO2dCQUNkLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQ1osV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsQ0FBQyxRQUFRLEVBQVgsQ0FBVyxDQUFHLENBQUMsQ0FBQztpQkFDM0M7Z0JBQ0QsSUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLEdBQUcsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNqRjtZQUNELGlCQUFpQixDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pGLENBQUMsQ0FBQztRQUVBLElBQUEsdUdBQ21GLEVBRGxGLDhCQUEwQixFQUFFLDRCQUFXLEVBQUUsOEJBQVksQ0FDOEI7UUFFMUYsSUFBTSxPQUFPLEdBQWlDLEVBQUUsQ0FBQztRQUNqRCxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUNoQyxJQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7O2dCQUNyRixLQUF5QixJQUFBLGdCQUFBLFNBQUEsV0FBVyxDQUFBLHdDQUFBLGlFQUFFO29CQUFqQyxJQUFNLFVBQVUsd0JBQUE7b0JBQ25CLElBQU0sS0FBSyxHQUFHLGdDQUFhLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNqRCxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUNsRSxTQUFTO3FCQUNWO29CQUNLLElBQUEsOEdBQzZFLEVBRDVFLGtCQUFNLEVBQUUsNEJBQVcsQ0FDMEQ7b0JBQ3BGLElBQUksTUFBTSxFQUFFO3dCQUNWLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO3FCQUN2QztvQkFDRCxJQUFJLFdBQVcsRUFBRTt3QkFDZixrQkFBa0IsQ0FBQyxJQUFJLE9BQXZCLGtCQUFrQixXQUFTLFdBQVcsR0FBRTtxQkFDekM7aUJBQ0Y7Ozs7Ozs7OztTQUNGO1FBQ0QsOERBQThEO1FBQzlELDZEQUE2RDtRQUM3RCx1RUFBdUU7UUFDdkUsb0VBQW9FO1FBQ3BFLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FDMUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO1lBQzNDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFLLENBQUMsUUFBUSxDQUFDLEVBRGxELENBQ2tELENBQUMsQ0FBQztRQUU3RCxPQUFPO1lBQ0wsZUFBZSxpQkFBQTtZQUNmLFdBQVcsYUFBQTtZQUNYLFlBQVksRUFBRSxZQUFZLElBQUksRUFBRTtZQUNoQyxXQUFXLFdBQU0sYUFBYSxFQUFLLGtCQUFrQixDQUFDO1lBQ3RELE9BQU8sU0FBQTtTQUNSLENBQUM7SUFDSixDQUFDO0lBdkdELDBDQXVHQztJQUVELDRFQUE0RTtJQUM1RSx1QkFBdUIsQ0FBUyxFQUFFLENBQVM7UUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gseUJBQ0ksUUFBZ0IsRUFBRSxjQUFzQixFQUFFLFVBQXlCLEVBQ25FLFdBQTJCLEVBQUUsSUFBaUI7O1FBQ2hELElBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRSxJQUFNLGFBQWEsR0FBRyxZQUFZLElBQUksV0FBVyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25GLElBQUksQ0FBQyxhQUFhO1lBQUUsT0FBTyxjQUFjLENBQUM7UUFFMUMsc0ZBQXNGO1FBQ3RGLElBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEQsMEZBQTBGO1FBQzFGLDRGQUE0RjtRQUM1RiwyRUFBMkU7UUFDM0UsSUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7WUFDekMsc0VBQXNFO1lBQ3RFLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNqQywwREFBMEQ7WUFDMUQsZ0dBQWdHO1lBQ2hHLGtCQUFrQjtZQUNsQixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUN2QyxrRUFBa0U7WUFDbEUsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxjQUFjLEVBQXBDLENBQW9DLENBQUMsQ0FBQztRQUN4RSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTTtZQUFFLE9BQU8sY0FBYyxDQUFDO1FBRWhELHFFQUFxRTtRQUNyRSxrRUFBa0U7UUFDbEUsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQTdCLENBQTZCLENBQUMsQ0FBQztRQUUzRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRSxJQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV2RCx1RkFBdUY7UUFDdkYsNkJBQTZCO1FBQzdCLDJFQUEyRTtRQUMzRSwwRUFBMEU7UUFDMUUsbUJBQW1CO1FBQ25CLHlGQUF5RjtRQUV6Rix1QkFBdUI7UUFDdkIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLHVCQUF1QjtRQUN2QixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7O1lBQ3ZCLEtBQXFCLElBQUEsaUJBQUEsU0FBQSxZQUFZLENBQUEsMENBQUEsb0VBQUU7Z0JBQTlCLElBQU0sTUFBTSx5QkFBQTtnQkFDZixhQUFhO29CQUNULGlCQUFlLE1BQU0sQ0FBQyxJQUFJLDRCQUF1QixlQUFlLFNBQUksTUFBTSxDQUFDLElBQUksUUFBSyxDQUFDO2dCQUN6RixhQUFhO29CQUNULGlDQUErQixlQUFlLFNBQUksTUFBTSxDQUFDLElBQUksWUFBTyxNQUFNLENBQUMsSUFBSSxRQUFLLENBQUM7Z0JBQ3pGLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtvQkFDdkMsYUFBYSxJQUFJLGlCQUFlLE1BQU0sQ0FBQyxJQUFJLDRCQUF1QixlQUFlLFNBQzdFLE1BQU0sQ0FBQyxJQUFJLGlCQUFjLENBQUM7b0JBQzlCLGFBQWEsSUFBSSxpQ0FBK0IsZUFBZSxTQUFJLE1BQU0sQ0FBQyxJQUFJLFlBQzFFLE1BQU0sQ0FBQyxJQUFJLGlCQUFjLENBQUM7aUJBQy9CO2FBQ0Y7Ozs7Ozs7OztRQUVELGNBQWMsSUFBSSxvQkFBb0IsQ0FBQztRQUN2QyxjQUFjLElBQUkscUNBQTJCLENBQUM7UUFDOUMsY0FBYyxJQUFJLGFBQWEsQ0FBQztRQUNoQyxjQUFjLElBQUksT0FBTyxDQUFDO1FBQzFCLGNBQWMsSUFBSSxvREFBd0MsZUFBZSxTQUFNLENBQUM7UUFDaEYsY0FBYyxJQUFJLGFBQWEsQ0FBQztRQUNoQyxjQUFjLElBQUksT0FBTyxDQUFDO1FBQzFCLGNBQWMsSUFBSSxLQUFLLENBQUM7UUFFeEIsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQztJQUVELDRDQUNJLElBQWlCLEVBQ2pCLGVBQXFEO1FBQ3ZELE9BQU8sVUFBQyxPQUFpQztZQUN2QyxJQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUMsT0FBTyxVQUFDLFVBQXlCO2dCQUMvQixJQUFJLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3pELE9BQU8sVUFBVSxDQUFDO2lCQUNuQjtnQkFDRCxPQUFPLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Fzc2VydEFic29sdXRlfSBmcm9tICcuL2NsaV9zdXBwb3J0JztcbmltcG9ydCB7ZGVjb3JhdG9yRG93bmxldmVsVHJhbnNmb3JtZXJ9IGZyb20gJy4vZGVjb3JhdG9yX2Rvd25sZXZlbF90cmFuc2Zvcm1lcic7XG5pbXBvcnQge2VudW1UcmFuc2Zvcm1lcn0gZnJvbSAnLi9lbnVtX3RyYW5zZm9ybWVyJztcbmltcG9ydCB7Z2VuZXJhdGVFeHRlcm5zfSBmcm9tICcuL2V4dGVybnMnO1xuaW1wb3J0IHt0cmFuc2Zvcm1GaWxlb3ZlcnZpZXdDb21tZW50RmFjdG9yeX0gZnJvbSAnLi9maWxlb3ZlcnZpZXdfY29tbWVudF90cmFuc2Zvcm1lcic7XG5pbXBvcnQgKiBhcyBnb29nbW9kdWxlIGZyb20gJy4vZ29vZ21vZHVsZSc7XG5pbXBvcnQge0Fubm90YXRvckhvc3QsIGpzZG9jVHJhbnNmb3JtZXIsIHJlbW92ZVR5cGVBc3NlcnRpb25zfSBmcm9tICcuL2pzZG9jX3RyYW5zZm9ybWVyJztcbmltcG9ydCB7TW9kdWxlc01hbmlmZXN0fSBmcm9tICcuL21vZHVsZXNfbWFuaWZlc3QnO1xuaW1wb3J0IHtxdW90aW5nVHJhbnNmb3JtZXJ9IGZyb20gJy4vcXVvdGluZ190cmFuc2Zvcm1lcic7XG5pbXBvcnQge2lzRHRzRmlsZU5hbWV9IGZyb20gJy4vdHJhbnNmb3JtZXJfdXRpbCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG4vLyBSZXRhaW5lZCBoZXJlIGZvciBBUEkgY29tcGF0aWJpbGl0eS5cbmV4cG9ydCB7Z2V0R2VuZXJhdGVkRXh0ZXJuc30gZnJvbSAnLi9leHRlcm5zJztcbmV4cG9ydCB7RmlsZU1hcCwgTW9kdWxlc01hbmlmZXN0fSBmcm9tICcuL21vZHVsZXNfbWFuaWZlc3QnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRzaWNrbGVIb3N0IGV4dGVuZHMgZ29vZ21vZHVsZS5Hb29nTW9kdWxlUHJvY2Vzc29ySG9zdCwgQW5ub3RhdG9ySG9zdCB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGRvd25sZXZlbCBkZWNvcmF0b3JzXG4gICAqL1xuICB0cmFuc2Zvcm1EZWNvcmF0b3JzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gY29udmVycyB0eXBlcyB0byBjbG9zdXJlXG4gICAqL1xuICB0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGFkZCBhbGlhc2VzIHRvIHRoZSAuZC50cyBmaWxlcyB0byBhZGQgdGhlIGV4cG9ydHMgdG8gdGhlXG4gICAqIOCyoF/gsqAuY2x1dHogbmFtZXNwYWNlLlxuICAgKi9cbiAgYWRkRHRzQ2x1dHpBbGlhc2VzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIElmIHRydWUsIHRzaWNrbGUgYW5kIGRlY29yYXRvciBkb3dubGV2ZWwgcHJvY2Vzc2luZyB3aWxsIGJlIHNraXBwZWQgZm9yXG4gICAqIHRoYXQgZmlsZS5cbiAgICovXG4gIHNob3VsZFNraXBUc2lja2xlUHJvY2Vzc2luZyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFRzaWNrbGUgdHJlYXRzIHdhcm5pbmdzIGFzIGVycm9ycywgaWYgdHJ1ZSwgaWdub3JlIHdhcm5pbmdzLiAgVGhpcyBtaWdodCBiZVxuICAgKiB1c2VmdWwgZm9yIGUuZy4gdGhpcmQgcGFydHkgY29kZS5cbiAgICovXG4gIHNob3VsZElnbm9yZVdhcm5pbmdzRm9yUGF0aChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdG8gY29udmVydCBDb21tb25KUyByZXF1aXJlKCkgaW1wb3J0cyB0byBnb29nLm1vZHVsZSgpIGFuZCBnb29nLnJlcXVpcmUoKSBjYWxscy4gKi9cbiAgZ29vZ21vZHVsZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRW1pdFJlc3VsdHMoZW1pdFJlc3VsdHM6IEVtaXRSZXN1bHRbXSk6IEVtaXRSZXN1bHQge1xuICBjb25zdCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gIGxldCBlbWl0U2tpcHBlZCA9IHRydWU7XG4gIGNvbnN0IGVtaXR0ZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZXh0ZXJuczoge1tmaWxlTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBjb25zdCBtb2R1bGVzTWFuaWZlc3QgPSBuZXcgTW9kdWxlc01hbmlmZXN0KCk7XG4gIGZvciAoY29uc3QgZXIgb2YgZW1pdFJlc3VsdHMpIHtcbiAgICBkaWFnbm9zdGljcy5wdXNoKC4uLmVyLmRpYWdub3N0aWNzKTtcbiAgICBlbWl0U2tpcHBlZCA9IGVtaXRTa2lwcGVkIHx8IGVyLmVtaXRTa2lwcGVkO1xuICAgIGVtaXR0ZWRGaWxlcy5wdXNoKC4uLmVyLmVtaXR0ZWRGaWxlcyk7XG4gICAgT2JqZWN0LmFzc2lnbihleHRlcm5zLCBlci5leHRlcm5zKTtcbiAgICBtb2R1bGVzTWFuaWZlc3QuYWRkTWFuaWZlc3QoZXIubW9kdWxlc01hbmlmZXN0KTtcbiAgfVxuICByZXR1cm4ge2RpYWdub3N0aWNzLCBlbWl0U2tpcHBlZCwgZW1pdHRlZEZpbGVzLCBleHRlcm5zLCBtb2R1bGVzTWFuaWZlc3R9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVtaXRSZXN1bHQgZXh0ZW5kcyB0cy5FbWl0UmVzdWx0IHtcbiAgLy8gVGhlIG1hbmlmZXN0IG9mIEpTIG1vZHVsZXMgb3V0cHV0IGJ5IHRoZSBjb21waWxlci5cbiAgbW9kdWxlc01hbmlmZXN0OiBNb2R1bGVzTWFuaWZlc3Q7XG4gIC8qKlxuICAgKiBleHRlcm5zLmpzIGZpbGVzIHByb2R1Y2VkIGJ5IHRzaWNrbGUsIGlmIGFueS4gbW9kdWxlIElEcyBhcmUgcmVsYXRpdmUgcGF0aHMgZnJvbVxuICAgKiBmaWxlTmFtZVRvTW9kdWxlSWQuXG4gICAqL1xuICBleHRlcm5zOiB7W21vZHVsZUlkOiBzdHJpbmddOiBzdHJpbmd9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVtaXRUcmFuc2Zvcm1lcnMge1xuICBiZWZvcmVUc2lja2xlPzogQXJyYXk8dHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+PjtcbiAgYmVmb3JlVHM/OiBBcnJheTx0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4+O1xuICBhZnRlclRzPzogQXJyYXk8dHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+Pjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVtaXRXaXRoVHNpY2tsZShcbiAgICBwcm9ncmFtOiB0cy5Qcm9ncmFtLCBob3N0OiBUc2lja2xlSG9zdCwgdHNIb3N0OiB0cy5Db21waWxlckhvc3QsIHRzT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLFxuICAgIHRhcmdldFNvdXJjZUZpbGU/OiB0cy5Tb3VyY2VGaWxlLCB3cml0ZUZpbGU/OiB0cy5Xcml0ZUZpbGVDYWxsYmFjayxcbiAgICBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuLCBlbWl0T25seUR0c0ZpbGVzPzogYm9vbGVhbixcbiAgICBjdXN0b21UcmFuc2Zvcm1lcnM6IEVtaXRUcmFuc2Zvcm1lcnMgPSB7fSk6IEVtaXRSZXN1bHQge1xuICBmb3IgKGNvbnN0IHNmIG9mIHByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgIGFzc2VydEFic29sdXRlKHNmLmZpbGVOYW1lKTtcbiAgfVxuXG4gIGxldCB0c2lja2xlRGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICBjb25zdCB0eXBlQ2hlY2tlciA9IHByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcbiAgY29uc3QgdHNpY2tsZVNvdXJjZVRyYW5zZm9ybWVyczogQXJyYXk8dHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+PiA9IFtdO1xuICBpZiAoaG9zdC50cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZSkge1xuICAgIC8vIE9ubHkgYWRkIEBzdXBwcmVzcyB7Y2hlY2tUeXBlc30gY29tbWVudHMgd2hlbiBhbHNvIGFkZGluZyB0eXBlIGFubm90YXRpb25zLlxuICAgIHRzaWNrbGVTb3VyY2VUcmFuc2Zvcm1lcnMucHVzaCh0cmFuc2Zvcm1GaWxlb3ZlcnZpZXdDb21tZW50RmFjdG9yeSh0c2lja2xlRGlhZ25vc3RpY3MpKTtcbiAgICB0c2lja2xlU291cmNlVHJhbnNmb3JtZXJzLnB1c2goXG4gICAgICAgIGpzZG9jVHJhbnNmb3JtZXIoaG9zdCwgdHNPcHRpb25zLCB0c0hvc3QsIHR5cGVDaGVja2VyLCB0c2lja2xlRGlhZ25vc3RpY3MpKTtcbiAgICBpZiAoaG9zdC5lbmFibGVBdXRvUXVvdGluZykge1xuICAgICAgdHNpY2tsZVNvdXJjZVRyYW5zZm9ybWVycy5wdXNoKHF1b3RpbmdUcmFuc2Zvcm1lcihob3N0LCB0eXBlQ2hlY2tlciwgdHNpY2tsZURpYWdub3N0aWNzKSk7XG4gICAgfVxuICAgIHRzaWNrbGVTb3VyY2VUcmFuc2Zvcm1lcnMucHVzaChlbnVtVHJhbnNmb3JtZXIodHlwZUNoZWNrZXIsIHRzaWNrbGVEaWFnbm9zdGljcykpO1xuICAgIHRzaWNrbGVTb3VyY2VUcmFuc2Zvcm1lcnMucHVzaChkZWNvcmF0b3JEb3dubGV2ZWxUcmFuc2Zvcm1lcih0eXBlQ2hlY2tlciwgdHNpY2tsZURpYWdub3N0aWNzKSk7XG4gIH0gZWxzZSBpZiAoaG9zdC50cmFuc2Zvcm1EZWNvcmF0b3JzKSB7XG4gICAgdHNpY2tsZVNvdXJjZVRyYW5zZm9ybWVycy5wdXNoKGRlY29yYXRvckRvd25sZXZlbFRyYW5zZm9ybWVyKHR5cGVDaGVja2VyLCB0c2lja2xlRGlhZ25vc3RpY3MpKTtcbiAgfVxuICBjb25zdCBtb2R1bGVzTWFuaWZlc3QgPSBuZXcgTW9kdWxlc01hbmlmZXN0KCk7XG4gIGNvbnN0IHRzaWNrbGVUcmFuc2Zvcm1lcnM6IHRzLkN1c3RvbVRyYW5zZm9ybWVycyA9IHtiZWZvcmU6IHRzaWNrbGVTb3VyY2VUcmFuc2Zvcm1lcnN9O1xuICBjb25zdCB0c1RyYW5zZm9ybWVyczogdHMuQ3VzdG9tVHJhbnNmb3JtZXJzID0ge1xuICAgIGJlZm9yZTogW1xuICAgICAgLi4uKGN1c3RvbVRyYW5zZm9ybWVycy5iZWZvcmVUc2lja2xlIHx8IFtdKSxcbiAgICAgIC4uLih0c2lja2xlVHJhbnNmb3JtZXJzLmJlZm9yZSB8fCBbXSkubWFwKHRmID0+IHNraXBUcmFuc2Zvcm1Gb3JTb3VyY2VGaWxlSWZOZWVkZWQoaG9zdCwgdGYpKSxcbiAgICAgIC4uLihjdXN0b21UcmFuc2Zvcm1lcnMuYmVmb3JlVHMgfHwgW10pLFxuICAgIF0sXG4gICAgYWZ0ZXI6IFtcbiAgICAgIC4uLihjdXN0b21UcmFuc2Zvcm1lcnMuYWZ0ZXJUcyB8fCBbXSksXG4gICAgICAuLi4odHNpY2tsZVRyYW5zZm9ybWVycy5hZnRlciB8fCBbXSkubWFwKHRmID0+IHNraXBUcmFuc2Zvcm1Gb3JTb3VyY2VGaWxlSWZOZWVkZWQoaG9zdCwgdGYpKSxcbiAgICBdXG4gIH07XG4gIGlmIChob3N0LnRyYW5zZm9ybVR5cGVzVG9DbG9zdXJlKSB7XG4gICAgLy8gU2VlIGNvbW1lbnQgb24gcmVtb3RlVHlwZUFzc2VydGlvbnMuXG4gICAgdHNUcmFuc2Zvcm1lcnMuYmVmb3JlIS5wdXNoKHJlbW92ZVR5cGVBc3NlcnRpb25zKCkpO1xuICB9XG4gIGlmIChob3N0Lmdvb2dtb2R1bGUpIHtcbiAgICB0c1RyYW5zZm9ybWVycy5hZnRlciEucHVzaChnb29nbW9kdWxlLmNvbW1vbkpzVG9Hb29nbW9kdWxlVHJhbnNmb3JtZXIoXG4gICAgICAgIGhvc3QsIG1vZHVsZXNNYW5pZmVzdCwgdHlwZUNoZWNrZXIsIHRzaWNrbGVEaWFnbm9zdGljcykpO1xuICB9XG5cbiAgY29uc3Qgd3JpdGVGaWxlRGVsZWdhdGU6IHRzLldyaXRlRmlsZUNhbGxiYWNrID0gd3JpdGVGaWxlIHx8IHRzSG9zdC53cml0ZUZpbGUuYmluZCh0c0hvc3QpO1xuICBjb25zdCB3cml0ZUZpbGVJbXBsID1cbiAgICAgIChmaWxlTmFtZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcsIHdyaXRlQnl0ZU9yZGVyTWFyazogYm9vbGVhbixcbiAgICAgICBvbkVycm9yOiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCl8dW5kZWZpbmVkLFxuICAgICAgIHNvdXJjZUZpbGVzOiBSZWFkb25seUFycmF5PHRzLlNvdXJjZUZpbGU+KSA9PiB7XG4gICAgICAgIGFzc2VydEFic29sdXRlKGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKGhvc3QuYWRkRHRzQ2x1dHpBbGlhc2VzICYmIGlzRHRzRmlsZU5hbWUoZmlsZU5hbWUpICYmIHNvdXJjZUZpbGVzKSB7XG4gICAgICAgICAgLy8gT25seSBidW5kbGUgZW1pdHMgcGFzcyBtb3JlIHRoYW4gb25lIHNvdXJjZSBmaWxlIGZvciAuZC50cyB3cml0ZXMuIEJ1bmRsZSBlbWl0cyBob3dldmVyXG4gICAgICAgICAgLy8gYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdHNpY2tsZSwgYXMgd2UgY2Fubm90IGFubm90YXRlIHRoZW0gZm9yIENsb3N1cmUgaW4gYW55IG1lYW5pbmdmdWxcbiAgICAgICAgICAvLyB3YXkgYW55d2F5LlxuICAgICAgICAgIGlmICghc291cmNlRmlsZXMgfHwgc291cmNlRmlsZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBleGFjdGx5IG9uZSBzb3VyY2UgZmlsZSBmb3IgLmQudHMgZW1pdCwgZ290ICR7XG4gICAgICAgICAgICAgICAgc291cmNlRmlsZXMubWFwKHNmID0+IHNmLmZpbGVOYW1lKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxTb3VyY2UgPSBzb3VyY2VGaWxlc1swXTtcbiAgICAgICAgICBjb250ZW50ID0gYWRkQ2x1dHpBbGlhc2VzKGZpbGVOYW1lLCBjb250ZW50LCBvcmlnaW5hbFNvdXJjZSwgdHlwZUNoZWNrZXIsIGhvc3QpO1xuICAgICAgICB9XG4gICAgICAgIHdyaXRlRmlsZURlbGVnYXRlKGZpbGVOYW1lLCBjb250ZW50LCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIHNvdXJjZUZpbGVzKTtcbiAgICAgIH07XG5cbiAgY29uc3Qge2RpYWdub3N0aWNzOiB0c0RpYWdub3N0aWNzLCBlbWl0U2tpcHBlZCwgZW1pdHRlZEZpbGVzfSA9IHByb2dyYW0uZW1pdChcbiAgICAgIHRhcmdldFNvdXJjZUZpbGUsIHdyaXRlRmlsZUltcGwsIGNhbmNlbGxhdGlvblRva2VuLCBlbWl0T25seUR0c0ZpbGVzLCB0c1RyYW5zZm9ybWVycyk7XG5cbiAgY29uc3QgZXh0ZXJuczoge1tmaWxlTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBpZiAoaG9zdC50cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZSkge1xuICAgIGNvbnN0IHNvdXJjZUZpbGVzID0gdGFyZ2V0U291cmNlRmlsZSA/IFt0YXJnZXRTb3VyY2VGaWxlXSA6IHByb2dyYW0uZ2V0U291cmNlRmlsZXMoKTtcbiAgICBmb3IgKGNvbnN0IHNvdXJjZUZpbGUgb2Ygc291cmNlRmlsZXMpIHtcbiAgICAgIGNvbnN0IGlzRHRzID0gaXNEdHNGaWxlTmFtZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgIGlmIChpc0R0cyAmJiBob3N0LnNob3VsZFNraXBUc2lja2xlUHJvY2Vzc2luZyhzb3VyY2VGaWxlLmZpbGVOYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHtvdXRwdXQsIGRpYWdub3N0aWNzfSA9IGdlbmVyYXRlRXh0ZXJucyhcbiAgICAgICAgICB0eXBlQ2hlY2tlciwgc291cmNlRmlsZSwgaG9zdCwgLyogbW9kdWxlUmVzb2x1dGlvbkhvc3QgKi8gaG9zdC5ob3N0LCB0c09wdGlvbnMpO1xuICAgICAgaWYgKG91dHB1dCkge1xuICAgICAgICBleHRlcm5zW3NvdXJjZUZpbGUuZmlsZU5hbWVdID0gb3V0cHV0O1xuICAgICAgfVxuICAgICAgaWYgKGRpYWdub3N0aWNzKSB7XG4gICAgICAgIHRzaWNrbGVEaWFnbm9zdGljcy5wdXNoKC4uLmRpYWdub3N0aWNzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gQWxsIGRpYWdub3N0aWNzIChpbmNsdWRpbmcgd2FybmluZ3MpIGFyZSB0cmVhdGVkIGFzIGVycm9ycy5cbiAgLy8gSWYgdGhlIGhvc3QgZGVjaWRlcyB0byBpZ25vcmUgd2FybmluZ3MsIGp1c3QgZGlzY2FyZCB0aGVtLlxuICAvLyBXYXJuaW5ncyBpbmNsdWRlIHN0dWZmIGxpa2UgXCJkb24ndCB1c2UgQHR5cGUgaW4geW91ciBqc2RvY1wiOyB0c2lja2xlXG4gIC8vIHdhcm5zIGFuZCB0aGVuIGZpeGVzIHVwIHRoZSBjb2RlIHRvIGJlIENsb3N1cmUtY29tcGF0aWJsZSBhbnl3YXkuXG4gIHRzaWNrbGVEaWFnbm9zdGljcyA9IHRzaWNrbGVEaWFnbm9zdGljcy5maWx0ZXIoXG4gICAgICBkID0+IGQuY2F0ZWdvcnkgPT09IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvciB8fFxuICAgICAgICAgICFob3N0LnNob3VsZElnbm9yZVdhcm5pbmdzRm9yUGF0aChkLmZpbGUhLmZpbGVOYW1lKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBtb2R1bGVzTWFuaWZlc3QsXG4gICAgZW1pdFNraXBwZWQsXG4gICAgZW1pdHRlZEZpbGVzOiBlbWl0dGVkRmlsZXMgfHwgW10sXG4gICAgZGlhZ25vc3RpY3M6IFsuLi50c0RpYWdub3N0aWNzLCAuLi50c2lja2xlRGlhZ25vc3RpY3NdLFxuICAgIGV4dGVybnNcbiAgfTtcbn1cblxuLyoqIENvbXBhcmVzIHR3byBzdHJpbmdzIGFuZCByZXR1cm5zIGEgbnVtYmVyIHN1aXRhYmxlIGZvciB1c2UgaW4gc29ydCgpLiAqL1xuZnVuY3Rpb24gc3RyaW5nQ29tcGFyZShhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIGlmIChhIDwgYikgcmV0dXJuIC0xO1xuICBpZiAoYSA+IGIpIHJldHVybiAxO1xuICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBBIHRzaWNrbGUgcHJvZHVjZWQgZGVjbGFyYXRpb24gZmlsZSBtaWdodCBiZSBjb25zdW1lZCBiZSByZWZlcmVuY2VkIGJ5IENsdXR6XG4gKiBwcm9kdWNlZCAuZC50cyBmaWxlcywgd2hpY2ggdXNlIHN5bWJvbCBuYW1lcyBiYXNlZCBvbiBDbG9zdXJlJ3MgaW50ZXJuYWxcbiAqIG5hbWluZyBjb252ZW50aW9ucywgc28gd2UgbmVlZCB0byBwcm92aWRlIGFsaWFzZXMgZm9yIGFsbCB0aGUgZXhwb3J0ZWQgc3ltYm9sc1xuICogaW4gdGhlIENsdXR6IG5hbWluZyBjb252ZW50aW9uLlxuICovXG5mdW5jdGlvbiBhZGRDbHV0ekFsaWFzZXMoXG4gICAgZmlsZU5hbWU6IHN0cmluZywgZHRzRmlsZUNvbnRlbnQ6IHN0cmluZywgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSxcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGhvc3Q6IFRzaWNrbGVIb3N0KTogc3RyaW5nIHtcbiAgY29uc3QgbW9kdWxlU3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihzb3VyY2VGaWxlKTtcbiAgY29uc3QgbW9kdWxlRXhwb3J0cyA9IG1vZHVsZVN5bWJvbCAmJiB0eXBlQ2hlY2tlci5nZXRFeHBvcnRzT2ZNb2R1bGUobW9kdWxlU3ltYm9sKTtcbiAgaWYgKCFtb2R1bGVFeHBvcnRzKSByZXR1cm4gZHRzRmlsZUNvbnRlbnQ7XG5cbiAgLy8gLmQudHMgZmlsZXMgY2FuIGJlIHRyYW5zZm9ybWVkLCB0b28sIHNvIHdlIG5lZWQgdG8gY29tcGFyZSB0aGUgb3JpZ2luYWwgbm9kZSBiZWxvdy5cbiAgY29uc3Qgb3JpZ1NvdXJjZUZpbGUgPSB0cy5nZXRPcmlnaW5hbE5vZGUoc291cmNlRmlsZSk7XG4gIC8vIFRoZSBtb2R1bGUgZXhwb3J0cyBtaWdodCBiZSByZS1leHBvcnRzLCBhbmQgaW4gdGhlIGNhc2Ugb2YgXCJleHBvcnQgKlwiIG1pZ2h0IG5vdCBldmVuIGJlXG4gIC8vIGF2YWlsYWJsZSBpbiB0aGUgbW9kdWxlIHNjb3BlLCB3aGljaCBtYWtlcyB0aGVtIGRpZmZpY3VsdCB0byBleHBvcnQuIEF2b2lkIHRoZSBwcm9ibGVtIGJ5XG4gIC8vIGZpbHRlcmluZyBvdXQgc3ltYm9scyB3aG8gZG8gbm90IGhhdmUgYSBkZWNsYXJhdGlvbiBpbiB0aGUgbG9jYWwgbW9kdWxlLlxuICBjb25zdCBsb2NhbEV4cG9ydHMgPSBtb2R1bGVFeHBvcnRzLmZpbHRlcihlID0+IHtcbiAgICAvLyBJZiB0aGVyZSBhcmUgbm8gZGVjbGFyYXRpb25zLCBiZSBjb25zZXJ2YXRpdmUgYW5kIGVtaXQgdGhlIGFsaWFzZXMuXG4gICAgaWYgKCFlLmRlY2xhcmF0aW9ucykgcmV0dXJuIHRydWU7XG4gICAgLy8gU2tpcCBkZWZhdWx0IGV4cG9ydHMsIHRoZXkgYXJlIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkLlxuICAgIC8vIGRlZmF1bHQgaXMgYSBrZXl3b3JkIGluIHR5cGVzY3JpcHQsIHNvIHRoZSBuYW1lIG9mIHRoZSBleHBvcnQgYmVpbmcgZGVmYXVsdCBtZWFucyB0aGF0IGl0J3MgYVxuICAgIC8vIGRlZmF1bHQgZXhwb3J0LlxuICAgIGlmIChlLm5hbWUgPT09ICdkZWZhdWx0JykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIE90aGVyd2lzZSBjaGVjayB0aGF0IHNvbWUgZGVjbGFyYXRpb24gaXMgZnJvbSB0aGUgbG9jYWwgbW9kdWxlLlxuICAgIHJldHVybiBlLmRlY2xhcmF0aW9ucy5zb21lKGQgPT4gZC5nZXRTb3VyY2VGaWxlKCkgPT09IG9yaWdTb3VyY2VGaWxlKTtcbiAgfSk7XG4gIGlmICghbG9jYWxFeHBvcnRzLmxlbmd0aCkgcmV0dXJuIGR0c0ZpbGVDb250ZW50O1xuXG4gIC8vIFR5cGVTY3JpcHQgMi44IGFuZCBUeXBlU2NyaXB0IDIuOSBkaWZmZXIgb24gdGhlIG9yZGVyIGluIHdoaWNoIHRoZVxuICAvLyBtb2R1bGUgc3ltYm9scyBjb21lIG91dCwgc28gc29ydCBoZXJlIHRvIG1ha2UgdGhlIHRlc3RzIHN0YWJsZS5cbiAgbG9jYWxFeHBvcnRzLnNvcnQoKGEsIGIpID0+IHN0cmluZ0NvbXBhcmUoYS5uYW1lLCBiLm5hbWUpKTtcblxuICBjb25zdCBtb2R1bGVOYW1lID0gaG9zdC5wYXRoVG9Nb2R1bGVOYW1lKCcnLCBzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgY29uc3QgY2x1dHpNb2R1bGVOYW1lID0gbW9kdWxlTmFtZS5yZXBsYWNlKC9cXC4vZywgJyQnKTtcblxuICAvLyBDbHV0eiBtaWdodCByZWZlciB0byB0aGUgbmFtZSBpbiB0d28gZGlmZmVyZW50IGZvcm1zIChzdGVtbWluZyBmcm9tIGdvb2cucHJvdmlkZSBhbmRcbiAgLy8gZ29vZy5tb2R1bGUgcmVzcGVjdGl2ZWx5KS5cbiAgLy8gMSkgZ2xvYmFsIGluIGNsdXR6OiAgIOCyoF/gsqAuY2x1dHoubW9kdWxlJGNvbnRlbnRzJHBhdGgkdG8kbW9kdWxlX1N5bWJvbC4uLlxuICAvLyAyKSBsb2NhbCBpbiBhIG1vZHVsZTog4LKgX+CyoC5jbHV0ei5tb2R1bGUkZXhwb3J0cyRwYXRoJHRvJG1vZHVsZS5TeW1ib2wgLi5cbiAgLy8gU2VlIGV4YW1wbGVzIGF0OlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jbHV0ei90cmVlL21hc3Rlci9zcmMvdGVzdC9qYXZhL2NvbS9nb29nbGUvamF2YXNjcmlwdC9jbHV0elxuXG4gIC8vIENhc2UgKDEpIGZyb20gYWJvdmUuXG4gIGxldCBnbG9iYWxTeW1ib2xzID0gJyc7XG4gIC8vIENhc2UgKDIpIGZyb20gYWJvdmUuXG4gIGxldCBuZXN0ZWRTeW1ib2xzID0gJyc7XG4gIGZvciAoY29uc3Qgc3ltYm9sIG9mIGxvY2FsRXhwb3J0cykge1xuICAgIGdsb2JhbFN5bWJvbHMgKz1cbiAgICAgICAgYFxcdFxcdGV4cG9ydCB7JHtzeW1ib2wubmFtZX0gYXMgbW9kdWxlJGNvbnRlbnRzJCR7Y2x1dHpNb2R1bGVOYW1lfV8ke3N5bWJvbC5uYW1lfX1cXG5gO1xuICAgIG5lc3RlZFN5bWJvbHMgKz1cbiAgICAgICAgYFxcdFxcdGV4cG9ydCB7bW9kdWxlJGNvbnRlbnRzJCR7Y2x1dHpNb2R1bGVOYW1lfV8ke3N5bWJvbC5uYW1lfSBhcyAke3N5bWJvbC5uYW1lfX1cXG5gO1xuICAgIGlmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xuICAgICAgZ2xvYmFsU3ltYm9scyArPSBgXFx0XFx0ZXhwb3J0IHske3N5bWJvbC5uYW1lfSBhcyBtb2R1bGUkY29udGVudHMkJHtjbHV0ek1vZHVsZU5hbWV9XyR7XG4gICAgICAgICAgc3ltYm9sLm5hbWV9X0luc3RhbmNlfVxcbmA7XG4gICAgICBuZXN0ZWRTeW1ib2xzICs9IGBcXHRcXHRleHBvcnQge21vZHVsZSRjb250ZW50cyQke2NsdXR6TW9kdWxlTmFtZX1fJHtzeW1ib2wubmFtZX0gYXMgJHtcbiAgICAgICAgICBzeW1ib2wubmFtZX1fSW5zdGFuY2V9XFxuYDtcbiAgICB9XG4gIH1cblxuICBkdHNGaWxlQ29udGVudCArPSAnZGVjbGFyZSBnbG9iYWwge1xcbic7XG4gIGR0c0ZpbGVDb250ZW50ICs9IGBcXHRuYW1lc3BhY2Ug4LKgX+CyoC5jbHV0eiB7XFxuYDtcbiAgZHRzRmlsZUNvbnRlbnQgKz0gZ2xvYmFsU3ltYm9scztcbiAgZHRzRmlsZUNvbnRlbnQgKz0gYFxcdH1cXG5gO1xuICBkdHNGaWxlQ29udGVudCArPSBgXFx0bmFtZXNwYWNlIOCyoF/gsqAuY2x1dHoubW9kdWxlJGV4cG9ydHMkJHtjbHV0ek1vZHVsZU5hbWV9IHtcXG5gO1xuICBkdHNGaWxlQ29udGVudCArPSBuZXN0ZWRTeW1ib2xzO1xuICBkdHNGaWxlQ29udGVudCArPSBgXFx0fVxcbmA7XG4gIGR0c0ZpbGVDb250ZW50ICs9ICd9XFxuJztcblxuICByZXR1cm4gZHRzRmlsZUNvbnRlbnQ7XG59XG5cbmZ1bmN0aW9uIHNraXBUcmFuc2Zvcm1Gb3JTb3VyY2VGaWxlSWZOZWVkZWQoXG4gICAgaG9zdDogVHNpY2tsZUhvc3QsXG4gICAgZGVsZWdhdGVGYWN0b3J5OiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IGRlbGVnYXRlID0gZGVsZWdhdGVGYWN0b3J5KGNvbnRleHQpO1xuICAgIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgICAgaWYgKGhvc3Quc2hvdWxkU2tpcFRzaWNrbGVQcm9jZXNzaW5nKHNvdXJjZUZpbGUuZmlsZU5hbWUpKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2VGaWxlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlbGVnYXRlKHNvdXJjZUZpbGUpO1xuICAgIH07XG4gIH07XG59XG4iXX0=