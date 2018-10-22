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
        define("tsickle/src/jsdoc_transformer", ["require", "exports", "tsickle/src/decorators", "tsickle/src/externs", "tsickle/src/googmodule", "tsickle/src/jsdoc", "tsickle/src/module_type_translator", "tsickle/src/transformer_util", "tsickle/src/type_translator", "tsickle/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @fileoverview jsdoc_transformer contains the logic to add JSDoc comments to TypeScript code.
     *
     * One of tsickle's features is to add Closure Compiler compatible JSDoc comments containing type
     * annotations, inheritance information, etc., onto TypeScript code. This allows Closure Compiler to
     * make better optimization decisions compared to an untyped code base.
     *
     * The entry point to the annotation operation is jsdocTransformer below. It adds synthetic comments
     * to existing TypeScript constructs, for example:
     *     const x: number = 1;
     * Might get transformed to:
     *     /.. \@type {number} ./
     *     const x: number = 1;
     * Later TypeScript phases then remove the type annotation, and the final emit is JavaScript that
     * only contains the JSDoc comment.
     *
     * To handle certain constructs, this transformer also performs AST transformations, e.g. by adding
     * CommonJS-style exports for type constructs, expanding `export *`, parenthesizing casts, etc.
     */
    var decorators_1 = require("tsickle/src/decorators");
    var externs_1 = require("tsickle/src/externs");
    var googmodule = require("tsickle/src/googmodule");
    var jsdoc = require("tsickle/src/jsdoc");
    var module_type_translator_1 = require("tsickle/src/module_type_translator");
    var transformerUtil = require("tsickle/src/transformer_util");
    var type_translator_1 = require("tsickle/src/type_translator");
    var ts = require("tsickle/src/typescript");
    function addCommentOn(node, tags, escapeExtraTags) {
        var comment = jsdoc.toSynthesizedComment(tags, escapeExtraTags);
        var comments = ts.getSyntheticLeadingComments(node) || [];
        comments.push(comment);
        ts.setSyntheticLeadingComments(node, comments);
        return comment;
    }
    /** @return true if node has the specified modifier flag set. */
    function isAmbient(node) {
        var current = node;
        while (current) {
            if (transformerUtil.hasModifierFlag(current, ts.ModifierFlags.Ambient))
                return true;
            current = current.parent;
        }
        return false;
    }
    exports.isAmbient = isAmbient;
    /** Adds an \@template clause to docTags if decl has type parameters. */
    function maybeAddTemplateClause(docTags, decl) {
        if (!decl.typeParameters)
            return;
        // Closure does not support template constraints (T extends X), these are ignored below.
        docTags.push({
            tagName: 'template',
            text: decl.typeParameters.map(function (tp) { return transformerUtil.getIdentifierText(tp.name); }).join(', ')
        });
    }
    exports.maybeAddTemplateClause = maybeAddTemplateClause;
    /**
     * Adds heritage clauses (\@extends, \@implements) to the given docTags for decl. Used by
     * jsdoc_transformer and externs generation.
     */
    function maybeAddHeritageClauses(docTags, mtt, decl) {
        var e_1, _a, e_2, _b;
        if (!decl.heritageClauses)
            return;
        var isClass = decl.kind === ts.SyntaxKind.ClassDeclaration;
        var classHasSuperClass = isClass && decl.heritageClauses.some(function (hc) { return hc.token === ts.SyntaxKind.ExtendsKeyword; });
        try {
            for (var _c = __values(decl.heritageClauses), _d = _c.next(); !_d.done; _d = _c.next()) {
                var heritage = _d.value;
                if (!heritage.types)
                    continue;
                if (isClass && heritage.token !== ts.SyntaxKind.ImplementsKeyword && !isAmbient(decl)) {
                    // If a class has "extends Foo", that is preserved in the ES6 output
                    // and we don't need to do anything.  But if it has "implements Foo",
                    // that is a TS-specific thing and we need to translate it to the
                    // the Closure "@implements {Foo}".
                    // However for ambient declarations, we only emit externs, and in those we do need to
                    // add "@extends {Foo}" as they use ES5 syntax.
                    continue;
                }
                try {
                    for (var _e = __values(heritage.types), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var impl = _f.value;
                        var tagName = decl.kind === ts.SyntaxKind.InterfaceDeclaration ? 'extends' : 'implements';
                        var sym = mtt.typeChecker.getSymbolAtLocation(impl.expression);
                        if (!sym) {
                            // It's possible for a class declaration to extend an expression that
                            // does not have have a symbol, for example when a mixin function is
                            // used to build a base class, as in `declare MyClass extends
                            // MyMixin(MyBaseClass)`.
                            //
                            // Handling this correctly is tricky. Closure throws on this
                            // `extends <expression>` syntax (see
                            // https://github.com/google/closure-compiler/issues/2182). We would
                            // probably need to generate an intermediate class declaration and
                            // extend that. For now, just omit the `extends` annotation.
                            mtt.debugWarn(decl, "could not resolve supertype: " + impl.getText());
                            docTags.push({
                                tagName: '',
                                text: 'NOTE: tsickle could not resolve supertype, ' +
                                    'class definition may be incomplete.\n'
                            });
                            continue;
                        }
                        var alias = sym;
                        if (sym.flags & ts.SymbolFlags.TypeAlias) {
                            // It's implementing a type alias.  Follow the type alias back
                            // to the original symbol to check whether it's a type or a value.
                            var type = mtt.typeChecker.getDeclaredTypeOfSymbol(sym);
                            if (!type.symbol) {
                                // It's not clear when this can happen, but if it does all we
                                // do is fail to emit the @implements, which isn't so harmful.
                                continue;
                            }
                            alias = type.symbol;
                        }
                        if (alias.flags & ts.SymbolFlags.Alias) {
                            alias = mtt.typeChecker.getAliasedSymbol(alias);
                        }
                        var typeTranslator = mtt.newTypeTranslator(impl.expression);
                        if (typeTranslator.isBlackListed(alias)) {
                            continue;
                        }
                        // We can only @implements an interface, not a class.
                        // But it's fine to translate TS "implements Class" into Closure
                        // "@extends {Class}" because this is just a type hint.
                        if (alias.flags & ts.SymbolFlags.Class) {
                            if (!isClass) {
                                // Only classes can extend classes in TS. Ignoring the heritage clause should be safe,
                                // as interfaces are @record anyway, so should prevent property disambiguation.
                                // Problem: validate that methods are there?
                                continue;
                            }
                            if (classHasSuperClass && heritage.token !== ts.SyntaxKind.ExtendsKeyword) {
                                // Do not emit an @extends for a class that already has a proper ES6 extends class. This
                                // risks incorrect optimization, as @extends takes precedence, and Closure won't be
                                // aware of the actual type hierarchy of the class.
                                continue;
                            }
                            tagName = 'extends';
                        }
                        else if (alias.flags & ts.SymbolFlags.Value) {
                            // If the symbol was already in the value namespace, then it will
                            // not be a type in the Closure output (because Closure collapses
                            // the type and value namespaces).  Just ignore the implements.
                            continue;
                        }
                        // typeToClosure includes nullability modifiers, so call symbolToString directly here.
                        docTags.push({ tagName: tagName, type: typeTranslator.symbolToString(alias, true) });
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    exports.maybeAddHeritageClauses = maybeAddHeritageClauses;
    /**
     * createMemberTypeDeclaration emits the type annotations for members of a class. It's necessary in
     * the case where TypeScript syntax specifies there are additional properties on the class, because
     * to declare these in Closure you must declare these separately from the class.
     *
     * createMemberTypeDeclaration produces an if (false) statement containing property declarations, or
     * null if no declarations could or needed to be generated (e.g. no members, or an unnamed type).
     * The if statement is used to make sure the code is not executed, otherwise property accesses could
     * trigger getters on a superclass. See test_files/fields/fields.ts:BaseThatThrows.
     */
    function createMemberTypeDeclaration(mtt, typeDecl) {
        var e_3, _a, e_4, _b;
        // Gather parameter properties from the constructor, if it exists.
        var ctors = [];
        var paramProps = [];
        var nonStaticProps = [];
        var staticProps = [];
        var unhandled = [];
        var abstractMethods = [];
        try {
            for (var _c = __values(typeDecl.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                var member = _d.value;
                if (member.kind === ts.SyntaxKind.Constructor) {
                    ctors.push(member);
                }
                else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
                    var isStatic = transformerUtil.hasModifierFlag(member, ts.ModifierFlags.Static);
                    if (isStatic) {
                        staticProps.push(member);
                    }
                    else {
                        nonStaticProps.push(member);
                    }
                }
                else if (member.kind === ts.SyntaxKind.MethodDeclaration ||
                    member.kind === ts.SyntaxKind.MethodSignature ||
                    member.kind === ts.SyntaxKind.GetAccessor || member.kind === ts.SyntaxKind.SetAccessor) {
                    if (transformerUtil.hasModifierFlag(member, ts.ModifierFlags.Abstract) ||
                        ts.isInterfaceDeclaration(typeDecl)) {
                        abstractMethods.push(member);
                    }
                    // Non-abstract methods only exist on classes, and are handled in regular emit.
                }
                else {
                    unhandled.push(member);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (ctors.length > 0) {
            // Only the actual constructor implementation, which must be last in a potential sequence of
            // overloaded constructors, may contain parameter properties.
            var ctor = ctors[ctors.length - 1];
            paramProps = ctor.parameters.filter(function (p) { return transformerUtil.hasModifierFlag(p, ts.ModifierFlags.ParameterPropertyModifier); });
        }
        if (nonStaticProps.length === 0 && paramProps.length === 0 && staticProps.length === 0 &&
            abstractMethods.length === 0) {
            // There are no members so we don't need to emit any type
            // annotations helper.
            return null;
        }
        if (!typeDecl.name) {
            mtt.debugWarn(typeDecl, 'cannot add types on unnamed declarations');
            return null;
        }
        var className = transformerUtil.getIdentifierText(typeDecl.name);
        var staticPropAccess = ts.createIdentifier(className);
        var instancePropAccess = ts.createPropertyAccess(staticPropAccess, 'prototype');
        // Closure Compiler will report conformance errors about this being unknown type when emitting
        // class properties as {?|undefined}, instead of just {?}. So make sure to only emit {?|undefined}
        // on interfaces.
        var isInterface = ts.isInterfaceDeclaration(typeDecl);
        var propertyDecls = staticProps.map(function (p) { return createClosurePropertyDeclaration(mtt, staticPropAccess, p, isInterface && !!p.questionToken); });
        propertyDecls.push.apply(propertyDecls, __spread(__spread(nonStaticProps, paramProps).map(function (p) { return createClosurePropertyDeclaration(mtt, instancePropAccess, p, isInterface && !!p.questionToken); })));
        propertyDecls.push.apply(propertyDecls, __spread(unhandled.map(function (p) { return transformerUtil.createMultiLineComment(p, "Skipping unhandled member: " + escapeForComment(p.getText())); })));
        try {
            for (var abstractMethods_1 = __values(abstractMethods), abstractMethods_1_1 = abstractMethods_1.next(); !abstractMethods_1_1.done; abstractMethods_1_1 = abstractMethods_1.next()) {
                var fnDecl = abstractMethods_1_1.value;
                var name_1 = propertyName(fnDecl);
                if (!name_1) {
                    mtt.error(fnDecl, 'anonymous abstract function');
                    continue;
                }
                var _e = mtt.getFunctionTypeJSDoc([fnDecl], []), tags = _e.tags, parameterNames = _e.parameterNames;
                if (decorators_1.hasExportingDecorator(fnDecl, mtt.typeChecker))
                    tags.push({ tagName: 'export' });
                // memberNamespace because abstract methods cannot be static in TypeScript.
                var abstractFnDecl = ts.createStatement(ts.createAssignment(ts.createPropertyAccess(instancePropAccess, name_1), ts.createFunctionExpression(
                /* modifiers */ undefined, 
                /* asterisk */ undefined, 
                /* name */ undefined, 
                /* typeParameters */ undefined, parameterNames.map(function (n) { return ts.createParameter(
                /* decorators */ undefined, /* modifiers */ undefined, 
                /* dotDotDot */ undefined, n); }), undefined, ts.createBlock([]))));
                ts.setSyntheticLeadingComments(abstractFnDecl, [jsdoc.toSynthesizedComment(tags)]);
                propertyDecls.push(ts.setSourceMapRange(abstractFnDecl, fnDecl));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (abstractMethods_1_1 && !abstractMethods_1_1.done && (_b = abstractMethods_1.return)) _b.call(abstractMethods_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // See test_files/fields/fields.ts:BaseThatThrows for a note on this wrapper.
        return ts.createIf(ts.createLiteral(false), ts.createBlock(propertyDecls, true));
    }
    function propertyName(prop) {
        if (!prop.name)
            return null;
        switch (prop.name.kind) {
            case ts.SyntaxKind.Identifier:
                return transformerUtil.getIdentifierText(prop.name);
            case ts.SyntaxKind.StringLiteral:
                // E.g. interface Foo { 'bar': number; }
                // If 'bar' is a name that is not valid in Closure then there's nothing we can do.
                var text = prop.name.text;
                if (!type_translator_1.isValidClosurePropertyName(text))
                    return null;
                return text;
            default:
                return null;
        }
    }
    /** Removes comment metacharacters from a string, to make it safe to embed in a comment. */
    function escapeForComment(str) {
        return str.replace(/\/\*/g, '__').replace(/\*\//g, '__');
    }
    exports.escapeForComment = escapeForComment;
    function createClosurePropertyDeclaration(mtt, expr, prop, optional) {
        var name = propertyName(prop);
        if (!name) {
            mtt.debugWarn(prop, "handle unnamed member:\n" + escapeForComment(prop.getText()));
            return transformerUtil.createMultiLineComment(prop, "Skipping unnamed member:\n" + escapeForComment(prop.getText()));
        }
        var type = mtt.typeToClosure(prop);
        // When a property is optional, e.g.
        //   foo?: string;
        // Then the TypeScript type of the property is string|undefined, the
        // typeToClosure translation handles it correctly, and string|undefined is
        // how you write an optional property in Closure.
        //
        // But in the special case of an optional property with type any:
        //   foo?: any;
        // The TypeScript type of the property is just "any" (because any includes
        // undefined as well) so our default translation of the type is just "?".
        // To mark the property as optional in Closure it must have "|undefined",
        // so the Closure type must be ?|undefined.
        if (optional && type === '?')
            type += '|undefined';
        var tags = mtt.getJSDoc(prop, /* reportWarnings */ true);
        tags.push({ tagName: 'type', type: type });
        if (decorators_1.hasExportingDecorator(prop, mtt.typeChecker)) {
            tags.push({ tagName: 'export' });
        }
        var declStmt = ts.setSourceMapRange(ts.createStatement(ts.createPropertyAccess(expr, name)), prop);
        // Avoid printing annotations that can conflict with @type
        // This avoids Closure's error "type annotation incompatible with other annotations"
        addCommentOn(declStmt, tags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
        return declStmt;
    }
    /**
     * Removes any type assertions and non-null expressions from the AST before TypeScript processing.
     *
     * Ideally, the code in jsdoc_transformer below should just remove the cast expression and
     * replace it with the Closure equivalent. However Angular's compiler is fragile to AST
     * nodes being removed or changing type, so the code must retain the type assertion
     * expression, see: https://github.com/angular/angular/issues/24895.
     *
     * tsickle also cannot just generate and keep a `(/.. @type {SomeType} ./ (expr as SomeType))`
     * because TypeScript removes the parenthesized expressions in that syntax, (reasonably) believing
     * they were only added for the TS cast.
     *
     * The final workaround is then to keep the TypeScript type assertions, and have a post-Angular
     * processing step that removes the assertions before TypeScript sees them.
     *
     * TODO(martinprobst): remove once the Angular issue is fixed.
     */
    function removeTypeAssertions() {
        return function (context) {
            return function (sourceFile) {
                function visitor(node) {
                    switch (node.kind) {
                        case ts.SyntaxKind.TypeAssertionExpression:
                        case ts.SyntaxKind.AsExpression:
                            return ts.visitNode(node.expression, visitor);
                        case ts.SyntaxKind.NonNullExpression:
                            return ts.visitNode(node.expression, visitor);
                        default:
                            break;
                    }
                    return ts.visitEachChild(node, visitor, context);
                }
                return visitor(sourceFile);
            };
        };
    }
    exports.removeTypeAssertions = removeTypeAssertions;
    /**
     * jsdocTransformer returns a transformer factory that converts TypeScript types into the equivalent
     * JSDoc annotations.
     */
    function jsdocTransformer(host, tsOptions, tsHost, typeChecker, diagnostics) {
        return function (context) {
            return function (sourceFile) {
                var moduleTypeTranslator = new module_type_translator_1.ModuleTypeTranslator(sourceFile, typeChecker, host, diagnostics, /*isForExterns*/ false);
                /**
                 * The set of all names exported from an export * in the current module. Used to prevent
                 * emitting duplicated exports. The first export * takes precedence in ES6.
                 */
                var expandedStarImports = new Set();
                /**
                 * While Closure compiler supports parameterized types, including parameterized `this` on
                 * methods, it does not support constraints on them. That means that an `\@template`d type is
                 * always considered to be `unknown` within the method, including `THIS`.
                 *
                 * To help Closure Compiler, we keep track of any templated this return type, and substitute
                 * explicit casts to the templated type.
                 *
                 * This is an incomplete solution and works around a specific problem with warnings on unknown
                 * this accesses. More generally, Closure also cannot infer constraints for any other
                 * templated types, but that might require a more general solution in Closure Compiler.
                 */
                var contextThisType = null;
                function visitClassDeclaration(classDecl) {
                    var contextThisTypeBackup = contextThisType;
                    var mjsdoc = moduleTypeTranslator.getMutableJSDoc(classDecl);
                    if (transformerUtil.hasModifierFlag(classDecl, ts.ModifierFlags.Abstract)) {
                        mjsdoc.tags.push({ tagName: 'abstract' });
                    }
                    maybeAddTemplateClause(mjsdoc.tags, classDecl);
                    if (!host.untyped) {
                        maybeAddHeritageClauses(mjsdoc.tags, moduleTypeTranslator, classDecl);
                    }
                    mjsdoc.updateComment();
                    var decls = [];
                    var memberDecl = createMemberTypeDeclaration(moduleTypeTranslator, classDecl);
                    // WARNING: order is significant; we must create the member decl before transforming away
                    // parameter property comments when visiting the constructor.
                    decls.push(ts.visitEachChild(classDecl, visitor, context));
                    if (memberDecl)
                        decls.push(memberDecl);
                    contextThisType = contextThisTypeBackup;
                    return decls;
                }
                /**
                 * visitHeritageClause works around a Closure Compiler issue, where the expression in an
                 * "extends" clause must be a simple identifier, and in particular must not be a parenthesized
                 * expression.
                 *
                 * This is triggered when TS code writes "class X extends (Foo as Bar) { ... }", commonly done
                 * to support mixins. For extends clauses in classes, the code below drops the cast and any
                 * parentheticals, leaving just the original expression.
                 *
                 * This is an incomplete workaround, as Closure will still bail on other super expressions,
                 * but retains compatibility with the previous emit that (accidentally) dropped the cast
                 * expression.
                 *
                 * TODO(martinprobst): remove this once the Closure side issue has been resolved.
                 */
                function visitHeritageClause(heritageClause) {
                    if (heritageClause.token !== ts.SyntaxKind.ExtendsKeyword || !heritageClause.parent ||
                        heritageClause.parent.kind === ts.SyntaxKind.InterfaceDeclaration) {
                        return ts.visitEachChild(heritageClause, visitor, context);
                    }
                    if (heritageClause.types.length !== 1) {
                        moduleTypeTranslator.error(heritageClause, "expected exactly one type in class extension clause");
                    }
                    var type = heritageClause.types[0];
                    var expr = type.expression;
                    while (ts.isParenthesizedExpression(expr) || ts.isNonNullExpression(expr) ||
                        ts.isAssertionExpression(expr)) {
                        expr = expr.expression;
                    }
                    return ts.updateHeritageClause(heritageClause, [ts.updateExpressionWithTypeArguments(type, type.typeArguments || [], expr)]);
                }
                function visitInterfaceDeclaration(iface) {
                    var sym = typeChecker.getSymbolAtLocation(iface.name);
                    if (!sym) {
                        moduleTypeTranslator.error(iface, 'interface with no symbol');
                        return [];
                    }
                    // If this symbol is both a type and a value, we cannot emit both into Closure's
                    // single namespace.
                    if (sym.flags & ts.SymbolFlags.Value) {
                        moduleTypeTranslator.debugWarn(iface, "type/symbol conflict for " + sym.name + ", using {?} for now");
                        return [transformerUtil.createSingleLineComment(iface, 'WARNING: interface has both a type and a value, skipping emit')];
                    }
                    var tags = moduleTypeTranslator.getJSDoc(iface, /* reportWarnings */ true) || [];
                    tags.push({ tagName: 'record' });
                    maybeAddTemplateClause(tags, iface);
                    if (!host.untyped) {
                        maybeAddHeritageClauses(tags, moduleTypeTranslator, iface);
                    }
                    var name = transformerUtil.getIdentifierText(iface.name);
                    var modifiers = transformerUtil.hasModifierFlag(iface, ts.ModifierFlags.Export) ?
                        [ts.createToken(ts.SyntaxKind.ExportKeyword)] :
                        undefined;
                    var decl = ts.setSourceMapRange(ts.createFunctionDeclaration(
                    /* decorators */ undefined, modifiers, 
                    /* asterisk */ undefined, name, 
                    /* typeParameters */ undefined, 
                    /* parameters */ [], 
                    /* type */ undefined, 
                    /* body */ ts.createBlock([])), iface);
                    addCommentOn(decl, tags);
                    var memberDecl = createMemberTypeDeclaration(moduleTypeTranslator, iface);
                    return memberDecl ? [decl, memberDecl] : [decl];
                }
                /** Function declarations are emitted as they are, with only JSDoc added. */
                function visitFunctionLikeDeclaration(fnDecl) {
                    if (!fnDecl.body) {
                        // Two cases: abstract methods and overloaded methods/functions.
                        // Abstract methods are handled in emitTypeAnnotationsHandler.
                        // Overloads are union-ized into the shared type in FunctionType.
                        return ts.visitEachChild(fnDecl, visitor, context);
                    }
                    var extraTags = [];
                    if (decorators_1.hasExportingDecorator(fnDecl, typeChecker))
                        extraTags.push({ tagName: 'export' });
                    var _a = moduleTypeTranslator.getFunctionTypeJSDoc([fnDecl], extraTags), tags = _a.tags, thisReturnType = _a.thisReturnType;
                    var mjsdoc = moduleTypeTranslator.getMutableJSDoc(fnDecl);
                    mjsdoc.tags = tags;
                    mjsdoc.updateComment();
                    moduleTypeTranslator.blacklistTypeParameters(fnDecl, fnDecl.typeParameters);
                    var contextThisTypeBackup = contextThisType;
                    contextThisType = thisReturnType;
                    var result = ts.visitEachChild(fnDecl, visitor, context);
                    contextThisType = contextThisTypeBackup;
                    return result;
                }
                /**
                 * In methods with a templated this type, adds explicit casts to accesses on this.
                 *
                 * @see contextThisType
                 */
                function visitThisExpression(node) {
                    if (!contextThisType)
                        return ts.visitEachChild(node, visitor, context);
                    return createClosureCast(node, node, contextThisType);
                }
                /**
                 * visitVariableStatement flattens variable declaration lists (`var a, b;` to `var a; var
                 * b;`), and attaches JSDoc comments to each variable. JSDoc comments preceding the
                 * original variable are attached to the first newly created one.
                 */
                function visitVariableStatement(varStmt) {
                    var e_5, _a;
                    var stmts = [];
                    // "const", "let", etc are stored in node flags on the declarationList.
                    var flags = ts.getCombinedNodeFlags(varStmt.declarationList);
                    var tags = moduleTypeTranslator.getJSDoc(varStmt, /* reportWarnings */ true);
                    var leading = ts.getSyntheticLeadingComments(varStmt);
                    if (leading) {
                        // Attach non-JSDoc comments to a not emitted statement.
                        var commentHolder = ts.createNotEmittedStatement(varStmt);
                        ts.setSyntheticLeadingComments(commentHolder, leading.filter(function (c) { return c.text[0] !== '*'; }));
                        stmts.push(commentHolder);
                    }
                    var declList = ts.visitNode(varStmt.declarationList, visitor);
                    try {
                        for (var _b = __values(declList.declarations), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var decl = _c.value;
                            var localTags = [];
                            if (tags) {
                                // Add any tags and docs preceding the entire statement to the first variable.
                                localTags.push.apply(localTags, __spread(tags));
                                tags = null;
                            }
                            // Add an @type for plain identifiers, but not for bindings patterns (i.e. object or array
                            // destructuring) - those do not have a syntax in Closure.
                            if (ts.isIdentifier(decl.name)) {
                                // For variables that are initialized and use a blacklisted type, do not emit a type at
                                // all. Closure Compiler might be able to infer a better type from the initializer than
                                // the `?` the code below would emit.
                                // TODO(martinprobst): consider doing this for all types that get emitted as ?, not just
                                // for blacklisted ones.
                                var blackListedInitialized = !!decl.initializer && moduleTypeTranslator.isBlackListed(decl);
                                if (!blackListedInitialized) {
                                    // getOriginalNode(decl) is required because the type checker cannot type check
                                    // synthesized nodes.
                                    var typeStr = moduleTypeTranslator.typeToClosure(ts.getOriginalNode(decl));
                                    localTags.push({ tagName: 'type', type: typeStr });
                                }
                            }
                            var newStmt = ts.createVariableStatement(varStmt.modifiers, ts.createVariableDeclarationList([decl], flags));
                            if (localTags.length)
                                addCommentOn(newStmt, localTags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
                            stmts.push(newStmt);
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    return stmts;
                }
                /**
                 * shouldEmitExportsAssignments returns true if tsickle should emit `exports.Foo = ...` style
                 * export statements.
                 *
                 * TypeScript modules can export types. Because types are pure design-time constructs in
                 * TypeScript, it does not emit any actual exported symbols for these. But tsickle has to emit
                 * an export, so that downstream Closure code (including tsickle-converted Closure code) can
                 * import upstream types. tsickle has to pick a module format for that, because the pure ES6
                 * export would get stripped by TypeScript.
                 *
                 * tsickle uses CommonJS to emit googmodule, and code not using googmodule doesn't care about
                 * the Closure annotations anyway, so tsickle skips emitting exports if the module target
                 * isn't commonjs.
                 */
                function shouldEmitExportsAssignments() {
                    return tsOptions.module === ts.ModuleKind.CommonJS;
                }
                function visitTypeAliasDeclaration(typeAlias) {
                    // If the type is also defined as a value, skip emitting it. Closure collapses type & value
                    // namespaces, the two emits would conflict if tsickle emitted both.
                    var sym = moduleTypeTranslator.mustGetSymbolAtLocation(typeAlias.name);
                    if (sym.flags & ts.SymbolFlags.Value)
                        return [];
                    // Type aliases are always emitted as the resolved underlying type, so there is no need to
                    // emit anything, except for exported types.
                    if (!transformerUtil.hasModifierFlag(typeAlias, ts.ModifierFlags.Export))
                        return [];
                    if (!shouldEmitExportsAssignments())
                        return [];
                    var typeName = typeAlias.name.getText();
                    // Blacklist any type parameters, Closure does not support type aliases with type
                    // parameters.
                    moduleTypeTranslator.newTypeTranslator(typeAlias).blacklistTypeParameters(moduleTypeTranslator.symbolsToAliasedNames, typeAlias.typeParameters);
                    var typeStr = host.untyped ? '?' : moduleTypeTranslator.typeToClosure(typeAlias, undefined);
                    // In the case of an export, we cannot emit a `export var foo;` because TypeScript drops
                    // exports that are never assigned values, and Closure requires us to not assign values to
                    // typedef exports. Introducing a new local variable and exporting it can cause bugs due to
                    // name shadowing and confusing TypeScript's logic on what symbols and types vs values are
                    // exported. Mangling the name to avoid the conflicts would be reasonably clean, but would
                    // require a two pass emit to first find all type alias names, mangle them, and emit the use
                    // sites only later. With that, the fix here is to never emit type aliases, but always
                    // resolve the alias and emit the underlying type (fixing references in the local module,
                    // and also across modules). For downstream JavaScript code that imports the typedef, we
                    // emit an "export.Foo;" that declares and exports the type, and for TypeScript has no
                    // impact.
                    var tags = moduleTypeTranslator.getJSDoc(typeAlias, /* reportWarnings */ true);
                    tags.push({ tagName: 'typedef', type: typeStr });
                    var decl = ts.setSourceMapRange(ts.createStatement(ts.createPropertyAccess(ts.createIdentifier('exports'), ts.createIdentifier(typeName))), typeAlias);
                    addCommentOn(decl, tags, jsdoc.TAGS_CONFLICTING_WITH_TYPE);
                    return [decl];
                }
                /** Emits a parenthesized Closure cast: `(/** \@type ... * / (expr))`. */
                function createClosureCast(context, expression, type) {
                    var inner = ts.createParen(expression);
                    var comment = addCommentOn(inner, [{ tagName: 'type', type: moduleTypeTranslator.typeToClosure(context, type) }]);
                    comment.hasTrailingNewLine = false;
                    return ts.setSourceMapRange(ts.createParen(inner), context);
                }
                /** Converts a TypeScript type assertion into a Closure Cast. */
                function visitAssertionExpression(assertion) {
                    var type = typeChecker.getTypeAtLocation(assertion.type);
                    return createClosureCast(assertion, ts.visitEachChild(assertion, visitor, context), type);
                }
                /**
                 * Converts a TypeScript non-null assertion into a Closure Cast, by stripping |null and
                 * |undefined from a union type.
                 */
                function visitNonNullExpression(nonNull) {
                    var type = typeChecker.getTypeAtLocation(nonNull.expression);
                    var nonNullType = typeChecker.getNonNullableType(type);
                    return createClosureCast(nonNull, ts.visitEachChild(nonNull, visitor, context), nonNullType);
                }
                function visitImportDeclaration(importDecl) {
                    // No need to forward declare side effect imports.
                    if (!importDecl.importClause)
                        return importDecl;
                    // Introduce a goog.forwardDeclare for the module, so that if TypeScript does not emit the
                    // module because it's only used in type positions, the JSDoc comments still reference a
                    // valid Closure level symbol.
                    var sym = typeChecker.getSymbolAtLocation(importDecl.moduleSpecifier);
                    // Scripts do not have a symbol, and neither do unused modules. Scripts can still be
                    // imported, either as side effect imports or with an empty import set ("{}"). TypeScript
                    // does not emit a runtime load for an import with an empty list of symbols, but the import
                    // forces any global declarations from the library to be visible, which is what users use
                    // this for. No symbols from the script need forward declaration, so just return.
                    if (!sym)
                        return importDecl;
                    // Write the export declaration here so that forward declares come after it, and
                    // fileoverview comments do not get moved behind statements.
                    var importPath = googmodule.resolveModuleName({ options: tsOptions, host: tsHost }, sourceFile.fileName, importDecl.moduleSpecifier.text);
                    moduleTypeTranslator.forwardDeclare(importPath, sym, /* isExplicitlyImported? */ true, 
                    /* default import? */ !!importDecl.importClause.name);
                    return importDecl;
                }
                /**
                 * Closure Compiler will fail when it finds incorrect JSDoc tags on nodes. This function
                 * parses and then re-serializes JSDoc comments, escaping or removing illegal tags.
                 */
                function escapeIllegalJSDoc(node) {
                    var mjsdoc = moduleTypeTranslator.getMutableJSDoc(node);
                    mjsdoc.updateComment();
                }
                /** Returns true if a value export should be emitted for the given symbol in export *. */
                function shouldEmitValueExportForSymbol(sym) {
                    if (sym.flags & ts.SymbolFlags.Alias) {
                        sym = typeChecker.getAliasedSymbol(sym);
                    }
                    if ((sym.flags & ts.SymbolFlags.Value) === 0) {
                        // Note: We create explicit exports of type symbols for closure in visitExportDeclaration.
                        return false;
                    }
                    if (!tsOptions.preserveConstEnums && sym.flags & ts.SymbolFlags.ConstEnum) {
                        return false;
                    }
                    return true;
                }
                /**
                 * visitExportDeclaration forward declares exported modules and emits explicit exports for
                 * types (which normally do not get emitted by TypeScript).
                 */
                function visitExportDeclaration(exportDecl) {
                    var e_6, _a, e_7, _b, e_8, _c;
                    var importedModuleSymbol = exportDecl.moduleSpecifier &&
                        typeChecker.getSymbolAtLocation(exportDecl.moduleSpecifier);
                    if (importedModuleSymbol) {
                        // Forward declare all explicitly imported modules, so that symbols can be referenced and
                        // type only modules get force-loaded.
                        moduleTypeTranslator.forwardDeclare(exportDecl.moduleSpecifier.text, importedModuleSymbol, 
                        /* isExplicitlyImported? */ true, /* default import? */ false);
                    }
                    var typesToExport = [];
                    if (!exportDecl.exportClause) {
                        // export * from '...'
                        // Resolve the * into all value symbols exported, and update the export declaration.
                        // Explicitly spelled out exports (i.e. the exports of the current module) take precedence
                        // over implicit ones from export *. Use the current module's exports to filter.
                        var currentModuleSymbol = typeChecker.getSymbolAtLocation(sourceFile);
                        var currentModuleExports = currentModuleSymbol && currentModuleSymbol.exports;
                        if (!importedModuleSymbol) {
                            moduleTypeTranslator.error(exportDecl, "export * without module symbol");
                            return exportDecl;
                        }
                        var exportedSymbols = typeChecker.getExportsOfModule(importedModuleSymbol);
                        var exportSpecifiers = [];
                        try {
                            for (var exportedSymbols_1 = __values(exportedSymbols), exportedSymbols_1_1 = exportedSymbols_1.next(); !exportedSymbols_1_1.done; exportedSymbols_1_1 = exportedSymbols_1.next()) {
                                var sym = exportedSymbols_1_1.value;
                                if (currentModuleExports && currentModuleExports.has(sym.escapedName))
                                    continue;
                                // We might have already generated an export for the given symbol.
                                if (expandedStarImports.has(sym.name))
                                    continue;
                                expandedStarImports.add(sym.name);
                                // Only create an export specifier for values that are exported. For types, the code
                                // below creates specific export statements that match Closure's expectations.
                                if (shouldEmitValueExportForSymbol(sym)) {
                                    exportSpecifiers.push(ts.createExportSpecifier(undefined, sym.name));
                                }
                                else {
                                    typesToExport.push([sym.name, sym]);
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (exportedSymbols_1_1 && !exportedSymbols_1_1.done && (_a = exportedSymbols_1.return)) _a.call(exportedSymbols_1);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        exportDecl = ts.updateExportDeclaration(exportDecl, exportDecl.decorators, exportDecl.modifiers, ts.createNamedExports(exportSpecifiers), exportDecl.moduleSpecifier);
                    }
                    else {
                        try {
                            for (var _d = __values(exportDecl.exportClause.elements), _e = _d.next(); !_e.done; _e = _d.next()) {
                                var exp = _e.value;
                                var exportedName = transformerUtil.getIdentifierText(exp.name);
                                typesToExport.push([exportedName, moduleTypeTranslator.mustGetSymbolAtLocation(exp.name)]);
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                    }
                    // Do not emit typedef re-exports in untyped mode.
                    if (host.untyped)
                        return exportDecl;
                    var result = [exportDecl];
                    try {
                        for (var typesToExport_1 = __values(typesToExport), typesToExport_1_1 = typesToExport_1.next(); !typesToExport_1_1.done; typesToExport_1_1 = typesToExport_1.next()) {
                            var _f = __read(typesToExport_1_1.value, 2), exportedName = _f[0], sym = _f[1];
                            var aliasedSymbol = sym;
                            if (sym.flags & ts.SymbolFlags.Alias) {
                                aliasedSymbol = typeChecker.getAliasedSymbol(sym);
                            }
                            var isTypeAlias = (aliasedSymbol.flags & ts.SymbolFlags.Value) === 0 &&
                                (aliasedSymbol.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface)) !== 0;
                            if (!isTypeAlias)
                                continue;
                            var typeName = moduleTypeTranslator.symbolsToAliasedNames.get(aliasedSymbol) || aliasedSymbol.name;
                            var stmt = ts.createStatement(ts.createPropertyAccess(ts.createIdentifier('exports'), exportedName));
                            addCommentOn(stmt, [{ tagName: 'typedef', type: '!' + typeName }]);
                            ts.addSyntheticTrailingComment(stmt, ts.SyntaxKind.SingleLineCommentTrivia, ' re-export typedef', true);
                            result.push(stmt);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (typesToExport_1_1 && !typesToExport_1_1.done && (_c = typesToExport_1.return)) _c.call(typesToExport_1);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    return result;
                }
                /**
                 * Returns the identifiers exported in a single exported statement - typically just one
                 * identifier (e.g. for `export function foo()`), but multiple for `export declare var a, b`.
                 */
                function getExportDeclarationNames(node) {
                    switch (node.kind) {
                        case ts.SyntaxKind.VariableStatement:
                            var varDecl = node;
                            return varDecl.declarationList.declarations.map(function (d) { return getExportDeclarationNames(d)[0]; });
                        case ts.SyntaxKind.VariableDeclaration:
                        case ts.SyntaxKind.FunctionDeclaration:
                        case ts.SyntaxKind.InterfaceDeclaration:
                        case ts.SyntaxKind.ClassDeclaration:
                        case ts.SyntaxKind.ModuleDeclaration:
                        case ts.SyntaxKind.EnumDeclaration:
                            var decl = node;
                            if (!decl.name || decl.name.kind !== ts.SyntaxKind.Identifier) {
                                break;
                            }
                            return [decl.name];
                        case ts.SyntaxKind.TypeAliasDeclaration:
                            var typeAlias = node;
                            return [typeAlias.name];
                        default:
                            break;
                    }
                    moduleTypeTranslator.error(node, "unsupported export declaration " + ts.SyntaxKind[node.kind] + ": " + node.getText());
                    return [];
                }
                /**
                 * Ambient declarations declare types for TypeScript's benefit, and will be removede by
                 * TypeScript during its emit phase. Downstream Closure code however might be importing
                 * symbols from this module, so tsickle must emit a Closure-compatible exports declaration.
                 */
                function visitExportedAmbient(node) {
                    var e_9, _a;
                    if (host.untyped || !shouldEmitExportsAssignments())
                        return [node];
                    var declNames = getExportDeclarationNames(node);
                    var result = [node];
                    try {
                        for (var declNames_1 = __values(declNames), declNames_1_1 = declNames_1.next(); !declNames_1_1.done; declNames_1_1 = declNames_1.next()) {
                            var decl = declNames_1_1.value;
                            var sym = typeChecker.getSymbolAtLocation(decl);
                            var isValue = sym.flags & ts.SymbolFlags.Value;
                            // Non-value objects do not exist at runtime, so we cannot access the symbol (it only
                            // exists in externs). Export them as a typedef, which forwards to the type in externs.
                            // Note: TypeScript emits odd code for exported ambients (exports.x for variables, just x
                            // for everything else). That seems buggy, and in either case this code should not attempt
                            // to fix it.
                            // See also https://github.com/Microsoft/TypeScript/issues/8015.
                            if (!isValue) {
                                // Do not emit re-exports for ModuleDeclarations.
                                // Ambient ModuleDeclarations are always referenced as global symbols, so they don't
                                // need to be exported.
                                if (node.kind === ts.SyntaxKind.ModuleDeclaration)
                                    continue;
                                var mangledName = externs_1.moduleNameAsIdentifier(host, sourceFile.fileName);
                                var declName = transformerUtil.getIdentifierText(decl);
                                var stmt = ts.createStatement(ts.createPropertyAccess(ts.createIdentifier('exports'), declName));
                                addCommentOn(stmt, [{ tagName: 'typedef', type: "!" + mangledName + "." + declName }]);
                                result.push(stmt);
                            }
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (declNames_1_1 && !declNames_1_1.done && (_a = declNames_1.return)) _a.call(declNames_1);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    return result;
                }
                function visitor(node) {
                    if (isAmbient(node)) {
                        if (!transformerUtil.hasModifierFlag(node, ts.ModifierFlags.Export))
                            return node;
                        return visitExportedAmbient(node);
                    }
                    switch (node.kind) {
                        case ts.SyntaxKind.ImportDeclaration:
                            return visitImportDeclaration(node);
                        case ts.SyntaxKind.ExportDeclaration:
                            return visitExportDeclaration(node);
                        case ts.SyntaxKind.ClassDeclaration:
                            return visitClassDeclaration(node);
                        case ts.SyntaxKind.InterfaceDeclaration:
                            return visitInterfaceDeclaration(node);
                        case ts.SyntaxKind.HeritageClause:
                            return visitHeritageClause(node);
                        case ts.SyntaxKind.Constructor:
                        case ts.SyntaxKind.FunctionDeclaration:
                        case ts.SyntaxKind.MethodDeclaration:
                        case ts.SyntaxKind.GetAccessor:
                        case ts.SyntaxKind.SetAccessor:
                            return visitFunctionLikeDeclaration(node);
                        case ts.SyntaxKind.ThisKeyword:
                            return visitThisExpression(node);
                        case ts.SyntaxKind.VariableStatement:
                            return visitVariableStatement(node);
                        case ts.SyntaxKind.PropertyDeclaration:
                        case ts.SyntaxKind.PropertyAssignment:
                            escapeIllegalJSDoc(node);
                            break;
                        case ts.SyntaxKind.Parameter:
                            // Parameter properties (e.g. `constructor(/** docs */ private foo: string)`) might have
                            // JSDoc comments, including JSDoc tags recognized by Closure Compiler. Prevent emitting
                            // any comments on them, so that Closure doesn't error on them.
                            // See test_files/parameter_properties.ts.
                            var paramDecl = node;
                            if (transformerUtil.hasModifierFlag(paramDecl, ts.ModifierFlags.ParameterPropertyModifier)) {
                                ts.setSyntheticLeadingComments(paramDecl, []);
                                jsdoc.suppressLeadingCommentsRecursively(paramDecl);
                            }
                            break;
                        case ts.SyntaxKind.TypeAliasDeclaration:
                            return visitTypeAliasDeclaration(node);
                        case ts.SyntaxKind.AsExpression:
                        case ts.SyntaxKind.TypeAssertionExpression:
                            return visitAssertionExpression(node);
                        case ts.SyntaxKind.NonNullExpression:
                            return visitNonNullExpression(node);
                        default:
                            break;
                    }
                    return ts.visitEachChild(node, visitor, context);
                }
                sourceFile = ts.visitEachChild(sourceFile, visitor, context);
                return moduleTypeTranslator.insertForwardDeclares(sourceFile);
            };
        };
    }
    exports.jsdocTransformer = jsdocTransformer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNkb2NfdHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvanNkb2NfdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Ba0JHO0lBRUgscURBQW1EO0lBQ25ELCtDQUFpRDtJQUNqRCxtREFBMkM7SUFDM0MseUNBQWlDO0lBQ2pDLDZFQUE4RDtJQUM5RCw4REFBc0Q7SUFDdEQsK0RBQTZEO0lBQzdELDJDQUFtQztJQXVDbkMsc0JBQXNCLElBQWEsRUFBRSxJQUFpQixFQUFFLGVBQTZCO1FBQ25GLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDbEUsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1RCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0MsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxtQkFBMEIsSUFBYTtRQUNyQyxJQUFJLE9BQU8sR0FBc0IsSUFBSSxDQUFDO1FBQ3RDLE9BQU8sT0FBTyxFQUFFO1lBQ2QsSUFBSSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNwRixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztTQUMxQjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQVBELDhCQU9DO0lBS0Qsd0VBQXdFO0lBQ3hFLGdD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QU8sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFFRCxVQUFVLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUU3RCxPQUFPLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUNKLENBQUM7SUF6aUJELDRDQXlpQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBqc2RvY190cmFuc2Zvcm1lciBjb250YWlucyB0aGUgbG9naWMgdG8gYWRkIEpTRG9jIGNvbW1lbnRzIHRvIFR5cGVTY3JpcHQgY29kZS5cbiAqXG4gKiBPbmUgb2YgdHNpY2tsZSdzIGZlYXR1cmVzIGlzIHRvIGFkZCBDbG9zdXJlIENvbXBpbGVyIGNvbXBhdGlibGUgSlNEb2MgY29tbWVudHMgY29udGFpbmluZyB0eXBlXG4gKiBhbm5vdGF0aW9ucywgaW5oZXJpdGFuY2UgaW5mb3JtYXRpb24sIGV0Yy4sIG9udG8gVHlwZVNjcmlwdCBjb2RlLiBUaGlzIGFsbG93cyBDbG9zdXJlIENvbXBpbGVyIHRvXG4gKiBtYWtlIGJldHRlciBvcHRpbWl6YXRpb24gZGVjaXNpb25zIGNvbXBhcmVkIHRvIGFuIHVudHlwZWQgY29kZSBiYXNlLlxuICpcbiAqIFRoZSBlbnRyeSBwb2ludCB0byB0aGUgYW5ub3RhdGlvbiBvcGVyYXRpb24gaXMganNkb2NUcmFuc2Zvcm1lciBiZWxvdy4gSXQgYWRkcyBzeW50aGV0aWMgY29tbWVudHNcbiAqIHRvIGV4aXN0aW5nIFR5cGVTY3JpcHQgY29uc3RydWN0cywgZm9yIGV4YW1wbGU6XG4gKiAgICAgY29uc3QgeDogbnVtYmVyID0gMTtcbiAqIE1pZ2h0IGdldCB0cmFuc2Zvcm1lZCB0bzpcbiAqICAgICAvLi4gXFxAdHlwZSB7bnVtYmVyfSAuL1xuICogICAgIGNvbnN0IHg6IG51bWJlciA9IDE7XG4gKiBMYXRlciBUeXBlU2NyaXB0IHBoYXNlcyB0aGVuIHJlbW92ZSB0aGUgdHlwZSBhbm5vdGF0aW9uLCBhbmQgdGhlIGZpbmFsIGVtaXQgaXMgSmF2YVNjcmlwdCB0aGF0XG4gKiBvbmx5IGNvbnRhaW5zIHRoZSBKU0RvYyBjb21tZW50LlxuICpcbiAqIFRvIGhhbmRsZSBjZXJ0YWluIGNvbnN0cnVjdHMsIHRoaXMgdHJhbnNmb3JtZXIgYWxzbyBwZXJmb3JtcyBBU1QgdHJhbnNmb3JtYXRpb25zLCBlLmcuIGJ5IGFkZGluZ1xuICogQ29tbW9uSlMtc3R5bGUgZXhwb3J0cyBmb3IgdHlwZSBjb25zdHJ1Y3RzLCBleHBhbmRpbmcgYGV4cG9ydCAqYCwgcGFyZW50aGVzaXppbmcgY2FzdHMsIGV0Yy5cbiAqL1xuXG5pbXBvcnQge2hhc0V4cG9ydGluZ0RlY29yYXRvcn0gZnJvbSAnLi9kZWNvcmF0b3JzJztcbmltcG9ydCB7bW9kdWxlTmFtZUFzSWRlbnRpZmllcn0gZnJvbSAnLi9leHRlcm5zJztcbmltcG9ydCAqIGFzIGdvb2dtb2R1bGUgZnJvbSAnLi9nb29nbW9kdWxlJztcbmltcG9ydCAqIGFzIGpzZG9jIGZyb20gJy4vanNkb2MnO1xuaW1wb3J0IHtNb2R1bGVUeXBlVHJhbnNsYXRvcn0gZnJvbSAnLi9tb2R1bGVfdHlwZV90cmFuc2xhdG9yJztcbmltcG9ydCAqIGFzIHRyYW5zZm9ybWVyVXRpbCBmcm9tICcuL3RyYW5zZm9ybWVyX3V0aWwnO1xuaW1wb3J0IHtpc1ZhbGlkQ2xvc3VyZVByb3BlcnR5TmFtZX0gZnJvbSAnLi90eXBlX3RyYW5zbGF0b3InO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi90eXBlc2NyaXB0JztcblxuLyoqIEFubm90YXRvckhvc3QgY29udGFpbnMgaG9zdCBwcm9wZXJ0aWVzIGZvciB0aGUgSlNEb2MtYW5ub3RhdGlvbiBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbm5vdGF0b3JIb3N0IHtcbiAgLyoqXG4gICAqIElmIHByb3ZpZGVkIGEgZnVuY3Rpb24gdGhhdCBsb2dzIGFuIGludGVybmFsIHdhcm5pbmcuXG4gICAqIFRoZXNlIHdhcm5pbmdzIGFyZSBub3QgYWN0aW9uYWJsZSBieSBhbiBlbmQgdXNlciBhbmQgc2hvdWxkIGJlIGhpZGRlblxuICAgKiBieSBkZWZhdWx0LlxuICAgKi9cbiAgbG9nV2FybmluZz86ICh3YXJuaW5nOiB0cy5EaWFnbm9zdGljKSA9PiB2b2lkO1xuICBwYXRoVG9Nb2R1bGVOYW1lOiAoY29udGV4dDogc3RyaW5nLCBpbXBvcnRQYXRoOiBzdHJpbmcpID0+IHN0cmluZztcbiAgLyoqXG4gICAqIElmIHRydWUsIGNvbnZlcnQgZXZlcnkgdHlwZSB0byB0aGUgQ2xvc3VyZSB7P30gdHlwZSwgd2hpY2ggbWVhbnNcbiAgICogXCJkb24ndCBjaGVjayB0eXBlc1wiLlxuICAgKi9cbiAgdW50eXBlZD86IGJvb2xlYW47XG4gIC8qKiBJZiBwcm92aWRlZCwgYSBzZXQgb2YgcGF0aHMgd2hvc2UgdHlwZXMgc2hvdWxkIGFsd2F5cyBnZW5lcmF0ZSBhcyB7P30uICovXG4gIHR5cGVCbGFja0xpc3RQYXRocz86IFNldDxzdHJpbmc+O1xuICAvKipcbiAgICogQ29udmVydCBzaG9ydGhhbmQgXCIvaW5kZXhcIiBpbXBvcnRzIHRvIGZ1bGwgcGF0aCAoaW5jbHVkZSB0aGUgXCIvaW5kZXhcIikuXG4gICAqIEFubm90YXRpb24gd2lsbCBiZSBzbG93ZXIgYmVjYXVzZSBldmVyeSBpbXBvcnQgbXVzdCBiZSByZXNvbHZlZC5cbiAgICovXG4gIGNvbnZlcnRJbmRleEltcG9ydFNob3J0aGFuZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBJZiB0cnVlLCBtb2RpZnkgcXVvdGVzIGFyb3VuZCBwcm9wZXJ0eSBhY2Nlc3NvcnMgdG8gbWF0Y2ggdGhlIHR5cGUgZGVjbGFyYXRpb24uXG4gICAqL1xuICBlbmFibGVBdXRvUXVvdGluZz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRzaWNrbGUgc2hvdWxkIGluc2VydCBnb29nLnByb3ZpZGUoKSBjYWxscyBpbnRvIHRoZSBleHRlcm5zIGdlbmVyYXRlZCBmb3IgYC5kLnRzYCBmaWxlc1xuICAgKiB0aGF0IGFyZSBleHRlcm5hbCBtb2R1bGVzLlxuICAgKi9cbiAgcHJvdmlkZUV4dGVybmFsTW9kdWxlRHRzTmFtZXNwYWNlPzogYm9vbGVhbjtcblxuICAvKiogaG9zdCBhbGxvd3MgcmVzb2x2aW5nIGZpbGUgbmFtZXMgdG8gbW9kdWxlcy4gKi9cbiAgaG9zdDogdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3Q7XG4gIC8qKiBVc2VkIHRvZ2V0aGVyIHdpdGggdGhlIGhvc3QgZm9yIGZpbGUgbmFtZSAtPiBtb2R1bGUgbmFtZSByZXNvbHV0aW9uLiAqL1xuICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGFkZENvbW1lbnRPbihub2RlOiB0cy5Ob2RlLCB0YWdzOiBqc2RvYy5UYWdbXSwgZXNjYXBlRXh0cmFUYWdzPzogU2V0PHN0cmluZz4pIHtcbiAgY29uc3QgY29tbWVudCA9IGpzZG9jLnRvU3ludGhlc2l6ZWRDb21tZW50KHRhZ3MsIGVzY2FwZUV4dHJhVGFncyk7XG4gIGNvbnN0IGNvbW1lbnRzID0gdHMuZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKG5vZGUpIHx8IFtdO1xuICBjb21tZW50cy5wdXNoKGNvbW1lbnQpO1xuICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMobm9kZSwgY29tbWVudHMpO1xuICByZXR1cm4gY29tbWVudDtcbn1cblxuLyoqIEByZXR1cm4gdHJ1ZSBpZiBub2RlIGhhcyB0aGUgc3BlY2lmaWVkIG1vZGlmaWVyIGZsYWcgc2V0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQW1iaWVudChub2RlOiB0cy5Ob2RlKTogYm9vbGVhbiB7XG4gIGxldCBjdXJyZW50OiB0cy5Ob2RlfHVuZGVmaW5lZCA9IG5vZGU7XG4gIHdoaWxlIChjdXJyZW50KSB7XG4gICAgaWYgKHRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcoY3VycmVudCwgdHMuTW9kaWZpZXJGbGFncy5BbWJpZW50KSkgcmV0dXJuIHRydWU7XG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxudHlwZSBIYXNUeXBlUGFyYW1ldGVycyA9XG4gICAgdHMuSW50ZXJmYWNlRGVjbGFyYXRpb258dHMuQ2xhc3NMaWtlRGVjbGFyYXRpb258dHMuVHlwZUFsaWFzRGVjbGFyYXRpb258dHMuU2lnbmF0dXJlRGVjbGFyYXRpb247XG5cbi8qKiBBZGRzIGFuIFxcQHRlbXBsYXRlIGNsYXVzZSB0byBkb2NUYWdzIGlmIGRlY2wgaGFzIHR5cGUgcGFyYW1ldGVycy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUFkZFRlbXBsYXRlQ2xhdXNlKGRvY1RhZ3M6IGpzZG9jLlRhZ1tdLCBkZWNsOiBIYXNUeXBlUGFyYW1ldGVycykge1xuICBpZiAoIWRlY2wudHlwZVBhcmFtZXRlcnMpIHJldHVybjtcbiAgLy8gQ2xvc3VyZSBkb2VzIG5vdCBzdXBwb3J0IHRlbXBsYXRlIGNvbnN0cmFpbnRzIChUIGV4dGVuZHMgWCksIHRoZXNlIGFyZSBpZ25vcmVkIGJlbG93LlxuICBkb2NUYWdzLnB1c2goe1xuICAgIHRhZ05hbWU6ICd0ZW1wbGF0ZScsXG4gICAgdGV4dDogZGVjbC50eXBlUGFyYW1ldGVycy5tYXAodHAgPT4gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KHRwLm5hbWUpKS5qb2luKCcsICcpXG4gIH0pO1xufVxuXG4vKipcbiAqIEFkZHMgaGVyaXRhZ2UgY2xhdXNlcyAoXFxAZXh0ZW5kcywgXFxAaW1wbGVtZW50cykgdG8gdGhlIGdpdmVuIGRvY1RhZ3MgZm9yIGRlY2wuIFVzZWQgYnlcbiAqIGpzZG9jX3RyYW5zZm9ybWVyIGFuZCBleHRlcm5zIGdlbmVyYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUFkZEhlcml0YWdlQ2xhdXNlcyhcbiAgICBkb2NUYWdzOiBqc2RvYy5UYWdbXSwgbXR0OiBNb2R1bGVUeXBlVHJhbnNsYXRvcixcbiAgICBkZWNsOiB0cy5DbGFzc0xpa2VEZWNsYXJhdGlvbnx0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbikge1xuICBpZiAoIWRlY2wuaGVyaXRhZ2VDbGF1c2VzKSByZXR1cm47XG4gIGNvbnN0IGlzQ2xhc3MgPSBkZWNsLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjtcbiAgY29uc3QgY2xhc3NIYXNTdXBlckNsYXNzID1cbiAgICAgIGlzQ2xhc3MgJiYgZGVjbC5oZXJpdGFnZUNsYXVzZXMuc29tZShoYyA9PiBoYy50b2tlbiA9PT0gdHMuU3ludGF4S2luZC5FeHRlbmRzS2V5d29yZCk7XG4gIGZvciAoY29uc3QgaGVyaXRhZ2Ugb2YgZGVjbC5oZXJpdGFnZUNsYXVzZXMhKSB7XG4gICAgaWYgKCFoZXJpdGFnZS50eXBlcykgY29udGludWU7XG4gICAgaWYgKGlzQ2xhc3MgJiYgaGVyaXRhZ2UudG9rZW4gIT09IHRzLlN5bnRheEtpbmQuSW1wbGVtZW50c0tleXdvcmQgJiYgIWlzQW1iaWVudChkZWNsKSkge1xuICAgICAgLy8gSWYgYSBjbGFzcyBoYXMgXCJleHRlbmRzIEZvb1wiLCB0aGF0IGlzIHByZXNlcnZlZCBpbiB0aGUgRVM2IG91dHB1dFxuICAgICAgLy8gYW5kIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcuICBCdXQgaWYgaXQgaGFzIFwiaW1wbGVtZW50cyBGb29cIixcbiAgICAgIC8vIHRoYXQgaXMgYSBUUy1zcGVjaWZpYyB0aGluZyBhbmQgd2UgbmVlZCB0byB0cmFuc2xhdGUgaXQgdG8gdGhlXG4gICAgICAvLyB0aGUgQ2xvc3VyZSBcIkBpbXBsZW1lbnRzIHtGb299XCIuXG4gICAgICAvLyBIb3dldmVyIGZvciBhbWJpZW50IGRlY2xhcmF0aW9ucywgd2Ugb25seSBlbWl0IGV4dGVybnMsIGFuZCBpbiB0aG9zZSB3ZSBkbyBuZWVkIHRvXG4gICAgICAvLyBhZGQgXCJAZXh0ZW5kcyB7Rm9vfVwiIGFzIHRoZXkgdXNlIEVTNSBzeW50YXguXG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBpbXBsIG9mIGhlcml0YWdlLnR5cGVzKSB7XG4gICAgICBsZXQgdGFnTmFtZSA9IGRlY2wua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbiA/ICdleHRlbmRzJyA6ICdpbXBsZW1lbnRzJztcblxuICAgICAgY29uc3Qgc3ltID0gbXR0LnR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaW1wbC5leHByZXNzaW9uKTtcbiAgICAgIGlmICghc3ltKSB7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgZm9yIGEgY2xhc3MgZGVjbGFyYXRpb24gdG8gZXh0ZW5kIGFuIGV4cHJlc3Npb24gdGhhdFxuICAgICAgICAvLyBkb2VzIG5vdCBoYXZlIGhhdmUgYSBzeW1ib2wsIGZvciBleGFtcGxlIHdoZW4gYSBtaXhpbiBmdW5jdGlvbiBpc1xuICAgICAgICAvLyB1c2VkIHRvIGJ1aWxkIGEgYmFzZSBjbGFzcywgYXMgaW4gYGRlY2xhcmUgTXlDbGFzcyBleHRlbmRzXG4gICAgICAgIC8vIE15TWl4aW4oTXlCYXNlQ2xhc3MpYC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSGFuZGxpbmcgdGhpcyBjb3JyZWN0bHkgaXMgdHJpY2t5LiBDbG9zdXJlIHRocm93cyBvbiB0aGlzXG4gICAgICAgIC8vIGBleHRlbmRzIDxleHByZXNzaW9uPmAgc3ludGF4IChzZWVcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWNvbXBpbGVyL2lzc3Vlcy8yMTgyKS4gV2Ugd291bGRcbiAgICAgICAgLy8gcHJvYmFibHkgbmVlZCB0byBnZW5lcmF0ZSBhbiBpbnRlcm1lZGlhdGUgY2xhc3MgZGVjbGFyYXRpb24gYW5kXG4gICAgICAgIC8vIGV4dGVuZCB0aGF0LiBGb3Igbm93LCBqdXN0IG9taXQgdGhlIGBleHRlbmRzYCBhbm5vdGF0aW9uLlxuICAgICAgICBtdHQuZGVidWdXYXJuKGRlY2wsIGBjb3VsZCBub3QgcmVzb2x2ZSBzdXBlcnR5cGU6ICR7aW1wbC5nZXRUZXh0KCl9YCk7XG4gICAgICAgIGRvY1RhZ3MucHVzaCh7XG4gICAgICAgICAgdGFnTmFtZTogJycsXG4gICAgICAgICAgdGV4dDogJ05PVEU6IHRzaWNrbGUgY291bGQgbm90IHJlc29sdmUgc3VwZXJ0eXBlLCAnICtcbiAgICAgICAgICAgICAgJ2NsYXNzIGRlZmluaXRpb24gbWF5IGJlIGluY29tcGxldGUuXFxuJ1xuICAgICAgICB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBsZXQgYWxpYXM6IHRzLlN5bWJvbCA9IHN5bTtcbiAgICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5UeXBlQWxpYXMpIHtcbiAgICAgICAgLy8gSXQncyBpbXBsZW1lbnRpbmcgYSB0eXBlIGFsaWFzLiAgRm9sbG93IHRoZSB0eXBlIGFsaWFzIGJhY2tcbiAgICAgICAgLy8gdG8gdGhlIG9yaWdpbmFsIHN5bWJvbCB0byBjaGVjayB3aGV0aGVyIGl0J3MgYSB0eXBlIG9yIGEgdmFsdWUuXG4gICAgICAgIGNvbnN0IHR5cGUgPSBtdHQudHlwZUNoZWNrZXIuZ2V0RGVjbGFyZWRUeXBlT2ZTeW1ib2woc3ltKTtcbiAgICAgICAgaWYgKCF0eXBlLnN5bWJvbCkge1xuICAgICAgICAgIC8vIEl0J3Mgbm90IGNsZWFyIHdoZW4gdGhpcyBjYW4gaGFwcGVuLCBidXQgaWYgaXQgZG9lcyBhbGwgd2VcbiAgICAgICAgICAvLyBkbyBpcyBmYWlsIHRvIGVtaXQgdGhlIEBpbXBsZW1lbnRzLCB3aGljaCBpc24ndCBzbyBoYXJtZnVsLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGFsaWFzID0gdHlwZS5zeW1ib2w7XG4gICAgICB9XG4gICAgICBpZiAoYWxpYXMuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgICBhbGlhcyA9IG10dC50eXBlQ2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKGFsaWFzKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHR5cGVUcmFuc2xhdG9yID0gbXR0Lm5ld1R5cGVUcmFuc2xhdG9yKGltcGwuZXhwcmVzc2lvbik7XG4gICAgICBpZiAodHlwZVRyYW5zbGF0b3IuaXNCbGFja0xpc3RlZChhbGlhcykpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyBXZSBjYW4gb25seSBAaW1wbGVtZW50cyBhbiBpbnRlcmZhY2UsIG5vdCBhIGNsYXNzLlxuICAgICAgLy8gQnV0IGl0J3MgZmluZSB0byB0cmFuc2xhdGUgVFMgXCJpbXBsZW1lbnRzIENsYXNzXCIgaW50byBDbG9zdXJlXG4gICAgICAvLyBcIkBleHRlbmRzIHtDbGFzc31cIiBiZWNhdXNlIHRoaXMgaXMganVzdCBhIHR5cGUgaGludC5cbiAgICAgIGlmIChhbGlhcy5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkNsYXNzKSB7XG4gICAgICAgIGlmICghaXNDbGFzcykge1xuICAgICAgICAgIC8vIE9ubHkgY2xhc3NlcyBjYW4gZXh0ZW5kIGNsYXNzZXMgaW4gVFMuIElnbm9yaW5nIHRoZSBoZXJpdGFnZSBjbGF1c2Ugc2hvdWxkIGJlIHNhZmUsXG4gICAgICAgICAgLy8gYXMgaW50ZXJmYWNlcyBhcmUgQHJlY29yZCBhbnl3YXksIHNvIHNob3VsZCBwcmV2ZW50IHByb3BlcnR5IGRpc2FtYmlndWF0aW9uLlxuXG4gICAgICAgICAgLy8gUHJvYmxlbTogdmFsaWRhdGUgdGhhdCBtZXRob2RzIGFyZSB0aGVyZT9cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2xhc3NIYXNTdXBlckNsYXNzICYmIGhlcml0YWdlLnRva2VuICE9PSB0cy5TeW50YXhLaW5kLkV4dGVuZHNLZXl3b3JkKSB7XG4gICAgICAgICAgLy8gRG8gbm90IGVtaXQgYW4gQGV4dGVuZHMgZm9yIGEgY2xhc3MgdGhhdCBhbHJlYWR5IGhhcyBhIHByb3BlciBFUzYgZXh0ZW5kcyBjbGFzcy4gVGhpc1xuICAgICAgICAgIC8vIHJpc2tzIGluY29ycmVjdCBvcHRpbWl6YXRpb24sIGFzIEBleHRlbmRzIHRha2VzIHByZWNlZGVuY2UsIGFuZCBDbG9zdXJlIHdvbid0IGJlXG4gICAgICAgICAgLy8gYXdhcmUgb2YgdGhlIGFjdHVhbCB0eXBlIGhpZXJhcmNoeSBvZiB0aGUgY2xhc3MuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdGFnTmFtZSA9ICdleHRlbmRzJztcbiAgICAgIH0gZWxzZSBpZiAoYWxpYXMuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkge1xuICAgICAgICAvLyBJZiB0aGUgc3ltYm9sIHdhcyBhbHJlYWR5IGluIHRoZSB2YWx1ZSBuYW1lc3BhY2UsIHRoZW4gaXQgd2lsbFxuICAgICAgICAvLyBub3QgYmUgYSB0eXBlIGluIHRoZSBDbG9zdXJlIG91dHB1dCAoYmVjYXVzZSBDbG9zdXJlIGNvbGxhcHNlc1xuICAgICAgICAvLyB0aGUgdHlwZSBhbmQgdmFsdWUgbmFtZXNwYWNlcykuICBKdXN0IGlnbm9yZSB0aGUgaW1wbGVtZW50cy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAvLyB0eXBlVG9DbG9zdXJlIGluY2x1ZGVzIG51bGxhYmlsaXR5IG1vZGlmaWVycywgc28gY2FsbCBzeW1ib2xUb1N0cmluZyBkaXJlY3RseSBoZXJlLlxuICAgICAgZG9jVGFncy5wdXNoKHt0YWdOYW1lLCB0eXBlOiB0eXBlVHJhbnNsYXRvci5zeW1ib2xUb1N0cmluZyhhbGlhcywgdHJ1ZSl9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24gZW1pdHMgdGhlIHR5cGUgYW5ub3RhdGlvbnMgZm9yIG1lbWJlcnMgb2YgYSBjbGFzcy4gSXQncyBuZWNlc3NhcnkgaW5cbiAqIHRoZSBjYXNlIHdoZXJlIFR5cGVTY3JpcHQgc3ludGF4IHNwZWNpZmllcyB0aGVyZSBhcmUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIG9uIHRoZSBjbGFzcywgYmVjYXVzZVxuICogdG8gZGVjbGFyZSB0aGVzZSBpbiBDbG9zdXJlIHlvdSBtdXN0IGRlY2xhcmUgdGhlc2Ugc2VwYXJhdGVseSBmcm9tIHRoZSBjbGFzcy5cbiAqXG4gKiBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24gcHJvZHVjZXMgYW4gaWYgKGZhbHNlKSBzdGF0ZW1lbnQgY29udGFpbmluZyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMsIG9yXG4gKiBudWxsIGlmIG5vIGRlY2xhcmF0aW9ucyBjb3VsZCBvciBuZWVkZWQgdG8gYmUgZ2VuZXJhdGVkIChlLmcuIG5vIG1lbWJlcnMsIG9yIGFuIHVubmFtZWQgdHlwZSkuXG4gKiBUaGUgaWYgc3RhdGVtZW50IGlzIHVzZWQgdG8gbWFrZSBzdXJlIHRoZSBjb2RlIGlzIG5vdCBleGVjdXRlZCwgb3RoZXJ3aXNlIHByb3BlcnR5IGFjY2Vzc2VzIGNvdWxkXG4gKiB0cmlnZ2VyIGdldHRlcnMgb24gYSBzdXBlcmNsYXNzLiBTZWUgdGVzdF9maWxlcy9maWVsZHMvZmllbGRzLnRzOkJhc2VUaGF0VGhyb3dzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24oXG4gICAgbXR0OiBNb2R1bGVUeXBlVHJhbnNsYXRvcixcbiAgICB0eXBlRGVjbDogdHMuQ2xhc3NEZWNsYXJhdGlvbnx0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbik6IHRzLklmU3RhdGVtZW50fG51bGwge1xuICAvLyBHYXRoZXIgcGFyYW1ldGVyIHByb3BlcnRpZXMgZnJvbSB0aGUgY29uc3RydWN0b3IsIGlmIGl0IGV4aXN0cy5cbiAgY29uc3QgY3RvcnM6IHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb25bXSA9IFtdO1xuICBsZXQgcGFyYW1Qcm9wczogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb25bXSA9IFtdO1xuICBjb25zdCBub25TdGF0aWNQcm9wczogQXJyYXk8dHMuUHJvcGVydHlEZWNsYXJhdGlvbnx0cy5Qcm9wZXJ0eVNpZ25hdHVyZT4gPSBbXTtcbiAgY29uc3Qgc3RhdGljUHJvcHM6IEFycmF5PHRzLlByb3BlcnR5RGVjbGFyYXRpb258dHMuUHJvcGVydHlTaWduYXR1cmU+ID0gW107XG4gIGNvbnN0IHVuaGFuZGxlZDogdHMuTmFtZWREZWNsYXJhdGlvbltdID0gW107XG4gIGNvbnN0IGFic3RyYWN0TWV0aG9kczogdHMuRnVuY3Rpb25MaWtlRGVjbGFyYXRpb25bXSA9IFtdO1xuICBmb3IgKGNvbnN0IG1lbWJlciBvZiB0eXBlRGVjbC5tZW1iZXJzKSB7XG4gICAgaWYgKG1lbWJlci5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XG4gICAgICBjdG9ycy5wdXNoKG1lbWJlciBhcyB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlEZWNsYXJhdGlvbihtZW1iZXIpIHx8IHRzLmlzUHJvcGVydHlTaWduYXR1cmUobWVtYmVyKSkge1xuICAgICAgY29uc3QgaXNTdGF0aWMgPSB0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKG1lbWJlciwgdHMuTW9kaWZpZXJGbGFncy5TdGF0aWMpO1xuICAgICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICAgIHN0YXRpY1Byb3BzLnB1c2gobWVtYmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vblN0YXRpY1Byb3BzLnB1c2gobWVtYmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICBtZW1iZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbiB8fFxuICAgICAgICBtZW1iZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2RTaWduYXR1cmUgfHxcbiAgICAgICAgbWVtYmVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuR2V0QWNjZXNzb3IgfHwgbWVtYmVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3IpIHtcbiAgICAgIGlmICh0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKG1lbWJlciwgdHMuTW9kaWZpZXJGbGFncy5BYnN0cmFjdCkgfHxcbiAgICAgICAgICB0cy5pc0ludGVyZmFjZURlY2xhcmF0aW9uKHR5cGVEZWNsKSkge1xuICAgICAgICBhYnN0cmFjdE1ldGhvZHMucHVzaChcbiAgICAgICAgICAgIG1lbWJlciBhcyB0cy5NZXRob2REZWNsYXJhdGlvbiB8IHRzLkdldEFjY2Vzc29yRGVjbGFyYXRpb24gfCB0cy5TZXRBY2Nlc3NvckRlY2xhcmF0aW9uKTtcbiAgICAgIH1cbiAgICAgIC8vIE5vbi1hYnN0cmFjdCBtZXRob2RzIG9ubHkgZXhpc3Qgb24gY2xhc3NlcywgYW5kIGFyZSBoYW5kbGVkIGluIHJlZ3VsYXIgZW1pdC5cbiAgICB9IGVsc2Uge1xuICAgICAgdW5oYW5kbGVkLnB1c2gobWVtYmVyKTtcbiAgICB9XG4gIH1cblxuICBpZiAoY3RvcnMubGVuZ3RoID4gMCkge1xuICAgIC8vIE9ubHkgdGhlIGFjdHVhbCBjb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggbXVzdCBiZSBsYXN0IGluIGEgcG90ZW50aWFsIHNlcXVlbmNlIG9mXG4gICAgLy8gb3ZlcmxvYWRlZCBjb25zdHJ1Y3RvcnMsIG1heSBjb250YWluIHBhcmFtZXRlciBwcm9wZXJ0aWVzLlxuICAgIGNvbnN0IGN0b3IgPSBjdG9yc1tjdG9ycy5sZW5ndGggLSAxXTtcbiAgICBwYXJhbVByb3BzID0gY3Rvci5wYXJhbWV0ZXJzLmZpbHRlcihcbiAgICAgICAgcCA9PiB0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKHAsIHRzLk1vZGlmaWVyRmxhZ3MuUGFyYW1ldGVyUHJvcGVydHlNb2RpZmllcikpO1xuICB9XG5cbiAgaWYgKG5vblN0YXRpY1Byb3BzLmxlbmd0aCA9PT0gMCAmJiBwYXJhbVByb3BzLmxlbmd0aCA9PT0gMCAmJiBzdGF0aWNQcm9wcy5sZW5ndGggPT09IDAgJiZcbiAgICAgIGFic3RyYWN0TWV0aG9kcy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBUaGVyZSBhcmUgbm8gbWVtYmVycyBzbyB3ZSBkb24ndCBuZWVkIHRvIGVtaXQgYW55IHR5cGVcbiAgICAvLyBhbm5vdGF0aW9ucyBoZWxwZXIuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoIXR5cGVEZWNsLm5hbWUpIHtcbiAgICBtdHQuZGVidWdXYXJuKHR5cGVEZWNsLCAnY2Fubm90IGFkZCB0eXBlcyBvbiB1bm5hbWVkIGRlY2xhcmF0aW9ucycpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY2xhc3NOYW1lID0gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KHR5cGVEZWNsLm5hbWUpO1xuICBjb25zdCBzdGF0aWNQcm9wQWNjZXNzID0gdHMuY3JlYXRlSWRlbnRpZmllcihjbGFzc05hbWUpO1xuICBjb25zdCBpbnN0YW5jZVByb3BBY2Nlc3MgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhzdGF0aWNQcm9wQWNjZXNzLCAncHJvdG90eXBlJyk7XG4gIC8vIENsb3N1cmUgQ29tcGlsZXIgd2lsbCByZXBvcnQgY29uZm9ybWFuY2UgZXJyb3JzIGFib3V0IHRoaXMgYmVpbmcgdW5rbm93biB0eXBlIHdoZW4gZW1pdHRpbmdcbiAgLy8gY2xhc3MgcHJvcGVydGllcyBhcyB7P3x1bmRlZmluZWR9LCBpbnN0ZWFkIG9mIGp1c3Qgez99LiBTbyBtYWtlIHN1cmUgdG8gb25seSBlbWl0IHs/fHVuZGVmaW5lZH1cbiAgLy8gb24gaW50ZXJmYWNlcy5cbiAgY29uc3QgaXNJbnRlcmZhY2UgPSB0cy5pc0ludGVyZmFjZURlY2xhcmF0aW9uKHR5cGVEZWNsKTtcbiAgY29uc3QgcHJvcGVydHlEZWNscyA9IHN0YXRpY1Byb3BzLm1hcChcbiAgICAgIHAgPT4gY3JlYXRlQ2xvc3VyZVByb3BlcnR5RGVjbGFyYXRpb24oXG4gICAgICAgICAgbXR0LCBzdGF0aWNQcm9wQWNjZXNzLCBwLCBpc0ludGVyZmFjZSAmJiAhIXAucXVlc3Rpb25Ub2tlbikpO1xuICBwcm9wZXJ0eURlY2xzLnB1c2goLi4uWy4uLm5vblN0YXRpY1Byb3BzLCAuLi5wYXJhbVByb3BzXS5tYXAoXG4gICAgICBwID0+IGNyZWF0ZUNsb3N1cmVQcm9wZXJ0eURlY2xhcmF0aW9uKFxuICAgICAgICAgIG10dCwgaW5zdGFuY2VQcm9wQWNjZXNzLCBwLCBpc0ludGVyZmFjZSAmJiAhIXAucXVlc3Rpb25Ub2tlbikpKTtcbiAgcHJvcGVydHlEZWNscy5wdXNoKC4uLnVuaGFuZGxlZC5tYXAoXG4gICAgICBwID0+IHRyYW5zZm9ybWVyVXRpbC5jcmVhdGVNdWx0aUxpbmVDb21tZW50KFxuICAgICAgICAgIHAsIGBTa2lwcGluZyB1bmhhbmRsZWQgbWVtYmVyOiAke2VzY2FwZUZvckNvbW1lbnQocC5nZXRUZXh0KCkpfWApKSk7XG5cbiAgZm9yIChjb25zdCBmbkRlY2wgb2YgYWJzdHJhY3RNZXRob2RzKSB7XG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZShmbkRlY2wpO1xuICAgIGlmICghbmFtZSkge1xuICAgICAgbXR0LmVycm9yKGZuRGVjbCwgJ2Fub255bW91cyBhYnN0cmFjdCBmdW5jdGlvbicpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHt0YWdzLCBwYXJhbWV0ZXJOYW1lc30gPSBtdHQuZ2V0RnVuY3Rpb25UeXBlSlNEb2MoW2ZuRGVjbF0sIFtdKTtcbiAgICBpZiAoaGFzRXhwb3J0aW5nRGVjb3JhdG9yKGZuRGVjbCwgbXR0LnR5cGVDaGVja2VyKSkgdGFncy5wdXNoKHt0YWdOYW1lOiAnZXhwb3J0J30pO1xuICAgIC8vIG1lbWJlck5hbWVzcGFjZSBiZWNhdXNlIGFic3RyYWN0IG1ldGhvZHMgY2Fubm90IGJlIHN0YXRpYyBpbiBUeXBlU2NyaXB0LlxuICAgIGNvbnN0IGFic3RyYWN0Rm5EZWNsID0gdHMuY3JlYXRlU3RhdGVtZW50KHRzLmNyZWF0ZUFzc2lnbm1lbnQoXG4gICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKGluc3RhbmNlUHJvcEFjY2VzcywgbmFtZSksXG4gICAgICAgIHRzLmNyZWF0ZUZ1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBhc3RlcmlzayAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBuYW1lICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHBhcmFtZXRlck5hbWVzLm1hcChcbiAgICAgICAgICAgICAgICBuID0+IHRzLmNyZWF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIC8qIGRvdERvdERvdCAqLyB1bmRlZmluZWQsIG4pKSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRzLmNyZWF0ZUJsb2NrKFtdKSxcbiAgICAgICAgICAgICkpKTtcbiAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoYWJzdHJhY3RGbkRlY2wsIFtqc2RvYy50b1N5bnRoZXNpemVkQ29tbWVudCh0YWdzKV0pO1xuICAgIHByb3BlcnR5RGVjbHMucHVzaCh0cy5zZXRTb3VyY2VNYXBSYW5nZShhYnN0cmFjdEZuRGVjbCwgZm5EZWNsKSk7XG4gIH1cblxuICAvLyBTZWUgdGVzdF9maWxlcy9maWVsZHMvZmllbGRzLnRzOkJhc2VUaGF0VGhyb3dzIGZvciBhIG5vdGUgb24gdGhpcyB3cmFwcGVyLlxuICByZXR1cm4gdHMuY3JlYXRlSWYodHMuY3JlYXRlTGl0ZXJhbChmYWxzZSksIHRzLmNyZWF0ZUJsb2NrKHByb3BlcnR5RGVjbHMsIHRydWUpKTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlOYW1lKHByb3A6IHRzLk5hbWVkRGVjbGFyYXRpb24pOiBzdHJpbmd8bnVsbCB7XG4gIGlmICghcHJvcC5uYW1lKSByZXR1cm4gbnVsbDtcblxuICBzd2l0Y2ggKHByb3AubmFtZS5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICByZXR1cm4gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KHByb3AubmFtZSBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgIC8vIEUuZy4gaW50ZXJmYWNlIEZvbyB7ICdiYXInOiBudW1iZXI7IH1cbiAgICAgIC8vIElmICdiYXInIGlzIGEgbmFtZSB0aGF0IGlzIG5vdCB2YWxpZCBpbiBDbG9zdXJlIHRoZW4gdGhlcmUncyBub3RoaW5nIHdlIGNhbiBkby5cbiAgICAgIGNvbnN0IHRleHQgPSAocHJvcC5uYW1lIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgICBpZiAoIWlzVmFsaWRDbG9zdXJlUHJvcGVydHlOYW1lKHRleHQpKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogUmVtb3ZlcyBjb21tZW50IG1ldGFjaGFyYWN0ZXJzIGZyb20gYSBzdHJpbmcsIHRvIG1ha2UgaXQgc2FmZSB0byBlbWJlZCBpbiBhIGNvbW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRm9yQ29tbWVudChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwvXFwqL2csICdfXycpLnJlcGxhY2UoL1xcKlxcLy9nLCAnX18nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xvc3VyZVByb3BlcnR5RGVjbGFyYXRpb24oXG4gICAgbXR0OiBNb2R1bGVUeXBlVHJhbnNsYXRvciwgZXhwcjogdHMuRXhwcmVzc2lvbixcbiAgICBwcm9wOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9ufHRzLlByb3BlcnR5U2lnbmF0dXJlfHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uLFxuICAgIG9wdGlvbmFsOiBib29sZWFuKTogdHMuU3RhdGVtZW50IHtcbiAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZShwcm9wKTtcbiAgaWYgKCFuYW1lKSB7XG4gICAgbXR0LmRlYnVnV2Fybihwcm9wLCBgaGFuZGxlIHVubmFtZWQgbWVtYmVyOlxcbiR7ZXNjYXBlRm9yQ29tbWVudChwcm9wLmdldFRleHQoKSl9YCk7XG4gICAgcmV0dXJuIHRyYW5zZm9ybWVyVXRpbC5jcmVhdGVNdWx0aUxpbmVDb21tZW50KFxuICAgICAgICBwcm9wLCBgU2tpcHBpbmcgdW5uYW1lZCBtZW1iZXI6XFxuJHtlc2NhcGVGb3JDb21tZW50KHByb3AuZ2V0VGV4dCgpKX1gKTtcbiAgfVxuXG4gIGxldCB0eXBlID0gbXR0LnR5cGVUb0Nsb3N1cmUocHJvcCk7XG4gIC8vIFdoZW4gYSBwcm9wZXJ0eSBpcyBvcHRpb25hbCwgZS5nLlxuICAvLyAgIGZvbz86IHN0cmluZztcbiAgLy8gVGhlbiB0aGUgVHlwZVNjcmlwdCB0eXBlIG9mIHRoZSBwcm9wZXJ0eSBpcyBzdHJpbmd8dW5kZWZpbmVkLCB0aGVcbiAgLy8gdHlwZVRvQ2xvc3VyZSB0cmFuc2xhdGlvbiBoYW5kbGVzIGl0IGNvcnJlY3RseSwgYW5kIHN0cmluZ3x1bmRlZmluZWQgaXNcbiAgLy8gaG93IHlvdSB3cml0ZSBhbiBvcHRpb25hbCBwcm9wZXJ0eSBpbiBDbG9zdXJlLlxuICAvL1xuICAvLyBCdXQgaW4gdGhlIHNwZWNpYWwgY2FzZSBvZiBhbiBvcHRpb25hbCBwcm9wZXJ0eSB3aXRoIHR5cGUgYW55OlxuICAvLyAgIGZvbz86IGFueTtcbiAgLy8gVGhlIFR5cGVTY3JpcHQgdHlwZSBvZiB0aGUgcHJvcGVydHkgaXMganVzdCBcImFueVwiIChiZWNhdXNlIGFueSBpbmNsdWRlc1xuICAvLyB1bmRlZmluZWQgYXMgd2VsbCkgc28gb3VyIGRlZmF1bHQgdHJhbnNsYXRpb24gb2YgdGhlIHR5cGUgaXMganVzdCBcIj9cIi5cbiAgLy8gVG8gbWFyayB0aGUgcHJvcGVydHkgYXMgb3B0aW9uYWwgaW4gQ2xvc3VyZSBpdCBtdXN0IGhhdmUgXCJ8dW5kZWZpbmVkXCIsXG4gIC8vIHNvIHRoZSBDbG9zdXJlIHR5cGUgbXVzdCBiZSA/fHVuZGVmaW5lZC5cbiAgaWYgKG9wdGlvbmFsICYmIHR5cGUgPT09ICc/JykgdHlwZSArPSAnfHVuZGVmaW5lZCc7XG5cbiAgY29uc3QgdGFncyA9IG10dC5nZXRKU0RvYyhwcm9wLCAvKiByZXBvcnRXYXJuaW5ncyAqLyB0cnVlKTtcbiAgdGFncy5wdXNoKHt0YWdOYW1lOiAndHlwZScsIHR5cGV9KTtcbiAgaWYgKGhhc0V4cG9ydGluZ0RlY29yYXRvcihwcm9wLCBtdHQudHlwZUNoZWNrZXIpKSB7XG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiAnZXhwb3J0J30pO1xuICB9XG4gIGNvbnN0IGRlY2xTdG10ID1cbiAgICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKHRzLmNyZWF0ZVN0YXRlbWVudCh0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhleHByLCBuYW1lKSksIHByb3ApO1xuICAvLyBBdm9pZCBwcmludGluZyBhbm5vdGF0aW9ucyB0aGF0IGNhbiBjb25mbGljdCB3aXRoIEB0eXBlXG4gIC8vIFRoaXMgYXZvaWRzIENsb3N1cmUncyBlcnJvciBcInR5cGUgYW5ub3RhdGlvbiBpbmNvbXBhdGlibGUgd2l0aCBvdGhlciBhbm5vdGF0aW9uc1wiXG4gIGFkZENvbW1lbnRPbihkZWNsU3RtdCwgdGFncywganNkb2MuVEFHU19DT05GTElDVElOR19XSVRIX1RZUEUpO1xuICByZXR1cm4gZGVjbFN0bXQ7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbnkgdHlwZSBhc3NlcnRpb25zIGFuZCBub24tbnVsbCBleHByZXNzaW9ucyBmcm9tIHRoZSBBU1QgYmVmb3JlIFR5cGVTY3JpcHQgcHJvY2Vzc2luZy5cbiAqXG4gKiBJZGVhbGx5LCB0aGUgY29kZSBpbiBqc2RvY190cmFuc2Zvcm1lciBiZWxvdyBzaG91bGQganVzdCByZW1vdmUgdGhlIGNhc3QgZXhwcmVzc2lvbiBhbmRcbiAqIHJlcGxhY2UgaXQgd2l0aCB0aGUgQ2xvc3VyZSBlcXVpdmFsZW50LiBIb3dldmVyIEFuZ3VsYXIncyBjb21waWxlciBpcyBmcmFnaWxlIHRvIEFTVFxuICogbm9kZXMgYmVpbmcgcmVtb3ZlZCBvciBjaGFuZ2luZyB0eXBlLCBzbyB0aGUgY29kZSBtdXN0IHJldGFpbiB0aGUgdHlwZSBhc3NlcnRpb25cbiAqIGV4cHJlc3Npb24sIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjQ4OTUuXG4gKlxuICogdHNpY2tsZSBhbHNvIGNhbm5vdCBqdXN0IGdlbmVyYXRlIGFuZCBrZWVwIGEgYCgvLi4gQHR5cGUge1NvbWVUeXBlfSAuLyAoZXhwciBhcyBTb21lVHlwZSkpYFxuICogYmVjYXVzZSBUeXBlU2NyaXB0IHJlbW92ZXMgdGhlIHBhcmVudGhlc2l6ZWQgZXhwcmVzc2lvbnMgaW4gdGhhdCBzeW50YXgsIChyZWFzb25hYmx5KSBiZWxpZXZpbmdcbiAqIHRoZXkgd2VyZSBvbmx5IGFkZGVkIGZvciB0aGUgVFMgY2FzdC5cbiAqXG4gKiBUaGUgZmluYWwgd29ya2Fyb3VuZCBpcyB0aGVuIHRvIGtlZXAgdGhlIFR5cGVTY3JpcHQgdHlwZSBhc3NlcnRpb25zLCBhbmQgaGF2ZSBhIHBvc3QtQW5ndWxhclxuICogcHJvY2Vzc2luZyBzdGVwIHRoYXQgcmVtb3ZlcyB0aGUgYXNzZXJ0aW9ucyBiZWZvcmUgVHlwZVNjcmlwdCBzZWVzIHRoZW0uXG4gKlxuICogVE9ETyhtYXJ0aW5wcm9ic3QpOiByZW1vdmUgb25jZSB0aGUgQW5ndWxhciBpc3N1ZSBpcyBmaXhlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVR5cGVBc3NlcnRpb25zKCk6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB7XG4gICAgcmV0dXJuIChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgICBmdW5jdGlvbiB2aXNpdG9yKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlIHtcbiAgICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZUFzc2VydGlvbkV4cHJlc3Npb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFzRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB0cy52aXNpdE5vZGUoKG5vZGUgYXMgdHMuQXNzZXJ0aW9uRXhwcmVzc2lvbikuZXhwcmVzc2lvbiwgdmlzaXRvcik7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5vbk51bGxFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRzLnZpc2l0Tm9kZSgobm9kZSBhcyB0cy5Ob25OdWxsRXhwcmVzc2lvbikuZXhwcmVzc2lvbiwgdmlzaXRvcik7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZpc2l0b3Ioc291cmNlRmlsZSkgYXMgdHMuU291cmNlRmlsZTtcbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIGpzZG9jVHJhbnNmb3JtZXIgcmV0dXJucyBhIHRyYW5zZm9ybWVyIGZhY3RvcnkgdGhhdCBjb252ZXJ0cyBUeXBlU2NyaXB0IHR5cGVzIGludG8gdGhlIGVxdWl2YWxlbnRcbiAqIEpTRG9jIGFubm90YXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24ganNkb2NUcmFuc2Zvcm1lcihcbiAgICBob3N0OiBBbm5vdGF0b3JIb3N0LCB0c09wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucywgdHNIb3N0OiB0cy5Db21waWxlckhvc3QsXG4gICAgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdKTpcbiAgICAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB0cy5UcmFuc2Zvcm1lcjx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTogdHMuVHJhbnNmb3JtZXI8dHMuU291cmNlRmlsZT4gPT4ge1xuICAgIHJldHVybiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlVHlwZVRyYW5zbGF0b3IgPSBuZXcgTW9kdWxlVHlwZVRyYW5zbGF0b3IoXG4gICAgICAgICAgc291cmNlRmlsZSwgdHlwZUNoZWNrZXIsIGhvc3QsIGRpYWdub3N0aWNzLCAvKmlzRm9yRXh0ZXJucyovIGZhbHNlKTtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIHNldCBvZiBhbGwgbmFtZXMgZXhwb3J0ZWQgZnJvbSBhbiBleHBvcnQgKiBpbiB0aGUgY3VycmVudCBtb2R1bGUuIFVzZWQgdG8gcHJldmVudFxuICAgICAgICogZW1pdHRpbmcgZHVwbGljYXRlZCBleHBvcnRzLiBUaGUgZmlyc3QgZXhwb3J0ICogdGFrZXMgcHJlY2VkZW5jZSBpbiBFUzYuXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGV4cGFuZGVkU3RhckltcG9ydHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgICAgLyoqXG4gICAgICAgKiBXaGlsZSBDbG9zdXJlIGNvbXBpbGVyIHN1cHBvcnRzIHBhcmFtZXRlcml6ZWQgdHlwZXMsIGluY2x1ZGluZyBwYXJhbWV0ZXJpemVkIGB0aGlzYCBvblxuICAgICAgICogbWV0aG9kcywgaXQgZG9lcyBub3Qgc3VwcG9ydCBjb25zdHJhaW50cyBvbiB0aGVtLiBUaGF0IG1lYW5zIHRoYXQgYW4gYFxcQHRlbXBsYXRlYGQgdHlwZSBpc1xuICAgICAgICogYWx3YXlzIGNvbnNpZGVyZWQgdG8gYmUgYHVua25vd25gIHdpdGhpbiB0aGUgbWV0aG9kLCBpbmNsdWRpbmcgYFRISVNgLlxuICAgICAgICpcbiAgICAgICAqIFRvIGhlbHAgQ2xvc3VyZSBDb21waWxlciwgd2Uga2VlcCB0cmFjayBvZiBhbnkgdGVtcGxhdGVkIHRoaXMgcmV0dXJuIHR5cGUsIGFuZCBzdWJzdGl0dXRlXG4gICAgICAgKiBleHBsaWNpdCBjYXN0cyB0byB0aGUgdGVtcGxhdGVkIHR5cGUuXG4gICAgICAgKlxuICAgICAgICogVGhpcyBpcyBhbiBpbmNvbXBsZXRlIHNvbHV0aW9uIGFuZCB3b3JrcyBhcm91bmQgYSBzcGVjaWZpYyBwcm9ibGVtIHdpdGggd2FybmluZ3Mgb24gdW5rbm93blxuICAgICAgICogdGhpcyBhY2Nlc3Nlcy4gTW9yZSBnZW5lcmFsbHksIENsb3N1cmUgYWxzbyBjYW5ub3QgaW5mZXIgY29uc3RyYWludHMgZm9yIGFueSBvdGhlclxuICAgICAgICogdGVtcGxhdGVkIHR5cGVzLCBidXQgdGhhdCBtaWdodCByZXF1aXJlIGEgbW9yZSBnZW5lcmFsIHNvbHV0aW9uIGluIENsb3N1cmUgQ29tcGlsZXIuXG4gICAgICAgKi9cbiAgICAgIGxldCBjb250ZXh0VGhpc1R5cGU6IHRzLlR5cGV8bnVsbCA9IG51bGw7XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihjbGFzc0RlY2w6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHRUaGlzVHlwZUJhY2t1cCA9IGNvbnRleHRUaGlzVHlwZTtcblxuICAgICAgICBjb25zdCBtanNkb2MgPSBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRNdXRhYmxlSlNEb2MoY2xhc3NEZWNsKTtcbiAgICAgICAgaWYgKHRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcoY2xhc3NEZWNsLCB0cy5Nb2RpZmllckZsYWdzLkFic3RyYWN0KSkge1xuICAgICAgICAgIG1qc2RvYy50YWdzLnB1c2goe3RhZ05hbWU6ICdhYnN0cmFjdCd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heWJlQWRkVGVtcGxhdGVDbGF1c2UobWpzZG9jLnRhZ3MsIGNsYXNzRGVjbCk7XG4gICAgICAgIGlmICghaG9zdC51bnR5cGVkKSB7XG4gICAgICAgICAgbWF5YmVBZGRIZXJpdGFnZUNsYXVzZXMobWpzZG9jLnRhZ3MsIG1vZHVsZVR5cGVUcmFuc2xhdG9yLCBjbGFzc0RlY2wpO1xuICAgICAgICB9XG4gICAgICAgIG1qc2RvYy51cGRhdGVDb21tZW50KCk7XG4gICAgICAgIGNvbnN0IGRlY2xzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgICBjb25zdCBtZW1iZXJEZWNsID0gY3JlYXRlTWVtYmVyVHlwZURlY2xhcmF0aW9uKG1vZHVsZVR5cGVUcmFuc2xhdG9yLCBjbGFzc0RlY2wpO1xuICAgICAgICAvLyBXQVJOSU5HOiBvcmRlciBpcyBzaWduaWZpY2FudDsgd2UgbXVzdCBjcmVhdGUgdGhlIG1lbWJlciBkZWNsIGJlZm9yZSB0cmFuc2Zvcm1pbmcgYXdheVxuICAgICAgICAvLyBwYXJhbWV0ZXIgcHJvcGVydHkgY29tbWVudHMgd2hlbiB2aXNpdGluZyB0aGUgY29uc3RydWN0b3IuXG4gICAgICAgIGRlY2xzLnB1c2godHMudmlzaXRFYWNoQ2hpbGQoY2xhc3NEZWNsLCB2aXNpdG9yLCBjb250ZXh0KSk7XG4gICAgICAgIGlmIChtZW1iZXJEZWNsKSBkZWNscy5wdXNoKG1lbWJlckRlY2wpO1xuICAgICAgICBjb250ZXh0VGhpc1R5cGUgPSBjb250ZXh0VGhpc1R5cGVCYWNrdXA7XG4gICAgICAgIHJldHVybiBkZWNscztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiB2aXNpdEhlcml0YWdlQ2xhdXNlIHdvcmtzIGFyb3VuZCBhIENsb3N1cmUgQ29tcGlsZXIgaXNzdWUsIHdoZXJlIHRoZSBleHByZXNzaW9uIGluIGFuXG4gICAgICAgKiBcImV4dGVuZHNcIiBjbGF1c2UgbXVzdCBiZSBhIHNpbXBsZSBpZGVudGlmaWVyLCBhbmQgaW4gcGFydGljdWxhciBtdXN0IG5vdCBiZSBhIHBhcmVudGhlc2l6ZWRcbiAgICAgICAqIGV4cHJlc3Npb24uXG4gICAgICAgKlxuICAgICAgICogVGhpcyBpcyB0cmlnZ2VyZWQgd2hlbiBUUyBjb2RlIHdyaXRlcyBcImNsYXNzIFggZXh0ZW5kcyAoRm9vIGFzIEJhcikgeyAuLi4gfVwiLCBjb21tb25seSBkb25lXG4gICAgICAgKiB0byBzdXBwb3J0IG1peGlucy4gRm9yIGV4dGVuZHMgY2xhdXNlcyBpbiBjbGFzc2VzLCB0aGUgY29kZSBiZWxvdyBkcm9wcyB0aGUgY2FzdCBhbmQgYW55XG4gICAgICAgKiBwYXJlbnRoZXRpY2FscywgbGVhdmluZyBqdXN0IHRoZSBvcmlnaW5hbCBleHByZXNzaW9uLlxuICAgICAgICpcbiAgICAgICAqIFRoaXMgaXMgYW4gaW5jb21wbGV0ZSB3b3JrYXJvdW5kLCBhcyBDbG9zdXJlIHdpbGwgc3RpbGwgYmFpbCBvbiBvdGhlciBzdXBlciBleHByZXNzaW9ucyxcbiAgICAgICAqIGJ1dCByZXRhaW5zIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgcHJldmlvdXMgZW1pdCB0aGF0IChhY2NpZGVudGFsbHkpIGRyb3BwZWQgdGhlIGNhc3RcbiAgICAgICAqIGV4cHJlc3Npb24uXG4gICAgICAgKlxuICAgICAgICogVE9ETyhtYXJ0aW5wcm9ic3QpOiByZW1vdmUgdGhpcyBvbmNlIHRoZSBDbG9zdXJlIHNpZGUgaXNzdWUgaGFzIGJlZW4gcmVzb2x2ZWQuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHZpc2l0SGVyaXRhZ2VDbGF1c2UoaGVyaXRhZ2VDbGF1c2U6IHRzLkhlcml0YWdlQ2xhdXNlKSB7XG4gICAgICAgIGlmIChoZXJpdGFnZUNsYXVzZS50b2tlbiAhPT0gdHMuU3ludGF4S2luZC5FeHRlbmRzS2V5d29yZCB8fCAhaGVyaXRhZ2VDbGF1c2UucGFyZW50IHx8XG4gICAgICAgICAgICBoZXJpdGFnZUNsYXVzZS5wYXJlbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbikge1xuICAgICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChoZXJpdGFnZUNsYXVzZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhlcml0YWdlQ2xhdXNlLnR5cGVzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmVycm9yKFxuICAgICAgICAgICAgICBoZXJpdGFnZUNsYXVzZSwgYGV4cGVjdGVkIGV4YWN0bHkgb25lIHR5cGUgaW4gY2xhc3MgZXh0ZW5zaW9uIGNsYXVzZWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBoZXJpdGFnZUNsYXVzZS50eXBlc1swXTtcbiAgICAgICAgbGV0IGV4cHI6IHRzLkV4cHJlc3Npb24gPSB0eXBlLmV4cHJlc3Npb247XG4gICAgICAgIHdoaWxlICh0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGV4cHIpIHx8IHRzLmlzTm9uTnVsbEV4cHJlc3Npb24oZXhwcikgfHxcbiAgICAgICAgICAgICAgIHRzLmlzQXNzZXJ0aW9uRXhwcmVzc2lvbihleHByKSkge1xuICAgICAgICAgIGV4cHIgPSBleHByLmV4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRzLnVwZGF0ZUhlcml0YWdlQ2xhdXNlKGhlcml0YWdlQ2xhdXNlLCBbdHMudXBkYXRlRXhwcmVzc2lvbldpdGhUeXBlQXJndW1lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlLCB0eXBlLnR5cGVBcmd1bWVudHMgfHwgW10sIGV4cHIpXSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0SW50ZXJmYWNlRGVjbGFyYXRpb24oaWZhY2U6IHRzLkludGVyZmFjZURlY2xhcmF0aW9uKTogdHMuU3RhdGVtZW50W10ge1xuICAgICAgICBjb25zdCBzeW0gPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGlmYWNlLm5hbWUpO1xuICAgICAgICBpZiAoIXN5bSkge1xuICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmVycm9yKGlmYWNlLCAnaW50ZXJmYWNlIHdpdGggbm8gc3ltYm9sJyk7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoaXMgc3ltYm9sIGlzIGJvdGggYSB0eXBlIGFuZCBhIHZhbHVlLCB3ZSBjYW5ub3QgZW1pdCBib3RoIGludG8gQ2xvc3VyZSdzXG4gICAgICAgIC8vIHNpbmdsZSBuYW1lc3BhY2UuXG4gICAgICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkge1xuICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmRlYnVnV2FybihcbiAgICAgICAgICAgICAgaWZhY2UsIGB0eXBlL3N5bWJvbCBjb25mbGljdCBmb3IgJHtzeW0ubmFtZX0sIHVzaW5nIHs/fSBmb3Igbm93YCk7XG4gICAgICAgICAgcmV0dXJuIFt0cmFuc2Zvcm1lclV0aWwuY3JlYXRlU2luZ2xlTGluZUNvbW1lbnQoXG4gICAgICAgICAgICAgIGlmYWNlLCAnV0FSTklORzogaW50ZXJmYWNlIGhhcyBib3RoIGEgdHlwZSBhbmQgYSB2YWx1ZSwgc2tpcHBpbmcgZW1pdCcpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRhZ3MgPSBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRKU0RvYyhpZmFjZSwgLyogcmVwb3J0V2FybmluZ3MgKi8gdHJ1ZSkgfHwgW107XG4gICAgICAgIHRhZ3MucHVzaCh7dGFnTmFtZTogJ3JlY29yZCd9KTtcbiAgICAgICAgbWF5YmVBZGRUZW1wbGF0ZUNsYXVzZSh0YWdzLCBpZmFjZSk7XG4gICAgICAgIGlmICghaG9zdC51bnR5cGVkKSB7XG4gICAgICAgICAgbWF5YmVBZGRIZXJpdGFnZUNsYXVzZXModGFncywgbW9kdWxlVHlwZVRyYW5zbGF0b3IsIGlmYWNlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KGlmYWNlLm5hbWUpO1xuICAgICAgICBjb25zdCBtb2RpZmllcnMgPSB0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKGlmYWNlLCB0cy5Nb2RpZmllckZsYWdzLkV4cG9ydCkgP1xuICAgICAgICAgICAgW3RzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZCldIDpcbiAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgZGVjbCA9IHRzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICAgICAgdHMuY3JlYXRlRnVuY3Rpb25EZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBtb2RpZmllcnMsXG4gICAgICAgICAgICAgICAgLyogYXN0ZXJpc2sgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIC8qIHBhcmFtZXRlcnMgKi9bXSxcbiAgICAgICAgICAgICAgICAvKiB0eXBlICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAvKiBib2R5ICovIHRzLmNyZWF0ZUJsb2NrKFtdKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgaWZhY2UpO1xuICAgICAgICBhZGRDb21tZW50T24oZGVjbCwgdGFncyk7XG4gICAgICAgIGNvbnN0IG1lbWJlckRlY2wgPSBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24obW9kdWxlVHlwZVRyYW5zbGF0b3IsIGlmYWNlKTtcbiAgICAgICAgcmV0dXJuIG1lbWJlckRlY2wgPyBbZGVjbCwgbWVtYmVyRGVjbF0gOiBbZGVjbF07XG4gICAgICB9XG5cbiAgICAgIC8qKiBGdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlIGVtaXR0ZWQgYXMgdGhleSBhcmUsIHdpdGggb25seSBKU0RvYyBhZGRlZC4gKi9cbiAgICAgIGZ1bmN0aW9uIHZpc2l0RnVuY3Rpb25MaWtlRGVjbGFyYXRpb24oZm5EZWNsOiB0cy5GdW5jdGlvbkxpa2VEZWNsYXJhdGlvbikge1xuICAgICAgICBpZiAoIWZuRGVjbC5ib2R5KSB7XG4gICAgICAgICAgLy8gVHdvIGNhc2VzOiBhYnN0cmFjdCBtZXRob2RzIGFuZCBvdmVybG9hZGVkIG1ldGhvZHMvZnVuY3Rpb25zLlxuICAgICAgICAgIC8vIEFic3RyYWN0IG1ldGhvZHMgYXJlIGhhbmRsZWQgaW4gZW1pdFR5cGVBbm5vdGF0aW9uc0hhbmRsZXIuXG4gICAgICAgICAgLy8gT3ZlcmxvYWRzIGFyZSB1bmlvbi1pemVkIGludG8gdGhlIHNoYXJlZCB0eXBlIGluIEZ1bmN0aW9uVHlwZS5cbiAgICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQoZm5EZWNsLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHRyYVRhZ3MgPSBbXTtcbiAgICAgICAgaWYgKGhhc0V4cG9ydGluZ0RlY29yYXRvcihmbkRlY2wsIHR5cGVDaGVja2VyKSkgZXh0cmFUYWdzLnB1c2goe3RhZ05hbWU6ICdleHBvcnQnfSk7XG5cbiAgICAgICAgY29uc3Qge3RhZ3MsIHRoaXNSZXR1cm5UeXBlfSA9XG4gICAgICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRGdW5jdGlvblR5cGVKU0RvYyhbZm5EZWNsXSwgZXh0cmFUYWdzKTtcbiAgICAgICAgY29uc3QgbWpzZG9jID0gbW9kdWxlVHlwZVRyYW5zbGF0b3IuZ2V0TXV0YWJsZUpTRG9jKGZuRGVjbCk7XG4gICAgICAgIG1qc2RvYy50YWdzID0gdGFncztcbiAgICAgICAgbWpzZG9jLnVwZGF0ZUNvbW1lbnQoKTtcbiAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3IuYmxhY2tsaXN0VHlwZVBhcmFtZXRlcnMoZm5EZWNsLCBmbkRlY2wudHlwZVBhcmFtZXRlcnMpO1xuXG4gICAgICAgIGNvbnN0IGNvbnRleHRUaGlzVHlwZUJhY2t1cCA9IGNvbnRleHRUaGlzVHlwZTtcbiAgICAgICAgY29udGV4dFRoaXNUeXBlID0gdGhpc1JldHVyblR5cGU7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRzLnZpc2l0RWFjaENoaWxkKGZuRGVjbCwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIGNvbnRleHRUaGlzVHlwZSA9IGNvbnRleHRUaGlzVHlwZUJhY2t1cDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBJbiBtZXRob2RzIHdpdGggYSB0ZW1wbGF0ZWQgdGhpcyB0eXBlLCBhZGRzIGV4cGxpY2l0IGNhc3RzIHRvIGFjY2Vzc2VzIG9uIHRoaXMuXG4gICAgICAgKlxuICAgICAgICogQHNlZSBjb250ZXh0VGhpc1R5cGVcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gdmlzaXRUaGlzRXhwcmVzc2lvbihub2RlOiB0cy5UaGlzRXhwcmVzc2lvbikge1xuICAgICAgICBpZiAoIWNvbnRleHRUaGlzVHlwZSkgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gY3JlYXRlQ2xvc3VyZUNhc3Qobm9kZSwgbm9kZSwgY29udGV4dFRoaXNUeXBlKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiB2aXNpdFZhcmlhYmxlU3RhdGVtZW50IGZsYXR0ZW5zIHZhcmlhYmxlIGRlY2xhcmF0aW9uIGxpc3RzIChgdmFyIGEsIGI7YCB0byBgdmFyIGE7IHZhclxuICAgICAgICogYjtgKSwgYW5kIGF0dGFjaGVzIEpTRG9jIGNvbW1lbnRzIHRvIGVhY2ggdmFyaWFibGUuIEpTRG9jIGNvbW1lbnRzIHByZWNlZGluZyB0aGVcbiAgICAgICAqIG9yaWdpbmFsIHZhcmlhYmxlIGFyZSBhdHRhY2hlZCB0byB0aGUgZmlyc3QgbmV3bHkgY3JlYXRlZCBvbmUuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHZpc2l0VmFyaWFibGVTdGF0ZW1lbnQodmFyU3RtdDogdHMuVmFyaWFibGVTdGF0ZW1lbnQpOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgICAgIGNvbnN0IHN0bXRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gICAgICAgIC8vIFwiY29uc3RcIiwgXCJsZXRcIiwgZXRjIGFyZSBzdG9yZWQgaW4gbm9kZSBmbGFncyBvbiB0aGUgZGVjbGFyYXRpb25MaXN0LlxuICAgICAgICBjb25zdCBmbGFncyA9IHRzLmdldENvbWJpbmVkTm9kZUZsYWdzKHZhclN0bXQuZGVjbGFyYXRpb25MaXN0KTtcblxuICAgICAgICBsZXQgdGFnczoganNkb2MuVGFnW118bnVsbCA9XG4gICAgICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRKU0RvYyh2YXJTdG10LCAvKiByZXBvcnRXYXJuaW5ncyAqLyB0cnVlKTtcbiAgICAgICAgY29uc3QgbGVhZGluZyA9IHRzLmdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyh2YXJTdG10KTtcbiAgICAgICAgaWYgKGxlYWRpbmcpIHtcbiAgICAgICAgICAvLyBBdHRhY2ggbm9uLUpTRG9jIGNvbW1lbnRzIHRvIGEgbm90IGVtaXR0ZWQgc3RhdGVtZW50LlxuICAgICAgICAgIGNvbnN0IGNvbW1lbnRIb2xkZXIgPSB0cy5jcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50KHZhclN0bXQpO1xuICAgICAgICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhjb21tZW50SG9sZGVyLCBsZWFkaW5nLmZpbHRlcihjID0+IGMudGV4dFswXSAhPT0gJyonKSk7XG4gICAgICAgICAgc3RtdHMucHVzaChjb21tZW50SG9sZGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlY2xMaXN0ID0gdHMudmlzaXROb2RlKHZhclN0bXQuZGVjbGFyYXRpb25MaXN0LCB2aXNpdG9yKTtcbiAgICAgICAgZm9yIChjb25zdCBkZWNsIG9mIGRlY2xMaXN0LmRlY2xhcmF0aW9ucykge1xuICAgICAgICAgIGNvbnN0IGxvY2FsVGFnczoganNkb2MuVGFnW10gPSBbXTtcbiAgICAgICAgICBpZiAodGFncykge1xuICAgICAgICAgICAgLy8gQWRkIGFueSB0YWdzIGFuZCBkb2NzIHByZWNlZGluZyB0aGUgZW50aXJlIHN0YXRlbWVudCB0byB0aGUgZmlyc3QgdmFyaWFibGUuXG4gICAgICAgICAgICBsb2NhbFRhZ3MucHVzaCguLi50YWdzKTtcbiAgICAgICAgICAgIHRhZ3MgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBBZGQgYW4gQHR5cGUgZm9yIHBsYWluIGlkZW50aWZpZXJzLCBidXQgbm90IGZvciBiaW5kaW5ncyBwYXR0ZXJucyAoaS5lLiBvYmplY3Qgb3IgYXJyYXlcbiAgICAgICAgICAvLyBkZXN0cnVjdHVyaW5nKSAtIHRob3NlIGRvIG5vdCBoYXZlIGEgc3ludGF4IGluIENsb3N1cmUuXG4gICAgICAgICAgaWYgKHRzLmlzSWRlbnRpZmllcihkZWNsLm5hbWUpKSB7XG4gICAgICAgICAgICAvLyBGb3IgdmFyaWFibGVzIHRoYXQgYXJlIGluaXRpYWxpemVkIGFuZCB1c2UgYSBibGFja2xpc3RlZCB0eXBlLCBkbyBub3QgZW1pdCBhIHR5cGUgYXRcbiAgICAgICAgICAgIC8vIGFsbC4gQ2xvc3VyZSBDb21waWxlciBtaWdodCBiZSBhYmxlIHRvIGluZmVyIGEgYmV0dGVyIHR5cGUgZnJvbSB0aGUgaW5pdGlhbGl6ZXIgdGhhblxuICAgICAgICAgICAgLy8gdGhlIGA/YCB0aGUgY29kZSBiZWxvdyB3b3VsZCBlbWl0LlxuICAgICAgICAgICAgLy8gVE9ETyhtYXJ0aW5wcm9ic3QpOiBjb25zaWRlciBkb2luZyB0aGlzIGZvciBhbGwgdHlwZXMgdGhhdCBnZXQgZW1pdHRlZCBhcyA/LCBub3QganVzdFxuICAgICAgICAgICAgLy8gZm9yIGJsYWNrbGlzdGVkIG9uZXMuXG4gICAgICAgICAgICBjb25zdCBibGFja0xpc3RlZEluaXRpYWxpemVkID1cbiAgICAgICAgICAgICAgICAhIWRlY2wuaW5pdGlhbGl6ZXIgJiYgbW9kdWxlVHlwZVRyYW5zbGF0b3IuaXNCbGFja0xpc3RlZChkZWNsKTtcbiAgICAgICAgICAgIGlmICghYmxhY2tMaXN0ZWRJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAvLyBnZXRPcmlnaW5hbE5vZGUoZGVjbCkgaXMgcmVxdWlyZWQgYmVjYXVzZSB0aGUgdHlwZSBjaGVja2VyIGNhbm5vdCB0eXBlIGNoZWNrXG4gICAgICAgICAgICAgIC8vIHN5bnRoZXNpemVkIG5vZGVzLlxuICAgICAgICAgICAgICBjb25zdCB0eXBlU3RyID0gbW9kdWxlVHlwZVRyYW5zbGF0b3IudHlwZVRvQ2xvc3VyZSh0cy5nZXRPcmlnaW5hbE5vZGUoZGVjbCkpO1xuICAgICAgICAgICAgICBsb2NhbFRhZ3MucHVzaCh7dGFnTmFtZTogJ3R5cGUnLCB0eXBlOiB0eXBlU3RyfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IG5ld1N0bXQgPSB0cy5jcmVhdGVWYXJpYWJsZVN0YXRlbWVudChcbiAgICAgICAgICAgICAgdmFyU3RtdC5tb2RpZmllcnMsIHRzLmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb25MaXN0KFtkZWNsXSwgZmxhZ3MpKTtcbiAgICAgICAgICBpZiAobG9jYWxUYWdzLmxlbmd0aCkgYWRkQ29tbWVudE9uKG5ld1N0bXQsIGxvY2FsVGFncywganNkb2MuVEFHU19DT05GTElDVElOR19XSVRIX1RZUEUpO1xuICAgICAgICAgIHN0bXRzLnB1c2gobmV3U3RtdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RtdHM7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogc2hvdWxkRW1pdEV4cG9ydHNBc3NpZ25tZW50cyByZXR1cm5zIHRydWUgaWYgdHNpY2tsZSBzaG91bGQgZW1pdCBgZXhwb3J0cy5Gb28gPSAuLi5gIHN0eWxlXG4gICAgICAgKiBleHBvcnQgc3RhdGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBUeXBlU2NyaXB0IG1vZHVsZXMgY2FuIGV4cG9ydCB0eXBlcy4gQmVjYXVzZSB0eXBlcyBhcmUgcHVyZSBkZXNpZ24tdGltZSBjb25zdHJ1Y3RzIGluXG4gICAgICAgKiBUeXBlU2NyaXB0LCBpdCBkb2VzIG5vdCBlbWl0IGFueSBhY3R1YWwgZXhwb3J0ZWQgc3ltYm9scyBmb3IgdGhlc2UuIEJ1dCB0c2lja2xlIGhhcyB0byBlbWl0XG4gICAgICAgKiBhbiBleHBvcnQsIHNvIHRoYXQgZG93bnN0cmVhbSBDbG9zdXJlIGNvZGUgKGluY2x1ZGluZyB0c2lja2xlLWNvbnZlcnRlZCBDbG9zdXJlIGNvZGUpIGNhblxuICAgICAgICogaW1wb3J0IHVwc3RyZWFtIHR5cGVzLiB0c2lja2xlIGhhcyB0byBwaWNrIGEgbW9kdWxlIGZvcm1hdCBmb3IgdGhhdCwgYmVjYXVzZSB0aGUgcHVyZSBFUzZcbiAgICAgICAqIGV4cG9ydCB3b3VsZCBnZXQgc3RyaXBwZWQgYnkgVHlwZVNjcmlwdC5cbiAgICAgICAqXG4gICAgICAgKiB0c2lja2xlIHVzZXMgQ29tbW9uSlMgdG8gZW1pdCBnb29nbW9kdWxlLCBhbmQgY29kZSBub3QgdXNpbmcgZ29vZ21vZHVsZSBkb2Vzbid0IGNhcmUgYWJvdXRcbiAgICAgICAqIHRoZSBDbG9zdXJlIGFubm90YXRpb25zIGFueXdheSwgc28gdHNpY2tsZSBza2lwcyBlbWl0dGluZyBleHBvcnRzIGlmIHRoZSBtb2R1bGUgdGFyZ2V0XG4gICAgICAgKiBpc24ndCBjb21tb25qcy5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gc2hvdWxkRW1pdEV4cG9ydHNBc3NpZ25tZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRzT3B0aW9ucy5tb2R1bGUgPT09IHRzLk1vZHVsZUtpbmQuQ29tbW9uSlM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0VHlwZUFsaWFzRGVjbGFyYXRpb24odHlwZUFsaWFzOiB0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbik6IHRzLlN0YXRlbWVudFtdIHtcbiAgICAgICAgLy8gSWYgdGhlIHR5cGUgaXMgYWxzbyBkZWZpbmVkIGFzIGEgdmFsdWUsIHNraXAgZW1pdHRpbmcgaXQuIENsb3N1cmUgY29sbGFwc2VzIHR5cGUgJiB2YWx1ZVxuICAgICAgICAvLyBuYW1lc3BhY2VzLCB0aGUgdHdvIGVtaXRzIHdvdWxkIGNvbmZsaWN0IGlmIHRzaWNrbGUgZW1pdHRlZCBib3RoLlxuICAgICAgICBjb25zdCBzeW0gPSBtb2R1bGVUeXBlVHJhbnNsYXRvci5tdXN0R2V0U3ltYm9sQXRMb2NhdGlvbih0eXBlQWxpYXMubmFtZSk7XG4gICAgICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkgcmV0dXJuIFtdO1xuICAgICAgICAvLyBUeXBlIGFsaWFzZXMgYXJlIGFsd2F5cyBlbWl0dGVkIGFzIHRoZSByZXNvbHZlZCB1bmRlcmx5aW5nIHR5cGUsIHNvIHRoZXJlIGlzIG5vIG5lZWQgdG9cbiAgICAgICAgLy8gZW1pdCBhbnl0aGluZywgZXhjZXB0IGZvciBleHBvcnRlZCB0eXBlcy5cbiAgICAgICAgaWYgKCF0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKHR5cGVBbGlhcywgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpKSByZXR1cm4gW107XG4gICAgICAgIGlmICghc2hvdWxkRW1pdEV4cG9ydHNBc3NpZ25tZW50cygpKSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgdHlwZU5hbWUgPSB0eXBlQWxpYXMubmFtZS5nZXRUZXh0KCk7XG5cbiAgICAgICAgLy8gQmxhY2tsaXN0IGFueSB0eXBlIHBhcmFtZXRlcnMsIENsb3N1cmUgZG9lcyBub3Qgc3VwcG9ydCB0eXBlIGFsaWFzZXMgd2l0aCB0eXBlXG4gICAgICAgIC8vIHBhcmFtZXRlcnMuXG4gICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLm5ld1R5cGVUcmFuc2xhdG9yKHR5cGVBbGlhcykuYmxhY2tsaXN0VHlwZVBhcmFtZXRlcnMoXG4gICAgICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5zeW1ib2xzVG9BbGlhc2VkTmFtZXMsIHR5cGVBbGlhcy50eXBlUGFyYW1ldGVycyk7XG4gICAgICAgIGNvbnN0IHR5cGVTdHIgPVxuICAgICAgICAgICAgaG9zdC51bnR5cGVkID8gJz8nIDogbW9kdWxlVHlwZVRyYW5zbGF0b3IudHlwZVRvQ2xvc3VyZSh0eXBlQWxpYXMsIHVuZGVmaW5lZCk7XG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGFuIGV4cG9ydCwgd2UgY2Fubm90IGVtaXQgYSBgZXhwb3J0IHZhciBmb287YCBiZWNhdXNlIFR5cGVTY3JpcHQgZHJvcHNcbiAgICAgICAgLy8gZXhwb3J0cyB0aGF0IGFyZSBuZXZlciBhc3NpZ25lZCB2YWx1ZXMsIGFuZCBDbG9zdXJlIHJlcXVpcmVzIHVzIHRvIG5vdCBhc3NpZ24gdmFsdWVzIHRvXG4gICAgICAgIC8vIHR5cGVkZWYgZXhwb3J0cy4gSW50cm9kdWNpbmcgYSBuZXcgbG9jYWwgdmFyaWFibGUgYW5kIGV4cG9ydGluZyBpdCBjYW4gY2F1c2UgYnVncyBkdWUgdG9cbiAgICAgICAgLy8gbmFtZSBzaGFkb3dpbmcgYW5kIGNvbmZ1c2luZyBUeXBlU2NyaXB0J3MgbG9naWMgb24gd2hhdCBzeW1ib2xzIGFuZCB0eXBlcyB2cyB2YWx1ZXMgYXJlXG4gICAgICAgIC8vIGV4cG9ydGVkLiBNYW5nbGluZyB0aGUgbmFtZSB0byBhdm9pZCB0aGUgY29uZmxpY3RzIHdvdWxkIGJlIHJlYXNvbmFibHkgY2xlYW4sIGJ1dCB3b3VsZFxuICAgICAgICAvLyByZXF1aXJlIGEgdHdvIHBhc3MgZW1pdCB0byBmaXJzdCBmaW5kIGFsbCB0eXBlIGFsaWFzIG5hbWVzLCBtYW5nbGUgdGhlbSwgYW5kIGVtaXQgdGhlIHVzZVxuICAgICAgICAvLyBzaXRlcyBvbmx5IGxhdGVyLiBXaXRoIHRoYXQsIHRoZSBmaXggaGVyZSBpcyB0byBuZXZlciBlbWl0IHR5cGUgYWxpYXNlcywgYnV0IGFsd2F5c1xuICAgICAgICAvLyByZXNvbHZlIHRoZSBhbGlhcyBhbmQgZW1pdCB0aGUgdW5kZXJseWluZyB0eXBlIChmaXhpbmcgcmVmZXJlbmNlcyBpbiB0aGUgbG9jYWwgbW9kdWxlLFxuICAgICAgICAvLyBhbmQgYWxzbyBhY3Jvc3MgbW9kdWxlcykuIEZvciBkb3duc3RyZWFtIEphdmFTY3JpcHQgY29kZSB0aGF0IGltcG9ydHMgdGhlIHR5cGVkZWYsIHdlXG4gICAgICAgIC8vIGVtaXQgYW4gXCJleHBvcnQuRm9vO1wiIHRoYXQgZGVjbGFyZXMgYW5kIGV4cG9ydHMgdGhlIHR5cGUsIGFuZCBmb3IgVHlwZVNjcmlwdCBoYXMgbm9cbiAgICAgICAgLy8gaW1wYWN0LlxuICAgICAgICBjb25zdCB0YWdzID0gbW9kdWxlVHlwZVRyYW5zbGF0b3IuZ2V0SlNEb2ModHlwZUFsaWFzLCAvKiByZXBvcnRXYXJuaW5ncyAqLyB0cnVlKTtcbiAgICAgICAgdGFncy5wdXNoKHt0YWdOYW1lOiAndHlwZWRlZicsIHR5cGU6IHR5cGVTdHJ9KTtcbiAgICAgICAgY29uc3QgZGVjbCA9IHRzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICAgICAgdHMuY3JlYXRlU3RhdGVtZW50KHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKFxuICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2V4cG9ydHMnKSwgdHMuY3JlYXRlSWRlbnRpZmllcih0eXBlTmFtZSkpKSxcbiAgICAgICAgICAgIHR5cGVBbGlhcyk7XG4gICAgICAgIGFkZENvbW1lbnRPbihkZWNsLCB0YWdzLCBqc2RvYy5UQUdTX0NPTkZMSUNUSU5HX1dJVEhfVFlQRSk7XG4gICAgICAgIHJldHVybiBbZGVjbF07XG4gICAgICB9XG5cbiAgICAgIC8qKiBFbWl0cyBhIHBhcmVudGhlc2l6ZWQgQ2xvc3VyZSBjYXN0OiBgKC8qKiBcXEB0eXBlIC4uLiAqIC8gKGV4cHIpKWAuICovXG4gICAgICBmdW5jdGlvbiBjcmVhdGVDbG9zdXJlQ2FzdChjb250ZXh0OiB0cy5Ob2RlLCBleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uLCB0eXBlOiB0cy5UeXBlKSB7XG4gICAgICAgIGNvbnN0IGlubmVyID0gdHMuY3JlYXRlUGFyZW4oZXhwcmVzc2lvbik7XG4gICAgICAgIGNvbnN0IGNvbW1lbnQgPSBhZGRDb21tZW50T24oXG4gICAgICAgICAgICBpbm5lciwgW3t0YWdOYW1lOiAndHlwZScsIHR5cGU6IG1vZHVsZVR5cGVUcmFuc2xhdG9yLnR5cGVUb0Nsb3N1cmUoY29udGV4dCwgdHlwZSl9XSk7XG4gICAgICAgIGNvbW1lbnQuaGFzVHJhaWxpbmdOZXdMaW5lID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cy5zZXRTb3VyY2VNYXBSYW5nZSh0cy5jcmVhdGVQYXJlbihpbm5lciksIGNvbnRleHQpO1xuICAgICAgfVxuXG4gICAgICAvKiogQ29udmVydHMgYSBUeXBlU2NyaXB0IHR5cGUgYXNzZXJ0aW9uIGludG8gYSBDbG9zdXJlIENhc3QuICovXG4gICAgICBmdW5jdGlvbiB2aXNpdEFzc2VydGlvbkV4cHJlc3Npb24oYXNzZXJ0aW9uOiB0cy5Bc3NlcnRpb25FeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihhc3NlcnRpb24udHlwZSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVDbG9zdXJlQ2FzdChhc3NlcnRpb24sIHRzLnZpc2l0RWFjaENoaWxkKGFzc2VydGlvbiwgdmlzaXRvciwgY29udGV4dCksIHR5cGUpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENvbnZlcnRzIGEgVHlwZVNjcmlwdCBub24tbnVsbCBhc3NlcnRpb24gaW50byBhIENsb3N1cmUgQ2FzdCwgYnkgc3RyaXBwaW5nIHxudWxsIGFuZFxuICAgICAgICogfHVuZGVmaW5lZCBmcm9tIGEgdW5pb24gdHlwZS5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gdmlzaXROb25OdWxsRXhwcmVzc2lvbihub25OdWxsOiB0cy5Ob25OdWxsRXhwcmVzc2lvbikge1xuICAgICAgICBjb25zdCB0eXBlID0gdHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obm9uTnVsbC5leHByZXNzaW9uKTtcbiAgICAgICAgY29uc3Qgbm9uTnVsbFR5cGUgPSB0eXBlQ2hlY2tlci5nZXROb25OdWxsYWJsZVR5cGUodHlwZSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVDbG9zdXJlQ2FzdChcbiAgICAgICAgICAgIG5vbk51bGwsIHRzLnZpc2l0RWFjaENoaWxkKG5vbk51bGwsIHZpc2l0b3IsIGNvbnRleHQpLCBub25OdWxsVHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0SW1wb3J0RGVjbGFyYXRpb24oaW1wb3J0RGVjbDogdHMuSW1wb3J0RGVjbGFyYXRpb24pIHtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBmb3J3YXJkIGRlY2xhcmUgc2lkZSBlZmZlY3QgaW1wb3J0cy5cbiAgICAgICAgaWYgKCFpbXBvcnREZWNsLmltcG9ydENsYXVzZSkgcmV0dXJuIGltcG9ydERlY2w7XG4gICAgICAgIC8vIEludHJvZHVjZSBhIGdvb2cuZm9yd2FyZERlY2xhcmUgZm9yIHRoZSBtb2R1bGUsIHNvIHRoYXQgaWYgVHlwZVNjcmlwdCBkb2VzIG5vdCBlbWl0IHRoZVxuICAgICAgICAvLyBtb2R1bGUgYmVjYXVzZSBpdCdzIG9ubHkgdXNlZCBpbiB0eXBlIHBvc2l0aW9ucywgdGhlIEpTRG9jIGNvbW1lbnRzIHN0aWxsIHJlZmVyZW5jZSBhXG4gICAgICAgIC8vIHZhbGlkIENsb3N1cmUgbGV2ZWwgc3ltYm9sLlxuICAgICAgICBjb25zdCBzeW0gPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGltcG9ydERlY2wubW9kdWxlU3BlY2lmaWVyKTtcbiAgICAgICAgLy8gU2NyaXB0cyBkbyBub3QgaGF2ZSBhIHN5bWJvbCwgYW5kIG5laXRoZXIgZG8gdW51c2VkIG1vZHVsZXMuIFNjcmlwdHMgY2FuIHN0aWxsIGJlXG4gICAgICAgIC8vIGltcG9ydGVkLCBlaXRoZXIgYXMgc2lkZSBlZmZlY3QgaW1wb3J0cyBvciB3aXRoIGFuIGVtcHR5IGltcG9ydCBzZXQgKFwie31cIikuIFR5cGVTY3JpcHRcbiAgICAgICAgLy8gZG9lcyBub3QgZW1pdCBhIHJ1bnRpbWUgbG9hZCBmb3IgYW4gaW1wb3J0IHdpdGggYW4gZW1wdHkgbGlzdCBvZiBzeW1ib2xzLCBidXQgdGhlIGltcG9ydFxuICAgICAgICAvLyBmb3JjZXMgYW55IGdsb2JhbCBkZWNsYXJhdGlvbnMgZnJvbSB0aGUgbGlicmFyeSB0byBiZSB2aXNpYmxlLCB3aGljaCBpcyB3aGF0IHVzZXJzIHVzZVxuICAgICAgICAvLyB0aGlzIGZvci4gTm8gc3ltYm9scyBmcm9tIHRoZSBzY3JpcHQgbmVlZCBmb3J3YXJkIGRlY2xhcmF0aW9uLCBzbyBqdXN0IHJldHVybi5cbiAgICAgICAgaWYgKCFzeW0pIHJldHVybiBpbXBvcnREZWNsO1xuICAgICAgICAvLyBXcml0ZSB0aGUgZXhwb3J0IGRlY2xhcmF0aW9uIGhlcmUgc28gdGhhdCBmb3J3YXJkIGRlY2xhcmVzIGNvbWUgYWZ0ZXIgaXQsIGFuZFxuICAgICAgICAvLyBmaWxlb3ZlcnZpZXcgY29tbWVudHMgZG8gbm90IGdldCBtb3ZlZCBiZWhpbmQgc3RhdGVtZW50cy5cbiAgICAgICAgY29uc3QgaW1wb3J0UGF0aCA9IGdvb2dtb2R1bGUucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgICB7b3B0aW9uczogdHNPcHRpb25zLCBob3N0OiB0c0hvc3R9LCBzb3VyY2VGaWxlLmZpbGVOYW1lLFxuICAgICAgICAgICAgKGltcG9ydERlY2wubW9kdWxlU3BlY2lmaWVyIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQpO1xuXG4gICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmZvcndhcmREZWNsYXJlKFxuICAgICAgICAgICAgaW1wb3J0UGF0aCwgc3ltLCAvKiBpc0V4cGxpY2l0bHlJbXBvcnRlZD8gKi8gdHJ1ZSxcbiAgICAgICAgICAgIC8qIGRlZmF1bHQgaW1wb3J0PyAqLyAhIWltcG9ydERlY2wuaW1wb3J0Q2xhdXNlLm5hbWUpO1xuICAgICAgICByZXR1cm4gaW1wb3J0RGVjbDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBDbG9zdXJlIENvbXBpbGVyIHdpbGwgZmFpbCB3aGVuIGl0IGZpbmRzIGluY29ycmVjdCBKU0RvYyB0YWdzIG9uIG5vZGVzLiBUaGlzIGZ1bmN0aW9uXG4gICAgICAgKiBwYXJzZXMgYW5kIHRoZW4gcmUtc2VyaWFsaXplcyBKU0RvYyBjb21tZW50cywgZXNjYXBpbmcgb3IgcmVtb3ZpbmcgaWxsZWdhbCB0YWdzLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBlc2NhcGVJbGxlZ2FsSlNEb2Mobm9kZTogdHMuTm9kZSkge1xuICAgICAgICBjb25zdCBtanNkb2MgPSBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRNdXRhYmxlSlNEb2Mobm9kZSk7XG4gICAgICAgIG1qc2RvYy51cGRhdGVDb21tZW50KCk7XG4gICAgICB9XG5cbiAgICAgIC8qKiBSZXR1cm5zIHRydWUgaWYgYSB2YWx1ZSBleHBvcnQgc2hvdWxkIGJlIGVtaXR0ZWQgZm9yIHRoZSBnaXZlbiBzeW1ib2wgaW4gZXhwb3J0ICouICovXG4gICAgICBmdW5jdGlvbiBzaG91bGRFbWl0VmFsdWVFeHBvcnRGb3JTeW1ib2woc3ltOiB0cy5TeW1ib2wpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICAgICAgc3ltID0gdHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3ltLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpID09PSAwKSB7XG4gICAgICAgICAgLy8gTm90ZTogV2UgY3JlYXRlIGV4cGxpY2l0IGV4cG9ydHMgb2YgdHlwZSBzeW1ib2xzIGZvciBjbG9zdXJlIGluIHZpc2l0RXhwb3J0RGVjbGFyYXRpb24uXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdHNPcHRpb25zLnByZXNlcnZlQ29uc3RFbnVtcyAmJiBzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5Db25zdEVudW0pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogdmlzaXRFeHBvcnREZWNsYXJhdGlvbiBmb3J3YXJkIGRlY2xhcmVzIGV4cG9ydGVkIG1vZHVsZXMgYW5kIGVtaXRzIGV4cGxpY2l0IGV4cG9ydHMgZm9yXG4gICAgICAgKiB0eXBlcyAod2hpY2ggbm9ybWFsbHkgZG8gbm90IGdldCBlbWl0dGVkIGJ5IFR5cGVTY3JpcHQpLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiB2aXNpdEV4cG9ydERlY2xhcmF0aW9uKGV4cG9ydERlY2w6IHRzLkV4cG9ydERlY2xhcmF0aW9uKTogdHMuTm9kZXx0cy5Ob2RlW10ge1xuICAgICAgICBjb25zdCBpbXBvcnRlZE1vZHVsZVN5bWJvbCA9IGV4cG9ydERlY2wubW9kdWxlU3BlY2lmaWVyICYmXG4gICAgICAgICAgICB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGV4cG9ydERlY2wubW9kdWxlU3BlY2lmaWVyKSE7XG4gICAgICAgIGlmIChpbXBvcnRlZE1vZHVsZVN5bWJvbCkge1xuICAgICAgICAgIC8vIEZvcndhcmQgZGVjbGFyZSBhbGwgZXhwbGljaXRseSBpbXBvcnRlZCBtb2R1bGVzLCBzbyB0aGF0IHN5bWJvbHMgY2FuIGJlIHJlZmVyZW5jZWQgYW5kXG4gICAgICAgICAgLy8gdHlwZSBvbmx5IG1vZHVsZXMgZ2V0IGZvcmNlLWxvYWRlZC5cbiAgICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5mb3J3YXJkRGVjbGFyZShcbiAgICAgICAgICAgICAgKGV4cG9ydERlY2wubW9kdWxlU3BlY2lmaWVyIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQsIGltcG9ydGVkTW9kdWxlU3ltYm9sLFxuICAgICAgICAgICAgICAvKiBpc0V4cGxpY2l0bHlJbXBvcnRlZD8gKi8gdHJ1ZSwgLyogZGVmYXVsdCBpbXBvcnQ/ICovIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHR5cGVzVG9FeHBvcnQ6IEFycmF5PFtzdHJpbmcsIHRzLlN5bWJvbF0+ID0gW107XG4gICAgICAgIGlmICghZXhwb3J0RGVjbC5leHBvcnRDbGF1c2UpIHtcbiAgICAgICAgICAvLyBleHBvcnQgKiBmcm9tICcuLi4nXG4gICAgICAgICAgLy8gUmVzb2x2ZSB0aGUgKiBpbnRvIGFsbCB2YWx1ZSBzeW1ib2xzIGV4cG9ydGVkLCBhbmQgdXBkYXRlIHRoZSBleHBvcnQgZGVjbGFyYXRpb24uXG5cbiAgICAgICAgICAvLyBFeHBsaWNpdGx5IHNwZWxsZWQgb3V0IGV4cG9ydHMgKGkuZS4gdGhlIGV4cG9ydHMgb2YgdGhlIGN1cnJlbnQgbW9kdWxlKSB0YWtlIHByZWNlZGVuY2VcbiAgICAgICAgICAvLyBvdmVyIGltcGxpY2l0IG9uZXMgZnJvbSBleHBvcnQgKi4gVXNlIHRoZSBjdXJyZW50IG1vZHVsZSdzIGV4cG9ydHMgdG8gZmlsdGVyLlxuICAgICAgICAgIGNvbnN0IGN1cnJlbnRNb2R1bGVTeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKHNvdXJjZUZpbGUpO1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRNb2R1bGVFeHBvcnRzID0gY3VycmVudE1vZHVsZVN5bWJvbCAmJiBjdXJyZW50TW9kdWxlU3ltYm9sLmV4cG9ydHM7XG5cbiAgICAgICAgICBpZiAoIWltcG9ydGVkTW9kdWxlU3ltYm9sKSB7XG4gICAgICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5lcnJvcihleHBvcnREZWNsLCBgZXhwb3J0ICogd2l0aG91dCBtb2R1bGUgc3ltYm9sYCk7XG4gICAgICAgICAgICByZXR1cm4gZXhwb3J0RGVjbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZXhwb3J0ZWRTeW1ib2xzID0gdHlwZUNoZWNrZXIuZ2V0RXhwb3J0c09mTW9kdWxlKGltcG9ydGVkTW9kdWxlU3ltYm9sKTtcbiAgICAgICAgICBjb25zdCBleHBvcnRTcGVjaWZpZXJzOiB0cy5FeHBvcnRTcGVjaWZpZXJbXSA9IFtdO1xuICAgICAgICAgIGZvciAoY29uc3Qgc3ltIG9mIGV4cG9ydGVkU3ltYm9scykge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRNb2R1bGVFeHBvcnRzICYmIGN1cnJlbnRNb2R1bGVFeHBvcnRzLmhhcyhzeW0uZXNjYXBlZE5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgYWxyZWFkeSBnZW5lcmF0ZWQgYW4gZXhwb3J0IGZvciB0aGUgZ2l2ZW4gc3ltYm9sLlxuICAgICAgICAgICAgaWYgKGV4cGFuZGVkU3RhckltcG9ydHMuaGFzKHN5bS5uYW1lKSkgY29udGludWU7XG4gICAgICAgICAgICBleHBhbmRlZFN0YXJJbXBvcnRzLmFkZChzeW0ubmFtZSk7XG4gICAgICAgICAgICAvLyBPbmx5IGNyZWF0ZSBhbiBleHBvcnQgc3BlY2lmaWVyIGZvciB2YWx1ZXMgdGhhdCBhcmUgZXhwb3J0ZWQuIEZvciB0eXBlcywgdGhlIGNvZGVcbiAgICAgICAgICAgIC8vIGJlbG93IGNyZWF0ZXMgc3BlY2lmaWMgZXhwb3J0IHN0YXRlbWVudHMgdGhhdCBtYXRjaCBDbG9zdXJlJ3MgZXhwZWN0YXRpb25zLlxuICAgICAgICAgICAgaWYgKHNob3VsZEVtaXRWYWx1ZUV4cG9ydEZvclN5bWJvbChzeW0pKSB7XG4gICAgICAgICAgICAgIGV4cG9ydFNwZWNpZmllcnMucHVzaCh0cy5jcmVhdGVFeHBvcnRTcGVjaWZpZXIodW5kZWZpbmVkLCBzeW0ubmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHlwZXNUb0V4cG9ydC5wdXNoKFtzeW0ubmFtZSwgc3ltXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4cG9ydERlY2wgPSB0cy51cGRhdGVFeHBvcnREZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgZXhwb3J0RGVjbCwgZXhwb3J0RGVjbC5kZWNvcmF0b3JzLCBleHBvcnREZWNsLm1vZGlmaWVycyxcbiAgICAgICAgICAgICAgdHMuY3JlYXRlTmFtZWRFeHBvcnRzKGV4cG9ydFNwZWNpZmllcnMpLCBleHBvcnREZWNsLm1vZHVsZVNwZWNpZmllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChjb25zdCBleHAgb2YgZXhwb3J0RGVjbC5leHBvcnRDbGF1c2UuZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydGVkTmFtZSA9IHRyYW5zZm9ybWVyVXRpbC5nZXRJZGVudGlmaWVyVGV4dChleHAubmFtZSk7XG4gICAgICAgICAgICB0eXBlc1RvRXhwb3J0LnB1c2goXG4gICAgICAgICAgICAgICAgW2V4cG9ydGVkTmFtZSwgbW9kdWxlVHlwZVRyYW5zbGF0b3IubXVzdEdldFN5bWJvbEF0TG9jYXRpb24oZXhwLm5hbWUpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIERvIG5vdCBlbWl0IHR5cGVkZWYgcmUtZXhwb3J0cyBpbiB1bnR5cGVkIG1vZGUuXG4gICAgICAgIGlmIChob3N0LnVudHlwZWQpIHJldHVybiBleHBvcnREZWNsO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdDogdHMuTm9kZVtdID0gW2V4cG9ydERlY2xdO1xuICAgICAgICBmb3IgKGNvbnN0IFtleHBvcnRlZE5hbWUsIHN5bV0gb2YgdHlwZXNUb0V4cG9ydCkge1xuICAgICAgICAgIGxldCBhbGlhc2VkU3ltYm9sID0gc3ltO1xuICAgICAgICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgICAgICAgYWxpYXNlZFN5bWJvbCA9IHR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgaXNUeXBlQWxpYXMgPSAoYWxpYXNlZFN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlZhbHVlKSA9PT0gMCAmJlxuICAgICAgICAgICAgICAoYWxpYXNlZFN5bWJvbC5mbGFncyAmICh0cy5TeW1ib2xGbGFncy5UeXBlQWxpYXMgfCB0cy5TeW1ib2xGbGFncy5JbnRlcmZhY2UpKSAhPT0gMDtcbiAgICAgICAgICBpZiAoIWlzVHlwZUFsaWFzKSBjb250aW51ZTtcbiAgICAgICAgICBjb25zdCB0eXBlTmFtZSA9XG4gICAgICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLnN5bWJvbHNUb0FsaWFzZWROYW1lcy5nZXQoYWxpYXNlZFN5bWJvbCkgfHwgYWxpYXNlZFN5bWJvbC5uYW1lO1xuICAgICAgICAgIGNvbnN0IHN0bXQgPSB0cy5jcmVhdGVTdGF0ZW1lbnQoXG4gICAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2V4cG9ydHMnKSwgZXhwb3J0ZWROYW1lKSk7XG4gICAgICAgICAgYWRkQ29tbWVudE9uKHN0bXQsIFt7dGFnTmFtZTogJ3R5cGVkZWYnLCB0eXBlOiAnIScgKyB0eXBlTmFtZX1dKTtcbiAgICAgICAgICB0cy5hZGRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnQoXG4gICAgICAgICAgICAgIHN0bXQsIHRzLlN5bnRheEtpbmQuU2luZ2xlTGluZUNvbW1lbnRUcml2aWEsICcgcmUtZXhwb3J0IHR5cGVkZWYnLCB0cnVlKTtcbiAgICAgICAgICByZXN1bHQucHVzaChzdG10KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGlkZW50aWZpZXJzIGV4cG9ydGVkIGluIGEgc2luZ2xlIGV4cG9ydGVkIHN0YXRlbWVudCAtIHR5cGljYWxseSBqdXN0IG9uZVxuICAgICAgICogaWRlbnRpZmllciAoZS5nLiBmb3IgYGV4cG9ydCBmdW5jdGlvbiBmb28oKWApLCBidXQgbXVsdGlwbGUgZm9yIGBleHBvcnQgZGVjbGFyZSB2YXIgYSwgYmAuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGdldEV4cG9ydERlY2xhcmF0aW9uTmFtZXMobm9kZTogdHMuTm9kZSk6IHRzLklkZW50aWZpZXJbXSB7XG4gICAgICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlU3RhdGVtZW50OlxuICAgICAgICAgICAgY29uc3QgdmFyRGVjbCA9IG5vZGUgYXMgdHMuVmFyaWFibGVTdGF0ZW1lbnQ7XG4gICAgICAgICAgICByZXR1cm4gdmFyRGVjbC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zLm1hcCgoZCkgPT4gZ2V0RXhwb3J0RGVjbGFyYXRpb25OYW1lcyhkKVswXSk7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlZhcmlhYmxlRGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRW51bURlY2xhcmF0aW9uOlxuICAgICAgICAgICAgY29uc3QgZGVjbCA9IG5vZGUgYXMgdHMuTmFtZWREZWNsYXJhdGlvbjtcbiAgICAgICAgICAgIGlmICghZGVjbC5uYW1lIHx8IGRlY2wubmFtZS5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW2RlY2wubmFtZV07XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlR5cGVBbGlhc0RlY2xhcmF0aW9uOlxuICAgICAgICAgICAgY29uc3QgdHlwZUFsaWFzID0gbm9kZSBhcyB0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbjtcbiAgICAgICAgICAgIHJldHVybiBbdHlwZUFsaWFzLm5hbWVdO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5lcnJvcihcbiAgICAgICAgICAgIG5vZGUsIGB1bnN1cHBvcnRlZCBleHBvcnQgZGVjbGFyYXRpb24gJHt0cy5TeW50YXhLaW5kW25vZGUua2luZF19OiAke25vZGUuZ2V0VGV4dCgpfWApO1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQW1iaWVudCBkZWNsYXJhdGlvbnMgZGVjbGFyZSB0eXBlcyBmb3IgVHlwZVNjcmlwdCdzIGJlbmVmaXQsIGFuZCB3aWxsIGJlIHJlbW92ZWRlIGJ5XG4gICAgICAgKiBUeXBlU2NyaXB0IGR1cmluZyBpdHMgZW1pdCBwaGFzZS4gRG93bnN0cmVhbSBDbG9zdXJlIGNvZGUgaG93ZXZlciBtaWdodCBiZSBpbXBvcnRpbmdcbiAgICAgICAqIHN5bWJvbHMgZnJvbSB0aGlzIG1vZHVsZSwgc28gdHNpY2tsZSBtdXN0IGVtaXQgYSBDbG9zdXJlLWNvbXBhdGlibGUgZXhwb3J0cyBkZWNsYXJhdGlvbi5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gdmlzaXRFeHBvcnRlZEFtYmllbnQobm9kZTogdHMuTm9kZSk6IHRzLk5vZGVbXSB7XG4gICAgICAgIGlmIChob3N0LnVudHlwZWQgfHwgIXNob3VsZEVtaXRFeHBvcnRzQXNzaWdubWVudHMoKSkgcmV0dXJuIFtub2RlXTtcblxuICAgICAgICBjb25zdCBkZWNsTmFtZXMgPSBnZXRFeHBvcnREZWNsYXJhdGlvbk5hbWVzKG5vZGUpO1xuICAgICAgICBjb25zdCByZXN1bHQ6IHRzLk5vZGVbXSA9IFtub2RlXTtcbiAgICAgICAgZm9yIChjb25zdCBkZWNsIG9mIGRlY2xOYW1lcykge1xuICAgICAgICAgIGNvbnN0IHN5bSA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oZGVjbCkhO1xuICAgICAgICAgIGNvbnN0IGlzVmFsdWUgPSBzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZTtcbiAgICAgICAgICAvLyBOb24tdmFsdWUgb2JqZWN0cyBkbyBub3QgZXhpc3QgYXQgcnVudGltZSwgc28gd2UgY2Fubm90IGFjY2VzcyB0aGUgc3ltYm9sIChpdCBvbmx5XG4gICAgICAgICAgLy8gZXhpc3RzIGluIGV4dGVybnMpLiBFeHBvcnQgdGhlbSBhcyBhIHR5cGVkZWYsIHdoaWNoIGZvcndhcmRzIHRvIHRoZSB0eXBlIGluIGV4dGVybnMuXG4gICAgICAgICAgLy8gTm90ZTogVHlwZVNjcmlwdCBlbWl0cyBvZGQgY29kZSBmb3IgZXhwb3J0ZWQgYW1iaWVudHMgKGV4cG9ydHMueCBmb3IgdmFyaWFibGVzLCBqdXN0IHhcbiAgICAgICAgICAvLyBmb3IgZXZlcnl0aGluZyBlbHNlKS4gVGhhdCBzZWVtcyBidWdneSwgYW5kIGluIGVpdGhlciBjYXNlIHRoaXMgY29kZSBzaG91bGQgbm90IGF0dGVtcHRcbiAgICAgICAgICAvLyB0byBmaXggaXQuXG4gICAgICAgICAgLy8gU2VlIGFsc28gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy84MDE1LlxuICAgICAgICAgIGlmICghaXNWYWx1ZSkge1xuICAgICAgICAgICAgLy8gRG8gbm90IGVtaXQgcmUtZXhwb3J0cyBmb3IgTW9kdWxlRGVjbGFyYXRpb25zLlxuICAgICAgICAgICAgLy8gQW1iaWVudCBNb2R1bGVEZWNsYXJhdGlvbnMgYXJlIGFsd2F5cyByZWZlcmVuY2VkIGFzIGdsb2JhbCBzeW1ib2xzLCBzbyB0aGV5IGRvbid0XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGJlIGV4cG9ydGVkLlxuICAgICAgICAgICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5Nb2R1bGVEZWNsYXJhdGlvbikgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBtYW5nbGVkTmFtZSA9IG1vZHVsZU5hbWVBc0lkZW50aWZpZXIoaG9zdCwgc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgICAgICAgICBjb25zdCBkZWNsTmFtZSA9IHRyYW5zZm9ybWVyVXRpbC5nZXRJZGVudGlmaWVyVGV4dChkZWNsKTtcbiAgICAgICAgICAgIGNvbnN0IHN0bXQgPSB0cy5jcmVhdGVTdGF0ZW1lbnQoXG4gICAgICAgICAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3ModHMuY3JlYXRlSWRlbnRpZmllcignZXhwb3J0cycpLCBkZWNsTmFtZSkpO1xuICAgICAgICAgICAgYWRkQ29tbWVudE9uKHN0bXQsIFt7dGFnTmFtZTogJ3R5cGVkZWYnLCB0eXBlOiBgISR7bWFuZ2xlZE5hbWV9LiR7ZGVjbE5hbWV9YH1dKTtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHN0bXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB2aXNpdG9yKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlfHRzLk5vZGVbXSB7XG4gICAgICAgIGlmIChpc0FtYmllbnQobm9kZSkpIHtcbiAgICAgICAgICBpZiAoIXRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcobm9kZSwgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQpKSByZXR1cm4gbm9kZTtcbiAgICAgICAgICByZXR1cm4gdmlzaXRFeHBvcnRlZEFtYmllbnQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0RGVjbGFyYXRpb246XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRJbXBvcnREZWNsYXJhdGlvbihub2RlIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0RGVjbGFyYXRpb246XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRFeHBvcnREZWNsYXJhdGlvbihub2RlIGFzIHRzLkV4cG9ydERlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIHJldHVybiB2aXNpdENsYXNzRGVjbGFyYXRpb24obm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRJbnRlcmZhY2VEZWNsYXJhdGlvbihub2RlIGFzIHRzLkludGVyZmFjZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSGVyaXRhZ2VDbGF1c2U6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRIZXJpdGFnZUNsYXVzZShub2RlIGFzIHRzLkhlcml0YWdlQ2xhdXNlKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3I6XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HZXRBY2Nlc3NvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3I6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRGdW5jdGlvbkxpa2VEZWNsYXJhdGlvbihub2RlIGFzIHRzLkZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRUaGlzRXhwcmVzc2lvbihub2RlIGFzIHRzLlRoaXNFeHByZXNzaW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQ6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRWYXJpYWJsZVN0YXRlbWVudChub2RlIGFzIHRzLlZhcmlhYmxlU3RhdGVtZW50KTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50OlxuICAgICAgICAgICAgZXNjYXBlSWxsZWdhbEpTRG9jKG5vZGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBhcmFtZXRlcjpcbiAgICAgICAgICAgIC8vIFBhcmFtZXRlciBwcm9wZXJ0aWVzIChlLmcuIGBjb25zdHJ1Y3RvcigvKiogZG9jcyAqLyBwcml2YXRlIGZvbzogc3RyaW5nKWApIG1pZ2h0IGhhdmVcbiAgICAgICAgICAgIC8vIEpTRG9jIGNvbW1lbnRzLCBpbmNsdWRpbmcgSlNEb2MgdGFncyByZWNvZ25pemVkIGJ5IENsb3N1cmUgQ29tcGlsZXIuIFByZXZlbnQgZW1pdHRpbmdcbiAgICAgICAgICAgIC8vIGFueSBjb21tZW50cyBvbiB0aGVtLCBzbyB0aGF0IENsb3N1cmUgZG9lc24ndCBlcnJvciBvbiB0aGVtLlxuICAgICAgICAgICAgLy8gU2VlIHRlc3RfZmlsZXMvcGFyYW1ldGVyX3Byb3BlcnRpZXMudHMuXG4gICAgICAgICAgICBjb25zdCBwYXJhbURlY2wgPSBub2RlIGFzIHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcoXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtRGVjbCwgdHMuTW9kaWZpZXJGbGFncy5QYXJhbWV0ZXJQcm9wZXJ0eU1vZGlmaWVyKSkge1xuICAgICAgICAgICAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMocGFyYW1EZWNsLCBbXSk7XG4gICAgICAgICAgICAgIGpzZG9jLnN1cHByZXNzTGVhZGluZ0NvbW1lbnRzUmVjdXJzaXZlbHkocGFyYW1EZWNsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlQWxpYXNEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIHJldHVybiB2aXNpdFR5cGVBbGlhc0RlY2xhcmF0aW9uKG5vZGUgYXMgdHMuVHlwZUFsaWFzRGVjbGFyYXRpb24pO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Bc0V4cHJlc3Npb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlR5cGVBc3NlcnRpb25FeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHZpc2l0QXNzZXJ0aW9uRXhwcmVzc2lvbihub2RlIGFzIHRzLlR5cGVBc3NlcnRpb24pO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Ob25OdWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB2aXNpdE5vbk51bGxFeHByZXNzaW9uKG5vZGUgYXMgdHMuTm9uTnVsbEV4cHJlc3Npb24pO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIHNvdXJjZUZpbGUgPSB0cy52aXNpdEVhY2hDaGlsZChzb3VyY2VGaWxlLCB2aXNpdG9yLCBjb250ZXh0KTtcblxuICAgICAgcmV0dXJuIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmluc2VydEZvcndhcmREZWNsYXJlcyhzb3VyY2VGaWxlKTtcbiAgICB9O1xuICB9O1xufVxuIl19