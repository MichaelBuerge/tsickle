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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/externs", ["require", "exports", "path", "tsickle/src/enum_transformer", "tsickle/src/googmodule", "tsickle/src/jsdoc", "tsickle/src/jsdoc_transformer", "tsickle/src/module_type_translator", "tsickle/src/transformer_util", "tsickle/src/type_translator", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @fileoverview Externs creates Closure Compiler \@externs definitions from the
     * ambient declarations in a TypeScript file.
     *
     * For example, a declare interface Foo { bar: string; } Would generate a /..
     *   \@externs ./ /.. \@record ./ var Foo = function() {}; /.. \@type {string}
     *   ./ Foo.prototype.bar;
     *
     * The generated externs indicate to Closure Compiler that symbols are external
     * to the optimization process, i.e. they are provided by outside code. That
     * most importantly means they must not be renamed or removed.
     *
     * A major difficulty here is that TypeScript supports module-scoped external
     * symbols; `.d.ts` files can contain `export`s and `import` other files.
     * Closure Compiler does not have such a concept, so tsickle must emulate the
     * behaviour. It does so by following this scheme:
     *
     * 1. non-module .d.ts produces global symbols
     * 2. module .d.ts produce symbols namespaced to the module, by creating a
     *    mangled name matching the current file's path. tsickle expects outside
     *    code (e.g. build system integration or manually written code) to contain a
     *    goog.module/provide that references the mangled path.
     * 3. declarations in `.ts` files produce types that can be separately emitted
     *    in e.g. an `externs.js`, using `getGeneratedExterns` below.
     *    1. non-exported symbols produce global types, because that's what users
     *       expect and it matches TypeScripts emit, which just references `Foo` for
     *       a locally declared symbol `Foo` in a module. Arguably these should be
     *       wrapped in `declare global { ... }`.
     *    2. exported symbols are scoped to the `.ts` file by prefixing them with a
     *       mangled name. Exported types are re-exported from the JavaScript
     *       `goog.module`, allowing downstream code to reference them. This has the
     *       same problem regarding ambient values as above, it is unclear where the
     *       value symbol would be defined, so for the time being this is
     *       unsupported.
     *
     * The effect of this is that:
     * - symbols in a module (i.e. not globals) are generally scoped to the local
     *   module using a mangled name, preventing symbol collisions on the Closure
     *   side.
     * - importing code can unconditionally refer to and import any symbol defined
     *   in a module `X` as `path.to.module.X`, regardless of whether the defining
     *   location is a `.d.ts` file or a `.ts` file, and regardless whether the
     *   symbol is ambient (assuming there's an appropriate shim).
     * - if there is a shim present, tsickle avoids emitting the Closure namespace
     *   itself, expecting the shim to provide the namespace and initialize it to a
     *   symbol that provides the right value at runtime (i.e. the implementation of
     *   whatever third party library the .d.ts describes).
     */
    var path = require("path");
    var enum_transformer_1 = require("tsickle/src/enum_transformer");
    var googmodule_1 = require("tsickle/src/googmodule");
    var jsdoc = require("tsickle/src/jsdoc");
    var jsdoc_transformer_1 = require("tsickle/src/jsdoc_transformer");
    var module_type_translator_1 = require("tsickle/src/module_type_translator");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var type_translator_1 = require("tsickle/src/type_translator");
    var ts = require("tsickle/src/typescript");
    /**
     * Symbols that are already declared as externs in Closure, that should
     * be avoided by tsickle's "declare ..." => externs.js conversion.
     */
    var CLOSURE_EXTERNS_BLACKLIST = [
        'exports',
        'global',
        'module',
        // ErrorConstructor is the interface of the Error object itself.
        // tsickle detects that this is part of the TypeScript standard library
        // and assumes it's part of the Closure standard library, but this
        // assumption is wrong for ErrorConstructor.  To properly handle this
        // we'd somehow need to map methods defined on the ErrorConstructor
        // interface into properties on Closure's Error object, but for now it's
        // simpler to just blacklist it.
        'ErrorConstructor',
        'Symbol',
        'WorkerGlobalScope',
    ];
    /**
     * The header to be used in generated externs.  This is not included in the output of
     * generateExterns() because generateExterns() works one file at a time, and typically you create
     * one externs file from the entire compilation unit.
     *
     * Suppressions:
     * - duplicate: because externs might duplicate re-opened definitions from other JS files.
     * - checkTypes: Closure's type system does not match TS'.
     * - undefinedNames: code below tries to be careful not to overwrite previously emitted definitions,
     *   but on the flip side might accidentally miss definitions.
     */
    var EXTERNS_HEADER = "/**\n * @externs\n * @suppress {duplicate,checkTypes}\n */\n// NOTE: generated by tsickle, do not edit.\n";
    /**
     * Concatenate all generated externs definitions together into a string, including a file comment
     * header.
     *
     * @param rootDir Project root.  Emitted comments will reference paths relative to this root.
     *    This param is effectively required, but made optional here until Angular is fixed.
     */
    function getGeneratedExterns(externs, rootDir) {
        if (rootDir === void 0) { rootDir = ''; }
        var e_1, _a;
        var allExterns = EXTERNS_HEADER;
        try {
            for (var _b = __values(Object.keys(externs)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var fileName = _c.value;
                allExterns += "// externs from " + path.relative(rootDir, fileName) + ":\n";
                allExterns += externs[fileName];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return allExterns;
    }
    exports.getGeneratedExterns = getGeneratedExterns;
    /**
     * Returns a mangled version of the module name (resolved file name) for source file.
     *
     * The mangled name is safe to use as a JavaScript identifier. It is used as a globally unique
     * prefix to scope symbols in externs file (see code below).
     */
    function moduleNameAsIdentifier(host, fileName) {
        return host.pathToModuleName('', fileName).replace(/\./g, '$');
    }
    exports.moduleNameAsIdentifier = moduleNameAsIdentifier;
    /**
     * isInGlobalAugmentation returns true if declaration is the immediate child of a 'declare global'
     * block.
     */
    function isInGlobalAugmentation(declaration) {
        // declare global { ... } creates a ModuleDeclaration containing a ModuleBlock containing the
        // declaration, with the ModuleDeclaration having the GlobalAugmentation flag set.
        if (!declaration.parent || !declaration.parent.parent)
            return false;
        return (declaration.parent.parent.flags & ts.NodeFlags.GlobalAugmentation) !== 0;
    }
    /**
     * generateExterns generates extern definitions for all ambient declarations in the given source
     * file. It returns a string representation of the Closure JavaScript, not including the initial
     * comment with \@fileoverview and \@externs (see above for that).
     */
    function generateExterns(typeChecker, sourceFile, host, moduleResolutionHost, options) {
        var e_2, _a, e_3, _b;
        var output = '';
        var diagnostics = [];
        var isDts = transformer_util_1.isDtsFileName(sourceFile.fileName);
        var isExternalModule = ts.isExternalModule(sourceFile);
        var mtt = new module_type_translator_1.ModuleTypeTranslator(sourceFile, typeChecker, host, diagnostics, /*isForExterns*/ true);
        var rootNamespace = '';
        if (isExternalModule) {
            // .d.ts files that are modules do not declare global symbols - their symbols must be explicitly
            // imported to be used. However Closure Compiler has no concept of externs that are modules and
            // require imports. This code mangles the symbol names by wrapping them in a top level variable
            // that's unique to this file. That allows emitting them for Closure as global symbols while
            // avoiding collisions. This is necessary as symbols local to this module can (and will very
            // commonly) conflict with the namespace used in "export as namespace", e.g. "angular", and also
            // to avoid users accidentally using these symbols in .js files (and more collisions). The
            // symbols that are "hidden" like that can be made accessible through an "export as namespace"
            // declaration (see below).
            rootNamespace = moduleNameAsIdentifier(host, sourceFile.fileName);
        }
        try {
            for (var _c = __values(sourceFile.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var stmt = _d.value;
                if (!isDts && !transformer_util_1.hasModifierFlag(stmt, ts.ModifierFlags.Ambient))
                    continue;
                visitor(stmt, []);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (output && isExternalModule) {
            // If tsickle generated any externs and this is an external module, prepend the namespace
            // declaration for it.
            output = "/** @const */\nvar " + rootNamespace + " = {};\n" + output;
            // There can only be one export =.
            var exportAssignment = sourceFile.statements.find(ts.isExportAssignment);
            var exportedNamespace = rootNamespace;
            if (exportAssignment && exportAssignment.isExportEquals) {
                if (ts.isIdentifier(exportAssignment.expression) ||
                    ts.isQualifiedName(exportAssignment.expression)) {
                    // E.g. export = someName;
                    // If someName is "declare global { namespace someName {...} }", tsickle must not qualify
                    // access to it with module namespace as it is emitted in the global namespace.
                    var symbol = typeChecker.getSymbolAtLocation(exportAssignment.expression);
                    var isGlobalSymbol = symbol && symbol.declarations &&
                        symbol.declarations.some(function (d) { return isInGlobalAugmentation(d); });
                    var entityName = transformer_util_1.getEntityNameText(exportAssignment.expression);
                    if (isGlobalSymbol) {
                        exportedNamespace = entityName;
                    }
                    else {
                        exportedNamespace = rootNamespace + '.' + entityName;
                    }
                }
                else {
                    transformer_util_1.reportDiagnostic(diagnostics, exportAssignment.expression, "export = expression must be a qualified name, got " + ts.SyntaxKind[exportAssignment.expression.kind] + ".");
                }
            }
            if (isDts && host.provideExternalModuleDtsNamespace) {
                try {
                    // In a non-shimmed module, create a global namespace. This exists purely for backwards
                    // compatiblity, in the medium term all code using tsickle should always use `goog.module`s,
                    // so global names should not be neccessary.
                    for (var _e = __values(sourceFile.statements.filter(ts.isNamespaceExportDeclaration)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var nsExport = _f.value;
                        var namespaceName = transformer_util_1.getIdentifierText(nsExport.name);
                        emit("// export as namespace " + namespaceName + "\n");
                        writeVariableStatement(namespaceName, [], exportedNamespace);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        return { output: output, diagnostics: diagnostics };
        function emit(str) {
            output += str;
        }
        /**
         * isFirstDeclaration returns true if decl is the first declaration
         * of its symbol.  E.g. imagine
         *   interface Foo { x: number; }
         *   interface Foo { y: number; }
         * we only want to emit the "\@record" for Foo on the first one.
         *
         * The exception are variable declarations, which - in externs - do not assign a value:
         *   /.. \@type {...} ./
         *   var someVariable;
         *   /.. \@type {...} ./
         *   someNamespace.someVariable;
         * If a later declaration wants to add additional properties on someVariable, tsickle must still
         * emit an assignment into the object, as it's otherwise absent.
         */
        function isFirstValueDeclaration(decl) {
            if (!decl.name)
                return true;
            var sym = typeChecker.getSymbolAtLocation(decl.name);
            if (!sym.declarations || sym.declarations.length < 2)
                return true;
            var earlierDecls = sym.declarations.slice(0, sym.declarations.indexOf(decl));
            // Either there are no earlier declarations, or all of them are variables (see above). tsickle
            // emits a value for all other declaration kinds (function for functions, classes, interfaces,
            // {} object for namespaces).
            return earlierDecls.length === 0 || earlierDecls.every(ts.isVariableDeclaration);
        }
        /** Writes the actual variable statement of a Closure variable declaration. */
        function writeVariableStatement(name, namespace, value) {
            var qualifiedName = namespace.concat([name]).join('.');
            if (namespace.length === 0)
                emit("var ");
            emit(qualifiedName);
            if (value)
                emit(" = " + value);
            emit(';\n');
        }
        /**
         * Writes a Closure variable declaration, i.e. the variable statement with a leading JSDoc
         * comment making it a declaration.
         */
        function writeVariableDeclaration(decl, namespace) {
            if (decl.name.kind === ts.SyntaxKind.Identifier) {
                var name_1 = transformer_util_1.getIdentifierText(decl.name);
                if (CLOSURE_EXTERNS_BLACKLIST.indexOf(name_1) >= 0)
                    return;
                emit(jsdoc.toString([{ tagName: 'type', type: mtt.typeToClosure(decl) }]));
                emit('\n');
                writeVariableStatement(name_1, namespace);
            }
            else {
                errorUnimplementedKind(decl.name, 'externs for variable');
            }
        }
        /**
         * Emits a JSDoc declaration that merges the signatures of the given function declaration (for
         * overloads), and returns the parameter names chosen.
         */
        function emitFunctionType(decls, extraTags) {
            if (extraTags === void 0) { extraTags = []; }
            var _a = mtt.getFunctionTypeJSDoc(decls, extraTags), tags = _a.tags, parameterNames = _a.parameterNames;
            emit('\n');
            emit(jsdoc.toString(tags));
            return parameterNames;
        }
        function writeFunction(name, params, namespace) {
            var paramsStr = params.join(', ');
            if (namespace.length > 0) {
                var fqn = namespace.join('.');
                if (name.kind === ts.SyntaxKind.Identifier) {
                    fqn += '.'; // computed names include [ ] in their getText() representation.
                }
                fqn += name.getText();
                emit(fqn + " = function(" + paramsStr + ") {};\n");
            }
            else {
                if (name.kind !== ts.SyntaxKind.Identifier) {
                    transformer_util_1.reportDiagnostic(diagnostics, name, 'Non-namespaced computed name in externs');
                }
                emit("function " + name.getText() + "(" + paramsStr + ") {}\n");
            }
        }
        function writeEnum(decl, namespace) {
            var e_4, _a;
            // E.g. /** @enum {number} */ var COUNTRY = {US: 1, CA: 1};
            var name = transformer_util_1.getIdentifierText(decl.name);
            var members = '';
            var enumType = enum_transformer_1.getEnumType(typeChecker, decl);
            // Closure enums members must have a value of the correct type, but the actual value does not
            // matter in externs.
            var initializer = enumType === 'string' ? "''" : 1;
            try {
                for (var _b = __values(decl.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var member = _c.value;
                    var memberName = void 0;
                    switch (member.name.kind) {
                        case ts.SyntaxKind.Identifier:
                            memberName = transformer_util_1.getIdentifierText(member.name);
                            break;
                        case ts.SyntaxKind.StringLiteral:
                            var text = member.name.text;
                            if (type_translator_1.isValidClosurePropertyName(text))
                                memberName = text;
                            break;
                        default:
                            break;
                    }
                    if (!memberName) {
                        members += "  /* TODO: " + ts.SyntaxKind[member.name.kind] + ": " + jsdoc_transformer_1.escapeForComment(member.name.getText()) + " */\n";
                        continue;
                    }
                    members += "  " + memberName + ": " + initializer + ",\n";
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            emit("\n/** @enum {" + enumType + "} */\n");
            writeVariableStatement(name, namespace, "{\n" + members + "}");
        }
        function writeTypeAlias(decl, namespace) {
            var typeStr = mtt.typeToClosure(decl, undefined);
            emit("\n/** @typedef {" + typeStr + "} */\n");
            writeVariableStatement(transformer_util_1.getIdentifierText(decl.name), namespace);
        }
        function writeType(decl, namespace) {
            var e_5, _a, e_6, _b;
            var name = decl.name;
            if (!name) {
                transformer_util_1.reportDiagnostic(diagnostics, decl, 'anonymous type in externs');
                return;
            }
            var typeName = namespace.concat([name.getText()]).join('.');
            if (CLOSURE_EXTERNS_BLACKLIST.indexOf(typeName) >= 0)
                return;
            if (isFirstValueDeclaration(decl)) {
                // Emit the 'function' that is actually the declaration of the interface
                // itself.  If it's a class, this function also must include the type
                // annotations of the constructor.
                var paramNames = [];
                var jsdocTags = [];
                var wroteJsDoc = false;
                jsdoc_transformer_1.maybeAddHeritageClauses(jsdocTags, mtt, decl);
                jsdoc_transformer_1.maybeAddTemplateClause(jsdocTags, decl);
                if (decl.kind === ts.SyntaxKind.ClassDeclaration) {
                    // TODO: it appears you can just write 'class Foo { ...' in externs.
                    // This code instead tries to translate it to a function.
                    jsdocTags.push({ tagName: 'constructor' }, { tagName: 'struct' });
                    var ctors = decl
                        .members.filter(function (m) { return m.kind === ts.SyntaxKind.Constructor; });
                    if (ctors.length) {
                        var firstCtor = ctors[0];
                        if (ctors.length > 1) {
                            paramNames = emitFunctionType(ctors, jsdocTags);
                        }
                        else {
                            paramNames = emitFunctionType([firstCtor], jsdocTags);
                        }
                        wroteJsDoc = true;
                    }
                }
                else {
                    // Otherwise it's an interface; tag it as structurally typed.
                    jsdocTags.push({ tagName: 'record' }, { tagName: 'struct' });
                }
                if (!wroteJsDoc)
                    emit(jsdoc.toString(jsdocTags));
                writeFunction(name, paramNames, namespace);
            }
            // Process everything except (MethodSignature|MethodDeclaration|Constructor)
            var methods = new Map();
            try {
                for (var _c = __values(decl.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var member = _d.value;
                    switch (member.kind) {
                        case ts.SyntaxKind.PropertySignature:
                        case ts.SyntaxKind.PropertyDeclaration:
                            var prop = member;
                            if (prop.name.kind === ts.SyntaxKind.Identifier) {
                                var type = mtt.typeToClosure(prop);
                                if (prop.questionToken && type === '?') {
                                    // An optional 'any' type translates to '?|undefined' in Closure.
                                    type = '?|undefined';
                                }
                                emit(jsdoc.toString([{ tagName: 'type', type: type }]));
                                if (transformer_util_1.hasModifierFlag(prop, ts.ModifierFlags.Static)) {
                                    emit("\n" + typeName + "." + prop.name.getText() + ";\n");
                                }
                                else {
                                    emit("\n" + typeName + ".prototype." + prop.name.getText() + ";\n");
                                }
                                continue;
                            }
                            // TODO: For now property names other than Identifiers are not handled; e.g.
                            //    interface Foo { "123bar": number }
                            break;
                        case ts.SyntaxKind.MethodSignature:
                        case ts.SyntaxKind.MethodDeclaration:
                            var method = member;
                            var isStatic = transformer_util_1.hasModifierFlag(method, ts.ModifierFlags.Static);
                            var methodSignature = method.name.getText() + "$$$" + (isStatic ? 'static' : 'instance');
                            if (methods.has(methodSignature)) {
                                methods.get(methodSignature).push(method);
                            }
                            else {
                                methods.set(methodSignature, [method]);
                            }
                            continue;
                        case ts.SyntaxKind.Constructor:
                            continue; // Handled above.
                        default:
                            // Members can include things like index signatures, for e.g.
                            //   interface Foo { [key: string]: number; }
                            // For now, just skip it.
                            break;
                    }
                    // If we get here, the member wasn't handled in the switch statement.
                    var memberName = namespace;
                    if (member.name) {
                        memberName = memberName.concat([member.name.getText()]);
                    }
                    emit("\n/* TODO: " + ts.SyntaxKind[member.kind] + ": " + memberName.join('.') + " */\n");
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_5) throw e_5.error; }
            }
            try {
                // Handle method declarations/signatures separately, since we need to deal with overloads.
                for (var _e = __values(Array.from(methods.values())), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var methodVariants = _f.value;
                    var firstMethodVariant = methodVariants[0];
                    var parameterNames = void 0;
                    if (methodVariants.length > 1) {
                        parameterNames = emitFunctionType(methodVariants);
                    }
                    else {
                        parameterNames = emitFunctionType([firstMethodVariant]);
                    }
                    var methodNamespace = namespace.concat([name.getText()]);
                    // If the method is static, don't add the prototype.
                    if (!transformer_util_1.hasModifierFlag(firstMethodVariant, ts.ModifierFlags.Static)) {
                        methodNamespace.push('prototype');
                    }
                    writeFunction(firstMethodVariant.name, parameterNames, methodNamespace);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        /**
         * Adds aliases for the symbols imported in the given declaration, so that their types get
         * printed as the fully qualified name, and not just as a reference to the local import alias.
         *
         * tsickle generates .js files that (at most) contain a `goog.provide`, but are not
         * `goog.module`s. These files cannot express an aliased import. However Closure Compiler allows
         * referencing types using fully qualified names in such files, so tsickle can resolve the
         * imported module URI and produce `path.to.module.Symbol` as an alias, and use that when
         * referencing the type.
         */
        function addImportAliases(decl) {
            var e_7, _a;
            var moduleUri;
            if (ts.isImportDeclaration(decl)) {
                moduleUri = decl.moduleSpecifier.text;
            }
            else if (ts.isExternalModuleReference(decl.moduleReference)) {
                // import foo = require('./bar');
                moduleUri = decl.moduleReference.expression.text;
            }
            else {
                // import foo = bar.baz.bam;
                // unsupported.
                return;
            }
            var googNamespace = googmodule_1.extractGoogNamespaceImport(moduleUri);
            var moduleName = googNamespace ||
                host.pathToModuleName(sourceFile.fileName, googmodule_1.resolveModuleName(host, sourceFile.fileName, moduleUri));
            if (ts.isImportEqualsDeclaration(decl)) {
                // import foo = require('./bar');
                addImportAlias(decl.name, moduleName, undefined);
                return;
            }
            // Side effect import 'path'; declares no local aliases.
            if (!decl.importClause)
                return;
            if (decl.importClause.name) {
                // import name from ... -> map to .default on the module.name.
                if (googNamespace) {
                    addImportAlias(decl.importClause.name, googNamespace, undefined);
                }
                else {
                    addImportAlias(decl.importClause.name, moduleName, 'default');
                }
            }
            var namedBindings = decl.importClause.namedBindings;
            if (!namedBindings)
                return;
            if (ts.isNamespaceImport(namedBindings)) {
                // import * as name -> map directly to the module.name.
                addImportAlias(namedBindings.name, moduleName, undefined);
            }
            if (ts.isNamedImports(namedBindings)) {
                try {
                    // import {A as B}, map to module.name.A
                    for (var _b = __values(namedBindings.elements), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var namedBinding = _c.value;
                        addImportAlias(namedBinding.name, moduleName, namedBinding.name);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
        }
        /**
         * Adds an import alias for the symbol defined at the given node. Creates an alias name based on
         * the given moduleName and (optionally) the name.
         */
        function addImportAlias(node, moduleName, name) {
            var symbol = typeChecker.getSymbolAtLocation(node);
            if (!symbol) {
                transformer_util_1.reportDiagnostic(diagnostics, node, "named import has no symbol");
                return;
            }
            var aliasName = moduleName;
            if (typeof name === 'string') {
                aliasName += '.' + name;
            }
            else if (name) {
                aliasName += '.' + transformer_util_1.getIdentifierText(name);
            }
            if (symbol.flags & ts.SymbolFlags.Alias) {
                symbol = typeChecker.getAliasedSymbol(symbol);
            }
            mtt.symbolsToAliasedNames.set(symbol, aliasName);
        }
        /**
         * Produces a compiler error that references the Node's kind. This is useful for the "else"
         * branch of code that is attempting to handle all possible input Node types, to ensure all cases
         * covered.
         */
        function errorUnimplementedKind(node, where) {
            transformer_util_1.reportDiagnostic(diagnostics, node, ts.SyntaxKind[node.kind] + " not implemented in " + where);
        }
        /**
         * getNamespaceForLocalDeclaration returns the namespace that should be used for the given
         * declaration, deciding whether to namespace the symbol to the file or whether to create a
         * global name.
         *
         * The function covers these cases:
         * 1) a declaration in a .d.ts
         * 1a) where the .d.ts is an external module     --> namespace
         * 1b) where the .d.ts is not an external module --> global
         * 2) a declaration in a .ts file (all are treated as modules)
         * 2a) that is exported                          --> namespace
         * 2b) that is unexported                        --> global
         *
         * For 1), all symbols in .d.ts should generally be namespaced to the file to avoid collisions.
         * However .d.ts files that are not external modules do declare global names (1b).
         *
         * For 2), ambient declarations in .ts files must be namespaced, for the same collision reasons.
         * The exception is 2b), where in TypeScript, an unexported local "declare const x: string;"
         * creates a symbol that, when used locally, is emitted as just "x". That is, it behaves
         * like a variable declared in a 'declare global' block. Closure Compiler would fail the build if
         * there is no declaration for "x", so tsickle must generate a global external symbol, i.e.
         * without the namespace wrapper.
         */
        function getNamespaceForTopLevelDeclaration(declaration, namespace) {
            // Only use rootNamespace for top level symbols, any other namespacing (global names, nested
            // namespaces) is always kept.
            if (namespace.length !== 0)
                return namespace;
            // All names in a module (external) .d.ts file can only be accessed locally, so they always get
            // namespace prefixed.
            if (isDts && isExternalModule)
                return [rootNamespace];
            // Same for exported declarations in regular .ts files.
            if (transformer_util_1.hasModifierFlag(declaration, ts.ModifierFlags.Export))
                return [rootNamespace];
            // But local declarations in .ts files or .d.ts files (1b, 2b) are global, too.
            return [];
        }
        function visitor(node, namespace) {
            var e_8, _a, e_9, _b;
            if (node.parent === sourceFile) {
                namespace = getNamespaceForTopLevelDeclaration(node, namespace);
            }
            switch (node.kind) {
                case ts.SyntaxKind.ModuleDeclaration:
                    var decl = node;
                    switch (decl.name.kind) {
                        case ts.SyntaxKind.Identifier:
                            if (decl.flags & ts.NodeFlags.GlobalAugmentation) {
                                // E.g. "declare global { ... }".  Reset to the outer namespace.
                                namespace = [];
                            }
                            else {
                                // E.g. "declare namespace foo {"
                                var name_2 = transformer_util_1.getIdentifierText(decl.name);
                                if (isFirstValueDeclaration(decl)) {
                                    emit('/** @const */\n');
                                    writeVariableStatement(name_2, namespace, '{}');
                                }
                                namespace = namespace.concat(name_2);
                            }
                            if (decl.body)
                                visitor(decl.body, namespace);
                            break;
                        case ts.SyntaxKind.StringLiteral:
                            // E.g. "declare module 'foo' {" (note the quotes).
                            // We still want to emit externs for this module, but Closure doesn't provide a
                            // mechanism for module-scoped externs. Instead, we emit in a mangled namespace.
                            // The mangled namespace (after resolving files) matches the emit for an original module
                            // file, so effectively this augments any existing module.
                            var importName = decl.name.text;
                            var importedModuleName = googmodule_1.resolveModuleName({ host: moduleResolutionHost, options: options }, sourceFile.fileName, importName);
                            var mangled = moduleNameAsIdentifier(host, importedModuleName);
                            emit("// Derived from: declare module \"" + importName + "\"\n");
                            namespace = [mangled];
                            // Declare "mangled$name" if it's not declared already elsewhere.
                            if (isFirstValueDeclaration(decl)) {
                                emit('/** @const */\n');
                                writeVariableStatement(mangled, [], '{}');
                            }
                            // Declare the contents inside the "mangled$name".
                            if (decl.body)
                                visitor(decl.body, [mangled]);
                            break;
                        default:
                            errorUnimplementedKind(decl.name, 'externs generation of namespace');
                            break;
                    }
                    break;
                case ts.SyntaxKind.ModuleBlock:
                    var block = node;
                    try {
                        for (var _c = __values(block.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var stmt = _d.value;
                            visitor(stmt, namespace);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    break;
                case ts.SyntaxKind.ImportEqualsDeclaration:
                    var importEquals = node;
                    var localName = transformer_util_1.getIdentifierText(importEquals.name);
                    if (localName === 'ng') {
                        emit("\n/* Skipping problematic import ng = ...; */\n");
                        break;
                    }
                    if (importEquals.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference) {
                        addImportAliases(importEquals);
                        break;
                    }
                    var qn = transformer_util_1.getEntityNameText(importEquals.moduleReference);
                    // @const so that Closure Compiler understands this is an alias.
                    if (namespace.length === 0)
                        emit('/** @const */\n');
                    writeVariableStatement(localName, namespace, qn);
                    break;
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                    writeType(node, namespace);
                    break;
                case ts.SyntaxKind.FunctionDeclaration:
                    var fnDecl = node;
                    var name_3 = fnDecl.name;
                    if (!name_3) {
                        transformer_util_1.reportDiagnostic(diagnostics, fnDecl, 'anonymous function in externs');
                        break;
                    }
                    // Gather up all overloads of this function.
                    var sym = typeChecker.getSymbolAtLocation(name_3);
                    var decls = sym.declarations.filter(ts.isFunctionDeclaration);
                    // Only emit the first declaration of each overloaded function.
                    if (fnDecl !== decls[0])
                        break;
                    var params = emitFunctionType(decls);
                    writeFunction(name_3, params, namespace);
                    break;
                case ts.SyntaxKind.VariableStatement:
                    try {
                        for (var _e = __values(node.declarationList.declarations), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var decl_1 = _f.value;
                            writeVariableDeclaration(decl_1, namespace);
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    break;
                case ts.SyntaxKind.EnumDeclaration:
                    writeEnum(node, namespace);
                    break;
                case ts.SyntaxKind.TypeAliasDeclaration:
                    writeTypeAlias(node, namespace);
                    break;
                case ts.SyntaxKind.ImportDeclaration:
                    addImportAliases(node);
                    break;
                case ts.SyntaxKind.NamespaceExportDeclaration:
                case ts.SyntaxKind.ExportAssignment:
                    // Handled on the file level.
                    break;
                default:
                    var locationStr = namespace.join('.') || path.basename(node.getSourceFile().fileName);
                    emit("\n// TODO(tsickle): " + ts.SyntaxKind[node.kind] + " in " + locationStr + "\n");
                    break;
            }
        }
    }
    exports.generateExterns = generateExterns;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leHRlcm5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQStDRztJQUVILDJCQUE2QjtJQUU3QixpRUFBK0M7SUFDL0MscURBQTJFO0lBQzNFLHlDQUFpQztJQUNqQyxtRUFBcUg7SUFDckgsNkVBQThEO0lBQzlELGlFQUEwSDtJQUMxSCwrREFBNkQ7SUFDN0QsMkNBQW1DO0lBRW5DOzs7T0FHRztJQUNILElBQU0seUJBQXlCLEdBQTBCO1FBQ3ZELFNBQVM7UUFDVCxRQUFRO1FBQ1IsUUFBUTtRQUNSLGdFQUFnRTtRQUNoRSx1RUFBdUU7UUFDdkUsa0VBQWtFO1FBQ2xFLHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUsd0VBQXdFO1FBQ3hFLGdDQUFnQztRQUNoQyxrQkFBa0I7UUFDbEIsUUFBUTtRQUNSLG1CQUFtQjtLQUNwQixDQUFDO0lBR0Y7Ozs7Ozs7Ozs7T0FVRztJQUNILElBQU0sY0FBYyxHQUFHLDJHQUt0QixDQUFDO0lBRUY7Ozs7OztPQU1HO0lBQ0gsNkJBQW9DLE9BQXFDLEVBQUUsT0FBWTtRQUFaLHdCQUFBLEVBQUEsWUFBWTs7UUFDckYsSUFBSSxVQUFVLEdBQUcsY0FBYyxDQUFDOztZQUNoQyxLQUF1QixJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO2dCQUF4QyxJQUFNLFFBQVEsV0FBQTtnQkFDakIsVUFBVSxJQUFJLHFCQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsUUFBSyxDQUFDO2dCQUN2RSxVQUFVLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2pDOzs7Ozs7Ozs7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UixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCO29CQUNsQyxnQkFBZ0IsQ0FBQyxJQUE0QixDQUFDLENBQUM7b0JBQy9DLE1BQU07Z0JBQ1IsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLDBCQUEwQixDQUFDO2dCQUM5QyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCO29CQUNqQyw2QkFBNkI7b0JBQzdCLE1BQU07Z0JBQ1I7b0JBQ0UsSUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEYsSUFBSSxDQUFDLHlCQUF1QixFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBTyxXQUFXLE9BQUksQ0FBQyxDQUFDO29CQUM1RSxNQUFNO2FBQ1Q7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQTVpQkQsMENBNGlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEV4dGVybnMgY3JlYXRlcyBDbG9zdXJlIENvbXBpbGVyIFxcQGV4dGVybnMgZGVmaW5pdGlvbnMgZnJvbSB0aGVcbiAqIGFtYmllbnQgZGVjbGFyYXRpb25zIGluIGEgVHlwZVNjcmlwdCBmaWxlLlxuICpcbiAqIEZvciBleGFtcGxlLCBhIGRlY2xhcmUgaW50ZXJmYWNlIEZvbyB7IGJhcjogc3RyaW5nOyB9IFdvdWxkIGdlbmVyYXRlIGEgLy4uXG4gKiAgIFxcQGV4dGVybnMgLi8gLy4uIFxcQHJlY29yZCAuLyB2YXIgRm9vID0gZnVuY3Rpb24oKSB7fTsgLy4uIFxcQHR5cGUge3N0cmluZ31cbiAqICAgLi8gRm9vLnByb3RvdHlwZS5iYXI7XG4gKlxuICogVGhlIGdlbmVyYXRlZCBleHRlcm5zIGluZGljYXRlIHRvIENsb3N1cmUgQ29tcGlsZXIgdGhhdCBzeW1ib2xzIGFyZSBleHRlcm5hbFxuICogdG8gdGhlIG9wdGltaXphdGlvbiBwcm9jZXNzLCBpLmUuIHRoZXkgYXJlIHByb3ZpZGVkIGJ5IG91dHNpZGUgY29kZS4gVGhhdFxuICogbW9zdCBpbXBvcnRhbnRseSBtZWFucyB0aGV5IG11c3Qgbm90IGJlIHJlbmFtZWQgb3IgcmVtb3ZlZC5cbiAqXG4gKiBBIG1ham9yIGRpZmZpY3VsdHkgaGVyZSBpcyB0aGF0IFR5cGVTY3JpcHQgc3VwcG9ydHMgbW9kdWxlLXNjb3BlZCBleHRlcm5hbFxuICogc3ltYm9sczsgYC5kLnRzYCBmaWxlcyBjYW4gY29udGFpbiBgZXhwb3J0YHMgYW5kIGBpbXBvcnRgIG90aGVyIGZpbGVzLlxuICogQ2xvc3VyZSBDb21waWxlciBkb2VzIG5vdCBoYXZlIHN1Y2ggYSBjb25jZXB0LCBzbyB0c2lja2xlIG11c3QgZW11bGF0ZSB0aGVcbiAqIGJlaGF2aW91ci4gSXQgZG9lcyBzbyBieSBmb2xsb3dpbmcgdGhpcyBzY2hlbWU6XG4gKlxuICogMS4gbm9uLW1vZHVsZSAuZC50cyBwcm9kdWNlcyBnbG9iYWwgc3ltYm9sc1xuICogMi4gbW9kdWxlIC5kLnRzIHByb2R1Y2Ugc3ltYm9scyBuYW1lc3BhY2VkIHRvIHRoZSBtb2R1bGUsIGJ5IGNyZWF0aW5nIGFcbiAqICAgIG1hbmdsZWQgbmFtZSBtYXRjaGluZyB0aGUgY3VycmVudCBmaWxlJ3MgcGF0aC4gdHNpY2tsZSBleHBlY3RzIG91dHNpZGVcbiAqICAgIGNvZGUgKGUuZy4gYnVpbGQgc3lzdGVtIGludGVncmF0aW9uIG9yIG1hbnVhbGx5IHdyaXR0ZW4gY29kZSkgdG8gY29udGFpbiBhXG4gKiAgICBnb29nLm1vZHVsZS9wcm92aWRlIHRoYXQgcmVmZXJlbmNlcyB0aGUgbWFuZ2xlZCBwYXRoLlxuICogMy4gZGVjbGFyYXRpb25zIGluIGAudHNgIGZpbGVzIHByb2R1Y2UgdHlwZXMgdGhhdCBjYW4gYmUgc2VwYXJhdGVseSBlbWl0dGVkXG4gKiAgICBpbiBlLmcuIGFuIGBleHRlcm5zLmpzYCwgdXNpbmcgYGdldEdlbmVyYXRlZEV4dGVybnNgIGJlbG93LlxuICogICAgMS4gbm9uLWV4cG9ydGVkIHN5bWJvbHMgcHJvZHVjZSBnbG9iYWwgdHlwZXMsIGJlY2F1c2UgdGhhdCdzIHdoYXQgdXNlcnNcbiAqICAgICAgIGV4cGVjdCBhbmQgaXQgbWF0Y2hlcyBUeXBlU2NyaXB0cyBlbWl0LCB3aGljaCBqdXN0IHJlZmVyZW5jZXMgYEZvb2AgZm9yXG4gKiAgICAgICBhIGxvY2FsbHkgZGVjbGFyZWQgc3ltYm9sIGBGb29gIGluIGEgbW9kdWxlLiBBcmd1YWJseSB0aGVzZSBzaG91bGQgYmVcbiAqICAgICAgIHdyYXBwZWQgaW4gYGRlY2xhcmUgZ2xvYmFsIHsgLi4uIH1gLlxuICogICAgMi4gZXhwb3J0ZWQgc3ltYm9scyBhcmUgc2NvcGVkIHRvIHRoZSBgLnRzYCBmaWxlIGJ5IHByZWZpeGluZyB0aGVtIHdpdGggYVxuICogICAgICAgbWFuZ2xlZCBuYW1lLiBFeHBvcnRlZCB0eXBlcyBhcmUgcmUtZXhwb3J0ZWQgZnJvbSB0aGUgSmF2YVNjcmlwdFxuICogICAgICAgYGdvb2cubW9kdWxlYCwgYWxsb3dpbmcgZG93bnN0cmVhbSBjb2RlIHRvIHJlZmVyZW5jZSB0aGVtLiBUaGlzIGhhcyB0aGVcbiAqICAgICAgIHNhbWUgcHJvYmxlbSByZWdhcmRpbmcgYW1iaWVudCB2YWx1ZXMgYXMgYWJvdmUsIGl0IGlzIHVuY2xlYXIgd2hlcmUgdGhlXG4gKiAgICAgICB2YWx1ZSBzeW1ib2wgd291bGQgYmUgZGVmaW5lZCwgc28gZm9yIHRoZSB0aW1lIGJlaW5nIHRoaXMgaXNcbiAqICAgICAgIHVuc3VwcG9ydGVkLlxuICpcbiAqIFRoZSBlZmZlY3Qgb2YgdGhpcyBpcyB0aGF0OlxuICogLSBzeW1ib2xzIGluIGEgbW9kdWxlIChpLmUuIG5vdCBnbG9iYWxzKSBhcmUgZ2VuZXJhbGx5IHNjb3BlZCB0byB0aGUgbG9jYWxcbiAqICAgbW9kdWxlIHVzaW5nIGEgbWFuZ2xlZCBuYW1lLCBwcmV2ZW50aW5nIHN5bWJvbCBjb2xsaXNpb25zIG9uIHRoZSBDbG9zdXJlXG4gKiAgIHNpZGUuXG4gKiAtIGltcG9ydGluZyBjb2RlIGNhbiB1bmNvbmRpdGlvbmFsbHkgcmVmZXIgdG8gYW5kIGltcG9ydCBhbnkgc3ltYm9sIGRlZmluZWRcbiAqICAgaW4gYSBtb2R1bGUgYFhgIGFzIGBwYXRoLnRvLm1vZHVsZS5YYCwgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBkZWZpbmluZ1xuICogICBsb2NhdGlvbiBpcyBhIGAuZC50c2AgZmlsZSBvciBhIGAudHNgIGZpbGUsIGFuZCByZWdhcmRsZXNzIHdoZXRoZXIgdGhlXG4gKiAgIHN5bWJvbCBpcyBhbWJpZW50IChhc3N1bWluZyB0aGVyZSdzIGFuIGFwcHJvcHJpYXRlIHNoaW0pLlxuICogLSBpZiB0aGVyZSBpcyBhIHNoaW0gcHJlc2VudCwgdHNpY2tsZSBhdm9pZHMgZW1pdHRpbmcgdGhlIENsb3N1cmUgbmFtZXNwYWNlXG4gKiAgIGl0c2VsZiwgZXhwZWN0aW5nIHRoZSBzaGltIHRvIHByb3ZpZGUgdGhlIG5hbWVzcGFjZSBhbmQgaW5pdGlhbGl6ZSBpdCB0byBhXG4gKiAgIHN5bWJvbCB0aGF0IHByb3ZpZGVzIHRoZSByaWdodCB2YWx1ZSBhdCBydW50aW1lIChpLmUuIHRoZSBpbXBsZW1lbnRhdGlvbiBvZlxuICogICB3aGF0ZXZlciB0aGlyZCBwYXJ0eSBsaWJyYXJ5IHRoZSAuZC50cyBkZXNjcmliZXMpLlxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0RW51bVR5cGV9IGZyb20gJy4vZW51bV90cmFuc2Zvcm1lcic7XG5pbXBvcnQge2V4dHJhY3RHb29nTmFtZXNwYWNlSW1wb3J0LCByZXNvbHZlTW9kdWxlTmFtZX0gZnJvbSAnLi9nb29nbW9kdWxlJztcbmltcG9ydCAqIGFzIGpzZG9jIGZyb20gJy4vanNkb2MnO1xuaW1wb3J0IHtBbm5vdGF0b3JIb3N0LCBlc2NhcGVGb3JDb21tZW50LCBtYXliZUFkZEhlcml0YWdlQ2xhdXNlcywgbWF5YmVBZGRUZW1wbGF0ZUNsYXVzZX0gZnJvbSAnLi9qc2RvY190cmFuc2Zvcm1lcic7XG5pbXBvcnQge01vZHVsZVR5cGVUcmFuc2xhdG9yfSBmcm9tICcuL21vZHVsZV90eXBlX3RyYW5zbGF0b3InO1xuaW1wb3J0IHtnZXRFbnRpdHlOYW1lVGV4dCwgZ2V0SWRlbnRpZmllclRleHQsIGhhc01vZGlmaWVyRmxhZywgaXNEdHNGaWxlTmFtZSwgcmVwb3J0RGlhZ25vc3RpY30gZnJvbSAnLi90cmFuc2Zvcm1lcl91dGlsJztcbmltcG9ydCB7aXNWYWxpZENsb3N1cmVQcm9wZXJ0eU5hbWV9IGZyb20gJy4vdHlwZV90cmFuc2xhdG9yJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogU3ltYm9scyB0aGF0IGFyZSBhbHJlYWR5IGRlY2xhcmVkIGFzIGV4dGVybnMgaW4gQ2xvc3VyZSwgdGhhdCBzaG91bGRcbiAqIGJlIGF2b2lkZWQgYnkgdHNpY2tsZSdzIFwiZGVjbGFyZSAuLi5cIiA9PiBleHRlcm5zLmpzIGNvbnZlcnNpb24uXG4gKi9cbmNvbnN0IENMT1NVUkVfRVhURVJOU19CTEFDS0xJU1Q6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiA9IFtcbiAgJ2V4cG9ydHMnLFxuICAnZ2xvYmFsJyxcbiAgJ21vZHVsZScsXG4gIC8vIEVycm9yQ29uc3RydWN0b3IgaXMgdGhlIGludGVyZmFjZSBvZiB0aGUgRXJyb3Igb2JqZWN0IGl0c2VsZi5cbiAgLy8gdHNpY2tsZSBkZXRlY3RzIHRoYXQgdGhpcyBpcyBwYXJ0IG9mIHRoZSBUeXBlU2NyaXB0IHN0YW5kYXJkIGxpYnJhcnlcbiAgLy8gYW5kIGFzc3VtZXMgaXQncyBwYXJ0IG9mIHRoZSBDbG9zdXJlIHN0YW5kYXJkIGxpYnJhcnksIGJ1dCB0aGlzXG4gIC8vIGFzc3VtcHRpb24gaXMgd3JvbmcgZm9yIEVycm9yQ29uc3RydWN0b3IuICBUbyBwcm9wZXJseSBoYW5kbGUgdGhpc1xuICAvLyB3ZSdkIHNvbWVob3cgbmVlZCB0byBtYXAgbWV0aG9kcyBkZWZpbmVkIG9uIHRoZSBFcnJvckNvbnN0cnVjdG9yXG4gIC8vIGludGVyZmFjZSBpbnRvIHByb3BlcnRpZXMgb24gQ2xvc3VyZSdzIEVycm9yIG9iamVjdCwgYnV0IGZvciBub3cgaXQnc1xuICAvLyBzaW1wbGVyIHRvIGp1c3QgYmxhY2tsaXN0IGl0LlxuICAnRXJyb3JDb25zdHJ1Y3RvcicsXG4gICdTeW1ib2wnLFxuICAnV29ya2VyR2xvYmFsU2NvcGUnLFxuXTtcblxuXG4vKipcbiAqIFRoZSBoZWFkZXIgdG8gYmUgdXNlZCBpbiBnZW5lcmF0ZWQgZXh0ZXJucy4gIFRoaXMgaXMgbm90IGluY2x1ZGVkIGluIHRoZSBvdXRwdXQgb2ZcbiAqIGdlbmVyYXRlRXh0ZXJucygpIGJlY2F1c2UgZ2VuZXJhdGVFeHRlcm5zKCkgd29ya3Mgb25lIGZpbGUgYXQgYSB0aW1lLCBhbmQgdHlwaWNhbGx5IHlvdSBjcmVhdGVcbiAqIG9uZSBleHRlcm5zIGZpbGUgZnJvbSB0aGUgZW50aXJlIGNvbXBpbGF0aW9uIHVuaXQuXG4gKlxuICogU3VwcHJlc3Npb25zOlxuICogLSBkdXBsaWNhdGU6IGJlY2F1c2UgZXh0ZXJucyBtaWdodCBkdXBsaWNhdGUgcmUtb3BlbmVkIGRlZmluaXRpb25zIGZyb20gb3RoZXIgSlMgZmlsZXMuXG4gKiAtIGNoZWNrVHlwZXM6IENsb3N1cmUncyB0eXBlIHN5c3RlbSBkb2VzIG5vdCBtYXRjaCBUUycuXG4gKiAtIHVuZGVmaW5lZE5hbWVzOiBjb2RlIGJlbG93IHRyaWVzIHRvIGJlIGNhcmVmdWwgbm90IHRvIG92ZXJ3cml0ZSBwcmV2aW91c2x5IGVtaXR0ZWQgZGVmaW5pdGlvbnMsXG4gKiAgIGJ1dCBvbiB0aGUgZmxpcCBzaWRlIG1pZ2h0IGFjY2lkZW50YWxseSBtaXNzIGRlZmluaXRpb25zLlxuICovXG5jb25zdCBFWFRFUk5TX0hFQURFUiA9IGAvKipcbiAqIEBleHRlcm5zXG4gKiBAc3VwcHJlc3Mge2R1cGxpY2F0ZSxjaGVja1R5cGVzfVxuICovXG4vLyBOT1RFOiBnZW5lcmF0ZWQgYnkgdHNpY2tsZSwgZG8gbm90IGVkaXQuXG5gO1xuXG4vKipcbiAqIENvbmNhdGVuYXRlIGFsbCBnZW5lcmF0ZWQgZXh0ZXJucyBkZWZpbml0aW9ucyB0b2dldGhlciBpbnRvIGEgc3RyaW5nLCBpbmNsdWRpbmcgYSBmaWxlIGNvbW1lbnRcbiAqIGhlYWRlci5cbiAqXG4gKiBAcGFyYW0gcm9vdERpciBQcm9qZWN0IHJvb3QuICBFbWl0dGVkIGNvbW1lbnRzIHdpbGwgcmVmZXJlbmNlIHBhdGhzIHJlbGF0aXZlIHRvIHRoaXMgcm9vdC5cbiAqICAgIFRoaXMgcGFyYW0gaXMgZWZmZWN0aXZlbHkgcmVxdWlyZWQsIGJ1dCBtYWRlIG9wdGlvbmFsIGhlcmUgdW50aWwgQW5ndWxhciBpcyBmaXhlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEdlbmVyYXRlZEV4dGVybnMoZXh0ZXJuczoge1tmaWxlTmFtZTogc3RyaW5nXTogc3RyaW5nfSwgcm9vdERpciA9ICcnKTogc3RyaW5nIHtcbiAgbGV0IGFsbEV4dGVybnMgPSBFWFRFUk5TX0hFQURFUjtcbiAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBPYmplY3Qua2V5cyhleHRlcm5zKSkge1xuICAgIGFsbEV4dGVybnMgKz0gYC8vIGV4dGVybnMgZnJvbSAke3BhdGgucmVsYXRpdmUocm9vdERpciwgZmlsZU5hbWUpfTpcXG5gO1xuICAgIGFsbEV4dGVybnMgKz0gZXh0ZXJuc1tmaWxlTmFtZV07XG4gIH1cbiAgcmV0dXJuIGFsbEV4dGVybnM7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG1hbmdsZWQgdmVyc2lvbiBvZiB0aGUgbW9kdWxlIG5hbWUgKHJlc29sdmVkIGZpbGUgbmFtZSkgZm9yIHNvdXJjZSBmaWxlLlxuICpcbiAqIFRoZSBtYW5nbGVkIG5hbWUgaXMgc2FmZSB0byB1c2UgYXMgYSBKYXZhU2NyaXB0IGlkZW50aWZpZXIuIEl0IGlzIHVzZWQgYXMgYSBnbG9iYWxseSB1bmlxdWVcbiAqIHByZWZpeCB0byBzY29wZSBzeW1ib2xzIGluIGV4dGVybnMgZmlsZSAoc2VlIGNvZGUgYmVsb3cpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbW9kdWxlTmFtZUFzSWRlbnRpZmllcihob3N0OiBBbm5vdGF0b3JIb3N0LCBmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGhvc3QucGF0aFRvTW9kdWxlTmFtZSgnJywgZmlsZU5hbWUpLnJlcGxhY2UoL1xcLi9nLCAnJCcpO1xufVxuXG4vKipcbiAqIGlzSW5HbG9iYWxBdWdtZW50YXRpb24gcmV0dXJucyB0cnVlIGlmIGRlY2xhcmF0aW9uIGlzIHRoZSBpbW1lZGlhdGUgY2hpbGQgb2YgYSAnZGVjbGFyZSBnbG9iYWwnXG4gKiBibG9jay5cbiAqL1xuZnVuY3Rpb24gaXNJbkdsb2JhbEF1Z21lbnRhdGlvbihkZWNsYXJhdGlvbjogdHMuRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgLy8gZGVjbGFyZSBnbG9iYWwgeyAuLi4gfSBjcmVhdGVzIGEgTW9kdWxlRGVjbGFyYXRpb24gY29udGFpbmluZyBhIE1vZHVsZUJsb2NrIGNvbnRhaW5pbmcgdGhlXG4gIC8vIGRlY2xhcmF0aW9uLCB3aXRoIHRoZSBNb2R1bGVEZWNsYXJhdGlvbiBoYXZpbmcgdGhlIEdsb2JhbEF1Z21lbnRhdGlvbiBmbGFnIHNldC5cbiAgaWYgKCFkZWNsYXJhdGlvbi5wYXJlbnQgfHwgIWRlY2xhcmF0aW9uLnBhcmVudC5wYXJlbnQpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIChkZWNsYXJhdGlvbi5wYXJlbnQucGFyZW50LmZsYWdzICYgdHMuTm9kZUZsYWdzLkdsb2JhbEF1Z21lbnRhdGlvbikgIT09IDA7XG59XG5cbi8qKlxuICogZ2VuZXJhdGVFeHRlcm5zIGdlbmVyYXRlcyBleHRlcm4gZGVmaW5pdGlvbnMgZm9yIGFsbCBhbWJpZW50IGRlY2xhcmF0aW9ucyBpbiB0aGUgZ2l2ZW4gc291cmNlXG4gKiBmaWxlLiBJdCByZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDbG9zdXJlIEphdmFTY3JpcHQsIG5vdCBpbmNsdWRpbmcgdGhlIGluaXRpYWxcbiAqIGNvbW1lbnQgd2l0aCBcXEBmaWxlb3ZlcnZpZXcgYW5kIFxcQGV4dGVybnMgKHNlZSBhYm92ZSBmb3IgdGhhdCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUV4dGVybnMoXG4gICAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBob3N0OiBBbm5vdGF0b3JIb3N0LFxuICAgIG1vZHVsZVJlc29sdXRpb25Ib3N0OiB0cy5Nb2R1bGVSZXNvbHV0aW9uSG9zdCxcbiAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiB7b3V0cHV0OiBzdHJpbmcsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW119IHtcbiAgbGV0IG91dHB1dCA9ICcnO1xuICBjb25zdCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gIGNvbnN0IGlzRHRzID0gaXNEdHNGaWxlTmFtZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgY29uc3QgaXNFeHRlcm5hbE1vZHVsZSA9IHRzLmlzRXh0ZXJuYWxNb2R1bGUoc291cmNlRmlsZSk7XG5cbiAgY29uc3QgbXR0ID1cbiAgICAgIG5ldyBNb2R1bGVUeXBlVHJhbnNsYXRvcihzb3VyY2VGaWxlLCB0eXBlQ2hlY2tlciwgaG9zdCwgZGlhZ25vc3RpY3MsIC8qaXNGb3JFeHRlcm5zKi8gdHJ1ZSk7XG5cbiAgbGV0IHJvb3ROYW1lc3BhY2UgPSAnJztcbiAgaWYgKGlzRXh0ZXJuYWxNb2R1bGUpIHtcbiAgICAvLyAuZC50cyBmaWxlcyB0aGF0IGFyZSBtb2R1bGVzIGRvIG5vdCBkZWNsYXJlIGdsb2JhbCBzeW1ib2xzIC0gdGhlaXIgc3ltYm9scyBtdXN0IGJlIGV4cGxpY2l0bHlcbiAgICAvLyBpbXBvcnRlZCB0byBiZSB1c2VkLiBIb3dldmVyIENsb3N1cmUgQ29tcGlsZXIgaGFzIG5vIGNvbmNlcHQgb2YgZXh0ZXJucyB0aGF0IGFyZSBtb2R1bGVzIGFuZFxuICAgIC8vIHJlcXVpcmUgaW1wb3J0cy4gVGhpcyBjb2RlIG1hbmdsZXMgdGhlIHN5bWJvbCBuYW1lcyBieSB3cmFwcGluZyB0aGVtIGluIGEgdG9wIGxldmVsIHZhcmlhYmxlXG4gICAgLy8gdGhhdCdzIHVuaXF1ZSB0byB0aGlzIGZpbGUuIFRoYXQgYWxsb3dzIGVtaXR0aW5nIHRoZW0gZm9yIENsb3N1cmUgYXMgZ2xvYmFsIHN5bWJvbHMgd2hpbGVcbiAgICAvLyBhdm9pZGluZyBjb2xsaXNpb25zLiBUaGlzIGlzIG5lY2Vzc2FyeSBhcyBzeW1ib2xzIGxvY2FsIHRvIHRoaXMgbW9kdWxlIGNhbiAoYW5kIHdpbGwgdmVyeVxuICAgIC8vIGNvbW1vbmx5KSBjb25mbGljdCB3aXRoIHRoZSBuYW1lc3BhY2UgdXNlZCBpbiBcImV4cG9ydCBhcyBuYW1lc3BhY2VcIiwgZS5nLiBcImFuZ3VsYXJcIiwgYW5kIGFsc29cbiAgICAvLyB0byBhdm9pZCB1c2VycyBhY2NpZGVudGFsbHkgdXNpbmcgdGhlc2Ugc3ltYm9scyBpbiAuanMgZmlsZXMgKGFuZCBtb3JlIGNvbGxpc2lvbnMpLiBUaGVcbiAgICAvLyBzeW1ib2xzIHRoYXQgYXJlIFwiaGlkZGVuXCIgbGlrZSB0aGF0IGNhbiBiZSBtYWRlIGFjY2Vzc2libGUgdGhyb3VnaCBhbiBcImV4cG9ydCBhcyBuYW1lc3BhY2VcIlxuICAgIC8vIGRlY2xhcmF0aW9uIChzZWUgYmVsb3cpLlxuICAgIHJvb3ROYW1lc3BhY2UgPSBtb2R1bGVOYW1lQXNJZGVudGlmaWVyKGhvc3QsIHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICB9XG5cbiAgZm9yIChjb25zdCBzdG10IG9mIHNvdXJjZUZpbGUuc3RhdGVtZW50cykge1xuICAgIGlmICghaXNEdHMgJiYgIWhhc01vZGlmaWVyRmxhZyhzdG10LCB0cy5Nb2RpZmllckZsYWdzLkFtYmllbnQpKSBjb250aW51ZTtcbiAgICB2aXNpdG9yKHN0bXQsIFtdKTtcbiAgfVxuXG4gIGlmIChvdXRwdXQgJiYgaXNFeHRlcm5hbE1vZHVsZSkge1xuICAgIC8vIElmIHRzaWNrbGUgZ2VuZXJhdGVkIGFueSBleHRlcm5zIGFuZCB0aGlzIGlzIGFuIGV4dGVybmFsIG1vZHVsZSwgcHJlcGVuZCB0aGUgbmFtZXNwYWNlXG4gICAgLy8gZGVjbGFyYXRpb24gZm9yIGl0LlxuICAgIG91dHB1dCA9IGAvKiogQGNvbnN0ICovXFxudmFyICR7cm9vdE5hbWVzcGFjZX0gPSB7fTtcXG5gICsgb3V0cHV0O1xuXG4gICAgLy8gVGhlcmUgY2FuIG9ubHkgYmUgb25lIGV4cG9ydCA9LlxuICAgIGNvbnN0IGV4cG9ydEFzc2lnbm1lbnQgPSBzb3VyY2VGaWxlLnN0YXRlbWVudHMuZmluZCh0cy5pc0V4cG9ydEFzc2lnbm1lbnQpO1xuICAgIGxldCBleHBvcnRlZE5hbWVzcGFjZSA9IHJvb3ROYW1lc3BhY2U7XG4gICAgaWYgKGV4cG9ydEFzc2lnbm1lbnQgJiYgZXhwb3J0QXNzaWdubWVudC5pc0V4cG9ydEVxdWFscykge1xuICAgICAgaWYgKHRzLmlzSWRlbnRpZmllcihleHBvcnRBc3NpZ25tZW50LmV4cHJlc3Npb24pIHx8XG4gICAgICAgICAgdHMuaXNRdWFsaWZpZWROYW1lKGV4cG9ydEFzc2lnbm1lbnQuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgLy8gRS5nLiBleHBvcnQgPSBzb21lTmFtZTtcbiAgICAgICAgLy8gSWYgc29tZU5hbWUgaXMgXCJkZWNsYXJlIGdsb2JhbCB7IG5hbWVzcGFjZSBzb21lTmFtZSB7Li4ufSB9XCIsIHRzaWNrbGUgbXVzdCBub3QgcXVhbGlmeVxuICAgICAgICAvLyBhY2Nlc3MgdG8gaXQgd2l0aCBtb2R1bGUgbmFtZXNwYWNlIGFzIGl0IGlzIGVtaXR0ZWQgaW4gdGhlIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGNvbnN0IHN5bWJvbCA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oZXhwb3J0QXNzaWdubWVudC5leHByZXNzaW9uKTtcbiAgICAgICAgY29uc3QgaXNHbG9iYWxTeW1ib2wgPSBzeW1ib2wgJiYgc3ltYm9sLmRlY2xhcmF0aW9ucyAmJlxuICAgICAgICAgICAgc3ltYm9sLmRlY2xhcmF0aW9ucy5zb21lKGQgPT4gaXNJbkdsb2JhbEF1Z21lbnRhdGlvbihkKSk7XG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBnZXRFbnRpdHlOYW1lVGV4dChleHBvcnRBc3NpZ25tZW50LmV4cHJlc3Npb24pO1xuICAgICAgICBpZiAoaXNHbG9iYWxTeW1ib2wpIHtcbiAgICAgICAgICBleHBvcnRlZE5hbWVzcGFjZSA9IGVudGl0eU5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwb3J0ZWROYW1lc3BhY2UgPSByb290TmFtZXNwYWNlICsgJy4nICsgZW50aXR5TmFtZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVwb3J0RGlhZ25vc3RpYyhcbiAgICAgICAgICAgIGRpYWdub3N0aWNzLCBleHBvcnRBc3NpZ25tZW50LmV4cHJlc3Npb24sXG4gICAgICAgICAgICBgZXhwb3J0ID0gZXhwcmVzc2lvbiBtdXN0IGJlIGEgcXVhbGlmaWVkIG5hbWUsIGdvdCAke1xuICAgICAgICAgICAgICAgIHRzLlN5bnRheEtpbmRbZXhwb3J0QXNzaWdubWVudC5leHByZXNzaW9uLmtpbmRdfS5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNEdHMgJiYgaG9zdC5wcm92aWRlRXh0ZXJuYWxNb2R1bGVEdHNOYW1lc3BhY2UpIHtcbiAgICAgIC8vIEluIGEgbm9uLXNoaW1tZWQgbW9kdWxlLCBjcmVhdGUgYSBnbG9iYWwgbmFtZXNwYWNlLiBUaGlzIGV4aXN0cyBwdXJlbHkgZm9yIGJhY2t3YXJkc1xuICAgICAgLy8gY29tcGF0aWJsaXR5LCBpbiB0aGUgbWVkaXVtIHRlcm0gYWxsIGNvZGUgdXNpbmcgdHNpY2tsZSBzaG91bGQgYWx3YXlzIHVzZSBgZ29vZy5tb2R1bGVgcyxcbiAgICAgIC8vIHNvIGdsb2JhbCBuYW1lcyBzaG91bGQgbm90IGJlIG5lY2Nlc3NhcnkuXG4gICAgICBmb3IgKGNvbnN0IG5zRXhwb3J0IG9mIHNvdXJjZUZpbGUuc3RhdGVtZW50cy5maWx0ZXIodHMuaXNOYW1lc3BhY2VFeHBvcnREZWNsYXJhdGlvbikpIHtcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KG5zRXhwb3J0Lm5hbWUpO1xuICAgICAgICBlbWl0KGAvLyBleHBvcnQgYXMgbmFtZXNwYWNlICR7bmFtZXNwYWNlTmFtZX1cXG5gKTtcbiAgICAgICAgd3JpdGVWYXJpYWJsZVN0YXRlbWVudChuYW1lc3BhY2VOYW1lLCBbXSwgZXhwb3J0ZWROYW1lc3BhY2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7b3V0cHV0LCBkaWFnbm9zdGljc307XG5cbiAgZnVuY3Rpb24gZW1pdChzdHI6IHN0cmluZykge1xuICAgIG91dHB1dCArPSBzdHI7XG4gIH1cblxuICAvKipcbiAgICogaXNGaXJzdERlY2xhcmF0aW9uIHJldHVybnMgdHJ1ZSBpZiBkZWNsIGlzIHRoZSBmaXJzdCBkZWNsYXJhdGlvblxuICAgKiBvZiBpdHMgc3ltYm9sLiAgRS5nLiBpbWFnaW5lXG4gICAqICAgaW50ZXJmYWNlIEZvbyB7IHg6IG51bWJlcjsgfVxuICAgKiAgIGludGVyZmFjZSBGb28geyB5OiBudW1iZXI7IH1cbiAgICogd2Ugb25seSB3YW50IHRvIGVtaXQgdGhlIFwiXFxAcmVjb3JkXCIgZm9yIEZvbyBvbiB0aGUgZmlyc3Qgb25lLlxuICAgKlxuICAgKiBUaGUgZXhjZXB0aW9uIGFyZSB2YXJpYWJsZSBkZWNsYXJhdGlvbnMsIHdoaWNoIC0gaW4gZXh0ZXJucyAtIGRvIG5vdCBhc3NpZ24gYSB2YWx1ZTpcbiAgICogICAvLi4gXFxAdHlwZSB7Li4ufSAuL1xuICAgKiAgIHZhciBzb21lVmFyaWFibGU7XG4gICAqICAgLy4uIFxcQHR5cGUgey4uLn0gLi9cbiAgICogICBzb21lTmFtZXNwYWNlLnNvbWVWYXJpYWJsZTtcbiAgICogSWYgYSBsYXRlciBkZWNsYXJhdGlvbiB3YW50cyB0byBhZGQgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIG9uIHNvbWVWYXJpYWJsZSwgdHNpY2tsZSBtdXN0IHN0aWxsXG4gICAqIGVtaXQgYW4gYXNzaWdubWVudCBpbnRvIHRoZSBvYmplY3QsIGFzIGl0J3Mgb3RoZXJ3aXNlIGFic2VudC5cbiAgICovXG4gIGZ1bmN0aW9uIGlzRmlyc3RWYWx1ZURlY2xhcmF0aW9uKGRlY2w6IHRzLkRlY2xhcmF0aW9uU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gICAgaWYgKCFkZWNsLm5hbWUpIHJldHVybiB0cnVlO1xuICAgIGNvbnN0IHN5bSA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oZGVjbC5uYW1lKSE7XG4gICAgaWYgKCFzeW0uZGVjbGFyYXRpb25zIHx8IHN5bS5kZWNsYXJhdGlvbnMubGVuZ3RoIDwgMikgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgZWFybGllckRlY2xzID0gc3ltLmRlY2xhcmF0aW9ucy5zbGljZSgwLCBzeW0uZGVjbGFyYXRpb25zLmluZGV4T2YoZGVjbCkpO1xuICAgIC8vIEVpdGhlciB0aGVyZSBhcmUgbm8gZWFybGllciBkZWNsYXJhdGlvbnMsIG9yIGFsbCBvZiB0aGVtIGFyZSB2YXJpYWJsZXMgKHNlZSBhYm92ZSkuIHRzaWNrbGVcbiAgICAvLyBlbWl0cyBhIHZhbHVlIGZvciBhbGwgb3RoZXIgZGVjbGFyYXRpb24ga2luZHMgKGZ1bmN0aW9uIGZvciBmdW5jdGlvbnMsIGNsYXNzZXMsIGludGVyZmFjZXMsXG4gICAgLy8ge30gb2JqZWN0IGZvciBuYW1lc3BhY2VzKS5cbiAgICByZXR1cm4gZWFybGllckRlY2xzLmxlbmd0aCA9PT0gMCB8fCBlYXJsaWVyRGVjbHMuZXZlcnkodHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKTtcbiAgfVxuXG4gIC8qKiBXcml0ZXMgdGhlIGFjdHVhbCB2YXJpYWJsZSBzdGF0ZW1lbnQgb2YgYSBDbG9zdXJlIHZhcmlhYmxlIGRlY2xhcmF0aW9uLiAqL1xuICBmdW5jdGlvbiB3cml0ZVZhcmlhYmxlU3RhdGVtZW50KG5hbWU6IHN0cmluZywgbmFtZXNwYWNlOiBSZWFkb25seUFycmF5PHN0cmluZz4sIHZhbHVlPzogc3RyaW5nKSB7XG4gICAgY29uc3QgcXVhbGlmaWVkTmFtZSA9IG5hbWVzcGFjZS5jb25jYXQoW25hbWVdKS5qb2luKCcuJyk7XG4gICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggPT09IDApIGVtaXQoYHZhciBgKTtcbiAgICBlbWl0KHF1YWxpZmllZE5hbWUpO1xuICAgIGlmICh2YWx1ZSkgZW1pdChgID0gJHt2YWx1ZX1gKTtcbiAgICBlbWl0KCc7XFxuJyk7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIGEgQ2xvc3VyZSB2YXJpYWJsZSBkZWNsYXJhdGlvbiwgaS5lLiB0aGUgdmFyaWFibGUgc3RhdGVtZW50IHdpdGggYSBsZWFkaW5nIEpTRG9jXG4gICAqIGNvbW1lbnQgbWFraW5nIGl0IGEgZGVjbGFyYXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiB3cml0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICBkZWNsOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uLCBuYW1lc3BhY2U6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPikge1xuICAgIGlmIChkZWNsLm5hbWUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICBjb25zdCBuYW1lID0gZ2V0SWRlbnRpZmllclRleHQoZGVjbC5uYW1lIGFzIHRzLklkZW50aWZpZXIpO1xuICAgICAgaWYgKENMT1NVUkVfRVhURVJOU19CTEFDS0xJU1QuaW5kZXhPZihuYW1lKSA+PSAwKSByZXR1cm47XG4gICAgICBlbWl0KGpzZG9jLnRvU3RyaW5nKFt7dGFnTmFtZTogJ3R5cGUnLCB0eXBlOiBtdHQudHlwZVRvQ2xvc3VyZShkZWNsKX1dKSk7XG4gICAgICBlbWl0KCdcXG4nKTtcbiAgICAgIHdyaXRlVmFyaWFibGVTdGF0ZW1lbnQobmFtZSwgbmFtZXNwYWNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JVbmltcGxlbWVudGVkS2luZChkZWNsLm5hbWUsICdleHRlcm5zIGZvciB2YXJpYWJsZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIEpTRG9jIGRlY2xhcmF0aW9uIHRoYXQgbWVyZ2VzIHRoZSBzaWduYXR1cmVzIG9mIHRoZSBnaXZlbiBmdW5jdGlvbiBkZWNsYXJhdGlvbiAoZm9yXG4gICAqIG92ZXJsb2FkcyksIGFuZCByZXR1cm5zIHRoZSBwYXJhbWV0ZXIgbmFtZXMgY2hvc2VuLlxuICAgKi9cbiAgZnVuY3Rpb24gZW1pdEZ1bmN0aW9uVHlwZShkZWNsczogdHMuRnVuY3Rpb25MaWtlRGVjbGFyYXRpb25bXSwgZXh0cmFUYWdzOiBqc2RvYy5UYWdbXSA9IFtdKSB7XG4gICAgY29uc3Qge3RhZ3MsIHBhcmFtZXRlck5hbWVzfSA9IG10dC5nZXRGdW5jdGlvblR5cGVKU0RvYyhkZWNscywgZXh0cmFUYWdzKTtcbiAgICBlbWl0KCdcXG4nKTtcbiAgICBlbWl0KGpzZG9jLnRvU3RyaW5nKHRhZ3MpKTtcbiAgICByZXR1cm4gcGFyYW1ldGVyTmFtZXM7XG4gIH1cblxuICBmdW5jdGlvbiB3cml0ZUZ1bmN0aW9uKG5hbWU6IHRzLk5vZGUsIHBhcmFtczogc3RyaW5nW10sIG5hbWVzcGFjZTogUmVhZG9ubHlBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgcGFyYW1zU3RyID0gcGFyYW1zLmpvaW4oJywgJyk7XG4gICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgZnFuID0gbmFtZXNwYWNlLmpvaW4oJy4nKTtcbiAgICAgIGlmIChuYW1lLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICBmcW4gKz0gJy4nOyAgLy8gY29tcHV0ZWQgbmFtZXMgaW5jbHVkZSBbIF0gaW4gdGhlaXIgZ2V0VGV4dCgpIHJlcHJlc2VudGF0aW9uLlxuICAgICAgfVxuICAgICAgZnFuICs9IG5hbWUuZ2V0VGV4dCgpO1xuICAgICAgZW1pdChgJHtmcW59ID0gZnVuY3Rpb24oJHtwYXJhbXNTdHJ9KSB7fTtcXG5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG5hbWUua2luZCAhPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlcG9ydERpYWdub3N0aWMoZGlhZ25vc3RpY3MsIG5hbWUsICdOb24tbmFtZXNwYWNlZCBjb21wdXRlZCBuYW1lIGluIGV4dGVybnMnKTtcbiAgICAgIH1cbiAgICAgIGVtaXQoYGZ1bmN0aW9uICR7bmFtZS5nZXRUZXh0KCl9KCR7cGFyYW1zU3RyfSkge31cXG5gKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB3cml0ZUVudW0oZGVjbDogdHMuRW51bURlY2xhcmF0aW9uLCBuYW1lc3BhY2U6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPikge1xuICAgIC8vIEUuZy4gLyoqIEBlbnVtIHtudW1iZXJ9ICovIHZhciBDT1VOVFJZID0ge1VTOiAxLCBDQTogMX07XG4gICAgY29uc3QgbmFtZSA9IGdldElkZW50aWZpZXJUZXh0KGRlY2wubmFtZSk7XG4gICAgbGV0IG1lbWJlcnMgPSAnJztcbiAgICBjb25zdCBlbnVtVHlwZSA9IGdldEVudW1UeXBlKHR5cGVDaGVja2VyLCBkZWNsKTtcbiAgICAvLyBDbG9zdXJlIGVudW1zIG1lbWJlcnMgbXVzdCBoYXZlIGEgdmFsdWUgb2YgdGhlIGNvcnJlY3QgdHlwZSwgYnV0IHRoZSBhY3R1YWwgdmFsdWUgZG9lcyBub3RcbiAgICAvLyBtYXR0ZXIgaW4gZXh0ZXJucy5cbiAgICBjb25zdCBpbml0aWFsaXplciA9IGVudW1UeXBlID09PSAnc3RyaW5nJyA/IGAnJ2AgOiAxO1xuICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIGRlY2wubWVtYmVycykge1xuICAgICAgbGV0IG1lbWJlck5hbWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgICBzd2l0Y2ggKG1lbWJlci5uYW1lLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgbWVtYmVyTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KG1lbWJlci5uYW1lIGFzIHRzLklkZW50aWZpZXIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gKG1lbWJlci5uYW1lIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgICAgICAgaWYgKGlzVmFsaWRDbG9zdXJlUHJvcGVydHlOYW1lKHRleHQpKSBtZW1iZXJOYW1lID0gdGV4dDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmICghbWVtYmVyTmFtZSkge1xuICAgICAgICBtZW1iZXJzICs9IGAgIC8qIFRPRE86ICR7dHMuU3ludGF4S2luZFttZW1iZXIubmFtZS5raW5kXX06ICR7XG4gICAgICAgICAgICBlc2NhcGVGb3JDb21tZW50KG1lbWJlci5uYW1lLmdldFRleHQoKSl9ICovXFxuYDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBtZW1iZXJzICs9IGAgICR7bWVtYmVyTmFtZX06ICR7aW5pdGlhbGl6ZXJ9LFxcbmA7XG4gICAgfVxuXG4gICAgZW1pdChgXFxuLyoqIEBlbnVtIHske2VudW1UeXBlfX0gKi9cXG5gKTtcbiAgICB3cml0ZVZhcmlhYmxlU3RhdGVtZW50KG5hbWUsIG5hbWVzcGFjZSwgYHtcXG4ke21lbWJlcnN9fWApO1xuICB9XG5cbiAgZnVuY3Rpb24gd3JpdGVUeXBlQWxpYXMoZGVjbDogdHMuVHlwZUFsaWFzRGVjbGFyYXRpb24sIG5hbWVzcGFjZTogUmVhZG9ubHlBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgdHlwZVN0ciA9IG10dC50eXBlVG9DbG9zdXJlKGRlY2wsIHVuZGVmaW5lZCk7XG4gICAgZW1pdChgXFxuLyoqIEB0eXBlZGVmIHske3R5cGVTdHJ9fSAqL1xcbmApO1xuICAgIHdyaXRlVmFyaWFibGVTdGF0ZW1lbnQoZ2V0SWRlbnRpZmllclRleHQoZGVjbC5uYW1lKSwgbmFtZXNwYWNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyaXRlVHlwZShcbiAgICAgIGRlY2w6IHRzLkludGVyZmFjZURlY2xhcmF0aW9ufHRzLkNsYXNzRGVjbGFyYXRpb24sIG5hbWVzcGFjZTogUmVhZG9ubHlBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgbmFtZSA9IGRlY2wubmFtZTtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJlcG9ydERpYWdub3N0aWMoZGlhZ25vc3RpY3MsIGRlY2wsICdhbm9ueW1vdXMgdHlwZSBpbiBleHRlcm5zJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHR5cGVOYW1lID0gbmFtZXNwYWNlLmNvbmNhdChbbmFtZS5nZXRUZXh0KCldKS5qb2luKCcuJyk7XG4gICAgaWYgKENMT1NVUkVfRVhURVJOU19CTEFDS0xJU1QuaW5kZXhPZih0eXBlTmFtZSkgPj0gMCkgcmV0dXJuO1xuXG4gICAgaWYgKGlzRmlyc3RWYWx1ZURlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgICAvLyBFbWl0IHRoZSAnZnVuY3Rpb24nIHRoYXQgaXMgYWN0dWFsbHkgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBpbnRlcmZhY2VcbiAgICAgIC8vIGl0c2VsZi4gIElmIGl0J3MgYSBjbGFzcywgdGhpcyBmdW5jdGlvbiBhbHNvIG11c3QgaW5jbHVkZSB0aGUgdHlwZVxuICAgICAgLy8gYW5ub3RhdGlvbnMgb2YgdGhlIGNvbnN0cnVjdG9yLlxuICAgICAgbGV0IHBhcmFtTmFtZXM6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBqc2RvY1RhZ3M6IGpzZG9jLlRhZ1tdID0gW107XG4gICAgICBsZXQgd3JvdGVKc0RvYyA9IGZhbHNlO1xuICAgICAgbWF5YmVBZGRIZXJpdGFnZUNsYXVzZXMoanNkb2NUYWdzLCBtdHQsIGRlY2wpO1xuICAgICAgbWF5YmVBZGRUZW1wbGF0ZUNsYXVzZShqc2RvY1RhZ3MsIGRlY2wpO1xuICAgICAgaWYgKGRlY2wua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XG4gICAgICAgIC8vIFRPRE86IGl0IGFwcGVhcnMgeW91IGNhbiBqdXN0IHdyaXRlICdjbGFzcyBGb28geyAuLi4nIGluIGV4dGVybnMuXG4gICAgICAgIC8vIFRoaXMgY29kZSBpbnN0ZWFkIHRyaWVzIHRvIHRyYW5zbGF0ZSBpdCB0byBhIGZ1bmN0aW9uLlxuICAgICAgICBqc2RvY1RhZ3MucHVzaCh7dGFnTmFtZTogJ2NvbnN0cnVjdG9yJ30sIHt0YWdOYW1lOiAnc3RydWN0J30pO1xuICAgICAgICBjb25zdCBjdG9ycyA9IChkZWNsIGFzIHRzLkNsYXNzRGVjbGFyYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tZW1iZXJzLmZpbHRlcigobSkgPT4gbS5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKTtcbiAgICAgICAgaWYgKGN0b3JzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGZpcnN0Q3RvcjogdHMuQ29uc3RydWN0b3JEZWNsYXJhdGlvbiA9IGN0b3JzWzBdIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb247XG4gICAgICAgICAgaWYgKGN0b3JzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHBhcmFtTmFtZXMgPSBlbWl0RnVuY3Rpb25UeXBlKGN0b3JzIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb25bXSwganNkb2NUYWdzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyYW1OYW1lcyA9IGVtaXRGdW5jdGlvblR5cGUoW2ZpcnN0Q3Rvcl0sIGpzZG9jVGFncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHdyb3RlSnNEb2MgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPdGhlcndpc2UgaXQncyBhbiBpbnRlcmZhY2U7IHRhZyBpdCBhcyBzdHJ1Y3R1cmFsbHkgdHlwZWQuXG4gICAgICAgIGpzZG9jVGFncy5wdXNoKHt0YWdOYW1lOiAncmVjb3JkJ30sIHt0YWdOYW1lOiAnc3RydWN0J30pO1xuICAgICAgfVxuICAgICAgaWYgKCF3cm90ZUpzRG9jKSBlbWl0KGpzZG9jLnRvU3RyaW5nKGpzZG9jVGFncykpO1xuICAgICAgd3JpdGVGdW5jdGlvbihuYW1lLCBwYXJhbU5hbWVzLCBuYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZXZlcnl0aGluZyBleGNlcHQgKE1ldGhvZFNpZ25hdHVyZXxNZXRob2REZWNsYXJhdGlvbnxDb25zdHJ1Y3RvcilcbiAgICBjb25zdCBtZXRob2RzID0gbmV3IE1hcDxzdHJpbmcsIHRzLk1ldGhvZERlY2xhcmF0aW9uW10+KCk7XG4gICAgZm9yIChjb25zdCBtZW1iZXIgb2YgZGVjbC5tZW1iZXJzKSB7XG4gICAgICBzd2l0Y2ggKG1lbWJlci5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eVNpZ25hdHVyZTpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgcHJvcCA9IG1lbWJlciBhcyB0cy5Qcm9wZXJ0eVNpZ25hdHVyZTtcbiAgICAgICAgICBpZiAocHJvcC5uYW1lLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBtdHQudHlwZVRvQ2xvc3VyZShwcm9wKTtcbiAgICAgICAgICAgIGlmIChwcm9wLnF1ZXN0aW9uVG9rZW4gJiYgdHlwZSA9PT0gJz8nKSB7XG4gICAgICAgICAgICAgIC8vIEFuIG9wdGlvbmFsICdhbnknIHR5cGUgdHJhbnNsYXRlcyB0byAnP3x1bmRlZmluZWQnIGluIENsb3N1cmUuXG4gICAgICAgICAgICAgIHR5cGUgPSAnP3x1bmRlZmluZWQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW1pdChqc2RvYy50b1N0cmluZyhbe3RhZ05hbWU6ICd0eXBlJywgdHlwZX1dKSk7XG4gICAgICAgICAgICBpZiAoaGFzTW9kaWZpZXJGbGFnKHByb3AsIHRzLk1vZGlmaWVyRmxhZ3MuU3RhdGljKSkge1xuICAgICAgICAgICAgICBlbWl0KGBcXG4ke3R5cGVOYW1lfS4ke3Byb3AubmFtZS5nZXRUZXh0KCl9O1xcbmApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZW1pdChgXFxuJHt0eXBlTmFtZX0ucHJvdG90eXBlLiR7cHJvcC5uYW1lLmdldFRleHQoKX07XFxuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVE9ETzogRm9yIG5vdyBwcm9wZXJ0eSBuYW1lcyBvdGhlciB0aGFuIElkZW50aWZpZXJzIGFyZSBub3QgaGFuZGxlZDsgZS5nLlxuICAgICAgICAgIC8vICAgIGludGVyZmFjZSBGb28geyBcIjEyM2JhclwiOiBudW1iZXIgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWV0aG9kU2lnbmF0dXJlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWV0aG9kRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgbWV0aG9kID0gbWVtYmVyIGFzIHRzLk1ldGhvZERlY2xhcmF0aW9uO1xuICAgICAgICAgIGNvbnN0IGlzU3RhdGljID0gaGFzTW9kaWZpZXJGbGFnKG1ldGhvZCwgdHMuTW9kaWZpZXJGbGFncy5TdGF0aWMpO1xuICAgICAgICAgIGNvbnN0IG1ldGhvZFNpZ25hdHVyZSA9IGAke21ldGhvZC5uYW1lLmdldFRleHQoKX0kJCQke2lzU3RhdGljID8gJ3N0YXRpYycgOiAnaW5zdGFuY2UnfWA7XG5cbiAgICAgICAgICBpZiAobWV0aG9kcy5oYXMobWV0aG9kU2lnbmF0dXJlKSkge1xuICAgICAgICAgICAgbWV0aG9kcy5nZXQobWV0aG9kU2lnbmF0dXJlKSEucHVzaChtZXRob2QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXRob2RzLnNldChtZXRob2RTaWduYXR1cmUsIFttZXRob2RdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db25zdHJ1Y3RvcjpcbiAgICAgICAgICBjb250aW51ZTsgIC8vIEhhbmRsZWQgYWJvdmUuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gTWVtYmVycyBjYW4gaW5jbHVkZSB0aGluZ3MgbGlrZSBpbmRleCBzaWduYXR1cmVzLCBmb3IgZS5nLlxuICAgICAgICAgIC8vICAgaW50ZXJmYWNlIEZvbyB7IFtrZXk6IHN0cmluZ106IG51bWJlcjsgfVxuICAgICAgICAgIC8vIEZvciBub3csIGp1c3Qgc2tpcCBpdC5cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlIGdldCBoZXJlLCB0aGUgbWVtYmVyIHdhc24ndCBoYW5kbGVkIGluIHRoZSBzd2l0Y2ggc3RhdGVtZW50LlxuICAgICAgbGV0IG1lbWJlck5hbWUgPSBuYW1lc3BhY2U7XG4gICAgICBpZiAobWVtYmVyLm5hbWUpIHtcbiAgICAgICAgbWVtYmVyTmFtZSA9IG1lbWJlck5hbWUuY29uY2F0KFttZW1iZXIubmFtZS5nZXRUZXh0KCldKTtcbiAgICAgIH1cbiAgICAgIGVtaXQoYFxcbi8qIFRPRE86ICR7dHMuU3ludGF4S2luZFttZW1iZXIua2luZF19OiAke21lbWJlck5hbWUuam9pbignLicpfSAqL1xcbmApO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBtZXRob2QgZGVjbGFyYXRpb25zL3NpZ25hdHVyZXMgc2VwYXJhdGVseSwgc2luY2Ugd2UgbmVlZCB0byBkZWFsIHdpdGggb3ZlcmxvYWRzLlxuICAgIGZvciAoY29uc3QgbWV0aG9kVmFyaWFudHMgb2YgQXJyYXkuZnJvbShtZXRob2RzLnZhbHVlcygpKSkge1xuICAgICAgY29uc3QgZmlyc3RNZXRob2RWYXJpYW50ID0gbWV0aG9kVmFyaWFudHNbMF07XG4gICAgICBsZXQgcGFyYW1ldGVyTmFtZXM6IHN0cmluZ1tdO1xuICAgICAgaWYgKG1ldGhvZFZhcmlhbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcGFyYW1ldGVyTmFtZXMgPSBlbWl0RnVuY3Rpb25UeXBlKG1ldGhvZFZhcmlhbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtZXRlck5hbWVzID0gZW1pdEZ1bmN0aW9uVHlwZShbZmlyc3RNZXRob2RWYXJpYW50XSk7XG4gICAgICB9XG4gICAgICBjb25zdCBtZXRob2ROYW1lc3BhY2UgPSBuYW1lc3BhY2UuY29uY2F0KFtuYW1lLmdldFRleHQoKV0pO1xuICAgICAgLy8gSWYgdGhlIG1ldGhvZCBpcyBzdGF0aWMsIGRvbid0IGFkZCB0aGUgcHJvdG90eXBlLlxuICAgICAgaWYgKCFoYXNNb2RpZmllckZsYWcoZmlyc3RNZXRob2RWYXJpYW50LCB0cy5Nb2RpZmllckZsYWdzLlN0YXRpYykpIHtcbiAgICAgICAgbWV0aG9kTmFtZXNwYWNlLnB1c2goJ3Byb3RvdHlwZScpO1xuICAgICAgfVxuICAgICAgd3JpdGVGdW5jdGlvbihmaXJzdE1ldGhvZFZhcmlhbnQubmFtZSwgcGFyYW1ldGVyTmFtZXMsIG1ldGhvZE5hbWVzcGFjZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYWxpYXNlcyBmb3IgdGhlIHN5bWJvbHMgaW1wb3J0ZWQgaW4gdGhlIGdpdmVuIGRlY2xhcmF0aW9uLCBzbyB0aGF0IHRoZWlyIHR5cGVzIGdldFxuICAgKiBwcmludGVkIGFzIHRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZSwgYW5kIG5vdCBqdXN0IGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBsb2NhbCBpbXBvcnQgYWxpYXMuXG4gICAqXG4gICAqIHRzaWNrbGUgZ2VuZXJhdGVzIC5qcyBmaWxlcyB0aGF0IChhdCBtb3N0KSBjb250YWluIGEgYGdvb2cucHJvdmlkZWAsIGJ1dCBhcmUgbm90XG4gICAqIGBnb29nLm1vZHVsZWBzLiBUaGVzZSBmaWxlcyBjYW5ub3QgZXhwcmVzcyBhbiBhbGlhc2VkIGltcG9ydC4gSG93ZXZlciBDbG9zdXJlIENvbXBpbGVyIGFsbG93c1xuICAgKiByZWZlcmVuY2luZyB0eXBlcyB1c2luZyBmdWxseSBxdWFsaWZpZWQgbmFtZXMgaW4gc3VjaCBmaWxlcywgc28gdHNpY2tsZSBjYW4gcmVzb2x2ZSB0aGVcbiAgICogaW1wb3J0ZWQgbW9kdWxlIFVSSSBhbmQgcHJvZHVjZSBgcGF0aC50by5tb2R1bGUuU3ltYm9sYCBhcyBhbiBhbGlhcywgYW5kIHVzZSB0aGF0IHdoZW5cbiAgICogcmVmZXJlbmNpbmcgdGhlIHR5cGUuXG4gICAqL1xuICBmdW5jdGlvbiBhZGRJbXBvcnRBbGlhc2VzKGRlY2w6IHRzLkltcG9ydERlY2xhcmF0aW9ufHRzLkltcG9ydEVxdWFsc0RlY2xhcmF0aW9uKSB7XG4gICAgbGV0IG1vZHVsZVVyaTogc3RyaW5nO1xuICAgIGlmICh0cy5pc0ltcG9ydERlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgICBtb2R1bGVVcmkgPSAoZGVjbC5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzRXh0ZXJuYWxNb2R1bGVSZWZlcmVuY2UoZGVjbC5tb2R1bGVSZWZlcmVuY2UpKSB7XG4gICAgICAvLyBpbXBvcnQgZm9vID0gcmVxdWlyZSgnLi9iYXInKTtcbiAgICAgIG1vZHVsZVVyaSA9IChkZWNsLm1vZHVsZVJlZmVyZW5jZS5leHByZXNzaW9uIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGltcG9ydCBmb28gPSBiYXIuYmF6LmJhbTtcbiAgICAgIC8vIHVuc3VwcG9ydGVkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGdvb2dOYW1lc3BhY2UgPSBleHRyYWN0R29vZ05hbWVzcGFjZUltcG9ydChtb2R1bGVVcmkpO1xuICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBnb29nTmFtZXNwYWNlIHx8XG4gICAgICAgIGhvc3QucGF0aFRvTW9kdWxlTmFtZShcbiAgICAgICAgICAgIHNvdXJjZUZpbGUuZmlsZU5hbWUsIHJlc29sdmVNb2R1bGVOYW1lKGhvc3QsIHNvdXJjZUZpbGUuZmlsZU5hbWUsIG1vZHVsZVVyaSkpO1xuXG4gICAgaWYgKHRzLmlzSW1wb3J0RXF1YWxzRGVjbGFyYXRpb24oZGVjbCkpIHtcbiAgICAgIC8vIGltcG9ydCBmb28gPSByZXF1aXJlKCcuL2JhcicpO1xuICAgICAgYWRkSW1wb3J0QWxpYXMoZGVjbC5uYW1lLCBtb2R1bGVOYW1lLCB1bmRlZmluZWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNpZGUgZWZmZWN0IGltcG9ydCAncGF0aCc7IGRlY2xhcmVzIG5vIGxvY2FsIGFsaWFzZXMuXG4gICAgaWYgKCFkZWNsLmltcG9ydENsYXVzZSkgcmV0dXJuO1xuXG4gICAgaWYgKGRlY2wuaW1wb3J0Q2xhdXNlLm5hbWUpIHtcbiAgICAgIC8vIGltcG9ydCBuYW1lIGZyb20gLi4uIC0+IG1hcCB0byAuZGVmYXVsdCBvbiB0aGUgbW9kdWxlLm5hbWUuXG4gICAgICBpZiAoZ29vZ05hbWVzcGFjZSkge1xuICAgICAgICBhZGRJbXBvcnRBbGlhcyhkZWNsLmltcG9ydENsYXVzZS5uYW1lLCBnb29nTmFtZXNwYWNlLCB1bmRlZmluZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWRkSW1wb3J0QWxpYXMoZGVjbC5pbXBvcnRDbGF1c2UubmFtZSwgbW9kdWxlTmFtZSwgJ2RlZmF1bHQnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgbmFtZWRCaW5kaW5ncyA9IGRlY2wuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3M7XG4gICAgaWYgKCFuYW1lZEJpbmRpbmdzKSByZXR1cm47XG5cbiAgICBpZiAodHMuaXNOYW1lc3BhY2VJbXBvcnQobmFtZWRCaW5kaW5ncykpIHtcbiAgICAgIC8vIGltcG9ydCAqIGFzIG5hbWUgLT4gbWFwIGRpcmVjdGx5IHRvIHRoZSBtb2R1bGUubmFtZS5cbiAgICAgIGFkZEltcG9ydEFsaWFzKG5hbWVkQmluZGluZ3MubmFtZSwgbW9kdWxlTmFtZSwgdW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICBpZiAodHMuaXNOYW1lZEltcG9ydHMobmFtZWRCaW5kaW5ncykpIHtcbiAgICAgIC8vIGltcG9ydCB7QSBhcyBCfSwgbWFwIHRvIG1vZHVsZS5uYW1lLkFcbiAgICAgIGZvciAoY29uc3QgbmFtZWRCaW5kaW5nIG9mIG5hbWVkQmluZGluZ3MuZWxlbWVudHMpIHtcbiAgICAgICAgYWRkSW1wb3J0QWxpYXMobmFtZWRCaW5kaW5nLm5hbWUsIG1vZHVsZU5hbWUsIG5hbWVkQmluZGluZy5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBpbXBvcnQgYWxpYXMgZm9yIHRoZSBzeW1ib2wgZGVmaW5lZCBhdCB0aGUgZ2l2ZW4gbm9kZS4gQ3JlYXRlcyBhbiBhbGlhcyBuYW1lIGJhc2VkIG9uXG4gICAqIHRoZSBnaXZlbiBtb2R1bGVOYW1lIGFuZCAob3B0aW9uYWxseSkgdGhlIG5hbWUuXG4gICAqL1xuICBmdW5jdGlvbiBhZGRJbXBvcnRBbGlhcyhub2RlOiB0cy5Ob2RlLCBtb2R1bGVOYW1lOiBzdHJpbmcsIG5hbWU6IHRzLklkZW50aWZpZXJ8c3RyaW5nfHVuZGVmaW5lZCkge1xuICAgIGxldCBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKG5vZGUpO1xuICAgIGlmICghc3ltYm9sKSB7XG4gICAgICByZXBvcnREaWFnbm9zdGljKGRpYWdub3N0aWNzLCBub2RlLCBgbmFtZWQgaW1wb3J0IGhhcyBubyBzeW1ib2xgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGFsaWFzTmFtZSA9IG1vZHVsZU5hbWU7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgYWxpYXNOYW1lICs9ICcuJyArIG5hbWU7XG4gICAgfSBlbHNlIGlmIChuYW1lKSB7XG4gICAgICBhbGlhc05hbWUgKz0gJy4nICsgZ2V0SWRlbnRpZmllclRleHQobmFtZSk7XG4gICAgfVxuICAgIGlmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1ib2wpO1xuICAgIH1cbiAgICBtdHQuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLnNldChzeW1ib2wsIGFsaWFzTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBjb21waWxlciBlcnJvciB0aGF0IHJlZmVyZW5jZXMgdGhlIE5vZGUncyBraW5kLiBUaGlzIGlzIHVzZWZ1bCBmb3IgdGhlIFwiZWxzZVwiXG4gICAqIGJyYW5jaCBvZiBjb2RlIHRoYXQgaXMgYXR0ZW1wdGluZyB0byBoYW5kbGUgYWxsIHBvc3NpYmxlIGlucHV0IE5vZGUgdHlwZXMsIHRvIGVuc3VyZSBhbGwgY2FzZXNcbiAgICogY292ZXJlZC5cbiAgICovXG4gIGZ1bmN0aW9uIGVycm9yVW5pbXBsZW1lbnRlZEtpbmQobm9kZTogdHMuTm9kZSwgd2hlcmU6IHN0cmluZykge1xuICAgIHJlcG9ydERpYWdub3N0aWMoZGlhZ25vc3RpY3MsIG5vZGUsIGAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX0gbm90IGltcGxlbWVudGVkIGluICR7d2hlcmV9YCk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0TmFtZXNwYWNlRm9yTG9jYWxEZWNsYXJhdGlvbiByZXR1cm5zIHRoZSBuYW1lc3BhY2UgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIGdpdmVuXG4gICAqIGRlY2xhcmF0aW9uLCBkZWNpZGluZyB3aGV0aGVyIHRvIG5hbWVzcGFjZSB0aGUgc3ltYm9sIHRvIHRoZSBmaWxlIG9yIHdoZXRoZXIgdG8gY3JlYXRlIGFcbiAgICogZ2xvYmFsIG5hbWUuXG4gICAqXG4gICAqIFRoZSBmdW5jdGlvbiBjb3ZlcnMgdGhlc2UgY2FzZXM6XG4gICAqIDEpIGEgZGVjbGFyYXRpb24gaW4gYSAuZC50c1xuICAgKiAxYSkgd2hlcmUgdGhlIC5kLnRzIGlzIGFuIGV4dGVybmFsIG1vZHVsZSAgICAgLS0+IG5hbWVzcGFjZVxuICAgKiAxYikgd2hlcmUgdGhlIC5kLnRzIGlzIG5vdCBhbiBleHRlcm5hbCBtb2R1bGUgLS0+IGdsb2JhbFxuICAgKiAyKSBhIGRlY2xhcmF0aW9uIGluIGEgLnRzIGZpbGUgKGFsbCBhcmUgdHJlYXRlZCBhcyBtb2R1bGVzKVxuICAgKiAyYSkgdGhhdCBpcyBleHBvcnRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgLS0+IG5hbWVzcGFjZVxuICAgKiAyYikgdGhhdCBpcyB1bmV4cG9ydGVkICAgICAgICAgICAgICAgICAgICAgICAgLS0+IGdsb2JhbFxuICAgKlxuICAgKiBGb3IgMSksIGFsbCBzeW1ib2xzIGluIC5kLnRzIHNob3VsZCBnZW5lcmFsbHkgYmUgbmFtZXNwYWNlZCB0byB0aGUgZmlsZSB0byBhdm9pZCBjb2xsaXNpb25zLlxuICAgKiBIb3dldmVyIC5kLnRzIGZpbGVzIHRoYXQgYXJlIG5vdCBleHRlcm5hbCBtb2R1bGVzIGRvIGRlY2xhcmUgZ2xvYmFsIG5hbWVzICgxYikuXG4gICAqXG4gICAqIEZvciAyKSwgYW1iaWVudCBkZWNsYXJhdGlvbnMgaW4gLnRzIGZpbGVzIG11c3QgYmUgbmFtZXNwYWNlZCwgZm9yIHRoZSBzYW1lIGNvbGxpc2lvbiByZWFzb25zLlxuICAgKiBUaGUgZXhjZXB0aW9uIGlzIDJiKSwgd2hlcmUgaW4gVHlwZVNjcmlwdCwgYW4gdW5leHBvcnRlZCBsb2NhbCBcImRlY2xhcmUgY29uc3QgeDogc3RyaW5nO1wiXG4gICAqIGNyZWF0ZXMgYSBzeW1ib2wgdGhhdCwgd2hlbiB1c2VkIGxvY2FsbHksIGlzIGVtaXR0ZWQgYXMganVzdCBcInhcIi4gVGhhdCBpcywgaXQgYmVoYXZlc1xuICAgKiBsaWtlIGEgdmFyaWFibGUgZGVjbGFyZWQgaW4gYSAnZGVjbGFyZSBnbG9iYWwnIGJsb2NrLiBDbG9zdXJlIENvbXBpbGVyIHdvdWxkIGZhaWwgdGhlIGJ1aWxkIGlmXG4gICAqIHRoZXJlIGlzIG5vIGRlY2xhcmF0aW9uIGZvciBcInhcIiwgc28gdHNpY2tsZSBtdXN0IGdlbmVyYXRlIGEgZ2xvYmFsIGV4dGVybmFsIHN5bWJvbCwgaS5lLlxuICAgKiB3aXRob3V0IHRoZSBuYW1lc3BhY2Ugd3JhcHBlci5cbiAgICovXG4gIGZ1bmN0aW9uIGdldE5hbWVzcGFjZUZvclRvcExldmVsRGVjbGFyYXRpb24oXG4gICAgICBkZWNsYXJhdGlvbjogdHMuTm9kZSwgbmFtZXNwYWNlOiBSZWFkb25seUFycmF5PHN0cmluZz4pOiBSZWFkb25seUFycmF5PHN0cmluZz4ge1xuICAgIC8vIE9ubHkgdXNlIHJvb3ROYW1lc3BhY2UgZm9yIHRvcCBsZXZlbCBzeW1ib2xzLCBhbnkgb3RoZXIgbmFtZXNwYWNpbmcgKGdsb2JhbCBuYW1lcywgbmVzdGVkXG4gICAgLy8gbmFtZXNwYWNlcykgaXMgYWx3YXlzIGtlcHQuXG4gICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggIT09IDApIHJldHVybiBuYW1lc3BhY2U7XG4gICAgLy8gQWxsIG5hbWVzIGluIGEgbW9kdWxlIChleHRlcm5hbCkgLmQudHMgZmlsZSBjYW4gb25seSBiZSBhY2Nlc3NlZCBsb2NhbGx5LCBzbyB0aGV5IGFsd2F5cyBnZXRcbiAgICAvLyBuYW1lc3BhY2UgcHJlZml4ZWQuXG4gICAgaWYgKGlzRHRzICYmIGlzRXh0ZXJuYWxNb2R1bGUpIHJldHVybiBbcm9vdE5hbWVzcGFjZV07XG4gICAgLy8gU2FtZSBmb3IgZXhwb3J0ZWQgZGVjbGFyYXRpb25zIGluIHJlZ3VsYXIgLnRzIGZpbGVzLlxuICAgIGlmIChoYXNNb2RpZmllckZsYWcoZGVjbGFyYXRpb24sIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSkgcmV0dXJuIFtyb290TmFtZXNwYWNlXTtcbiAgICAvLyBCdXQgbG9jYWwgZGVjbGFyYXRpb25zIGluIC50cyBmaWxlcyBvciAuZC50cyBmaWxlcyAoMWIsIDJiKSBhcmUgZ2xvYmFsLCB0b28uXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZnVuY3Rpb24gdmlzaXRvcihub2RlOiB0cy5Ob2RlLCBuYW1lc3BhY2U6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPikge1xuICAgIGlmIChub2RlLnBhcmVudCA9PT0gc291cmNlRmlsZSkge1xuICAgICAgbmFtZXNwYWNlID0gZ2V0TmFtZXNwYWNlRm9yVG9wTGV2ZWxEZWNsYXJhdGlvbihub2RlLCBuYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTW9kdWxlRGVjbGFyYXRpb246XG4gICAgICAgIGNvbnN0IGRlY2wgPSBub2RlIGFzIHRzLk1vZHVsZURlY2xhcmF0aW9uO1xuICAgICAgICBzd2l0Y2ggKGRlY2wubmFtZS5raW5kKSB7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICBpZiAoZGVjbC5mbGFncyAmIHRzLk5vZGVGbGFncy5HbG9iYWxBdWdtZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgLy8gRS5nLiBcImRlY2xhcmUgZ2xvYmFsIHsgLi4uIH1cIi4gIFJlc2V0IHRvIHRoZSBvdXRlciBuYW1lc3BhY2UuXG4gICAgICAgICAgICAgIG5hbWVzcGFjZSA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gRS5nLiBcImRlY2xhcmUgbmFtZXNwYWNlIGZvbyB7XCJcbiAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGdldElkZW50aWZpZXJUZXh0KGRlY2wubmFtZSBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICAgICAgICAgICAgaWYgKGlzRmlyc3RWYWx1ZURlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgICAgICAgICAgICAgZW1pdCgnLyoqIEBjb25zdCAqL1xcbicpO1xuICAgICAgICAgICAgICAgIHdyaXRlVmFyaWFibGVTdGF0ZW1lbnQobmFtZSwgbmFtZXNwYWNlLCAne30nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBuYW1lc3BhY2UgPSBuYW1lc3BhY2UuY29uY2F0KG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlY2wuYm9keSkgdmlzaXRvcihkZWNsLmJvZHksIG5hbWVzcGFjZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgICAgIC8vIEUuZy4gXCJkZWNsYXJlIG1vZHVsZSAnZm9vJyB7XCIgKG5vdGUgdGhlIHF1b3RlcykuXG4gICAgICAgICAgICAvLyBXZSBzdGlsbCB3YW50IHRvIGVtaXQgZXh0ZXJucyBmb3IgdGhpcyBtb2R1bGUsIGJ1dCBDbG9zdXJlIGRvZXNuJ3QgcHJvdmlkZSBhXG4gICAgICAgICAgICAvLyBtZWNoYW5pc20gZm9yIG1vZHVsZS1zY29wZWQgZXh0ZXJucy4gSW5zdGVhZCwgd2UgZW1pdCBpbiBhIG1hbmdsZWQgbmFtZXNwYWNlLlxuICAgICAgICAgICAgLy8gVGhlIG1hbmdsZWQgbmFtZXNwYWNlIChhZnRlciByZXNvbHZpbmcgZmlsZXMpIG1hdGNoZXMgdGhlIGVtaXQgZm9yIGFuIG9yaWdpbmFsIG1vZHVsZVxuICAgICAgICAgICAgLy8gZmlsZSwgc28gZWZmZWN0aXZlbHkgdGhpcyBhdWdtZW50cyBhbnkgZXhpc3RpbmcgbW9kdWxlLlxuXG4gICAgICAgICAgICBjb25zdCBpbXBvcnROYW1lID0gKGRlY2wubmFtZSBhcyB0cy5TdHJpbmdMaXRlcmFsKS50ZXh0O1xuICAgICAgICAgICAgY29uc3QgaW1wb3J0ZWRNb2R1bGVOYW1lID0gcmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgICAgICAge2hvc3Q6IG1vZHVsZVJlc29sdXRpb25Ib3N0LCBvcHRpb25zfSwgc291cmNlRmlsZS5maWxlTmFtZSwgaW1wb3J0TmFtZSk7XG4gICAgICAgICAgICBjb25zdCBtYW5nbGVkID0gbW9kdWxlTmFtZUFzSWRlbnRpZmllcihob3N0LCBpbXBvcnRlZE1vZHVsZU5hbWUpO1xuICAgICAgICAgICAgZW1pdChgLy8gRGVyaXZlZCBmcm9tOiBkZWNsYXJlIG1vZHVsZSBcIiR7aW1wb3J0TmFtZX1cIlxcbmApO1xuICAgICAgICAgICAgbmFtZXNwYWNlID0gW21hbmdsZWRdO1xuXG4gICAgICAgICAgICAvLyBEZWNsYXJlIFwibWFuZ2xlZCRuYW1lXCIgaWYgaXQncyBub3QgZGVjbGFyZWQgYWxyZWFkeSBlbHNld2hlcmUuXG4gICAgICAgICAgICBpZiAoaXNGaXJzdFZhbHVlRGVjbGFyYXRpb24oZGVjbCkpIHtcbiAgICAgICAgICAgICAgZW1pdCgnLyoqIEBjb25zdCAqL1xcbicpO1xuICAgICAgICAgICAgICB3cml0ZVZhcmlhYmxlU3RhdGVtZW50KG1hbmdsZWQsIFtdLCAne30nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIERlY2xhcmUgdGhlIGNvbnRlbnRzIGluc2lkZSB0aGUgXCJtYW5nbGVkJG5hbWVcIi5cbiAgICAgICAgICAgIGlmIChkZWNsLmJvZHkpIHZpc2l0b3IoZGVjbC5ib2R5LCBbbWFuZ2xlZF0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGVycm9yVW5pbXBsZW1lbnRlZEtpbmQoZGVjbC5uYW1lLCAnZXh0ZXJucyBnZW5lcmF0aW9uIG9mIG5hbWVzcGFjZScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTW9kdWxlQmxvY2s6XG4gICAgICAgIGNvbnN0IGJsb2NrID0gbm9kZSBhcyB0cy5Nb2R1bGVCbG9jaztcbiAgICAgICAgZm9yIChjb25zdCBzdG10IG9mIGJsb2NrLnN0YXRlbWVudHMpIHtcbiAgICAgICAgICB2aXNpdG9yKHN0bXQsIG5hbWVzcGFjZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0RXF1YWxzRGVjbGFyYXRpb246XG4gICAgICAgIGNvbnN0IGltcG9ydEVxdWFscyA9IG5vZGUgYXMgdHMuSW1wb3J0RXF1YWxzRGVjbGFyYXRpb247XG4gICAgICAgIGNvbnN0IGxvY2FsTmFtZSA9IGdldElkZW50aWZpZXJUZXh0KGltcG9ydEVxdWFscy5uYW1lKTtcbiAgICAgICAgaWYgKGxvY2FsTmFtZSA9PT0gJ25nJykge1xuICAgICAgICAgIGVtaXQoYFxcbi8qIFNraXBwaW5nIHByb2JsZW1hdGljIGltcG9ydCBuZyA9IC4uLjsgKi9cXG5gKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW1wb3J0RXF1YWxzLm1vZHVsZVJlZmVyZW5jZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4dGVybmFsTW9kdWxlUmVmZXJlbmNlKSB7XG4gICAgICAgICAgYWRkSW1wb3J0QWxpYXNlcyhpbXBvcnRFcXVhbHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHFuID0gZ2V0RW50aXR5TmFtZVRleHQoaW1wb3J0RXF1YWxzLm1vZHVsZVJlZmVyZW5jZSk7XG4gICAgICAgIC8vIEBjb25zdCBzbyB0aGF0IENsb3N1cmUgQ29tcGlsZXIgdW5kZXJzdGFuZHMgdGhpcyBpcyBhbiBhbGlhcy5cbiAgICAgICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggPT09IDApIGVtaXQoJy8qKiBAY29uc3QgKi9cXG4nKTtcbiAgICAgICAgd3JpdGVWYXJpYWJsZVN0YXRlbWVudChsb2NhbE5hbWUsIG5hbWVzcGFjZSwgcW4pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uOlxuICAgICAgICB3cml0ZVR5cGUobm9kZSBhcyB0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbiB8IHRzLkNsYXNzRGVjbGFyYXRpb24sIG5hbWVzcGFjZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgIGNvbnN0IGZuRGVjbCA9IG5vZGUgYXMgdHMuRnVuY3Rpb25EZWNsYXJhdGlvbjtcbiAgICAgICAgY29uc3QgbmFtZSA9IGZuRGVjbC5uYW1lO1xuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICByZXBvcnREaWFnbm9zdGljKGRpYWdub3N0aWNzLCBmbkRlY2wsICdhbm9ueW1vdXMgZnVuY3Rpb24gaW4gZXh0ZXJucycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEdhdGhlciB1cCBhbGwgb3ZlcmxvYWRzIG9mIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgIGNvbnN0IHN5bSA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obmFtZSkhO1xuICAgICAgICBjb25zdCBkZWNscyA9IHN5bS5kZWNsYXJhdGlvbnMhLmZpbHRlcih0cy5pc0Z1bmN0aW9uRGVjbGFyYXRpb24pO1xuICAgICAgICAvLyBPbmx5IGVtaXQgdGhlIGZpcnN0IGRlY2xhcmF0aW9uIG9mIGVhY2ggb3ZlcmxvYWRlZCBmdW5jdGlvbi5cbiAgICAgICAgaWYgKGZuRGVjbCAhPT0gZGVjbHNbMF0pIGJyZWFrO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBlbWl0RnVuY3Rpb25UeXBlKGRlY2xzKTtcbiAgICAgICAgd3JpdGVGdW5jdGlvbihuYW1lLCBwYXJhbXMsIG5hbWVzcGFjZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50OlxuICAgICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgKG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQpLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMpIHtcbiAgICAgICAgICB3cml0ZVZhcmlhYmxlRGVjbGFyYXRpb24oZGVjbCwgbmFtZXNwYWNlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb246XG4gICAgICAgIHdyaXRlRW51bShub2RlIGFzIHRzLkVudW1EZWNsYXJhdGlvbiwgbmFtZXNwYWNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZUFsaWFzRGVjbGFyYXRpb246XG4gICAgICAgIHdyaXRlVHlwZUFsaWFzKG5vZGUgYXMgdHMuVHlwZUFsaWFzRGVjbGFyYXRpb24sIG5hbWVzcGFjZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uOlxuICAgICAgICBhZGRJbXBvcnRBbGlhc2VzKG5vZGUgYXMgdHMuSW1wb3J0RGVjbGFyYXRpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OYW1lc3BhY2VFeHBvcnREZWNsYXJhdGlvbjpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeHBvcnRBc3NpZ25tZW50OlxuICAgICAgICAvLyBIYW5kbGVkIG9uIHRoZSBmaWxlIGxldmVsLlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uU3RyID0gbmFtZXNwYWNlLmpvaW4oJy4nKSB8fCBwYXRoLmJhc2VuYW1lKG5vZGUuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lKTtcbiAgICAgICAgZW1pdChgXFxuLy8gVE9ETyh0c2lja2xlKTogJHt0cy5TeW50YXhLaW5kW25vZGUua2luZF19IGluICR7bG9jYXRpb25TdHJ9XFxuYCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19