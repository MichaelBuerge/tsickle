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
        define("tsickle/src/type_translator", ["require", "exports", "path", "tsickle/src/externs", "tsickle/src/jsdoc_transformer", "tsickle/src/transformer_util", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var externs_1 = require("tsickle/src/externs");
    var jsdoc_transformer_1 = require("tsickle/src/jsdoc_transformer");
    var transformer_util_1 = require("tsickle/src/transformer_util");
    var ts = require("tsickle/src/typescript");
    /**
     * TypeScript allows you to write identifiers quoted, like:
     *   interface Foo {
     *     'bar': string;
     *     'complex name': string;
     *   }
     *   Foo.bar;  // ok
     *   Foo['bar']  // ok
     *   Foo['complex name']  // ok
     *
     * In Closure-land, we want identify that the legal name 'bar' can become an
     * ordinary field, but we need to skip strings like 'complex name'.
     */
    function isValidClosurePropertyName(name) {
        // In local experimentation, it appears that reserved words like 'var' and
        // 'if' are legal JS and still accepted by Closure.
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }
    exports.isValidClosurePropertyName = isValidClosurePropertyName;
    /**
     * Determines if fileName refers to a builtin lib.d.ts file.
     * This is a terrible hack but it mirrors a similar thing done in Clutz.
     */
    function isBuiltinLibDTS(fileName) {
        return fileName.match(/\blib\.(?:[^/]+\.)?d\.ts$/) != null;
    }
    exports.isBuiltinLibDTS = isBuiltinLibDTS;
    /**
     * @return True if the named type is considered compatible with the Closure-defined
     *     type of the same name, e.g. "Array".  Note that we don't actually enforce
     *     that the types are actually compatible, but mostly just hope that they are due
     *     to being derived from the same HTML specs.
     */
    function isClosureProvidedType(symbol) {
        return symbol.declarations != null &&
            symbol.declarations.some(function (n) { return isBuiltinLibDTS(n.getSourceFile().fileName); });
    }
    function typeToDebugString(type) {
        var e_1, _a, e_2, _b;
        var debugString = "flags:0x" + type.flags.toString(16);
        if (type.aliasSymbol) {
            debugString += " alias:" + symbolToDebugString(type.aliasSymbol);
        }
        if (type.aliasTypeArguments) {
            debugString += " aliasArgs:<" + type.aliasTypeArguments.map(typeToDebugString).join(',') + ">";
        }
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var basicTypes = [
            ts.TypeFlags.Any, ts.TypeFlags.String, ts.TypeFlags.Number,
            ts.TypeFlags.Boolean, ts.TypeFlags.Enum, ts.TypeFlags.StringLiteral,
            ts.TypeFlags.NumberLiteral, ts.TypeFlags.BooleanLiteral, ts.TypeFlags.EnumLiteral,
            ts.TypeFlags.ESSymbol, ts.TypeFlags.UniqueESSymbol, ts.TypeFlags.Void,
            ts.TypeFlags.Undefined, ts.TypeFlags.Null, ts.TypeFlags.Never,
            ts.TypeFlags.TypeParameter, ts.TypeFlags.Object, ts.TypeFlags.Union,
            ts.TypeFlags.Intersection, ts.TypeFlags.Index, ts.TypeFlags.IndexedAccess,
            ts.TypeFlags.Conditional, ts.TypeFlags.Substitution,
        ];
        try {
            for (var basicTypes_1 = __values(basicTypes), basicTypes_1_1 = basicTypes_1.next(); !basicTypes_1_1.done; basicTypes_1_1 = basicTypes_1.next()) {
                var flag = basicTypes_1_1.value;
                if ((type.flags & flag) !== 0) {
                    debugString += " " + ts.TypeFlags[flag];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (basicTypes_1_1 && !basicTypes_1_1.done && (_a = basicTypes_1.return)) _a.call(basicTypes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (type.flags === ts.TypeFlags.Object) {
            var objType = type;
            debugString += " objectFlags:0x" + objType.objectFlags;
            // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
            var objectFlags = [
                ts.ObjectFlags.Class,
                ts.ObjectFlags.Interface,
                ts.ObjectFlags.Reference,
                ts.ObjectFlags.Tuple,
                ts.ObjectFlags.Anonymous,
                ts.ObjectFlags.Mapped,
                ts.ObjectFlags.Instantiated,
                ts.ObjectFlags.ObjectLiteral,
                ts.ObjectFlags.EvolvingArray,
                ts.ObjectFlags.ObjectLiteralPatternWithComputedProperties,
            ];
            try {
                for (var objectFlags_1 = __values(objectFlags), objectFlags_1_1 = objectFlags_1.next(); !objectFlags_1_1.done; objectFlags_1_1 = objectFlags_1.next()) {
                    var flag = objectFlags_1_1.value;
                    if ((objType.objectFlags & flag) !== 0) {
                        debugString += " object:" + ts.ObjectFlags[flag];
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (objectFlags_1_1 && !objectFlags_1_1.done && (_b = objectFlags_1.return)) _b.call(objectFlags_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        if (type.symbol && type.symbol.name !== '__type') {
            debugString += " symbol.name:" + JSON.stringify(type.symbol.name);
        }
        if (type.pattern) {
            debugString += " destructuring:true";
        }
        return "{type " + debugString + "}";
    }
    exports.typeToDebugString = typeToDebugString;
    function symbolToDebugString(sym) {
        var e_3, _a;
        var debugString = JSON.stringify(sym.name) + " flags:0x" + sym.flags.toString(16);
        // Just the unique flags (powers of two). Declared in src/compiler/types.ts.
        var symbolFlags = [
            ts.SymbolFlags.FunctionScopedVariable,
            ts.SymbolFlags.BlockScopedVariable,
            ts.SymbolFlags.Property,
            ts.SymbolFlags.EnumMember,
            ts.SymbolFlags.Function,
            ts.SymbolFlags.Class,
            ts.SymbolFlags.Interface,
            ts.SymbolFlags.ConstEnum,
            ts.SymbolFlags.RegularEnum,
            ts.SymbolFlags.ValueModule,
            ts.SymbolFlags.NamespaceModule,
            ts.SymbolFlags.TypeLiteral,
            ts.SymbolFlags.ObjectLiteral,
            ts.SymbolFlags.Method,
            ts.SymbolFlags.Constructor,
            ts.SymbolFlags.GetAccessor,
            ts.SymbolFlags.SetAccessor,
            ts.SymbolFlags.Signature,
            ts.SymbolFlags.TypeParameter,
            ts.SymbolFlags.TypeAlias,
            ts.SymbolFlags.ExportValue,
            ts.SymbolFlags.Alias,
            ts.SymbolFlags.Prototype,
            ts.SymbolFlags.ExportStar,
            ts.SymbolFlags.Optional,
            ts.SymbolFlags.Transient,
        ];
        try {
            for (var symbolFlags_1 = __values(symbolFlags), symbolFlags_1_1 = symbolFlags_1.next(); !symbolFlags_1_1.done; symbolFlags_1_1 = symbolFlags_1.next()) {
                var flag = symbolFlags_1_1.value;
                if ((sym.flags & flag) !== 0) {
                    debugString += " " + ts.SymbolFlags[flag];
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (symbolFlags_1_1 && !symbolFlags_1_1.done && (_a = symbolFlags_1.return)) _a.call(symbolFlags_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return debugString;
    }
    exports.symbolToDebugString = symbolToDebugString;
    /**
     * Searches for an ambient module declaration in the ancestors of declarations, depth first, and
     * returns the first or null if none found.
     */
    function getContainingAmbientModuleDeclaration(declarations) {
        var e_4, _a;
        try {
            for (var declarations_1 = __values(declarations), declarations_1_1 = declarations_1.next(); !declarations_1_1.done; declarations_1_1 = declarations_1.next()) {
                var declaration = declarations_1_1.value;
                var parent_1 = declaration.parent;
                while (parent_1) {
                    if (ts.isModuleDeclaration(parent_1) && ts.isStringLiteral(parent_1.name)) {
                        return parent_1;
                    }
                    parent_1 = parent_1.parent;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (declarations_1_1 && !declarations_1_1.done && (_a = declarations_1.return)) _a.call(declarations_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return null;
    }
    /** Returns true if any of declarations is a top level declaration in an external module. */
    function isTopLevelExternal(declarations) {
        var e_5, _a;
        try {
            for (var declarations_2 = __values(declarations), declarations_2_1 = declarations_2.next(); !declarations_2_1.done; declarations_2_1 = declarations_2.next()) {
                var declaration = declarations_2_1.value;
                if (declaration.parent === undefined)
                    continue;
                if (ts.isSourceFile(declaration.parent) && ts.isExternalModule(declaration.parent))
                    return true;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (declarations_2_1 && !declarations_2_1.done && (_a = declarations_2.return)) _a.call(declarations_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return false;
    }
    /**
     * Returns true if a and b are (or were originally before transformation) nodes of the same source
     * file.
     */
    function isDeclaredInSameFile(a, b) {
        return ts.getOriginalNode(a).getSourceFile() === ts.getOriginalNode(b).getSourceFile();
    }
    /** TypeTranslator translates TypeScript types to Closure types. */
    var TypeTranslator = /** @class */ (function () {
        /**
         * @param node is the source AST ts.Node the type comes from.  This is used
         *     in some cases (e.g. anonymous types) for looking up field names.
         * @param pathBlackList is a set of paths that should never get typed;
         *     any reference to symbols defined in these paths should by typed
         *     as {?}.
         * @param symbolsToAliasedNames a mapping from symbols (`Foo`) to a name in scope they should be
         *     emitted as (e.g. `tsickle_forward_declare_1.Foo`). Can be augmented during type
         *     translation, e.g. to blacklist a symbol.
         */
        function TypeTranslator(host, typeChecker, node, pathBlackList, symbolsToAliasedNames, ensureSymbolDeclared) {
            if (symbolsToAliasedNames === void 0) { symbolsToAliasedNames = new Map(); }
            if (ensureSymbolDeclared === void 0) { ensureSymbolDeclared = function () { }; }
            this.host = host;
            this.typeChecker = typeChecker;
            this.node = node;
            this.pathBlackList = pathBlackList;
            this.symbolsToAliasedNames = symbolsToAliasedNames;
            this.ensureSymbolDeclared = ensureSymbolDeclared;
            /**
             * A list of type literals we've encountered while emitting; used to avoid getting stuck in
             * recursive types.
             */
            this.seenAnonymousTypes = new Set();
            /**
             * Whether to write types suitable for an \@externs file. Externs types must not refer to
             * non-externs types (i.e. non ambient types) and need to use fully qualified names.
             */
            this.isForExterns = false;
            // Normalize paths to not break checks on Windows.
            if (this.pathBlackList != null) {
                this.pathBlackList =
                    new Set(Array.from(this.pathBlackList.values()).map(function (p) { return path.normalize(p); }));
            }
        }
        /**
         * Converts a ts.Symbol to a string.
         * Other approaches that don't work:
         * - TypeChecker.typeToString translates Array as T[].
         * - TypeChecker.symbolToString emits types without their namespace,
         *   and doesn't let you pass the flag to control that.
         * @param useFqn whether to scope the name using its fully qualified name. Closure's template
         *     arguments are always scoped to the class containing them, where TypeScript's template args
         *     would be fully qualified. I.e. this flag is false for generic types.
         */
        TypeTranslator.prototype.symbolToString = function (sym, useFqn) {
            var _this = this;
            // TypeScript resolves e.g. union types to their members, which can include symbols not declared
            // in the current scope. Ensure that all symbols found this way are actually declared.
            // This must happen before the alias check below, it might introduce a new alias for the symbol.
            if (!this.isForExterns && (sym.flags & ts.SymbolFlags.TypeParameter) === 0) {
                this.ensureSymbolDeclared(sym);
            }
            // This follows getSingleLineStringWriter in the TypeScript compiler.
            var str = '';
            function writeText(text) {
                str += text;
            }
            var writeSymbol = function (text, symbol) {
                // When writing a symbol, check if there is an alias for it in the current scope that should
                // take precedence, e.g. from a goog.forwardDeclare.
                if (symbol.flags & ts.SymbolFlags.Alias) {
                    symbol = _this.typeChecker.getAliasedSymbol(symbol);
                }
                var alias = _this.symbolsToAliasedNames.get(symbol);
                if (alias) {
                    // If so, discard the entire current text and only use the alias - otherwise if a symbol has
                    // a local alias but appears in a dotted type path (e.g. when it's imported using import *
                    // as foo), str would contain both the prefx *and* the full alias (foo.alias.name).
                    str = alias;
                    return;
                }
                if (str.length === 0) {
                    var mangledPrefix = _this.maybeGetMangledNamePrefix(symbol);
                    text = mangledPrefix + text;
                }
                str += text;
            };
            var doNothing = function () {
                return;
            };
            var builder = this.typeChecker.getSymbolDisplayBuilder();
            var writer = {
                writeSymbol: writeSymbol,
                writeKeyword: writeText,
                writeOperator: writeText,
                writePunctuation: writeText,
                writeSpace: writeText,
                writeStringLiteral: writeText,
                writeParameter: writeText,
                writeProperty: writeText,
                writeLine: doNothing,
                increaseIndent: doNothing,
                decreaseIndent: doNothing,
                clear: doNothing,
                trackSymbol: function (symbol, enclosingDeclaration, meaning) {
                    return;
                },
                reportInaccessibleThisError: doNothing,
                reportPrivateInBaseOfClassExpression: doNothing,
            };
            builder.buildSymbolDisplay(sym, writer, this.node);
            return this.stripClutzNamespace(str);
        };
        /**
         * Returns the mangled name prefix for symbol, or an empty string if not applicable.
         *
         * Type names are emitted with a mangled prefix if they are top level symbols declared in an
         * external module (.d.ts or .ts), and are ambient declarations ("declare ..."). This is because
         * their declarations get moved to externs files (to make external names visible to Closure and
         * prevent renaming), which only use global names. This means the names must be mangled to prevent
         * collisions and allow referencing them uniquely.
         *
         * This method also handles the special case of symbols declared in an ambient external module
         * context.
         *
         * Symbols declared in a global block, e.g. "declare global { type X; }", are handled implicitly:
         * when referenced, they are written as just "X", which is not a top level declaration, so the
         * code below ignores them.
         */
        TypeTranslator.prototype.maybeGetMangledNamePrefix = function (symbol) {
            var _this = this;
            if (!symbol.declarations)
                return '';
            var declarations = symbol.declarations;
            var ambientModuleDeclaration = null;
            // If the symbol is neither a top level declaration in an external module nor in an ambient
            // block, tsickle should not emit a prefix: it's either not an external symbol, or it's an
            // external symbol nested in a module, so it will need to be qualified, and the mangling prefix
            // goes on the qualifier.
            if (!isTopLevelExternal(declarations)) {
                ambientModuleDeclaration = getContainingAmbientModuleDeclaration(declarations);
                if (!ambientModuleDeclaration)
                    return '';
            }
            // At this point, the declaration is from an external module (possibly ambient).
            // These declarations must be prefixed if either:
            // (a) tsickle is emitting an externs file, so all symbols are qualified within it
            // (b) or the declaration must be an exported ambient declaration from the local file.
            // Ambient external declarations from other files are imported, so there's a local alias for the
            // module and no mangling is needed.
            if (!this.isForExterns &&
                !declarations.every(function (d) { return isDeclaredInSameFile(_this.node, d) && jsdoc_transformer_1.isAmbient(d) &&
                    transformer_util_1.hasModifierFlag(d, ts.ModifierFlags.Export); })) {
                return '';
            }
            // If from an ambient declaration, use and resolve the name from that. Otherwise, use the file
            // name from the (arbitrary) first declaration to mangle.
            var fileName = ambientModuleDeclaration ?
                ambientModuleDeclaration.name.text :
                ts.getOriginalNode(declarations[0]).getSourceFile().fileName;
            var mangled = externs_1.moduleNameAsIdentifier(this.host, fileName);
            return mangled + '.';
        };
        // Clutz (https://github.com/angular/clutz) emits global type symbols hidden in a special
        // ಠ_ಠ.clutz namespace. While most code seen by Tsickle will only ever see local aliases, Clutz
        // symbols can be written by users directly in code, and they can appear by dereferencing
        // TypeAliases. The code below simply strips the prefix, the remaining type name then matches
        // Closure's type.
        TypeTranslator.prototype.stripClutzNamespace = function (name) {
            if (name.startsWith('ಠ_ಠ.clutz.'))
                return name.substring('ಠ_ಠ.clutz.'.length);
            return name;
        };
        TypeTranslator.prototype.translate = function (type) {
            // NOTE: Though type.flags has the name "flags", it usually can only be one
            // of the enum options at a time (except for unions of literal types, e.g. unions of boolean
            // values, string values, enum values). This switch handles all the cases in the ts.TypeFlags
            // enum in the order they occur.
            var e_6, _a;
            // NOTE: Some TypeFlags are marked "internal" in the d.ts but still show up in the value of
            // type.flags. This mask limits the flag checks to the ones in the public API. "lastFlag" here
            // is the last flag handled in this switch statement, and should be kept in sync with
            // typescript.d.ts.
            // NonPrimitive occurs on its own on the lower case "object" type. Special case to "!Object".
            if (type.flags === ts.TypeFlags.NonPrimitive)
                return '!Object';
            // Avoid infinite loops on recursive type literals.
            // It would be nice to just emit the name of the recursive type here (in type.aliasSymbol
            // below), but Closure Compiler does not allow recursive type definitions.
            if (this.seenAnonymousTypes.has(type))
                return '?';
            var isAmbient = false;
            var isInNamespace = false;
            var isModule = false;
            if (type.symbol) {
                try {
                    for (var _b = __values(type.symbol.declarations || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var decl = _c.value;
                        if (ts.isExternalModule(decl.getSourceFile()))
                            isModule = true;
                        var current = decl;
                        while (current) {
                            if (ts.getCombinedModifierFlags(current) & ts.ModifierFlags.Ambient)
                                isAmbient = true;
                            if (current.kind === ts.SyntaxKind.ModuleDeclaration)
                                isInNamespace = true;
                            current = current.parent;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            // tsickle cannot generate types for non-ambient namespaces nor any symbols contained in them.
            if (isInNamespace && !isAmbient)
                return '?';
            // Types in externs cannot reference types from external modules.
            // However ambient types in modules get moved to externs, too, so type references work and we
            // can emit a precise type.
            if (this.isForExterns && isModule && !isAmbient)
                return '?';
            var lastFlag = ts.TypeFlags.Substitution;
            var mask = (lastFlag << 1) - 1;
            switch (type.flags & mask) {
                case ts.TypeFlags.Any:
                    return '?';
                case ts.TypeFlags.String:
                case ts.TypeFlags.StringLiteral:
                    return 'string';
                case ts.TypeFlags.Number:
                case ts.TypeFlags.NumberLiteral:
                    return 'number';
                case ts.TypeFlags.Boolean:
                case ts.TypeFlags.BooleanLiteral:
                    // See the note in translateUnion about booleans.
                    return 'boolean';
                case ts.TypeFlags.Enum:
                    if (!type.symbol) {
                        this.warn("EnumType without a symbol");
                        return '?';
                    }
                    return this.symbolToString(type.symbol, true);
                case ts.TypeFlags.ESSymbol:
                case ts.TypeFlags.UniqueESSymbol:
                    // ESSymbol indicates something typed symbol.
                    // UniqueESSymbol indicates a specific unique symbol, used e.g. to index into an object.
                    // Closure does not have this distinction, so tsickle emits both as 'symbol'.
                    return 'symbol';
                case ts.TypeFlags.Void:
                    return 'void';
                case ts.TypeFlags.Undefined:
                    return 'undefined';
                case ts.TypeFlags.Null:
                    return 'null';
                case ts.TypeFlags.Never:
                    this.warn("should not emit a 'never' type");
                    return '?';
                case ts.TypeFlags.TypeParameter:
                    // This is e.g. the T in a type like Foo<T>.
                    if (!type.symbol) {
                        this.warn("TypeParameter without a symbol"); // should not happen (tm)
                        return '?';
                    }
                    // In Closure, type parameters ("<T>") are non-nullable by default, unlike references to
                    // classes or interfaces. However this code path can be reached by bound type parameters,
                    // where the type parameter's symbol references a plain class or interface. In this case,
                    // add `!` to avoid emitting a nullable type.
                    var prefix = '';
                    if ((type.symbol.flags & ts.SymbolFlags.TypeParameter) === 0) {
                        prefix = '!';
                    }
                    // In Closure Compiler, type parameters *are* scoped to their containing class.
                    var useFqn = false;
                    return prefix + this.symbolToString(type.symbol, useFqn);
                case ts.TypeFlags.Object:
                    return this.translateObject(type);
                case ts.TypeFlags.Union:
                    return this.translateUnion(type);
                case ts.TypeFlags.Conditional:
                case ts.TypeFlags.Substitution:
                    this.warn("emitting ? for conditional/substitution type");
                    return '?';
                case ts.TypeFlags.Intersection:
                case ts.TypeFlags.Index:
                case ts.TypeFlags.IndexedAccess:
                    // TODO(ts2.1): handle these special types.
                    this.warn("unhandled type flags: " + ts.TypeFlags[type.flags]);
                    return '?';
                default:
                    // Handle cases where multiple flags are set.
                    // Types with literal members are represented as
                    //   ts.TypeFlags.Union | [literal member]
                    // E.g. an enum typed value is a union type with the enum's members as its members. A
                    // boolean type is a union type with 'true' and 'false' as its members.
                    // Note also that in a more complex union, e.g. boolean|number, then it's a union of three
                    // things (true|false|number) and ts.TypeFlags.Boolean doesn't show up at all.
                    if (type.flags & ts.TypeFlags.Union) {
                        return this.translateUnion(type);
                    }
                    if (type.flags & ts.TypeFlags.EnumLiteral) {
                        return this.translateEnumLiteral(type);
                    }
                    // The switch statement should have been exhaustive.
                    throw new Error("unknown type flags " + type.flags + " on " + typeToDebugString(type));
            }
        };
        TypeTranslator.prototype.translateUnion = function (type) {
            var _this = this;
            var parts = type.types.map(function (t) { return _this.translate(t); });
            // Union types that include literals (e.g. boolean, enum) can end up repeating the same Closure
            // type. For example: true | boolean will be translated to boolean | boolean.
            // Remove duplicates to produce types that read better.
            parts = parts.filter(function (el, idx) { return parts.indexOf(el) === idx; });
            return parts.length === 1 ? parts[0] : "(" + parts.join('|') + ")";
        };
        TypeTranslator.prototype.translateEnumLiteral = function (type) {
            // Suppose you had:
            //   enum EnumType { MEMBER }
            // then the type of "EnumType.MEMBER" is an enum literal (the thing passed to this function)
            // and it has type flags that include
            //   ts.TypeFlags.NumberLiteral | ts.TypeFlags.EnumLiteral
            //
            // Closure Compiler doesn't support literals in types, so this code must not emit
            // "EnumType.MEMBER", but rather "EnumType".
            var enumLiteralBaseType = this.typeChecker.getBaseTypeOfLiteralType(type);
            if (!enumLiteralBaseType.symbol) {
                this.warn("EnumLiteralType without a symbol");
                return '?';
            }
            return this.symbolToString(enumLiteralBaseType.symbol, true);
        };
        // translateObject translates a ts.ObjectType, which is the type of all
        // object-like things in TS, such as classes and interfaces.
        TypeTranslator.prototype.translateObject = function (type) {
            var _this = this;
            if (type.symbol && this.isBlackListed(type.symbol))
                return '?';
            // NOTE: objectFlags is an enum, but a given type can have multiple flags.
            // Array<string> is both ts.ObjectFlags.Reference and ts.ObjectFlags.Interface.
            if (type.objectFlags & ts.ObjectFlags.Class) {
                if (!type.symbol) {
                    this.warn('class has no symbol');
                    return '?';
                }
                var name_1 = this.symbolToString(type.symbol, /* useFqn */ true);
                if (name_1 === '(Anonymous class)') {
                    // Values that have anonymous class types produce this name, but the type
                    // appears otherwise identical to a named class.  Given that the type is
                    // anonymous here, there's not really a useful name we can emit.
                    return '?';
                }
                return '!' + name_1;
            }
            else if (type.objectFlags & ts.ObjectFlags.Interface) {
                // Note: ts.InterfaceType has a typeParameters field, but that
                // specifies the parameters that the interface type *expects*
                // when it's used, and should not be transformed to the output.
                // E.g. a type like Array<number> is a TypeReference to the
                // InterfaceType "Array", but the "number" type parameter is
                // part of the outer TypeReference, not a typeParameter on
                // the InterfaceType.
                if (!type.symbol) {
                    this.warn('interface has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Value) {
                    // The symbol is both a type and a value.
                    // For user-defined types in this state, we don't have a Closure name
                    // for the type.  See the type_and_value test.
                    if (!isClosureProvidedType(type.symbol)) {
                        this.warn("type/symbol conflict for " + type.symbol.name + ", using {?} for now");
                        return '?';
                    }
                }
                return '!' + this.symbolToString(type.symbol, /* useFqn */ true);
            }
            else if (type.objectFlags & ts.ObjectFlags.Reference) {
                // A reference to another type, e.g. Array<number> refers to Array.
                // Emit the referenced type and any type arguments.
                var referenceType = type;
                // A tuple is a ReferenceType where the target is flagged Tuple and the
                // typeArguments are the tuple arguments.  Just treat it as a mystery
                // array, because Closure doesn't understand tuples.
                if (referenceType.target.objectFlags & ts.ObjectFlags.Tuple) {
                    return '!Array<?>';
                }
                var typeStr = '';
                if (referenceType.target === referenceType) {
                    // We get into an infinite loop here if the inner reference is
                    // the same as the outer; this can occur when this function
                    // fails to translate a more specific type before getting to
                    // this point.
                    throw new Error("reference loop in " + typeToDebugString(referenceType) + " " + referenceType.flags);
                }
                typeStr += this.translate(referenceType.target);
                // Translate can return '?' for a number of situations, e.g. type/value conflicts.
                // `?<?>` is illegal syntax in Closure Compiler, so just return `?` here.
                if (typeStr === '?')
                    return '?';
                if (referenceType.typeArguments) {
                    var params = referenceType.typeArguments.map(function (t) { return _this.translate(t); });
                    typeStr += "<" + params.join(', ') + ">";
                }
                return typeStr;
            }
            else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
                if (!type.symbol) {
                    // This comes up when generating code for an arrow function as passed
                    // to a generic function.  The passed-in type is tagged as anonymous
                    // and has no properties so it's hard to figure out what to generate.
                    // Just avoid it for now so we don't crash.
                    this.warn('anonymous type has no symbol');
                    return '?';
                }
                if (type.symbol.flags & ts.SymbolFlags.Function ||
                    type.symbol.flags & ts.SymbolFlags.Method) {
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                    this.warn('unhandled anonymous type with multiple call signatures');
                    return '?';
                }
                else {
                    return this.translateAnonymousType(type);
                }
            }
            /*
            TODO(ts2.1): more unhandled object type flags:
              Tuple
              Mapped
              Instantiated
              ObjectLiteral
              EvolvingArray
              ObjectLiteralPatternWithComputedProperties
            */
            this.warn("unhandled type " + typeToDebugString(type));
            return '?';
        };
        /**
         * translateAnonymousType translates a ts.TypeFlags.ObjectType that is also
         * ts.ObjectFlags.Anonymous. That is, this type's symbol does not have a name. This is the
         * anonymous type encountered in e.g.
         *     let x: {a: number};
         * But also the inferred type in:
         *     let x = {a: 1};  // type of x is {a: number}, as above
         */
        TypeTranslator.prototype.translateAnonymousType = function (type) {
            var e_7, _a;
            this.seenAnonymousTypes.add(type);
            // Gather up all the named fields and whether the object is also callable.
            var callable = false;
            var indexable = false;
            var fields = [];
            if (!type.symbol || !type.symbol.members) {
                this.warn('anonymous type has no symbol');
                return '?';
            }
            // special-case construct signatures.
            var ctors = type.getConstructSignatures();
            if (ctors.length) {
                // TODO(martinprobst): this does not support additional properties defined on constructors
                // (not expressible in Closure), nor multiple constructors (same).
                var decl = ctors[0].declaration;
                if (!decl) {
                    this.warn('unhandled anonymous type with constructor signature but no declaration');
                    return '?';
                }
                if (decl.kind === ts.SyntaxKindJSDocSignature) {
                    this.warn('unhandled JSDoc based constructor signature');
                    return '?';
                }
                // new <T>(tee: T) is not supported by Closure, blacklist as ?.
                this.blacklistTypeParameters(this.symbolsToAliasedNames, decl.typeParameters);
                var params = this.convertParams(ctors[0], decl.parameters);
                var paramsStr = params.length ? (', ' + params.join(', ')) : '';
                var constructedType = this.translate(ctors[0].getReturnType());
                // In the specific case of the "new" in a function, it appears that
                //   function(new: !Bar)
                // fails to parse, while
                //   function(new: (!Bar))
                // parses in the way you'd expect.
                // It appears from testing that Closure ignores the ! anyway and just
                // assumes the result will be non-null in either case.  (To be pedantic,
                // it's possible to return null from a ctor it seems like a bad idea.)
                return "function(new: (" + constructedType + ")" + paramsStr + "): ?";
            }
            try {
                // members is an ES6 map, but the .d.ts defining it defined their own map
                // type, so typescript doesn't believe that .keys() is iterable
                // tslint:disable-next-line:no-any
                for (var _b = __values(type.symbol.members.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var field = _c.value;
                    switch (field) {
                        case '__call':
                            callable = true;
                            break;
                        case '__index':
                            indexable = true;
                            break;
                        default:
                            if (!isValidClosurePropertyName(field)) {
                                this.warn("omitting inexpressible property name: " + field);
                                continue;
                            }
                            var member = type.symbol.members.get(field);
                            // optional members are handled by the type including |undefined in a union type.
                            var memberType = this.translate(this.typeChecker.getTypeOfSymbolAtLocation(member, this.node));
                            fields.push(field + ": " + memberType);
                            break;
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_7) throw e_7.error; }
            }
            // Try to special-case plain key-value objects and functions.
            if (fields.length === 0) {
                if (callable && !indexable) {
                    // A function type.
                    var sigs = this.typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
                    if (sigs.length === 1) {
                        return this.signatureToClosure(sigs[0]);
                    }
                }
                else if (indexable && !callable) {
                    // A plain key-value map type.
                    var keyType = 'string';
                    var valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.String);
                    if (!valType) {
                        keyType = 'number';
                        valType = this.typeChecker.getIndexTypeOfType(type, ts.IndexKind.Number);
                    }
                    if (!valType) {
                        this.warn('unknown index key type');
                        return "!Object<?,?>";
                    }
                    return "!Object<" + keyType + "," + this.translate(valType) + ">";
                }
                else if (!callable && !indexable) {
                    // The object has no members.  This is the TS type '{}',
                    // which means "any value other than null or undefined".
                    // What is this in Closure's type system?
                    //
                    // First, {!Object} is wrong because it is not a supertype of
                    // {string} or {number}.  This would mean you cannot assign a
                    // number to a variable of TS type {}.
                    //
                    // We get closer with {*}, aka the ALL type.  This one better
                    // captures the typical use of the TS {}, which users use for
                    // "I don't care".
                    //
                    // {*} unfortunately does include null/undefined, so it's a closer
                    // match for TS 3.0's 'unknown'.
                    return '*';
                }
            }
            if (!callable && !indexable) {
                // Not callable, not indexable; implies a plain object with fields in it.
                return "{" + fields.join(', ') + "}";
            }
            this.warn('unhandled anonymous type');
            return '?';
        };
        /** Converts a ts.Signature (function signature) to a Closure function type. */
        TypeTranslator.prototype.signatureToClosure = function (sig) {
            // TODO(martinprobst): Consider harmonizing some overlap with emitFunctionType in tsickle.ts.
            if (!sig.declaration) {
                this.warn('signature without declaration');
                return 'Function';
            }
            if (sig.declaration.kind === ts.SyntaxKindJSDocSignature) {
                this.warn('signature with JSDoc declaration');
                return 'Function';
            }
            this.blacklistTypeParameters(this.symbolsToAliasedNames, sig.declaration.typeParameters);
            var typeStr = "function(";
            var paramDecls = sig.declaration.parameters || [];
            var maybeThisParam = paramDecls[0];
            // Oddly, the this type shows up in paramDecls, but not in the type's parameters.
            // Handle it here and then pass paramDecls down without its first element.
            if (maybeThisParam && maybeThisParam.name.getText() === 'this') {
                if (maybeThisParam.type) {
                    var thisType = this.typeChecker.getTypeAtLocation(maybeThisParam.type);
                    typeStr += "this: (" + this.translate(thisType) + ")";
                    if (paramDecls.length > 1)
                        typeStr += ', ';
                }
                else {
                    this.warn('this type without type');
                }
                paramDecls = paramDecls.slice(1);
            }
            var params = this.convertParams(sig, paramDecls);
            typeStr += params.join(', ') + ")";
            var retType = this.translate(this.typeChecker.getReturnTypeOfSignature(sig));
            if (retType) {
                typeStr += ": " + retType;
            }
            return typeStr;
        };
        /**
         * Converts parameters for the given signature. Takes parameter declarations as those might not
         * match the signature parameters (e.g. there might be an additional this parameter). This
         * difference is handled by the caller, as is converting the "this" parameter.
         */
        TypeTranslator.prototype.convertParams = function (sig, paramDecls) {
            var paramTypes = [];
            for (var i = 0; i < sig.parameters.length; i++) {
                var param = sig.parameters[i];
                var paramDecl = paramDecls[i];
                var optional = !!paramDecl.questionToken;
                var varArgs = !!paramDecl.dotDotDotToken;
                var paramType = this.typeChecker.getTypeOfSymbolAtLocation(param, this.node);
                if (varArgs) {
                    var typeRef = paramType;
                    paramType = typeRef.typeArguments[0];
                }
                var typeStr = this.translate(paramType);
                if (varArgs)
                    typeStr = '...' + typeStr;
                if (optional)
                    typeStr = typeStr + '=';
                paramTypes.push(typeStr);
            }
            return paramTypes;
        };
        TypeTranslator.prototype.warn = function (msg) {
            // By default, warn() does nothing.  The caller will overwrite this
            // if it wants different behavior.
        };
        /** @return true if sym should always have type {?}. */
        TypeTranslator.prototype.isBlackListed = function (symbol) {
            if (this.pathBlackList === undefined)
                return false;
            var pathBlackList = this.pathBlackList;
            // Some builtin types, such as {}, get represented by a symbol that has no declarations.
            if (symbol.declarations === undefined)
                return false;
            return symbol.declarations.every(function (n) {
                var fileName = path.normalize(n.getSourceFile().fileName);
                return pathBlackList.has(fileName);
            });
        };
        /**
         * Closure doesn not support type parameters for function types, i.e. generic function types.
         * Blacklist the symbols declared by them and emit a ? for the types.
         *
         * This mutates the given blacklist map. The map's scope is one file, and symbols are
         * unique objects, so this should neither lead to excessive memory consumption nor introduce
         * errors.
         *
         * @param blacklist a map to store the blacklisted symbols in, with a value of '?'. In practice,
         *     this is always === this.symbolsToAliasedNames, but we're passing it explicitly to make it
         *    clear that the map is mutated (in particular when used from outside the class).
         * @param decls the declarations whose symbols should be blacklisted.
         */
        TypeTranslator.prototype.blacklistTypeParameters = function (blacklist, decls) {
            var e_8, _a;
            if (!decls || !decls.length)
                return;
            try {
                for (var decls_1 = __values(decls), decls_1_1 = decls_1.next(); !decls_1_1.done; decls_1_1 = decls_1.next()) {
                    var tpd = decls_1_1.value;
                    var sym = this.typeChecker.getSymbolAtLocation(tpd.name);
                    if (!sym) {
                        this.warn("type parameter with no symbol");
                        continue;
                    }
                    this.symbolsToAliasedNames.set(sym, '?');
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (decls_1_1 && !decls_1_1.done && (_a = decls_1.return)) _a.call(decls_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        return TypeTranslator;
    }());
    exports.TypeTranslator = TypeTranslator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV90cmFuc2xhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3R5cGVfdHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyQkFBNkI7SUFFN0IsK0NBQWlEO0lBQ2pELG1FQUE2RDtJQUM3RCxpRUFBbUQ7SUFDbkQsMkNBQW1DO0lBRW5DOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILG9DQUEyQyxJQUFZO1FBQ3JELDBFQUEwRTtRQUMxRSxtREFBbUQ7UUFDbkQsT0FBTywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUpELGdFQUlDO0lBRUQ7OztPQUdHO0lBQ0gseUJBQWdDLFFBQWdCO1FBQzlDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM3RCxDQUFDO0lBRkQsMENBRUM7SUFFRDs7Ozs7T0FLRztJQUNILCtCQUErQixNQUFpQjtRQUM5QyxPQUFPLE1BQU0sQ0FBQyxZQUFZLElBQUksSUFBSTtZQUM5QixNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQWUsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsMkJBQWtDLElBQWE7O1FBQzdDLElBQUksV0FBVyxHQUFHLGFBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFHLENBQUM7UUFFdkQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLFdBQVcsSUFBSSxZQUFVLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUcsQ0FBQztTQUNsRTtRQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzNCLFdB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b3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7bW9kdWxlTmFtZUFzSWRlbnRpZmllcn0gZnJvbSAnLi9leHRlcm5zJztcbmltcG9ydCB7QW5ub3RhdG9ySG9zdCwgaXNBbWJpZW50fSBmcm9tICcuL2pzZG9jX3RyYW5zZm9ybWVyJztcbmltcG9ydCB7aGFzTW9kaWZpZXJGbGFnfSBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqXG4gKiBUeXBlU2NyaXB0IGFsbG93cyB5b3UgdG8gd3JpdGUgaWRlbnRpZmllcnMgcXVvdGVkLCBsaWtlOlxuICogICBpbnRlcmZhY2UgRm9vIHtcbiAqICAgICAnYmFyJzogc3RyaW5nO1xuICogICAgICdjb21wbGV4IG5hbWUnOiBzdHJpbmc7XG4gKiAgIH1cbiAqICAgRm9vLmJhcjsgIC8vIG9rXG4gKiAgIEZvb1snYmFyJ10gIC8vIG9rXG4gKiAgIEZvb1snY29tcGxleCBuYW1lJ10gIC8vIG9rXG4gKlxuICogSW4gQ2xvc3VyZS1sYW5kLCB3ZSB3YW50IGlkZW50aWZ5IHRoYXQgdGhlIGxlZ2FsIG5hbWUgJ2JhcicgY2FuIGJlY29tZSBhblxuICogb3JkaW5hcnkgZmllbGQsIGJ1dCB3ZSBuZWVkIHRvIHNraXAgc3RyaW5ncyBsaWtlICdjb21wbGV4IG5hbWUnLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZENsb3N1cmVQcm9wZXJ0eU5hbWUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIC8vIEluIGxvY2FsIGV4cGVyaW1lbnRhdGlvbiwgaXQgYXBwZWFycyB0aGF0IHJlc2VydmVkIHdvcmRzIGxpa2UgJ3ZhcicgYW5kXG4gIC8vICdpZicgYXJlIGxlZ2FsIEpTIGFuZCBzdGlsbCBhY2NlcHRlZCBieSBDbG9zdXJlLlxuICByZXR1cm4gL15bYS16QS1aX11bYS16QS1aMC05X10qJC8udGVzdChuYW1lKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIGZpbGVOYW1lIHJlZmVycyB0byBhIGJ1aWx0aW4gbGliLmQudHMgZmlsZS5cbiAqIFRoaXMgaXMgYSB0ZXJyaWJsZSBoYWNrIGJ1dCBpdCBtaXJyb3JzIGEgc2ltaWxhciB0aGluZyBkb25lIGluIENsdXR6LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCdWlsdGluTGliRFRTKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGZpbGVOYW1lLm1hdGNoKC9cXGJsaWJcXC4oPzpbXi9dK1xcLik/ZFxcLnRzJC8pICE9IG51bGw7XG59XG5cbi8qKlxuICogQHJldHVybiBUcnVlIGlmIHRoZSBuYW1lZCB0eXBlIGlzIGNvbnNpZGVyZWQgY29tcGF0aWJsZSB3aXRoIHRoZSBDbG9zdXJlLWRlZmluZWRcbiAqICAgICB0eXBlIG9mIHRoZSBzYW1lIG5hbWUsIGUuZy4gXCJBcnJheVwiLiAgTm90ZSB0aGF0IHdlIGRvbid0IGFjdHVhbGx5IGVuZm9yY2VcbiAqICAgICB0aGF0IHRoZSB0eXBlcyBhcmUgYWN0dWFsbHkgY29tcGF0aWJsZSwgYnV0IG1vc3RseSBqdXN0IGhvcGUgdGhhdCB0aGV5IGFyZSBkdWVcbiAqICAgICB0byBiZWluZyBkZXJpdmVkIGZyb20gdGhlIHNhbWUgSFRNTCBzcGVjcy5cbiAqL1xuZnVuY3Rpb24gaXNDbG9zdXJlUHJvdmlkZWRUeXBlKHN5bWJvbDogdHMuU3ltYm9sKTogYm9vbGVhbiB7XG4gIHJldHVybiBzeW1ib2wuZGVjbGFyYXRpb25zICE9IG51bGwgJiZcbiAgICAgIHN5bWJvbC5kZWNsYXJhdGlvbnMuc29tZShuID0+IGlzQnVpbHRpbkxpYkRUUyhuLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZVRvRGVidWdTdHJpbmcodHlwZTogdHMuVHlwZSk6IHN0cmluZyB7XG4gIGxldCBkZWJ1Z1N0cmluZyA9IGBmbGFnczoweCR7dHlwZS5mbGFncy50b1N0cmluZygxNil9YDtcblxuICBpZiAodHlwZS5hbGlhc1N5bWJvbCkge1xuICAgIGRlYnVnU3RyaW5nICs9IGAgYWxpYXM6JHtzeW1ib2xUb0RlYnVnU3RyaW5nKHR5cGUuYWxpYXNTeW1ib2wpfWA7XG4gIH1cbiAgaWYgKHR5cGUuYWxpYXNUeXBlQXJndW1lbnRzKSB7XG4gICAgZGVidWdTdHJpbmcgKz0gYCBhbGlhc0FyZ3M6PCR7dHlwZS5hbGlhc1R5cGVBcmd1bWVudHMubWFwKHR5cGVUb0RlYnVnU3RyaW5nKS5qb2luKCcsJyl9PmA7XG4gIH1cblxuICAvLyBKdXN0IHRoZSB1bmlxdWUgZmxhZ3MgKHBvd2VycyBvZiB0d28pLiBEZWNsYXJlZCBpbiBzcmMvY29tcGlsZXIvdHlwZXMudHMuXG4gIGNvbnN0IGJhc2ljVHlwZXM6IHRzLlR5cGVGbGFnc1tdID0gW1xuICAgIHRzLlR5cGVGbGFncy5BbnksICAgICAgICAgICB0cy5UeXBlRmxhZ3MuU3RyaW5nLCAgICAgICAgIHRzLlR5cGVGbGFncy5OdW1iZXIsXG4gICAgdHMuVHlwZUZsYWdzLkJvb2xlYW4sICAgICAgIHRzLlR5cGVGbGFncy5FbnVtLCAgICAgICAgICAgdHMuVHlwZUZsYWdzLlN0cmluZ0xpdGVyYWwsXG4gICAgdHMuVHlwZUZsYWdzLk51bWJlckxpdGVyYWwsIHRzLlR5cGVGbGFncy5Cb29sZWFuTGl0ZXJhbCwgdHMuVHlwZUZsYWdzLkVudW1MaXRlcmFsLFxuICAgIHRzLlR5cGVGbGFncy5FU1N5bWJvbCwgICAgICB0cy5UeXBlRmxhZ3MuVW5pcXVlRVNTeW1ib2wsIHRzLlR5cGVGbGFncy5Wb2lkLFxuICAgIHRzLlR5cGVGbGFncy5VbmRlZmluZWQsICAgICB0cy5UeXBlRmxhZ3MuTnVsbCwgICAgICAgICAgIHRzLlR5cGVGbGFncy5OZXZlcixcbiAgICB0cy5UeXBlRmxhZ3MuVHlwZVBhcmFtZXRlciwgdHMuVHlwZUZsYWdzLk9iamVjdCwgICAgICAgICB0cy5UeXBlRmxhZ3MuVW5pb24sXG4gICAgdHMuVHlwZUZsYWdzLkludGVyc2VjdGlvbiwgIHRzLlR5cGVGbGFncy5JbmRleCwgICAgICAgICAgdHMuVHlwZUZsYWdzLkluZGV4ZWRBY2Nlc3MsXG4gICAgdHMuVHlwZUZsYWdzLkNvbmRpdGlvbmFsLCAgIHRzLlR5cGVGbGFncy5TdWJzdGl0dXRpb24sXG4gIF07XG4gIGZvciAoY29uc3QgZmxhZyBvZiBiYXNpY1R5cGVzKSB7XG4gICAgaWYgKCh0eXBlLmZsYWdzICYgZmxhZykgIT09IDApIHtcbiAgICAgIGRlYnVnU3RyaW5nICs9IGAgJHt0cy5UeXBlRmxhZ3NbZmxhZ119YDtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZS5mbGFncyA9PT0gdHMuVHlwZUZsYWdzLk9iamVjdCkge1xuICAgIGNvbnN0IG9ialR5cGUgPSB0eXBlIGFzIHRzLk9iamVjdFR5cGU7XG4gICAgZGVidWdTdHJpbmcgKz0gYCBvYmplY3RGbGFnczoweCR7b2JqVHlwZS5vYmplY3RGbGFnc31gO1xuICAgIC8vIEp1c3QgdGhlIHVuaXF1ZSBmbGFncyAocG93ZXJzIG9mIHR3bykuIERlY2xhcmVkIGluIHNyYy9jb21waWxlci90eXBlcy50cy5cbiAgICBjb25zdCBvYmplY3RGbGFnczogdHMuT2JqZWN0RmxhZ3NbXSA9IFtcbiAgICAgIHRzLk9iamVjdEZsYWdzLkNsYXNzLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuSW50ZXJmYWNlLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuUmVmZXJlbmNlLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuVHVwbGUsXG4gICAgICB0cy5PYmplY3RGbGFncy5Bbm9ueW1vdXMsXG4gICAgICB0cy5PYmplY3RGbGFncy5NYXBwZWQsXG4gICAgICB0cy5PYmplY3RGbGFncy5JbnN0YW50aWF0ZWQsXG4gICAgICB0cy5PYmplY3RGbGFncy5PYmplY3RMaXRlcmFsLFxuICAgICAgdHMuT2JqZWN0RmxhZ3MuRXZvbHZpbmdBcnJheSxcbiAgICAgIHRzLk9iamVjdEZsYWdzLk9iamVjdExpdGVyYWxQYXR0ZXJuV2l0aENvbXB1dGVkUHJvcGVydGllcyxcbiAgICBdO1xuICAgIGZvciAoY29uc3QgZmxhZyBvZiBvYmplY3RGbGFncykge1xuICAgICAgaWYgKChvYmpUeXBlLm9iamVjdEZsYWdzICYgZmxhZykgIT09IDApIHtcbiAgICAgICAgZGVidWdTdHJpbmcgKz0gYCBvYmplY3Q6JHt0cy5PYmplY3RGbGFnc1tmbGFnXX1gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlLnN5bWJvbCAmJiB0eXBlLnN5bWJvbC5uYW1lICE9PSAnX190eXBlJykge1xuICAgIGRlYnVnU3RyaW5nICs9IGAgc3ltYm9sLm5hbWU6JHtKU09OLnN0cmluZ2lmeSh0eXBlLnN5bWJvbC5uYW1lKX1gO1xuICB9XG5cbiAgaWYgKHR5cGUucGF0dGVybikge1xuICAgIGRlYnVnU3RyaW5nICs9IGAgZGVzdHJ1Y3R1cmluZzp0cnVlYDtcbiAgfVxuXG4gIHJldHVybiBge3R5cGUgJHtkZWJ1Z1N0cmluZ319YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN5bWJvbFRvRGVidWdTdHJpbmcoc3ltOiB0cy5TeW1ib2wpOiBzdHJpbmcge1xuICBsZXQgZGVidWdTdHJpbmcgPSBgJHtKU09OLnN0cmluZ2lmeShzeW0ubmFtZSl9IGZsYWdzOjB4JHtzeW0uZmxhZ3MudG9TdHJpbmcoMTYpfWA7XG5cbiAgLy8gSnVzdCB0aGUgdW5pcXVlIGZsYWdzIChwb3dlcnMgb2YgdHdvKS4gRGVjbGFyZWQgaW4gc3JjL2NvbXBpbGVyL3R5cGVzLnRzLlxuICBjb25zdCBzeW1ib2xGbGFncyA9IFtcbiAgICB0cy5TeW1ib2xGbGFncy5GdW5jdGlvblNjb3BlZFZhcmlhYmxlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkJsb2NrU2NvcGVkVmFyaWFibGUsXG4gICAgdHMuU3ltYm9sRmxhZ3MuUHJvcGVydHksXG4gICAgdHMuU3ltYm9sRmxhZ3MuRW51bU1lbWJlcixcbiAgICB0cy5TeW1ib2xGbGFncy5GdW5jdGlvbixcbiAgICB0cy5TeW1ib2xGbGFncy5DbGFzcyxcbiAgICB0cy5TeW1ib2xGbGFncy5JbnRlcmZhY2UsXG4gICAgdHMuU3ltYm9sRmxhZ3MuQ29uc3RFbnVtLFxuICAgIHRzLlN5bWJvbEZsYWdzLlJlZ3VsYXJFbnVtLFxuICAgIHRzLlN5bWJvbEZsYWdzLlZhbHVlTW9kdWxlLFxuICAgIHRzLlN5bWJvbEZsYWdzLk5hbWVzcGFjZU1vZHVsZSxcbiAgICB0cy5TeW1ib2xGbGFncy5UeXBlTGl0ZXJhbCxcbiAgICB0cy5TeW1ib2xGbGFncy5PYmplY3RMaXRlcmFsLFxuICAgIHRzLlN5bWJvbEZsYWdzLk1ldGhvZCxcbiAgICB0cy5TeW1ib2xGbGFncy5Db25zdHJ1Y3RvcixcbiAgICB0cy5TeW1ib2xGbGFncy5HZXRBY2Nlc3NvcixcbiAgICB0cy5TeW1ib2xGbGFncy5TZXRBY2Nlc3NvcixcbiAgICB0cy5TeW1ib2xGbGFncy5TaWduYXR1cmUsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHlwZVBhcmFtZXRlcixcbiAgICB0cy5TeW1ib2xGbGFncy5UeXBlQWxpYXMsXG4gICAgdHMuU3ltYm9sRmxhZ3MuRXhwb3J0VmFsdWUsXG4gICAgdHMuU3ltYm9sRmxhZ3MuQWxpYXMsXG4gICAgdHMuU3ltYm9sRmxhZ3MuUHJvdG90eXBlLFxuICAgIHRzLlN5bWJvbEZsYWdzLkV4cG9ydFN0YXIsXG4gICAgdHMuU3ltYm9sRmxhZ3MuT3B0aW9uYWwsXG4gICAgdHMuU3ltYm9sRmxhZ3MuVHJhbnNpZW50LFxuICBdO1xuICBmb3IgKGNvbnN0IGZsYWcgb2Ygc3ltYm9sRmxhZ3MpIHtcbiAgICBpZiAoKHN5bS5mbGFncyAmIGZsYWcpICE9PSAwKSB7XG4gICAgICBkZWJ1Z1N0cmluZyArPSBgICR7dHMuU3ltYm9sRmxhZ3NbZmxhZ119YDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVidWdTdHJpbmc7XG59XG5cbi8qKiBBIG1vZHVsZSBkZWNsYXJlZCBhcyBcImRlY2xhcmUgbW9kdWxlICdleHRlcm5hbF9uYW1lJyB7Li4ufVwiIChub3RlIHRoZSBxdW90ZXMpLiAqL1xudHlwZSBBbWJpZW50TW9kdWxlRGVjbGFyYXRpb24gPSB0cy5Nb2R1bGVEZWNsYXJhdGlvbiZ7bmFtZTogdHMuU3RyaW5nTGl0ZXJhbH07XG5cbi8qKlxuICogU2VhcmNoZXMgZm9yIGFuIGFtYmllbnQgbW9kdWxlIGRlY2xhcmF0aW9uIGluIHRoZSBhbmNlc3RvcnMgb2YgZGVjbGFyYXRpb25zLCBkZXB0aCBmaXJzdCwgYW5kXG4gKiByZXR1cm5zIHRoZSBmaXJzdCBvciBudWxsIGlmIG5vbmUgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIGdldENvbnRhaW5pbmdBbWJpZW50TW9kdWxlRGVjbGFyYXRpb24oZGVjbGFyYXRpb25zOiB0cy5EZWNsYXJhdGlvbltdKTpcbiAgICBBbWJpZW50TW9kdWxlRGVjbGFyYXRpb258bnVsbCB7XG4gIGZvciAoY29uc3QgZGVjbGFyYXRpb24gb2YgZGVjbGFyYXRpb25zKSB7XG4gICAgbGV0IHBhcmVudCA9IGRlY2xhcmF0aW9uLnBhcmVudDtcbiAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICBpZiAodHMuaXNNb2R1bGVEZWNsYXJhdGlvbihwYXJlbnQpICYmIHRzLmlzU3RyaW5nTGl0ZXJhbChwYXJlbnQubmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudCBhcyBBbWJpZW50TW9kdWxlRGVjbGFyYXRpb247XG4gICAgICB9XG4gICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgZGVjbGFyYXRpb25zIGlzIGEgdG9wIGxldmVsIGRlY2xhcmF0aW9uIGluIGFuIGV4dGVybmFsIG1vZHVsZS4gKi9cbmZ1bmN0aW9uIGlzVG9wTGV2ZWxFeHRlcm5hbChkZWNsYXJhdGlvbnM6IHRzLkRlY2xhcmF0aW9uW10pIHtcbiAgZm9yIChjb25zdCBkZWNsYXJhdGlvbiBvZiBkZWNsYXJhdGlvbnMpIHtcbiAgICBpZiAoZGVjbGFyYXRpb24ucGFyZW50ID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgIGlmICh0cy5pc1NvdXJjZUZpbGUoZGVjbGFyYXRpb24ucGFyZW50KSAmJiB0cy5pc0V4dGVybmFsTW9kdWxlKGRlY2xhcmF0aW9uLnBhcmVudCkpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSBhbmQgYiBhcmUgKG9yIHdlcmUgb3JpZ2luYWxseSBiZWZvcmUgdHJhbnNmb3JtYXRpb24pIG5vZGVzIG9mIHRoZSBzYW1lIHNvdXJjZVxuICogZmlsZS5cbiAqL1xuZnVuY3Rpb24gaXNEZWNsYXJlZEluU2FtZUZpbGUoYTogdHMuTm9kZSwgYjogdHMuTm9kZSkge1xuICByZXR1cm4gdHMuZ2V0T3JpZ2luYWxOb2RlKGEpLmdldFNvdXJjZUZpbGUoKSA9PT0gdHMuZ2V0T3JpZ2luYWxOb2RlKGIpLmdldFNvdXJjZUZpbGUoKTtcbn1cblxuLyoqIFR5cGVUcmFuc2xhdG9yIHRyYW5zbGF0ZXMgVHlwZVNjcmlwdCB0eXBlcyB0byBDbG9zdXJlIHR5cGVzLiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVUcmFuc2xhdG9yIHtcbiAgLyoqXG4gICAqIEEgbGlzdCBvZiB0eXBlIGxpdGVyYWxzIHdlJ3ZlIGVuY291bnRlcmVkIHdoaWxlIGVtaXR0aW5nOyB1c2VkIHRvIGF2b2lkIGdldHRpbmcgc3R1Y2sgaW5cbiAgICogcmVjdXJzaXZlIHR5cGVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBzZWVuQW5vbnltb3VzVHlwZXMgPSBuZXcgU2V0PHRzLlR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gd3JpdGUgdHlwZXMgc3VpdGFibGUgZm9yIGFuIFxcQGV4dGVybnMgZmlsZS4gRXh0ZXJucyB0eXBlcyBtdXN0IG5vdCByZWZlciB0b1xuICAgKiBub24tZXh0ZXJucyB0eXBlcyAoaS5lLiBub24gYW1iaWVudCB0eXBlcykgYW5kIG5lZWQgdG8gdXNlIGZ1bGx5IHF1YWxpZmllZCBuYW1lcy5cbiAgICovXG4gIGlzRm9yRXh0ZXJucyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbm9kZSBpcyB0aGUgc291cmNlIEFTVCB0cy5Ob2RlIHRoZSB0eXBlIGNvbWVzIGZyb20uICBUaGlzIGlzIHVzZWRcbiAgICogICAgIGluIHNvbWUgY2FzZXMgKGUuZy4gYW5vbnltb3VzIHR5cGVzKSBmb3IgbG9va2luZyB1cCBmaWVsZCBuYW1lcy5cbiAgICogQHBhcmFtIHBhdGhCbGFja0xpc3QgaXMgYSBzZXQgb2YgcGF0aHMgdGhhdCBzaG91bGQgbmV2ZXIgZ2V0IHR5cGVkO1xuICAgKiAgICAgYW55IHJlZmVyZW5jZSB0byBzeW1ib2xzIGRlZmluZWQgaW4gdGhlc2UgcGF0aHMgc2hvdWxkIGJ5IHR5cGVkXG4gICAqICAgICBhcyB7P30uXG4gICAqIEBwYXJhbSBzeW1ib2xzVG9BbGlhc2VkTmFtZXMgYSBtYXBwaW5nIGZyb20gc3ltYm9scyAoYEZvb2ApIHRvIGEgbmFtZSBpbiBzY29wZSB0aGV5IHNob3VsZCBiZVxuICAgKiAgICAgZW1pdHRlZCBhcyAoZS5nLiBgdHNpY2tsZV9mb3J3YXJkX2RlY2xhcmVfMS5Gb29gKS4gQ2FuIGJlIGF1Z21lbnRlZCBkdXJpbmcgdHlwZVxuICAgKiAgICAgdHJhbnNsYXRpb24sIGUuZy4gdG8gYmxhY2tsaXN0IGEgc3ltYm9sLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGhvc3Q6IEFubm90YXRvckhvc3QsIHByaXZhdGUgcmVhZG9ubHkgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBub2RlOiB0cy5Ob2RlLCBwcml2YXRlIHJlYWRvbmx5IHBhdGhCbGFja0xpc3Q/OiBTZXQ8c3RyaW5nPixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgc3ltYm9sc1RvQWxpYXNlZE5hbWVzID0gbmV3IE1hcDx0cy5TeW1ib2wsIHN0cmluZz4oKSxcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgZW5zdXJlU3ltYm9sRGVjbGFyZWQ6IChzeW06IHRzLlN5bWJvbCkgPT4gdm9pZCA9ICgpID0+IHt9KSB7XG4gICAgLy8gTm9ybWFsaXplIHBhdGhzIHRvIG5vdCBicmVhayBjaGVja3Mgb24gV2luZG93cy5cbiAgICBpZiAodGhpcy5wYXRoQmxhY2tMaXN0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMucGF0aEJsYWNrTGlzdCA9XG4gICAgICAgICAgbmV3IFNldDxzdHJpbmc+KEFycmF5LmZyb20odGhpcy5wYXRoQmxhY2tMaXN0LnZhbHVlcygpKS5tYXAocCA9PiBwYXRoLm5vcm1hbGl6ZShwKSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHRzLlN5bWJvbCB0byBhIHN0cmluZy5cbiAgICogT3RoZXIgYXBwcm9hY2hlcyB0aGF0IGRvbid0IHdvcms6XG4gICAqIC0gVHlwZUNoZWNrZXIudHlwZVRvU3RyaW5nIHRyYW5zbGF0ZXMgQXJyYXkgYXMgVFtdLlxuICAgKiAtIFR5cGVDaGVja2VyLnN5bWJvbFRvU3RyaW5nIGVtaXRzIHR5cGVzIHdpdGhvdXQgdGhlaXIgbmFtZXNwYWNlLFxuICAgKiAgIGFuZCBkb2Vzbid0IGxldCB5b3UgcGFzcyB0aGUgZmxhZyB0byBjb250cm9sIHRoYXQuXG4gICAqIEBwYXJhbSB1c2VGcW4gd2hldGhlciB0byBzY29wZSB0aGUgbmFtZSB1c2luZyBpdHMgZnVsbHkgcXVhbGlmaWVkIG5hbWUuIENsb3N1cmUncyB0ZW1wbGF0ZVxuICAgKiAgICAgYXJndW1lbnRzIGFyZSBhbHdheXMgc2NvcGVkIHRvIHRoZSBjbGFzcyBjb250YWluaW5nIHRoZW0sIHdoZXJlIFR5cGVTY3JpcHQncyB0ZW1wbGF0ZSBhcmdzXG4gICAqICAgICB3b3VsZCBiZSBmdWxseSBxdWFsaWZpZWQuIEkuZS4gdGhpcyBmbGFnIGlzIGZhbHNlIGZvciBnZW5lcmljIHR5cGVzLlxuICAgKi9cbiAgc3ltYm9sVG9TdHJpbmcoc3ltOiB0cy5TeW1ib2wsIHVzZUZxbjogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgLy8gVHlwZVNjcmlwdCByZXNvbHZlcyBlLmcuIHVuaW9uIHR5cGVzIHRvIHRoZWlyIG1lbWJlcnMsIHdoaWNoIGNhbiBpbmNsdWRlIHN5bWJvbHMgbm90IGRlY2xhcmVkXG4gICAgLy8gaW4gdGhlIGN1cnJlbnQgc2NvcGUuIEVuc3VyZSB0aGF0IGFsbCBzeW1ib2xzIGZvdW5kIHRoaXMgd2F5IGFyZSBhY3R1YWxseSBkZWNsYXJlZC5cbiAgICAvLyBUaGlzIG11c3QgaGFwcGVuIGJlZm9yZSB0aGUgYWxpYXMgY2hlY2sgYmVsb3csIGl0IG1pZ2h0IGludHJvZHVjZSBhIG5ldyBhbGlhcyBmb3IgdGhlIHN5bWJvbC5cbiAgICBpZiAoIXRoaXMuaXNGb3JFeHRlcm5zICYmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5UeXBlUGFyYW1ldGVyKSA9PT0gMCkge1xuICAgICAgdGhpcy5lbnN1cmVTeW1ib2xEZWNsYXJlZChzeW0pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgZm9sbG93cyBnZXRTaW5nbGVMaW5lU3RyaW5nV3JpdGVyIGluIHRoZSBUeXBlU2NyaXB0IGNvbXBpbGVyLlxuICAgIGxldCBzdHIgPSAnJztcbiAgICBmdW5jdGlvbiB3cml0ZVRleHQodGV4dDogc3RyaW5nKSB7XG4gICAgICBzdHIgKz0gdGV4dDtcbiAgICB9XG4gICAgY29uc3Qgd3JpdGVTeW1ib2wgPSAodGV4dDogc3RyaW5nLCBzeW1ib2w6IHRzLlN5bWJvbCkgPT4ge1xuICAgICAgLy8gV2hlbiB3cml0aW5nIGEgc3ltYm9sLCBjaGVjayBpZiB0aGVyZSBpcyBhbiBhbGlhcyBmb3IgaXQgaW4gdGhlIGN1cnJlbnQgc2NvcGUgdGhhdCBzaG91bGRcbiAgICAgIC8vIHRha2UgcHJlY2VkZW5jZSwgZS5nLiBmcm9tIGEgZ29vZy5mb3J3YXJkRGVjbGFyZS5cbiAgICAgIGlmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgICBzeW1ib2wgPSB0aGlzLnR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltYm9sKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFsaWFzID0gdGhpcy5zeW1ib2xzVG9BbGlhc2VkTmFtZXMuZ2V0KHN5bWJvbCk7XG4gICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgLy8gSWYgc28sIGRpc2NhcmQgdGhlIGVudGlyZSBjdXJyZW50IHRleHQgYW5kIG9ubHkgdXNlIHRoZSBhbGlhcyAtIG90aGVyd2lzZSBpZiBhIHN5bWJvbCBoYXNcbiAgICAgICAgLy8gYSBsb2NhbCBhbGlhcyBidXQgYXBwZWFycyBpbiBhIGRvdHRlZCB0eXBlIHBhdGggKGUuZy4gd2hlbiBpdCdzIGltcG9ydGVkIHVzaW5nIGltcG9ydCAqXG4gICAgICAgIC8vIGFzIGZvbyksIHN0ciB3b3VsZCBjb250YWluIGJvdGggdGhlIHByZWZ4ICphbmQqIHRoZSBmdWxsIGFsaWFzIChmb28uYWxpYXMubmFtZSkuXG4gICAgICAgIHN0ciA9IGFsaWFzO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnN0IG1hbmdsZWRQcmVmaXggPSB0aGlzLm1heWJlR2V0TWFuZ2xlZE5hbWVQcmVmaXgoc3ltYm9sKTtcbiAgICAgICAgdGV4dCA9IG1hbmdsZWRQcmVmaXggKyB0ZXh0O1xuICAgICAgfVxuICAgICAgc3RyICs9IHRleHQ7XG4gICAgfTtcbiAgICBjb25zdCBkb05vdGhpbmcgPSAoKSA9PiB7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIGNvbnN0IGJ1aWxkZXIgPSB0aGlzLnR5cGVDaGVja2VyLmdldFN5bWJvbERpc3BsYXlCdWlsZGVyKCk7XG4gICAgY29uc3Qgd3JpdGVyOiB0cy5TeW1ib2xXcml0ZXIgPSB7XG4gICAgICB3cml0ZVN5bWJvbCxcbiAgICAgIHdyaXRlS2V5d29yZDogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVPcGVyYXRvcjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQdW5jdHVhdGlvbjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTcGFjZTogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVTdHJpbmdMaXRlcmFsOiB3cml0ZVRleHQsXG4gICAgICB3cml0ZVBhcmFtZXRlcjogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVQcm9wZXJ0eTogd3JpdGVUZXh0LFxuICAgICAgd3JpdGVMaW5lOiBkb05vdGhpbmcsXG4gICAgICBpbmNyZWFzZUluZGVudDogZG9Ob3RoaW5nLFxuICAgICAgZGVjcmVhc2VJbmRlbnQ6IGRvTm90aGluZyxcbiAgICAgIGNsZWFyOiBkb05vdGhpbmcsXG4gICAgICB0cmFja1N5bWJvbChzeW1ib2w6IHRzLlN5bWJvbCwgZW5jbG9zaW5nRGVjbGFyYXRpb24/OiB0cy5Ob2RlLCBtZWFuaW5nPzogdHMuU3ltYm9sRmxhZ3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSxcbiAgICAgIHJlcG9ydEluYWNjZXNzaWJsZVRoaXNFcnJvcjogZG9Ob3RoaW5nLFxuICAgICAgcmVwb3J0UHJpdmF0ZUluQmFzZU9mQ2xhc3NFeHByZXNzaW9uOiBkb05vdGhpbmcsXG4gICAgfTtcbiAgICBidWlsZGVyLmJ1aWxkU3ltYm9sRGlzcGxheShzeW0sIHdyaXRlciwgdGhpcy5ub2RlKTtcbiAgICByZXR1cm4gdGhpcy5zdHJpcENsdXR6TmFtZXNwYWNlKHN0cik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWFuZ2xlZCBuYW1lIHByZWZpeCBmb3Igc3ltYm9sLCBvciBhbiBlbXB0eSBzdHJpbmcgaWYgbm90IGFwcGxpY2FibGUuXG4gICAqXG4gICAqIFR5cGUgbmFtZXMgYXJlIGVtaXR0ZWQgd2l0aCBhIG1hbmdsZWQgcHJlZml4IGlmIHRoZXkgYXJlIHRvcCBsZXZlbCBzeW1ib2xzIGRlY2xhcmVkIGluIGFuXG4gICAqIGV4dGVybmFsIG1vZHVsZSAoLmQudHMgb3IgLnRzKSwgYW5kIGFyZSBhbWJpZW50IGRlY2xhcmF0aW9ucyAoXCJkZWNsYXJlIC4uLlwiKS4gVGhpcyBpcyBiZWNhdXNlXG4gICAqIHRoZWlyIGRlY2xhcmF0aW9ucyBnZXQgbW92ZWQgdG8gZXh0ZXJucyBmaWxlcyAodG8gbWFrZSBleHRlcm5hbCBuYW1lcyB2aXNpYmxlIHRvIENsb3N1cmUgYW5kXG4gICAqIHByZXZlbnQgcmVuYW1pbmcpLCB3aGljaCBvbmx5IHVzZSBnbG9iYWwgbmFtZXMuIFRoaXMgbWVhbnMgdGhlIG5hbWVzIG11c3QgYmUgbWFuZ2xlZCB0byBwcmV2ZW50XG4gICAqIGNvbGxpc2lvbnMgYW5kIGFsbG93IHJlZmVyZW5jaW5nIHRoZW0gdW5pcXVlbHkuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGFsc28gaGFuZGxlcyB0aGUgc3BlY2lhbCBjYXNlIG9mIHN5bWJvbHMgZGVjbGFyZWQgaW4gYW4gYW1iaWVudCBleHRlcm5hbCBtb2R1bGVcbiAgICogY29udGV4dC5cbiAgICpcbiAgICogU3ltYm9scyBkZWNsYXJlZCBpbiBhIGdsb2JhbCBibG9jaywgZS5nLiBcImRlY2xhcmUgZ2xvYmFsIHsgdHlwZSBYOyB9XCIsIGFyZSBoYW5kbGVkIGltcGxpY2l0bHk6XG4gICAqIHdoZW4gcmVmZXJlbmNlZCwgdGhleSBhcmUgd3JpdHRlbiBhcyBqdXN0IFwiWFwiLCB3aGljaCBpcyBub3QgYSB0b3AgbGV2ZWwgZGVjbGFyYXRpb24sIHNvIHRoZVxuICAgKiBjb2RlIGJlbG93IGlnbm9yZXMgdGhlbS5cbiAgICovXG4gIG1heWJlR2V0TWFuZ2xlZE5hbWVQcmVmaXgoc3ltYm9sOiB0cy5TeW1ib2wpOiBzdHJpbmd8Jycge1xuICAgIGlmICghc3ltYm9sLmRlY2xhcmF0aW9ucykgcmV0dXJuICcnO1xuICAgIGNvbnN0IGRlY2xhcmF0aW9ucyA9IHN5bWJvbC5kZWNsYXJhdGlvbnM7XG4gICAgbGV0IGFtYmllbnRNb2R1bGVEZWNsYXJhdGlvbjogQW1iaWVudE1vZHVsZURlY2xhcmF0aW9ufG51bGwgPSBudWxsO1xuICAgIC8vIElmIHRoZSBzeW1ib2wgaXMgbmVpdGhlciBhIHRvcCBsZXZlbCBkZWNsYXJhdGlvbiBpbiBhbiBleHRlcm5hbCBtb2R1bGUgbm9yIGluIGFuIGFtYmllbnRcbiAgICAvLyBibG9jaywgdHNpY2tsZSBzaG91bGQgbm90IGVtaXQgYSBwcmVmaXg6IGl0J3MgZWl0aGVyIG5vdCBhbiBleHRlcm5hbCBzeW1ib2wsIG9yIGl0J3MgYW5cbiAgICAvLyBleHRlcm5hbCBzeW1ib2wgbmVzdGVkIGluIGEgbW9kdWxlLCBzbyBpdCB3aWxsIG5lZWQgdG8gYmUgcXVhbGlmaWVkLCBhbmQgdGhlIG1hbmdsaW5nIHByZWZpeFxuICAgIC8vIGdvZXMgb24gdGhlIHF1YWxpZmllci5cbiAgICBpZiAoIWlzVG9wTGV2ZWxFeHRlcm5hbChkZWNsYXJhdGlvbnMpKSB7XG4gICAgICBhbWJpZW50TW9kdWxlRGVjbGFyYXRpb24gPSBnZXRDb250YWluaW5nQW1iaWVudE1vZHVsZURlY2xhcmF0aW9uKGRlY2xhcmF0aW9ucyk7XG4gICAgICBpZiAoIWFtYmllbnRNb2R1bGVEZWNsYXJhdGlvbikgcmV0dXJuICcnO1xuICAgIH1cbiAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgZGVjbGFyYXRpb24gaXMgZnJvbSBhbiBleHRlcm5hbCBtb2R1bGUgKHBvc3NpYmx5IGFtYmllbnQpLlxuICAgIC8vIFRoZXNlIGRlY2xhcmF0aW9ucyBtdXN0IGJlIHByZWZpeGVkIGlmIGVpdGhlcjpcbiAgICAvLyAoYSkgdHNpY2tsZSBpcyBlbWl0dGluZyBhbiBleHRlcm5zIGZpbGUsIHNvIGFsbCBzeW1ib2xzIGFyZSBxdWFsaWZpZWQgd2l0aGluIGl0XG4gICAgLy8gKGIpIG9yIHRoZSBkZWNsYXJhdGlvbiBtdXN0IGJlIGFuIGV4cG9ydGVkIGFtYmllbnQgZGVjbGFyYXRpb24gZnJvbSB0aGUgbG9jYWwgZmlsZS5cbiAgICAvLyBBbWJpZW50IGV4dGVybmFsIGRlY2xhcmF0aW9ucyBmcm9tIG90aGVyIGZpbGVzIGFyZSBpbXBvcnRlZCwgc28gdGhlcmUncyBhIGxvY2FsIGFsaWFzIGZvciB0aGVcbiAgICAvLyBtb2R1bGUgYW5kIG5vIG1hbmdsaW5nIGlzIG5lZWRlZC5cbiAgICBpZiAoIXRoaXMuaXNGb3JFeHRlcm5zICYmXG4gICAgICAgICFkZWNsYXJhdGlvbnMuZXZlcnkoXG4gICAgICAgICAgICBkID0+IGlzRGVjbGFyZWRJblNhbWVGaWxlKHRoaXMubm9kZSwgZCkgJiYgaXNBbWJpZW50KGQpICYmXG4gICAgICAgICAgICAgICAgaGFzTW9kaWZpZXJGbGFnKGQsIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgLy8gSWYgZnJvbSBhbiBhbWJpZW50IGRlY2xhcmF0aW9uLCB1c2UgYW5kIHJlc29sdmUgdGhlIG5hbWUgZnJvbSB0aGF0LiBPdGhlcndpc2UsIHVzZSB0aGUgZmlsZVxuICAgIC8vIG5hbWUgZnJvbSB0aGUgKGFyYml0cmFyeSkgZmlyc3QgZGVjbGFyYXRpb24gdG8gbWFuZ2xlLlxuICAgIGNvbnN0IGZpbGVOYW1lID0gYW1iaWVudE1vZHVsZURlY2xhcmF0aW9uID9cbiAgICAgICAgYW1iaWVudE1vZHVsZURlY2xhcmF0aW9uLm5hbWUudGV4dCA6XG4gICAgICAgIHRzLmdldE9yaWdpbmFsTm9kZShkZWNsYXJhdGlvbnNbMF0pLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcbiAgICBjb25zdCBtYW5nbGVkID0gbW9kdWxlTmFtZUFzSWRlbnRpZmllcih0aGlzLmhvc3QsIGZpbGVOYW1lKTtcbiAgICByZXR1cm4gbWFuZ2xlZCArICcuJztcbiAgfVxuXG4gIC8vIENsdXR6IChodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jbHV0eikgZW1pdHMgZ2xvYmFsIHR5cGUgc3ltYm9scyBoaWRkZW4gaW4gYSBzcGVjaWFsXG4gIC8vIOCyoF/gsqAuY2x1dHogbmFtZXNwYWNlLiBXaGlsZSBtb3N0IGNvZGUgc2VlbiBieSBUc2lja2xlIHdpbGwgb25seSBldmVyIHNlZSBsb2NhbCBhbGlhc2VzLCBDbHV0elxuICAvLyBzeW1ib2xzIGNhbiBiZSB3cml0dGVuIGJ5IHVzZXJzIGRpcmVjdGx5IGluIGNvZGUsIGFuZCB0aGV5IGNhbiBhcHBlYXIgYnkgZGVyZWZlcmVuY2luZ1xuICAvLyBUeXBlQWxpYXNlcy4gVGhlIGNvZGUgYmVsb3cgc2ltcGx5IHN0cmlwcyB0aGUgcHJlZml4LCB0aGUgcmVtYWluaW5nIHR5cGUgbmFtZSB0aGVuIG1hdGNoZXNcbiAgLy8gQ2xvc3VyZSdzIHR5cGUuXG4gIHByaXZhdGUgc3RyaXBDbHV0ek5hbWVzcGFjZShuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAobmFtZS5zdGFydHNXaXRoKCfgsqBf4LKgLmNsdXR6LicpKSByZXR1cm4gbmFtZS5zdWJzdHJpbmcoJ+CyoF/gsqAuY2x1dHouJy5sZW5ndGgpO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgdHJhbnNsYXRlKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICAgIC8vIE5PVEU6IFRob3VnaCB0eXBlLmZsYWdzIGhhcyB0aGUgbmFtZSBcImZsYWdzXCIsIGl0IHVzdWFsbHkgY2FuIG9ubHkgYmUgb25lXG4gICAgLy8gb2YgdGhlIGVudW0gb3B0aW9ucyBhdCBhIHRpbWUgKGV4Y2VwdCBmb3IgdW5pb25zIG9mIGxpdGVyYWwgdHlwZXMsIGUuZy4gdW5pb25zIG9mIGJvb2xlYW5cbiAgICAvLyB2YWx1ZXMsIHN0cmluZyB2YWx1ZXMsIGVudW0gdmFsdWVzKS4gVGhpcyBzd2l0Y2ggaGFuZGxlcyBhbGwgdGhlIGNhc2VzIGluIHRoZSB0cy5UeXBlRmxhZ3NcbiAgICAvLyBlbnVtIGluIHRoZSBvcmRlciB0aGV5IG9jY3VyLlxuXG4gICAgLy8gTk9URTogU29tZSBUeXBlRmxhZ3MgYXJlIG1hcmtlZCBcImludGVybmFsXCIgaW4gdGhlIGQudHMgYnV0IHN0aWxsIHNob3cgdXAgaW4gdGhlIHZhbHVlIG9mXG4gICAgLy8gdHlwZS5mbGFncy4gVGhpcyBtYXNrIGxpbWl0cyB0aGUgZmxhZyBjaGVja3MgdG8gdGhlIG9uZXMgaW4gdGhlIHB1YmxpYyBBUEkuIFwibGFzdEZsYWdcIiBoZXJlXG4gICAgLy8gaXMgdGhlIGxhc3QgZmxhZyBoYW5kbGVkIGluIHRoaXMgc3dpdGNoIHN0YXRlbWVudCwgYW5kIHNob3VsZCBiZSBrZXB0IGluIHN5bmMgd2l0aFxuICAgIC8vIHR5cGVzY3JpcHQuZC50cy5cblxuICAgIC8vIE5vblByaW1pdGl2ZSBvY2N1cnMgb24gaXRzIG93biBvbiB0aGUgbG93ZXIgY2FzZSBcIm9iamVjdFwiIHR5cGUuIFNwZWNpYWwgY2FzZSB0byBcIiFPYmplY3RcIi5cbiAgICBpZiAodHlwZS5mbGFncyA9PT0gdHMuVHlwZUZsYWdzLk5vblByaW1pdGl2ZSkgcmV0dXJuICchT2JqZWN0JztcblxuICAgIC8vIEF2b2lkIGluZmluaXRlIGxvb3BzIG9uIHJlY3Vyc2l2ZSB0eXBlIGxpdGVyYWxzLlxuICAgIC8vIEl0IHdvdWxkIGJlIG5pY2UgdG8ganVzdCBlbWl0IHRoZSBuYW1lIG9mIHRoZSByZWN1cnNpdmUgdHlwZSBoZXJlIChpbiB0eXBlLmFsaWFzU3ltYm9sXG4gICAgLy8gYmVsb3cpLCBidXQgQ2xvc3VyZSBDb21waWxlciBkb2VzIG5vdCBhbGxvdyByZWN1cnNpdmUgdHlwZSBkZWZpbml0aW9ucy5cbiAgICBpZiAodGhpcy5zZWVuQW5vbnltb3VzVHlwZXMuaGFzKHR5cGUpKSByZXR1cm4gJz8nO1xuXG4gICAgbGV0IGlzQW1iaWVudCA9IGZhbHNlO1xuICAgIGxldCBpc0luTmFtZXNwYWNlID0gZmFsc2U7XG4gICAgbGV0IGlzTW9kdWxlID0gZmFsc2U7XG4gICAgaWYgKHR5cGUuc3ltYm9sKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgdHlwZS5zeW1ib2wuZGVjbGFyYXRpb25zIHx8IFtdKSB7XG4gICAgICAgIGlmICh0cy5pc0V4dGVybmFsTW9kdWxlKGRlY2wuZ2V0U291cmNlRmlsZSgpKSkgaXNNb2R1bGUgPSB0cnVlO1xuICAgICAgICBsZXQgY3VycmVudDogdHMuTm9kZXx1bmRlZmluZWQgPSBkZWNsO1xuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgIGlmICh0cy5nZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3MoY3VycmVudCkgJiB0cy5Nb2RpZmllckZsYWdzLkFtYmllbnQpIGlzQW1iaWVudCA9IHRydWU7XG4gICAgICAgICAgaWYgKGN1cnJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbikgaXNJbk5hbWVzcGFjZSA9IHRydWU7XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdHNpY2tsZSBjYW5ub3QgZ2VuZXJhdGUgdHlwZXMgZm9yIG5vbi1hbWJpZW50IG5hbWVzcGFjZXMgbm9yIGFueSBzeW1ib2xzIGNvbnRhaW5lZCBpbiB0aGVtLlxuICAgIGlmIChpc0luTmFtZXNwYWNlICYmICFpc0FtYmllbnQpIHJldHVybiAnPyc7XG5cbiAgICAvLyBUeXBlcyBpbiBleHRlcm5zIGNhbm5vdCByZWZlcmVuY2UgdHlwZXMgZnJvbSBleHRlcm5hbCBtb2R1bGVzLlxuICAgIC8vIEhvd2V2ZXIgYW1iaWVudCB0eXBlcyBpbiBtb2R1bGVzIGdldCBtb3ZlZCB0byBleHRlcm5zLCB0b28sIHNvIHR5cGUgcmVmZXJlbmNlcyB3b3JrIGFuZCB3ZVxuICAgIC8vIGNhbiBlbWl0IGEgcHJlY2lzZSB0eXBlLlxuICAgIGlmICh0aGlzLmlzRm9yRXh0ZXJucyAmJiBpc01vZHVsZSAmJiAhaXNBbWJpZW50KSByZXR1cm4gJz8nO1xuXG4gICAgY29uc3QgbGFzdEZsYWcgPSB0cy5UeXBlRmxhZ3MuU3Vic3RpdHV0aW9uO1xuICAgIGNvbnN0IG1hc2sgPSAobGFzdEZsYWcgPDwgMSkgLSAxO1xuICAgIHN3aXRjaCAodHlwZS5mbGFncyAmIG1hc2spIHtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkFueTpcbiAgICAgICAgcmV0dXJuICc/JztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlN0cmluZzpcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlN0cmluZ0xpdGVyYWw6XG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk51bWJlcjpcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk51bWJlckxpdGVyYWw6XG4gICAgICAgIHJldHVybiAnbnVtYmVyJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLkJvb2xlYW46XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Cb29sZWFuTGl0ZXJhbDpcbiAgICAgICAgLy8gU2VlIHRoZSBub3RlIGluIHRyYW5zbGF0ZVVuaW9uIGFib3V0IGJvb2xlYW5zLlxuICAgICAgICByZXR1cm4gJ2Jvb2xlYW4nO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuRW51bTpcbiAgICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICAgIHRoaXMud2FybihgRW51bVR5cGUgd2l0aG91dCBhIHN5bWJvbGApO1xuICAgICAgICAgIHJldHVybiAnPyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3ltYm9sVG9TdHJpbmcodHlwZS5zeW1ib2wsIHRydWUpO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuRVNTeW1ib2w6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5VbmlxdWVFU1N5bWJvbDpcbiAgICAgICAgLy8gRVNTeW1ib2wgaW5kaWNhdGVzIHNvbWV0aGluZyB0eXBlZCBzeW1ib2wuXG4gICAgICAgIC8vIFVuaXF1ZUVTU3ltYm9sIGluZGljYXRlcyBhIHNwZWNpZmljIHVuaXF1ZSBzeW1ib2wsIHVzZWQgZS5nLiB0byBpbmRleCBpbnRvIGFuIG9iamVjdC5cbiAgICAgICAgLy8gQ2xvc3VyZSBkb2VzIG5vdCBoYXZlIHRoaXMgZGlzdGluY3Rpb24sIHNvIHRzaWNrbGUgZW1pdHMgYm90aCBhcyAnc3ltYm9sJy5cbiAgICAgICAgcmV0dXJuICdzeW1ib2wnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVm9pZDpcbiAgICAgICAgcmV0dXJuICd2b2lkJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuTnVsbDpcbiAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLk5ldmVyOlxuICAgICAgICB0aGlzLndhcm4oYHNob3VsZCBub3QgZW1pdCBhICduZXZlcicgdHlwZWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuVHlwZVBhcmFtZXRlcjpcbiAgICAgICAgLy8gVGhpcyBpcyBlLmcuIHRoZSBUIGluIGEgdHlwZSBsaWtlIEZvbzxUPi5cbiAgICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICAgIHRoaXMud2FybihgVHlwZVBhcmFtZXRlciB3aXRob3V0IGEgc3ltYm9sYCk7ICAvLyBzaG91bGQgbm90IGhhcHBlbiAodG0pXG4gICAgICAgICAgcmV0dXJuICc/JztcbiAgICAgICAgfVxuICAgICAgICAvLyBJbiBDbG9zdXJlLCB0eXBlIHBhcmFtZXRlcnMgKFwiPFQ+XCIpIGFyZSBub24tbnVsbGFibGUgYnkgZGVmYXVsdCwgdW5saWtlIHJlZmVyZW5jZXMgdG9cbiAgICAgICAgLy8gY2xhc3NlcyBvciBpbnRlcmZhY2VzLiBIb3dldmVyIHRoaXMgY29kZSBwYXRoIGNhbiBiZSByZWFjaGVkIGJ5IGJvdW5kIHR5cGUgcGFyYW1ldGVycyxcbiAgICAgICAgLy8gd2hlcmUgdGhlIHR5cGUgcGFyYW1ldGVyJ3Mgc3ltYm9sIHJlZmVyZW5jZXMgYSBwbGFpbiBjbGFzcyBvciBpbnRlcmZhY2UuIEluIHRoaXMgY2FzZSxcbiAgICAgICAgLy8gYWRkIGAhYCB0byBhdm9pZCBlbWl0dGluZyBhIG51bGxhYmxlIHR5cGUuXG4gICAgICAgIGxldCBwcmVmaXggPSAnJztcbiAgICAgICAgaWYgKCh0eXBlLnN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlR5cGVQYXJhbWV0ZXIpID09PSAwKSB7XG4gICAgICAgICAgcHJlZml4ID0gJyEnO1xuICAgICAgICB9XG4gICAgICAgIC8vIEluIENsb3N1cmUgQ29tcGlsZXIsIHR5cGUgcGFyYW1ldGVycyAqYXJlKiBzY29wZWQgdG8gdGhlaXIgY29udGFpbmluZyBjbGFzcy5cbiAgICAgICAgY29uc3QgdXNlRnFuID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBwcmVmaXggKyB0aGlzLnN5bWJvbFRvU3RyaW5nKHR5cGUuc3ltYm9sLCB1c2VGcW4pO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuT2JqZWN0OlxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVPYmplY3QodHlwZSBhcyB0cy5PYmplY3RUeXBlKTtcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlVuaW9uOlxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVVbmlvbih0eXBlIGFzIHRzLlVuaW9uVHlwZSk7XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5Db25kaXRpb25hbDpcbiAgICAgIGNhc2UgdHMuVHlwZUZsYWdzLlN1YnN0aXR1dGlvbjpcbiAgICAgICAgdGhpcy53YXJuKGBlbWl0dGluZyA/IGZvciBjb25kaXRpb25hbC9zdWJzdGl0dXRpb24gdHlwZWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuSW50ZXJzZWN0aW9uOlxuICAgICAgY2FzZSB0cy5UeXBlRmxhZ3MuSW5kZXg6XG4gICAgICBjYXNlIHRzLlR5cGVGbGFncy5JbmRleGVkQWNjZXNzOlxuICAgICAgICAvLyBUT0RPKHRzMi4xKTogaGFuZGxlIHRoZXNlIHNwZWNpYWwgdHlwZXMuXG4gICAgICAgIHRoaXMud2FybihgdW5oYW5kbGVkIHR5cGUgZmxhZ3M6ICR7dHMuVHlwZUZsYWdzW3R5cGUuZmxhZ3NdfWApO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIG11bHRpcGxlIGZsYWdzIGFyZSBzZXQuXG5cbiAgICAgICAgLy8gVHlwZXMgd2l0aCBsaXRlcmFsIG1lbWJlcnMgYXJlIHJlcHJlc2VudGVkIGFzXG4gICAgICAgIC8vICAgdHMuVHlwZUZsYWdzLlVuaW9uIHwgW2xpdGVyYWwgbWVtYmVyXVxuICAgICAgICAvLyBFLmcuIGFuIGVudW0gdHlwZWQgdmFsdWUgaXMgYSB1bmlvbiB0eXBlIHdpdGggdGhlIGVudW0ncyBtZW1iZXJzIGFzIGl0cyBtZW1iZXJzLiBBXG4gICAgICAgIC8vIGJvb2xlYW4gdHlwZSBpcyBhIHVuaW9uIHR5cGUgd2l0aCAndHJ1ZScgYW5kICdmYWxzZScgYXMgaXRzIG1lbWJlcnMuXG4gICAgICAgIC8vIE5vdGUgYWxzbyB0aGF0IGluIGEgbW9yZSBjb21wbGV4IHVuaW9uLCBlLmcuIGJvb2xlYW58bnVtYmVyLCB0aGVuIGl0J3MgYSB1bmlvbiBvZiB0aHJlZVxuICAgICAgICAvLyB0aGluZ3MgKHRydWV8ZmFsc2V8bnVtYmVyKSBhbmQgdHMuVHlwZUZsYWdzLkJvb2xlYW4gZG9lc24ndCBzaG93IHVwIGF0IGFsbC5cbiAgICAgICAgaWYgKHR5cGUuZmxhZ3MgJiB0cy5UeXBlRmxhZ3MuVW5pb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVVbmlvbih0eXBlIGFzIHRzLlVuaW9uVHlwZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZS5mbGFncyAmIHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZUVudW1MaXRlcmFsKHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHN3aXRjaCBzdGF0ZW1lbnQgc2hvdWxkIGhhdmUgYmVlbiBleGhhdXN0aXZlLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gdHlwZSBmbGFncyAke3R5cGUuZmxhZ3N9IG9uICR7dHlwZVRvRGVidWdTdHJpbmcodHlwZSl9YCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0cmFuc2xhdGVVbmlvbih0eXBlOiB0cy5VbmlvblR5cGUpOiBzdHJpbmcge1xuICAgIGxldCBwYXJ0cyA9IHR5cGUudHlwZXMubWFwKHQgPT4gdGhpcy50cmFuc2xhdGUodCkpO1xuICAgIC8vIFVuaW9uIHR5cGVzIHRoYXQgaW5jbHVkZSBsaXRlcmFscyAoZS5nLiBib29sZWFuLCBlbnVtKSBjYW4gZW5kIHVwIHJlcGVhdGluZyB0aGUgc2FtZSBDbG9zdXJlXG4gICAgLy8gdHlwZS4gRm9yIGV4YW1wbGU6IHRydWUgfCBib29sZWFuIHdpbGwgYmUgdHJhbnNsYXRlZCB0byBib29sZWFuIHwgYm9vbGVhbi5cbiAgICAvLyBSZW1vdmUgZHVwbGljYXRlcyB0byBwcm9kdWNlIHR5cGVzIHRoYXQgcmVhZCBiZXR0ZXIuXG4gICAgcGFydHMgPSBwYXJ0cy5maWx0ZXIoKGVsLCBpZHgpID0+IHBhcnRzLmluZGV4T2YoZWwpID09PSBpZHgpO1xuICAgIHJldHVybiBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IGAoJHtwYXJ0cy5qb2luKCd8Jyl9KWA7XG4gIH1cblxuICBwcml2YXRlIHRyYW5zbGF0ZUVudW1MaXRlcmFsKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICAgIC8vIFN1cHBvc2UgeW91IGhhZDpcbiAgICAvLyAgIGVudW0gRW51bVR5cGUgeyBNRU1CRVIgfVxuICAgIC8vIHRoZW4gdGhlIHR5cGUgb2YgXCJFbnVtVHlwZS5NRU1CRVJcIiBpcyBhbiBlbnVtIGxpdGVyYWwgKHRoZSB0aGluZyBwYXNzZWQgdG8gdGhpcyBmdW5jdGlvbilcbiAgICAvLyBhbmQgaXQgaGFzIHR5cGUgZmxhZ3MgdGhhdCBpbmNsdWRlXG4gICAgLy8gICB0cy5UeXBlRmxhZ3MuTnVtYmVyTGl0ZXJhbCB8IHRzLlR5cGVGbGFncy5FbnVtTGl0ZXJhbFxuICAgIC8vXG4gICAgLy8gQ2xvc3VyZSBDb21waWxlciBkb2Vzbid0IHN1cHBvcnQgbGl0ZXJhbHMgaW4gdHlwZXMsIHNvIHRoaXMgY29kZSBtdXN0IG5vdCBlbWl0XG4gICAgLy8gXCJFbnVtVHlwZS5NRU1CRVJcIiwgYnV0IHJhdGhlciBcIkVudW1UeXBlXCIuXG5cbiAgICBjb25zdCBlbnVtTGl0ZXJhbEJhc2VUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRCYXNlVHlwZU9mTGl0ZXJhbFR5cGUodHlwZSk7XG4gICAgaWYgKCFlbnVtTGl0ZXJhbEJhc2VUeXBlLnN5bWJvbCkge1xuICAgICAgdGhpcy53YXJuKGBFbnVtTGl0ZXJhbFR5cGUgd2l0aG91dCBhIHN5bWJvbGApO1xuICAgICAgcmV0dXJuICc/JztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3ltYm9sVG9TdHJpbmcoZW51bUxpdGVyYWxCYXNlVHlwZS5zeW1ib2wsIHRydWUpO1xuICB9XG5cbiAgLy8gdHJhbnNsYXRlT2JqZWN0IHRyYW5zbGF0ZXMgYSB0cy5PYmplY3RUeXBlLCB3aGljaCBpcyB0aGUgdHlwZSBvZiBhbGxcbiAgLy8gb2JqZWN0LWxpa2UgdGhpbmdzIGluIFRTLCBzdWNoIGFzIGNsYXNzZXMgYW5kIGludGVyZmFjZXMuXG4gIHByaXZhdGUgdHJhbnNsYXRlT2JqZWN0KHR5cGU6IHRzLk9iamVjdFR5cGUpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlLnN5bWJvbCAmJiB0aGlzLmlzQmxhY2tMaXN0ZWQodHlwZS5zeW1ib2wpKSByZXR1cm4gJz8nO1xuXG4gICAgLy8gTk9URTogb2JqZWN0RmxhZ3MgaXMgYW4gZW51bSwgYnV0IGEgZ2l2ZW4gdHlwZSBjYW4gaGF2ZSBtdWx0aXBsZSBmbGFncy5cbiAgICAvLyBBcnJheTxzdHJpbmc+IGlzIGJvdGggdHMuT2JqZWN0RmxhZ3MuUmVmZXJlbmNlIGFuZCB0cy5PYmplY3RGbGFncy5JbnRlcmZhY2UuXG5cbiAgICBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLkNsYXNzKSB7XG4gICAgICBpZiAoIXR5cGUuc3ltYm9sKSB7XG4gICAgICAgIHRoaXMud2FybignY2xhc3MgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuc3ltYm9sVG9TdHJpbmcodHlwZS5zeW1ib2wsIC8qIHVzZUZxbiAqLyB0cnVlKTtcbiAgICAgIGlmIChuYW1lID09PSAnKEFub255bW91cyBjbGFzcyknKSB7XG4gICAgICAgIC8vIFZhbHVlcyB0aGF0IGhhdmUgYW5vbnltb3VzIGNsYXNzIHR5cGVzIHByb2R1Y2UgdGhpcyBuYW1lLCBidXQgdGhlIHR5cGVcbiAgICAgICAgLy8gYXBwZWFycyBvdGhlcndpc2UgaWRlbnRpY2FsIHRvIGEgbmFtZWQgY2xhc3MuICBHaXZlbiB0aGF0IHRoZSB0eXBlIGlzXG4gICAgICAgIC8vIGFub255bW91cyBoZXJlLCB0aGVyZSdzIG5vdCByZWFsbHkgYSB1c2VmdWwgbmFtZSB3ZSBjYW4gZW1pdC5cbiAgICAgICAgcmV0dXJuICc/JztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnIScgKyBuYW1lO1xuICAgIH0gZWxzZSBpZiAodHlwZS5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLkludGVyZmFjZSkge1xuICAgICAgLy8gTm90ZTogdHMuSW50ZXJmYWNlVHlwZSBoYXMgYSB0eXBlUGFyYW1ldGVycyBmaWVsZCwgYnV0IHRoYXRcbiAgICAgIC8vIHNwZWNpZmllcyB0aGUgcGFyYW1ldGVycyB0aGF0IHRoZSBpbnRlcmZhY2UgdHlwZSAqZXhwZWN0cypcbiAgICAgIC8vIHdoZW4gaXQncyB1c2VkLCBhbmQgc2hvdWxkIG5vdCBiZSB0cmFuc2Zvcm1lZCB0byB0aGUgb3V0cHV0LlxuICAgICAgLy8gRS5nLiBhIHR5cGUgbGlrZSBBcnJheTxudW1iZXI+IGlzIGEgVHlwZVJlZmVyZW5jZSB0byB0aGVcbiAgICAgIC8vIEludGVyZmFjZVR5cGUgXCJBcnJheVwiLCBidXQgdGhlIFwibnVtYmVyXCIgdHlwZSBwYXJhbWV0ZXIgaXNcbiAgICAgIC8vIHBhcnQgb2YgdGhlIG91dGVyIFR5cGVSZWZlcmVuY2UsIG5vdCBhIHR5cGVQYXJhbWV0ZXIgb25cbiAgICAgIC8vIHRoZSBJbnRlcmZhY2VUeXBlLlxuICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICB0aGlzLndhcm4oJ2ludGVyZmFjZSBoYXMgbm8gc3ltYm9sJyk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICB9XG4gICAgICBpZiAodHlwZS5zeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkge1xuICAgICAgICAvLyBUaGUgc3ltYm9sIGlzIGJvdGggYSB0eXBlIGFuZCBhIHZhbHVlLlxuICAgICAgICAvLyBGb3IgdXNlci1kZWZpbmVkIHR5cGVzIGluIHRoaXMgc3RhdGUsIHdlIGRvbid0IGhhdmUgYSBDbG9zdXJlIG5hbWVcbiAgICAgICAgLy8gZm9yIHRoZSB0eXBlLiAgU2VlIHRoZSB0eXBlX2FuZF92YWx1ZSB0ZXN0LlxuICAgICAgICBpZiAoIWlzQ2xvc3VyZVByb3ZpZGVkVHlwZSh0eXBlLnN5bWJvbCkpIHtcbiAgICAgICAgICB0aGlzLndhcm4oYHR5cGUvc3ltYm9sIGNvbmZsaWN0IGZvciAke3R5cGUuc3ltYm9sLm5hbWV9LCB1c2luZyB7P30gZm9yIG5vd2ApO1xuICAgICAgICAgIHJldHVybiAnPyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAnIScgKyB0aGlzLnN5bWJvbFRvU3RyaW5nKHR5cGUuc3ltYm9sLCAvKiB1c2VGcW4gKi8gdHJ1ZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlLm9iamVjdEZsYWdzICYgdHMuT2JqZWN0RmxhZ3MuUmVmZXJlbmNlKSB7XG4gICAgICAvLyBBIHJlZmVyZW5jZSB0byBhbm90aGVyIHR5cGUsIGUuZy4gQXJyYXk8bnVtYmVyPiByZWZlcnMgdG8gQXJyYXkuXG4gICAgICAvLyBFbWl0IHRoZSByZWZlcmVuY2VkIHR5cGUgYW5kIGFueSB0eXBlIGFyZ3VtZW50cy5cbiAgICAgIGNvbnN0IHJlZmVyZW5jZVR5cGUgPSB0eXBlIGFzIHRzLlR5cGVSZWZlcmVuY2U7XG5cbiAgICAgIC8vIEEgdHVwbGUgaXMgYSBSZWZlcmVuY2VUeXBlIHdoZXJlIHRoZSB0YXJnZXQgaXMgZmxhZ2dlZCBUdXBsZSBhbmQgdGhlXG4gICAgICAvLyB0eXBlQXJndW1lbnRzIGFyZSB0aGUgdHVwbGUgYXJndW1lbnRzLiAgSnVzdCB0cmVhdCBpdCBhcyBhIG15c3RlcnlcbiAgICAgIC8vIGFycmF5LCBiZWNhdXNlIENsb3N1cmUgZG9lc24ndCB1bmRlcnN0YW5kIHR1cGxlcy5cbiAgICAgIGlmIChyZWZlcmVuY2VUeXBlLnRhcmdldC5vYmplY3RGbGFncyAmIHRzLk9iamVjdEZsYWdzLlR1cGxlKSB7XG4gICAgICAgIHJldHVybiAnIUFycmF5PD8+JztcbiAgICAgIH1cblxuICAgICAgbGV0IHR5cGVTdHIgPSAnJztcbiAgICAgIGlmIChyZWZlcmVuY2VUeXBlLnRhcmdldCA9PT0gcmVmZXJlbmNlVHlwZSkge1xuICAgICAgICAvLyBXZSBnZXQgaW50byBhbiBpbmZpbml0ZSBsb29wIGhlcmUgaWYgdGhlIGlubmVyIHJlZmVyZW5jZSBpc1xuICAgICAgICAvLyB0aGUgc2FtZSBhcyB0aGUgb3V0ZXI7IHRoaXMgY2FuIG9jY3VyIHdoZW4gdGhpcyBmdW5jdGlvblxuICAgICAgICAvLyBmYWlscyB0byB0cmFuc2xhdGUgYSBtb3JlIHNwZWNpZmljIHR5cGUgYmVmb3JlIGdldHRpbmcgdG9cbiAgICAgICAgLy8gdGhpcyBwb2ludC5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYHJlZmVyZW5jZSBsb29wIGluICR7dHlwZVRvRGVidWdTdHJpbmcocmVmZXJlbmNlVHlwZSl9ICR7cmVmZXJlbmNlVHlwZS5mbGFnc31gKTtcbiAgICAgIH1cbiAgICAgIHR5cGVTdHIgKz0gdGhpcy50cmFuc2xhdGUocmVmZXJlbmNlVHlwZS50YXJnZXQpO1xuICAgICAgLy8gVHJhbnNsYXRlIGNhbiByZXR1cm4gJz8nIGZvciBhIG51bWJlciBvZiBzaXR1YXRpb25zLCBlLmcuIHR5cGUvdmFsdWUgY29uZmxpY3RzLlxuICAgICAgLy8gYD88Pz5gIGlzIGlsbGVnYWwgc3ludGF4IGluIENsb3N1cmUgQ29tcGlsZXIsIHNvIGp1c3QgcmV0dXJuIGA/YCBoZXJlLlxuICAgICAgaWYgKHR5cGVTdHIgPT09ICc/JykgcmV0dXJuICc/JztcbiAgICAgIGlmIChyZWZlcmVuY2VUeXBlLnR5cGVBcmd1bWVudHMpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gcmVmZXJlbmNlVHlwZS50eXBlQXJndW1lbnRzLm1hcCh0ID0+IHRoaXMudHJhbnNsYXRlKHQpKTtcbiAgICAgICAgdHlwZVN0ciArPSBgPCR7cGFyYW1zLmpvaW4oJywgJyl9PmA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHlwZVN0cjtcbiAgICB9IGVsc2UgaWYgKHR5cGUub2JqZWN0RmxhZ3MgJiB0cy5PYmplY3RGbGFncy5Bbm9ueW1vdXMpIHtcbiAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgLy8gVGhpcyBjb21lcyB1cCB3aGVuIGdlbmVyYXRpbmcgY29kZSBmb3IgYW4gYXJyb3cgZnVuY3Rpb24gYXMgcGFzc2VkXG4gICAgICAgIC8vIHRvIGEgZ2VuZXJpYyBmdW5jdGlvbi4gIFRoZSBwYXNzZWQtaW4gdHlwZSBpcyB0YWdnZWQgYXMgYW5vbnltb3VzXG4gICAgICAgIC8vIGFuZCBoYXMgbm8gcHJvcGVydGllcyBzbyBpdCdzIGhhcmQgdG8gZmlndXJlIG91dCB3aGF0IHRvIGdlbmVyYXRlLlxuICAgICAgICAvLyBKdXN0IGF2b2lkIGl0IGZvciBub3cgc28gd2UgZG9uJ3QgY3Jhc2guXG4gICAgICAgIHRoaXMud2FybignYW5vbnltb3VzIHR5cGUgaGFzIG5vIHN5bWJvbCcpO1xuICAgICAgICByZXR1cm4gJz8nO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZS5zeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5GdW5jdGlvbiB8fFxuICAgICAgICAgIHR5cGUuc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuTWV0aG9kKSB7XG4gICAgICAgIGNvbnN0IHNpZ3MgPSB0aGlzLnR5cGVDaGVja2VyLmdldFNpZ25hdHVyZXNPZlR5cGUodHlwZSwgdHMuU2lnbmF0dXJlS2luZC5DYWxsKTtcbiAgICAgICAgaWYgKHNpZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc2lnbmF0dXJlVG9DbG9zdXJlKHNpZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2FybigndW5oYW5kbGVkIGFub255bW91cyB0eXBlIHdpdGggbXVsdGlwbGUgY2FsbCBzaWduYXR1cmVzJyk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVBbm9ueW1vdXNUeXBlKHR5cGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgVE9ETyh0czIuMSk6IG1vcmUgdW5oYW5kbGVkIG9iamVjdCB0eXBlIGZsYWdzOlxuICAgICAgVHVwbGVcbiAgICAgIE1hcHBlZFxuICAgICAgSW5zdGFudGlhdGVkXG4gICAgICBPYmplY3RMaXRlcmFsXG4gICAgICBFdm9sdmluZ0FycmF5XG4gICAgICBPYmplY3RMaXRlcmFsUGF0dGVybldpdGhDb21wdXRlZFByb3BlcnRpZXNcbiAgICAqL1xuICAgIHRoaXMud2FybihgdW5oYW5kbGVkIHR5cGUgJHt0eXBlVG9EZWJ1Z1N0cmluZyh0eXBlKX1gKTtcbiAgICByZXR1cm4gJz8nO1xuICB9XG5cbiAgLyoqXG4gICAqIHRyYW5zbGF0ZUFub255bW91c1R5cGUgdHJhbnNsYXRlcyBhIHRzLlR5cGVGbGFncy5PYmplY3RUeXBlIHRoYXQgaXMgYWxzb1xuICAgKiB0cy5PYmplY3RGbGFncy5Bbm9ueW1vdXMuIFRoYXQgaXMsIHRoaXMgdHlwZSdzIHN5bWJvbCBkb2VzIG5vdCBoYXZlIGEgbmFtZS4gVGhpcyBpcyB0aGVcbiAgICogYW5vbnltb3VzIHR5cGUgZW5jb3VudGVyZWQgaW4gZS5nLlxuICAgKiAgICAgbGV0IHg6IHthOiBudW1iZXJ9O1xuICAgKiBCdXQgYWxzbyB0aGUgaW5mZXJyZWQgdHlwZSBpbjpcbiAgICogICAgIGxldCB4ID0ge2E6IDF9OyAgLy8gdHlwZSBvZiB4IGlzIHthOiBudW1iZXJ9LCBhcyBhYm92ZVxuICAgKi9cbiAgcHJpdmF0ZSB0cmFuc2xhdGVBbm9ueW1vdXNUeXBlKHR5cGU6IHRzLlR5cGUpOiBzdHJpbmcge1xuICAgIHRoaXMuc2VlbkFub255bW91c1R5cGVzLmFkZCh0eXBlKTtcbiAgICAvLyBHYXRoZXIgdXAgYWxsIHRoZSBuYW1lZCBmaWVsZHMgYW5kIHdoZXRoZXIgdGhlIG9iamVjdCBpcyBhbHNvIGNhbGxhYmxlLlxuICAgIGxldCBjYWxsYWJsZSA9IGZhbHNlO1xuICAgIGxldCBpbmRleGFibGUgPSBmYWxzZTtcbiAgICBjb25zdCBmaWVsZHM6IHN0cmluZ1tdID0gW107XG4gICAgaWYgKCF0eXBlLnN5bWJvbCB8fCAhdHlwZS5zeW1ib2wubWVtYmVycykge1xuICAgICAgdGhpcy53YXJuKCdhbm9ueW1vdXMgdHlwZSBoYXMgbm8gc3ltYm9sJyk7XG4gICAgICByZXR1cm4gJz8nO1xuICAgIH1cblxuICAgIC8vIHNwZWNpYWwtY2FzZSBjb25zdHJ1Y3Qgc2lnbmF0dXJlcy5cbiAgICBjb25zdCBjdG9ycyA9IHR5cGUuZ2V0Q29uc3RydWN0U2lnbmF0dXJlcygpO1xuICAgIGlmIChjdG9ycy5sZW5ndGgpIHtcbiAgICAgIC8vIFRPRE8obWFydGlucHJvYnN0KTogdGhpcyBkb2VzIG5vdCBzdXBwb3J0IGFkZGl0aW9uYWwgcHJvcGVydGllcyBkZWZpbmVkIG9uIGNvbnN0cnVjdG9yc1xuICAgICAgLy8gKG5vdCBleHByZXNzaWJsZSBpbiBDbG9zdXJlKSwgbm9yIG11bHRpcGxlIGNvbnN0cnVjdG9ycyAoc2FtZSkuXG4gICAgICBjb25zdCBkZWNsID0gY3RvcnNbMF0uZGVjbGFyYXRpb247XG4gICAgICBpZiAoIWRlY2wpIHtcbiAgICAgICAgdGhpcy53YXJuKCd1bmhhbmRsZWQgYW5vbnltb3VzIHR5cGUgd2l0aCBjb25zdHJ1Y3RvciBzaWduYXR1cmUgYnV0IG5vIGRlY2xhcmF0aW9uJyk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICB9XG4gICAgICBpZiAoZGVjbC5raW5kID09PSB0cy5TeW50YXhLaW5kSlNEb2NTaWduYXR1cmUpIHtcbiAgICAgICAgdGhpcy53YXJuKCd1bmhhbmRsZWQgSlNEb2MgYmFzZWQgY29uc3RydWN0b3Igc2lnbmF0dXJlJyk7XG4gICAgICAgIHJldHVybiAnPyc7XG4gICAgICB9XG5cbiAgICAgIC8vIG5ldyA8VD4odGVlOiBUKSBpcyBub3Qgc3VwcG9ydGVkIGJ5IENsb3N1cmUsIGJsYWNrbGlzdCBhcyA/LlxuICAgICAgdGhpcy5ibGFja2xpc3RUeXBlUGFyYW1ldGVycyh0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcywgZGVjbC50eXBlUGFyYW1ldGVycyk7XG5cbiAgICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuY29udmVydFBhcmFtcyhjdG9yc1swXSwgZGVjbC5wYXJhbWV0ZXJzKTtcbiAgICAgIGNvbnN0IHBhcmFtc1N0ciA9IHBhcmFtcy5sZW5ndGggPyAoJywgJyArIHBhcmFtcy5qb2luKCcsICcpKSA6ICcnO1xuICAgICAgY29uc3QgY29uc3RydWN0ZWRUeXBlID0gdGhpcy50cmFuc2xhdGUoY3RvcnNbMF0uZ2V0UmV0dXJuVHlwZSgpKTtcbiAgICAgIC8vIEluIHRoZSBzcGVjaWZpYyBjYXNlIG9mIHRoZSBcIm5ld1wiIGluIGEgZnVuY3Rpb24sIGl0IGFwcGVhcnMgdGhhdFxuICAgICAgLy8gICBmdW5jdGlvbihuZXc6ICFCYXIpXG4gICAgICAvLyBmYWlscyB0byBwYXJzZSwgd2hpbGVcbiAgICAgIC8vICAgZnVuY3Rpb24obmV3OiAoIUJhcikpXG4gICAgICAvLyBwYXJzZXMgaW4gdGhlIHdheSB5b3UnZCBleHBlY3QuXG4gICAgICAvLyBJdCBhcHBlYXJzIGZyb20gdGVzdGluZyB0aGF0IENsb3N1cmUgaWdub3JlcyB0aGUgISBhbnl3YXkgYW5kIGp1c3RcbiAgICAgIC8vIGFzc3VtZXMgdGhlIHJlc3VsdCB3aWxsIGJlIG5vbi1udWxsIGluIGVpdGhlciBjYXNlLiAgKFRvIGJlIHBlZGFudGljLFxuICAgICAgLy8gaXQncyBwb3NzaWJsZSB0byByZXR1cm4gbnVsbCBmcm9tIGEgY3RvciBpdCBzZWVtcyBsaWtlIGEgYmFkIGlkZWEuKVxuICAgICAgcmV0dXJuIGBmdW5jdGlvbihuZXc6ICgke2NvbnN0cnVjdGVkVHlwZX0pJHtwYXJhbXNTdHJ9KTogP2A7XG4gICAgfVxuXG4gICAgLy8gbWVtYmVycyBpcyBhbiBFUzYgbWFwLCBidXQgdGhlIC5kLnRzIGRlZmluaW5nIGl0IGRlZmluZWQgdGhlaXIgb3duIG1hcFxuICAgIC8vIHR5cGUsIHNvIHR5cGVzY3JpcHQgZG9lc24ndCBiZWxpZXZlIHRoYXQgLmtleXMoKSBpcyBpdGVyYWJsZVxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mICh0eXBlLnN5bWJvbC5tZW1iZXJzLmtleXMoKSBhcyBhbnkpKSB7XG4gICAgICBzd2l0Y2ggKGZpZWxkKSB7XG4gICAgICAgIGNhc2UgJ19fY2FsbCc6XG4gICAgICAgICAgY2FsbGFibGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdfX2luZGV4JzpcbiAgICAgICAgICBpbmRleGFibGUgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghaXNWYWxpZENsb3N1cmVQcm9wZXJ0eU5hbWUoZmllbGQpKSB7XG4gICAgICAgICAgICB0aGlzLndhcm4oYG9taXR0aW5nIGluZXhwcmVzc2libGUgcHJvcGVydHkgbmFtZTogJHtmaWVsZH1gKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBtZW1iZXIgPSB0eXBlLnN5bWJvbC5tZW1iZXJzLmdldChmaWVsZCkhO1xuICAgICAgICAgIC8vIG9wdGlvbmFsIG1lbWJlcnMgYXJlIGhhbmRsZWQgYnkgdGhlIHR5cGUgaW5jbHVkaW5nIHx1bmRlZmluZWQgaW4gYSB1bmlvbiB0eXBlLlxuICAgICAgICAgIGNvbnN0IG1lbWJlclR5cGUgPVxuICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh0aGlzLnR5cGVDaGVja2VyLmdldFR5cGVPZlN5bWJvbEF0TG9jYXRpb24obWVtYmVyLCB0aGlzLm5vZGUpKTtcbiAgICAgICAgICBmaWVsZHMucHVzaChgJHtmaWVsZH06ICR7bWVtYmVyVHlwZX1gKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUcnkgdG8gc3BlY2lhbC1jYXNlIHBsYWluIGtleS12YWx1ZSBvYmplY3RzIGFuZCBmdW5jdGlvbnMuXG4gICAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChjYWxsYWJsZSAmJiAhaW5kZXhhYmxlKSB7XG4gICAgICAgIC8vIEEgZnVuY3Rpb24gdHlwZS5cbiAgICAgICAgY29uc3Qgc2lncyA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0U2lnbmF0dXJlc09mVHlwZSh0eXBlLCB0cy5TaWduYXR1cmVLaW5kLkNhbGwpO1xuICAgICAgICBpZiAoc2lncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zaWduYXR1cmVUb0Nsb3N1cmUoc2lnc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaW5kZXhhYmxlICYmICFjYWxsYWJsZSkge1xuICAgICAgICAvLyBBIHBsYWluIGtleS12YWx1ZSBtYXAgdHlwZS5cbiAgICAgICAgbGV0IGtleVR5cGUgPSAnc3RyaW5nJztcbiAgICAgICAgbGV0IHZhbFR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLmdldEluZGV4VHlwZU9mVHlwZSh0eXBlLCB0cy5JbmRleEtpbmQuU3RyaW5nKTtcbiAgICAgICAgaWYgKCF2YWxUeXBlKSB7XG4gICAgICAgICAga2V5VHlwZSA9ICdudW1iZXInO1xuICAgICAgICAgIHZhbFR5cGUgPSB0aGlzLnR5cGVDaGVja2VyLmdldEluZGV4VHlwZU9mVHlwZSh0eXBlLCB0cy5JbmRleEtpbmQuTnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbFR5cGUpIHtcbiAgICAgICAgICB0aGlzLndhcm4oJ3Vua25vd24gaW5kZXgga2V5IHR5cGUnKTtcbiAgICAgICAgICByZXR1cm4gYCFPYmplY3Q8Pyw/PmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGAhT2JqZWN0PCR7a2V5VHlwZX0sJHt0aGlzLnRyYW5zbGF0ZSh2YWxUeXBlKX0+YDtcbiAgICAgIH0gZWxzZSBpZiAoIWNhbGxhYmxlICYmICFpbmRleGFibGUpIHtcbiAgICAgICAgLy8gVGhlIG9iamVjdCBoYXMgbm8gbWVtYmVycy4gIFRoaXMgaXMgdGhlIFRTIHR5cGUgJ3t9JyxcbiAgICAgICAgLy8gd2hpY2ggbWVhbnMgXCJhbnkgdmFsdWUgb3RoZXIgdGhhbiBudWxsIG9yIHVuZGVmaW5lZFwiLlxuICAgICAgICAvLyBXaGF0IGlzIHRoaXMgaW4gQ2xvc3VyZSdzIHR5cGUgc3lzdGVtP1xuICAgICAgICAvL1xuICAgICAgICAvLyBGaXJzdCwgeyFPYmplY3R9IGlzIHdyb25nIGJlY2F1c2UgaXQgaXMgbm90IGEgc3VwZXJ0eXBlIG9mXG4gICAgICAgIC8vIHtzdHJpbmd9IG9yIHtudW1iZXJ9LiAgVGhpcyB3b3VsZCBtZWFuIHlvdSBjYW5ub3QgYXNzaWduIGFcbiAgICAgICAgLy8gbnVtYmVyIHRvIGEgdmFyaWFibGUgb2YgVFMgdHlwZSB7fS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgZ2V0IGNsb3NlciB3aXRoIHsqfSwgYWthIHRoZSBBTEwgdHlwZS4gIFRoaXMgb25lIGJldHRlclxuICAgICAgICAvLyBjYXB0dXJlcyB0aGUgdHlwaWNhbCB1c2Ugb2YgdGhlIFRTIHt9LCB3aGljaCB1c2VycyB1c2UgZm9yXG4gICAgICAgIC8vIFwiSSBkb24ndCBjYXJlXCIuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHsqfSB1bmZvcnR1bmF0ZWx5IGRvZXMgaW5jbHVkZSBudWxsL3VuZGVmaW5lZCwgc28gaXQncyBhIGNsb3NlclxuICAgICAgICAvLyBtYXRjaCBmb3IgVFMgMy4wJ3MgJ3Vua25vd24nLlxuICAgICAgICByZXR1cm4gJyonO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghY2FsbGFibGUgJiYgIWluZGV4YWJsZSkge1xuICAgICAgLy8gTm90IGNhbGxhYmxlLCBub3QgaW5kZXhhYmxlOyBpbXBsaWVzIGEgcGxhaW4gb2JqZWN0IHdpdGggZmllbGRzIGluIGl0LlxuICAgICAgcmV0dXJuIGB7JHtmaWVsZHMuam9pbignLCAnKX19YDtcbiAgICB9XG5cbiAgICB0aGlzLndhcm4oJ3VuaGFuZGxlZCBhbm9ueW1vdXMgdHlwZScpO1xuICAgIHJldHVybiAnPyc7XG4gIH1cblxuICAvKiogQ29udmVydHMgYSB0cy5TaWduYXR1cmUgKGZ1bmN0aW9uIHNpZ25hdHVyZSkgdG8gYSBDbG9zdXJlIGZ1bmN0aW9uIHR5cGUuICovXG4gIHByaXZhdGUgc2lnbmF0dXJlVG9DbG9zdXJlKHNpZzogdHMuU2lnbmF0dXJlKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IENvbnNpZGVyIGhhcm1vbml6aW5nIHNvbWUgb3ZlcmxhcCB3aXRoIGVtaXRGdW5jdGlvblR5cGUgaW4gdHNpY2tsZS50cy5cbiAgICBpZiAoIXNpZy5kZWNsYXJhdGlvbikge1xuICAgICAgdGhpcy53YXJuKCdzaWduYXR1cmUgd2l0aG91dCBkZWNsYXJhdGlvbicpO1xuICAgICAgcmV0dXJuICdGdW5jdGlvbic7XG4gICAgfVxuICAgIGlmIChzaWcuZGVjbGFyYXRpb24ua2luZCA9PT0gdHMuU3ludGF4S2luZEpTRG9jU2lnbmF0dXJlKSB7XG4gICAgICB0aGlzLndhcm4oJ3NpZ25hdHVyZSB3aXRoIEpTRG9jIGRlY2xhcmF0aW9uJyk7XG4gICAgICByZXR1cm4gJ0Z1bmN0aW9uJztcbiAgICB9XG4gICAgdGhpcy5ibGFja2xpc3RUeXBlUGFyYW1ldGVycyh0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcywgc2lnLmRlY2xhcmF0aW9uLnR5cGVQYXJhbWV0ZXJzKTtcblxuICAgIGxldCB0eXBlU3RyID0gYGZ1bmN0aW9uKGA7XG4gICAgbGV0IHBhcmFtRGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24+ID0gc2lnLmRlY2xhcmF0aW9uLnBhcmFtZXRlcnMgfHwgW107XG4gICAgY29uc3QgbWF5YmVUaGlzUGFyYW0gPSBwYXJhbURlY2xzWzBdO1xuICAgIC8vIE9kZGx5LCB0aGUgdGhpcyB0eXBlIHNob3dzIHVwIGluIHBhcmFtRGVjbHMsIGJ1dCBub3QgaW4gdGhlIHR5cGUncyBwYXJhbWV0ZXJzLlxuICAgIC8vIEhhbmRsZSBpdCBoZXJlIGFuZCB0aGVuIHBhc3MgcGFyYW1EZWNscyBkb3duIHdpdGhvdXQgaXRzIGZpcnN0IGVsZW1lbnQuXG4gICAgaWYgKG1heWJlVGhpc1BhcmFtICYmIG1heWJlVGhpc1BhcmFtLm5hbWUuZ2V0VGV4dCgpID09PSAndGhpcycpIHtcbiAgICAgIGlmIChtYXliZVRoaXNQYXJhbS50eXBlKSB7XG4gICAgICAgIGNvbnN0IHRoaXNUeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihtYXliZVRoaXNQYXJhbS50eXBlKTtcbiAgICAgICAgdHlwZVN0ciArPSBgdGhpczogKCR7dGhpcy50cmFuc2xhdGUodGhpc1R5cGUpfSlgO1xuICAgICAgICBpZiAocGFyYW1EZWNscy5sZW5ndGggPiAxKSB0eXBlU3RyICs9ICcsICc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhcm4oJ3RoaXMgdHlwZSB3aXRob3V0IHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIHBhcmFtRGVjbHMgPSBwYXJhbURlY2xzLnNsaWNlKDEpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtcyA9IHRoaXMuY29udmVydFBhcmFtcyhzaWcsIHBhcmFtRGVjbHMpO1xuICAgIHR5cGVTdHIgKz0gYCR7cGFyYW1zLmpvaW4oJywgJyl9KWA7XG5cbiAgICBjb25zdCByZXRUeXBlID0gdGhpcy50cmFuc2xhdGUodGhpcy50eXBlQ2hlY2tlci5nZXRSZXR1cm5UeXBlT2ZTaWduYXR1cmUoc2lnKSk7XG4gICAgaWYgKHJldFR5cGUpIHtcbiAgICAgIHR5cGVTdHIgKz0gYDogJHtyZXRUeXBlfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGVTdHI7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHNpZ25hdHVyZS4gVGFrZXMgcGFyYW1ldGVyIGRlY2xhcmF0aW9ucyBhcyB0aG9zZSBtaWdodCBub3RcbiAgICogbWF0Y2ggdGhlIHNpZ25hdHVyZSBwYXJhbWV0ZXJzIChlLmcuIHRoZXJlIG1pZ2h0IGJlIGFuIGFkZGl0aW9uYWwgdGhpcyBwYXJhbWV0ZXIpLiBUaGlzXG4gICAqIGRpZmZlcmVuY2UgaXMgaGFuZGxlZCBieSB0aGUgY2FsbGVyLCBhcyBpcyBjb252ZXJ0aW5nIHRoZSBcInRoaXNcIiBwYXJhbWV0ZXIuXG4gICAqL1xuICBwcml2YXRlIGNvbnZlcnRQYXJhbXMoc2lnOiB0cy5TaWduYXR1cmUsIHBhcmFtRGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuUGFyYW1ldGVyRGVjbGFyYXRpb24+KTpcbiAgICAgIHN0cmluZ1tdIHtcbiAgICBjb25zdCBwYXJhbVR5cGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2lnLnBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcmFtID0gc2lnLnBhcmFtZXRlcnNbaV07XG5cbiAgICAgIGNvbnN0IHBhcmFtRGVjbCA9IHBhcmFtRGVjbHNbaV07XG4gICAgICBjb25zdCBvcHRpb25hbCA9ICEhcGFyYW1EZWNsLnF1ZXN0aW9uVG9rZW47XG4gICAgICBjb25zdCB2YXJBcmdzID0gISFwYXJhbURlY2wuZG90RG90RG90VG9rZW47XG4gICAgICBsZXQgcGFyYW1UeXBlID0gdGhpcy50eXBlQ2hlY2tlci5nZXRUeXBlT2ZTeW1ib2xBdExvY2F0aW9uKHBhcmFtLCB0aGlzLm5vZGUpO1xuICAgICAgaWYgKHZhckFyZ3MpIHtcbiAgICAgICAgY29uc3QgdHlwZVJlZiA9IHBhcmFtVHlwZSBhcyB0cy5UeXBlUmVmZXJlbmNlO1xuICAgICAgICBwYXJhbVR5cGUgPSB0eXBlUmVmLnR5cGVBcmd1bWVudHMhWzBdO1xuICAgICAgfVxuICAgICAgbGV0IHR5cGVTdHIgPSB0aGlzLnRyYW5zbGF0ZShwYXJhbVR5cGUpO1xuICAgICAgaWYgKHZhckFyZ3MpIHR5cGVTdHIgPSAnLi4uJyArIHR5cGVTdHI7XG4gICAgICBpZiAob3B0aW9uYWwpIHR5cGVTdHIgPSB0eXBlU3RyICsgJz0nO1xuICAgICAgcGFyYW1UeXBlcy5wdXNoKHR5cGVTdHIpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1UeXBlcztcbiAgfVxuXG4gIHdhcm4obXNnOiBzdHJpbmcpIHtcbiAgICAvLyBCeSBkZWZhdWx0LCB3YXJuKCkgZG9lcyBub3RoaW5nLiAgVGhlIGNhbGxlciB3aWxsIG92ZXJ3cml0ZSB0aGlzXG4gICAgLy8gaWYgaXQgd2FudHMgZGlmZmVyZW50IGJlaGF2aW9yLlxuICB9XG5cbiAgLyoqIEByZXR1cm4gdHJ1ZSBpZiBzeW0gc2hvdWxkIGFsd2F5cyBoYXZlIHR5cGUgez99LiAqL1xuICBpc0JsYWNrTGlzdGVkKHN5bWJvbDogdHMuU3ltYm9sKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGF0aEJsYWNrTGlzdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgcGF0aEJsYWNrTGlzdCA9IHRoaXMucGF0aEJsYWNrTGlzdDtcbiAgICAvLyBTb21lIGJ1aWx0aW4gdHlwZXMsIHN1Y2ggYXMge30sIGdldCByZXByZXNlbnRlZCBieSBhIHN5bWJvbCB0aGF0IGhhcyBubyBkZWNsYXJhdGlvbnMuXG4gICAgaWYgKHN5bWJvbC5kZWNsYXJhdGlvbnMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBzeW1ib2wuZGVjbGFyYXRpb25zLmV2ZXJ5KG4gPT4ge1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLm5vcm1hbGl6ZShuLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XG4gICAgICByZXR1cm4gcGF0aEJsYWNrTGlzdC5oYXMoZmlsZU5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3N1cmUgZG9lc24gbm90IHN1cHBvcnQgdHlwZSBwYXJhbWV0ZXJzIGZvciBmdW5jdGlvbiB0eXBlcywgaS5lLiBnZW5lcmljIGZ1bmN0aW9uIHR5cGVzLlxuICAgKiBCbGFja2xpc3QgdGhlIHN5bWJvbHMgZGVjbGFyZWQgYnkgdGhlbSBhbmQgZW1pdCBhID8gZm9yIHRoZSB0eXBlcy5cbiAgICpcbiAgICogVGhpcyBtdXRhdGVzIHRoZSBnaXZlbiBibGFja2xpc3QgbWFwLiBUaGUgbWFwJ3Mgc2NvcGUgaXMgb25lIGZpbGUsIGFuZCBzeW1ib2xzIGFyZVxuICAgKiB1bmlxdWUgb2JqZWN0cywgc28gdGhpcyBzaG91bGQgbmVpdGhlciBsZWFkIHRvIGV4Y2Vzc2l2ZSBtZW1vcnkgY29uc3VtcHRpb24gbm9yIGludHJvZHVjZVxuICAgKiBlcnJvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBibGFja2xpc3QgYSBtYXAgdG8gc3RvcmUgdGhlIGJsYWNrbGlzdGVkIHN5bWJvbHMgaW4sIHdpdGggYSB2YWx1ZSBvZiAnPycuIEluIHByYWN0aWNlLFxuICAgKiAgICAgdGhpcyBpcyBhbHdheXMgPT09IHRoaXMuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLCBidXQgd2UncmUgcGFzc2luZyBpdCBleHBsaWNpdGx5IHRvIG1ha2UgaXRcbiAgICogICAgY2xlYXIgdGhhdCB0aGUgbWFwIGlzIG11dGF0ZWQgKGluIHBhcnRpY3VsYXIgd2hlbiB1c2VkIGZyb20gb3V0c2lkZSB0aGUgY2xhc3MpLlxuICAgKiBAcGFyYW0gZGVjbHMgdGhlIGRlY2xhcmF0aW9ucyB3aG9zZSBzeW1ib2xzIHNob3VsZCBiZSBibGFja2xpc3RlZC5cbiAgICovXG4gIGJsYWNrbGlzdFR5cGVQYXJhbWV0ZXJzKFxuICAgICAgYmxhY2tsaXN0OiBNYXA8dHMuU3ltYm9sLCBzdHJpbmc+LFxuICAgICAgZGVjbHM6IFJlYWRvbmx5QXJyYXk8dHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uPnx1bmRlZmluZWQpIHtcbiAgICBpZiAoIWRlY2xzIHx8ICFkZWNscy5sZW5ndGgpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IHRwZCBvZiBkZWNscykge1xuICAgICAgY29uc3Qgc3ltID0gdGhpcy50eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKHRwZC5uYW1lKTtcbiAgICAgIGlmICghc3ltKSB7XG4gICAgICAgIHRoaXMud2FybihgdHlwZSBwYXJhbWV0ZXIgd2l0aCBubyBzeW1ib2xgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0aGlzLnN5bWJvbHNUb0FsaWFzZWROYW1lcy5zZXQoc3ltLCAnPycpO1xuICAgIH1cbiAgfVxufVxuIl19