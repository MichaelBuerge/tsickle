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
            if (transformerUtil.hasModifierFlag(current, ts.ModifierFlags.Ambient)) {
                return true;
            }
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
        var hasExtends = decl.heritageClauses.some(function (c) { return c.token === ts.SyntaxKind.ExtendsKeyword; });
        try {
            for (var _c = __values(decl.heritageClauses), _d = _c.next(); !_d.done; _d = _c.next()) {
                var heritage = _d.value;
                var isExtends = heritage.token === ts.SyntaxKind.ExtendsKeyword;
                if (isClass && isExtends) {
                    // If a class has an "extends", that is preserved in the ES6 output
                    // and we don't need to emit any additional jsdoc.
                    //
                    // However for ambient declarations, we only emit externs, and in those we do need to
                    // add "@extends {Foo}" as they use ES5 syntax.
                    if (!isAmbient(decl))
                        continue;
                }
                try {
                    // Otherwise, if we get here, we need to emit some jsdoc.
                    for (var _e = __values(heritage.types), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var expr = _f.value;
                        var heritage_1 = heritageName(isExtends, hasExtends, expr);
                        // heritageName may return null, indicating that the clause is something inexpressible
                        // in Closure, e.g. "class Foo implements Partial<Bar>".
                        if (!heritage_1) {
                            // For 'extends' clauses that means we cannot emit anything at all.
                            if (!isExtends) {
                                docTags.push({
                                    tagName: isExtends ? 'extends' : 'implements',
                                    type: 'InexpressibleType',
                                });
                            }
                        }
                        else {
                            docTags.push({
                                tagName: heritage_1.tagName,
                                type: heritage_1.parentName,
                            });
                        }
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
        /**
         * Computes the Closure name of an expression occurring in a heritage clause,
         * e.g. "implements FooBar".  Will return null if the expression is inexpressible
         * in Closure semantics.  Note that we don't need to consider all possible
         * combinations of types/values and extends/implements because our input is
         * already verified to be valid TypeScript.  See test_files/class/ for the full
         * cartesian product of test cases.
         * @param isExtends True if we're in an 'extends', false in an 'implements'.
         * @param hasExtends True if there are any 'extends' clauses present at all.
         */
        function heritageName(isExtends, hasExtends, expr) {
            var tagName = isExtends ? 'extends' : 'implements';
            var sym = mtt.typeChecker.getSymbolAtLocation(expr.expression);
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
                // extend that.
                mtt.debugWarn(decl, "could not resolve supertype: " + expr.getText());
                return null;
            }
            // Resolve any aliases to the underlying type.
            if (sym.flags & ts.SymbolFlags.TypeAlias) {
                // It's implementing a type alias.  Follow the type alias back
                // to the original symbol to check whether it's a type or a value.
                var type = mtt.typeChecker.getDeclaredTypeOfSymbol(sym);
                if (!type.symbol) {
                    // It's not clear when this can happen.
                    mtt.debugWarn(decl, "could not get type of symbol: " + expr.getText());
                    return null;
                }
                sym = type.symbol;
            }
            if (sym.flags & ts.SymbolFlags.Alias) {
                sym = mtt.typeChecker.getAliasedSymbol(sym);
            }
            var typeTranslator = mtt.newTypeTranslator(expr.expression);
            if (typeTranslator.isBlackListed(sym)) {
                // Don't emit references to blacklisted types.
                return null;
            }
            if (sym.flags & ts.SymbolFlags.Class) {
                if (!isClass) {
                    // Closure interfaces cannot extend or implements classes.
                    mtt.debugWarn(decl, "omitting interface deriving from class: " + expr.getText());
                    return null;
                }
                if (!isExtends) {
                    if (!hasExtends) {
                        // A special case: for a class that has no existing 'extends' clause but does
                        // have an 'implements' clause that refers to another class, we change it to
                        // instead be an 'extends'.  This was a poorly-thought-out hack that may
                        // actually cause compiler bugs:
                        //   https://github.com/google/closure-compiler/issues/3126
                        // but we have code that now relies on it, ugh.
                        tagName = 'extends';
                    }
                    else {
                        // Closure can only @implements an interface, not a class.
                        mtt.debugWarn(decl, "omitting @implements of a class: " + expr.getText());
                        return null;
                    }
                }
            }
            else if (sym.flags & ts.SymbolFlags.Value) {
                // If it's something other than a class in the value namespace, then it will
                // not be a type in the Closure output (because Closure collapses
                // the type and value namespaces).
                mtt.debugWarn(decl, "omitting heritage reference to a type/value conflict: " + expr.getText());
                return null;
            }
            else if (sym.flags & ts.SymbolFlags.TypeLiteral) {
                // A type literal is a type like `{foo: string}`.
                // These can come up as the output of a mapped type.
                mtt.debugWarn(decl, "omitting heritage reference to a type literal: " + expr.getText());
                return null;
            }
            // typeToClosure includes nullability modifiers, so call symbolToString directly here.
            var parentName = typeTranslator.symbolToString(sym);
            if (!parentName)
                return null;
            return { tagName: tagName, parentName: parentName };
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
        var flags = ts.getCombinedModifierFlags(prop);
        if (flags & ts.ModifierFlags.Protected) {
            tags.push({ tagName: 'protected' });
        }
        else if (flags & ts.ModifierFlags.Private) {
            tags.push({ tagName: 'private' });
        }
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
                        if (!transformerUtil.hasModifierFlag(node, ts.ModifierFlags.Export)) {
                            return node;
                        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNkb2NfdHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvanNkb2NfdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Ba0JHO0lBRUgscURBQW1EO0lBQ25ELCtDQUFpRDtJQUNqRCxtREFBMkM7SUFDM0MseUNBQWlDO0lBQ2pDLDZFQUE4RDtJQUM5RCw4REFBc0Q7SUFDdEQsK0RBQTZEO0lBQzdELDJDQUFtQztJQXVDbkMsc0JBQXNCLElBQWEsRUFBRSxJQUFpQixFQUFFLGVBQTZCO1FBQ25GLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDbEUsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1RCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0MsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxtQkFBMEIsSUFBYTtRQUNyQyxJQUFJLE9BQU8sR0FBc0IsSUFBSSxDQUFDO1FBQ3RDLE9BQU8sT0FBTyxFQUFFO1lBQ2QsSUFBSSxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQXlCLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDeEYsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1NBQzFCO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBVEQsOEJBU0M7SUFLRCx3RUFB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QUNwRSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO3dCQUNoQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCOzRCQUN4QyxPQUFPLHdCQUF3QixDQUFDLElBQXdCLENBQUMsQ0FBQzt3QkFDNUQsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQjs0QkFDbEMsT0FBTyxzQkFBc0IsQ0FBQyxJQUE0QixDQUFDLENBQUM7d0JBQzlEOzRCQUNFLE1BQU07cUJBQ1Q7b0JBQ0QsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ25ELENBQUM7Z0JBRUQsVUFBVSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFN0QsT0FBTyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRSxDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSixDQUFDO0lBM2lCRCw0Q0EyaUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcganNkb2NfdHJhbnNmb3JtZXIgY29udGFpbnMgdGhlIGxvZ2ljIHRvIGFkZCBKU0RvYyBjb21tZW50cyB0byBUeXBlU2NyaXB0IGNvZGUuXG4gKlxuICogT25lIG9mIHRzaWNrbGUncyBmZWF0dXJlcyBpcyB0byBhZGQgQ2xvc3VyZSBDb21waWxlciBjb21wYXRpYmxlIEpTRG9jIGNvbW1lbnRzIGNvbnRhaW5pbmcgdHlwZVxuICogYW5ub3RhdGlvbnMsIGluaGVyaXRhbmNlIGluZm9ybWF0aW9uLCBldGMuLCBvbnRvIFR5cGVTY3JpcHQgY29kZS4gVGhpcyBhbGxvd3MgQ2xvc3VyZSBDb21waWxlciB0b1xuICogbWFrZSBiZXR0ZXIgb3B0aW1pemF0aW9uIGRlY2lzaW9ucyBjb21wYXJlZCB0byBhbiB1bnR5cGVkIGNvZGUgYmFzZS5cbiAqXG4gKiBUaGUgZW50cnkgcG9pbnQgdG8gdGhlIGFubm90YXRpb24gb3BlcmF0aW9uIGlzIGpzZG9jVHJhbnNmb3JtZXIgYmVsb3cuIEl0IGFkZHMgc3ludGhldGljIGNvbW1lbnRzXG4gKiB0byBleGlzdGluZyBUeXBlU2NyaXB0IGNvbnN0cnVjdHMsIGZvciBleGFtcGxlOlxuICogICAgIGNvbnN0IHg6IG51bWJlciA9IDE7XG4gKiBNaWdodCBnZXQgdHJhbnNmb3JtZWQgdG86XG4gKiAgICAgLy4uIFxcQHR5cGUge251bWJlcn0gLi9cbiAqICAgICBjb25zdCB4OiBudW1iZXIgPSAxO1xuICogTGF0ZXIgVHlwZVNjcmlwdCBwaGFzZXMgdGhlbiByZW1vdmUgdGhlIHR5cGUgYW5ub3RhdGlvbiwgYW5kIHRoZSBmaW5hbCBlbWl0IGlzIEphdmFTY3JpcHQgdGhhdFxuICogb25seSBjb250YWlucyB0aGUgSlNEb2MgY29tbWVudC5cbiAqXG4gKiBUbyBoYW5kbGUgY2VydGFpbiBjb25zdHJ1Y3RzLCB0aGlzIHRyYW5zZm9ybWVyIGFsc28gcGVyZm9ybXMgQVNUIHRyYW5zZm9ybWF0aW9ucywgZS5nLiBieSBhZGRpbmdcbiAqIENvbW1vbkpTLXN0eWxlIGV4cG9ydHMgZm9yIHR5cGUgY29uc3RydWN0cywgZXhwYW5kaW5nIGBleHBvcnQgKmAsIHBhcmVudGhlc2l6aW5nIGNhc3RzLCBldGMuXG4gKi9cblxuaW1wb3J0IHtoYXNFeHBvcnRpbmdEZWNvcmF0b3J9IGZyb20gJy4vZGVjb3JhdG9ycyc7XG5pbXBvcnQge21vZHVsZU5hbWVBc0lkZW50aWZpZXJ9IGZyb20gJy4vZXh0ZXJucyc7XG5pbXBvcnQgKiBhcyBnb29nbW9kdWxlIGZyb20gJy4vZ29vZ21vZHVsZSc7XG5pbXBvcnQgKiBhcyBqc2RvYyBmcm9tICcuL2pzZG9jJztcbmltcG9ydCB7TW9kdWxlVHlwZVRyYW5zbGF0b3J9IGZyb20gJy4vbW9kdWxlX3R5cGVfdHJhbnNsYXRvcic7XG5pbXBvcnQgKiBhcyB0cmFuc2Zvcm1lclV0aWwgZnJvbSAnLi90cmFuc2Zvcm1lcl91dGlsJztcbmltcG9ydCB7aXNWYWxpZENsb3N1cmVQcm9wZXJ0eU5hbWV9IGZyb20gJy4vdHlwZV90cmFuc2xhdG9yJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKiBBbm5vdGF0b3JIb3N0IGNvbnRhaW5zIGhvc3QgcHJvcGVydGllcyBmb3IgdGhlIEpTRG9jLWFubm90YXRpb24gcHJvY2Vzcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5ub3RhdG9ySG9zdCB7XG4gIC8qKlxuICAgKiBJZiBwcm92aWRlZCBhIGZ1bmN0aW9uIHRoYXQgbG9ncyBhbiBpbnRlcm5hbCB3YXJuaW5nLlxuICAgKiBUaGVzZSB3YXJuaW5ncyBhcmUgbm90IGFjdGlvbmFibGUgYnkgYW4gZW5kIHVzZXIgYW5kIHNob3VsZCBiZSBoaWRkZW5cbiAgICogYnkgZGVmYXVsdC5cbiAgICovXG4gIGxvZ1dhcm5pbmc/OiAod2FybmluZzogdHMuRGlhZ25vc3RpYykgPT4gdm9pZDtcbiAgcGF0aFRvTW9kdWxlTmFtZTogKGNvbnRleHQ6IHN0cmluZywgaW1wb3J0UGF0aDogc3RyaW5nKSA9PiBzdHJpbmc7XG4gIC8qKlxuICAgKiBJZiB0cnVlLCBjb252ZXJ0IGV2ZXJ5IHR5cGUgdG8gdGhlIENsb3N1cmUgez99IHR5cGUsIHdoaWNoIG1lYW5zXG4gICAqIFwiZG9uJ3QgY2hlY2sgdHlwZXNcIi5cbiAgICovXG4gIHVudHlwZWQ/OiBib29sZWFuO1xuICAvKiogSWYgcHJvdmlkZWQsIGEgc2V0IG9mIHBhdGhzIHdob3NlIHR5cGVzIHNob3VsZCBhbHdheXMgZ2VuZXJhdGUgYXMgez99LiAqL1xuICB0eXBlQmxhY2tMaXN0UGF0aHM/OiBTZXQ8c3RyaW5nPjtcbiAgLyoqXG4gICAqIENvbnZlcnQgc2hvcnRoYW5kIFwiL2luZGV4XCIgaW1wb3J0cyB0byBmdWxsIHBhdGggKGluY2x1ZGUgdGhlIFwiL2luZGV4XCIpLlxuICAgKiBBbm5vdGF0aW9uIHdpbGwgYmUgc2xvd2VyIGJlY2F1c2UgZXZlcnkgaW1wb3J0IG11c3QgYmUgcmVzb2x2ZWQuXG4gICAqL1xuICBjb252ZXJ0SW5kZXhJbXBvcnRTaG9ydGhhbmQ/OiBib29sZWFuO1xuICAvKipcbiAgICogSWYgdHJ1ZSwgbW9kaWZ5IHF1b3RlcyBhcm91bmQgcHJvcGVydHkgYWNjZXNzb3JzIHRvIG1hdGNoIHRoZSB0eXBlIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgZW5hYmxlQXV0b1F1b3Rpbmc/OiBib29sZWFuO1xuICAvKipcbiAgICogV2hldGhlciB0c2lja2xlIHNob3VsZCBpbnNlcnQgZ29vZy5wcm92aWRlKCkgY2FsbHMgaW50byB0aGUgZXh0ZXJucyBnZW5lcmF0ZWQgZm9yIGAuZC50c2AgZmlsZXNcbiAgICogdGhhdCBhcmUgZXh0ZXJuYWwgbW9kdWxlcy5cbiAgICovXG4gIHByb3ZpZGVFeHRlcm5hbE1vZHVsZUR0c05hbWVzcGFjZT86IGJvb2xlYW47XG5cbiAgLyoqIGhvc3QgYWxsb3dzIHJlc29sdmluZyBmaWxlIG5hbWVzIHRvIG1vZHVsZXMuICovXG4gIGhvc3Q6IHRzLk1vZHVsZVJlc29sdXRpb25Ib3N0O1xuICAvKiogVXNlZCB0b2dldGhlciB3aXRoIHRoZSBob3N0IGZvciBmaWxlIG5hbWUgLT4gbW9kdWxlIG5hbWUgcmVzb2x1dGlvbi4gKi9cbiAgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zO1xufVxuXG5mdW5jdGlvbiBhZGRDb21tZW50T24obm9kZTogdHMuTm9kZSwgdGFnczoganNkb2MuVGFnW10sIGVzY2FwZUV4dHJhVGFncz86IFNldDxzdHJpbmc+KSB7XG4gIGNvbnN0IGNvbW1lbnQgPSBqc2RvYy50b1N5bnRoZXNpemVkQ29tbWVudCh0YWdzLCBlc2NhcGVFeHRyYVRhZ3MpO1xuICBjb25zdCBjb21tZW50cyA9IHRzLmdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhub2RlKSB8fCBbXTtcbiAgY29tbWVudHMucHVzaChjb21tZW50KTtcbiAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKG5vZGUsIGNvbW1lbnRzKTtcbiAgcmV0dXJuIGNvbW1lbnQ7XG59XG5cbi8qKiBAcmV0dXJuIHRydWUgaWYgbm9kZSBoYXMgdGhlIHNwZWNpZmllZCBtb2RpZmllciBmbGFnIHNldC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FtYmllbnQobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICBsZXQgY3VycmVudDogdHMuTm9kZXx1bmRlZmluZWQgPSBub2RlO1xuICB3aGlsZSAoY3VycmVudCkge1xuICAgIGlmICh0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKGN1cnJlbnQgYXMgdHMuRGVjbGFyYXRpb24sIHRzLk1vZGlmaWVyRmxhZ3MuQW1iaWVudCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG50eXBlIEhhc1R5cGVQYXJhbWV0ZXJzID1cbiAgICB0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbnx0cy5DbGFzc0xpa2VEZWNsYXJhdGlvbnx0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbnx0cy5TaWduYXR1cmVEZWNsYXJhdGlvbjtcblxuLyoqIEFkZHMgYW4gXFxAdGVtcGxhdGUgY2xhdXNlIHRvIGRvY1RhZ3MgaWYgZGVjbCBoYXMgdHlwZSBwYXJhbWV0ZXJzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heWJlQWRkVGVtcGxhdGVDbGF1c2UoZG9jVGFnczoganNkb2MuVGFnW10sIGRlY2w6IEhhc1R5cGVQYXJhbWV0ZXJzKSB7XG4gIGlmICghZGVjbC50eXBlUGFyYW1ldGVycykgcmV0dXJuO1xuICAvLyBDbG9zdXJlIGRvZXMgbm90IHN1cHBvcnQgdGVtcGxhdGUgY29uc3RyYWludHMgKFQgZXh0ZW5kcyBYKSwgdGhlc2UgYXJlIGlnbm9yZWQgYmVsb3cuXG4gIGRvY1RhZ3MucHVzaCh7XG4gICAgdGFnTmFtZTogJ3RlbXBsYXRlJyxcbiAgICB0ZXh0OiBkZWNsLnR5cGVQYXJhbWV0ZXJzLm1hcCh0cCA9PiB0cmFuc2Zvcm1lclV0aWwuZ2V0SWRlbnRpZmllclRleHQodHAubmFtZSkpLmpvaW4oJywgJylcbiAgfSk7XG59XG5cbi8qKlxuICogQWRkcyBoZXJpdGFnZSBjbGF1c2VzIChcXEBleHRlbmRzLCBcXEBpbXBsZW1lbnRzKSB0byB0aGUgZ2l2ZW4gZG9jVGFncyBmb3IgZGVjbC4gVXNlZCBieVxuICoganNkb2NfdHJhbnNmb3JtZXIgYW5kIGV4dGVybnMgZ2VuZXJhdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heWJlQWRkSGVyaXRhZ2VDbGF1c2VzKFxuICAgIGRvY1RhZ3M6IGpzZG9jLlRhZ1tdLCBtdHQ6IE1vZHVsZVR5cGVUcmFuc2xhdG9yLFxuICAgIGRlY2w6IHRzLkNsYXNzTGlrZURlY2xhcmF0aW9ufHRzLkludGVyZmFjZURlY2xhcmF0aW9uKSB7XG4gIGlmICghZGVjbC5oZXJpdGFnZUNsYXVzZXMpIHJldHVybjtcbiAgY29uc3QgaXNDbGFzcyA9IGRlY2wua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uO1xuICBjb25zdCBoYXNFeHRlbmRzID0gZGVjbC5oZXJpdGFnZUNsYXVzZXMuc29tZShjID0+IGMudG9rZW4gPT09IHRzLlN5bnRheEtpbmQuRXh0ZW5kc0tleXdvcmQpO1xuICBmb3IgKGNvbnN0IGhlcml0YWdlIG9mIGRlY2wuaGVyaXRhZ2VDbGF1c2VzKSB7XG4gICAgY29uc3QgaXNFeHRlbmRzID0gaGVyaXRhZ2UudG9rZW4gPT09IHRzLlN5bnRheEtpbmQuRXh0ZW5kc0tleXdvcmQ7XG4gICAgaWYgKGlzQ2xhc3MgJiYgaXNFeHRlbmRzKSB7XG4gICAgICAvLyBJZiBhIGNsYXNzIGhhcyBhbiBcImV4dGVuZHNcIiwgdGhhdCBpcyBwcmVzZXJ2ZWQgaW4gdGhlIEVTNiBvdXRwdXRcbiAgICAgIC8vIGFuZCB3ZSBkb24ndCBuZWVkIHRvIGVtaXQgYW55IGFkZGl0aW9uYWwganNkb2MuXG4gICAgICAvL1xuICAgICAgLy8gSG93ZXZlciBmb3IgYW1iaWVudCBkZWNsYXJhdGlvbnMsIHdlIG9ubHkgZW1pdCBleHRlcm5zLCBhbmQgaW4gdGhvc2Ugd2UgZG8gbmVlZCB0b1xuICAgICAgLy8gYWRkIFwiQGV4dGVuZHMge0Zvb31cIiBhcyB0aGV5IHVzZSBFUzUgc3ludGF4LlxuICAgICAgaWYgKCFpc0FtYmllbnQoZGVjbCkpIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgaWYgd2UgZ2V0IGhlcmUsIHdlIG5lZWQgdG8gZW1pdCBzb21lIGpzZG9jLlxuICAgIGZvciAoY29uc3QgZXhwciBvZiBoZXJpdGFnZS50eXBlcykge1xuICAgICAgY29uc3QgaGVyaXRhZ2UgPSBoZXJpdGFnZU5hbWUoaXNFeHRlbmRzLCBoYXNFeHRlbmRzLCBleHByKTtcbiAgICAgIC8vIGhlcml0YWdlTmFtZSBtYXkgcmV0dXJuIG51bGwsIGluZGljYXRpbmcgdGhhdCB0aGUgY2xhdXNlIGlzIHNvbWV0aGluZyBpbmV4cHJlc3NpYmxlXG4gICAgICAvLyBpbiBDbG9zdXJlLCBlLmcuIFwiY2xhc3MgRm9vIGltcGxlbWVudHMgUGFydGlhbDxCYXI+XCIuXG4gICAgICBpZiAoIWhlcml0YWdlKSB7XG4gICAgICAgIC8vIEZvciAnZXh0ZW5kcycgY2xhdXNlcyB0aGF0IG1lYW5zIHdlIGNhbm5vdCBlbWl0IGFueXRoaW5nIGF0IGFsbC5cbiAgICAgICAgaWYgKCFpc0V4dGVuZHMpIHtcbiAgICAgICAgICBkb2NUYWdzLnB1c2goe1xuICAgICAgICAgICAgdGFnTmFtZTogaXNFeHRlbmRzID8gJ2V4dGVuZHMnIDogJ2ltcGxlbWVudHMnLFxuICAgICAgICAgICAgdHlwZTogJ0luZXhwcmVzc2libGVUeXBlJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jVGFncy5wdXNoKHtcbiAgICAgICAgICB0YWdOYW1lOiBoZXJpdGFnZS50YWdOYW1lLFxuICAgICAgICAgIHR5cGU6IGhlcml0YWdlLnBhcmVudE5hbWUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgQ2xvc3VyZSBuYW1lIG9mIGFuIGV4cHJlc3Npb24gb2NjdXJyaW5nIGluIGEgaGVyaXRhZ2UgY2xhdXNlLFxuICAgKiBlLmcuIFwiaW1wbGVtZW50cyBGb29CYXJcIi4gIFdpbGwgcmV0dXJuIG51bGwgaWYgdGhlIGV4cHJlc3Npb24gaXMgaW5leHByZXNzaWJsZVxuICAgKiBpbiBDbG9zdXJlIHNlbWFudGljcy4gIE5vdGUgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIGNvbnNpZGVyIGFsbCBwb3NzaWJsZVxuICAgKiBjb21iaW5hdGlvbnMgb2YgdHlwZXMvdmFsdWVzIGFuZCBleHRlbmRzL2ltcGxlbWVudHMgYmVjYXVzZSBvdXIgaW5wdXQgaXNcbiAgICogYWxyZWFkeSB2ZXJpZmllZCB0byBiZSB2YWxpZCBUeXBlU2NyaXB0LiAgU2VlIHRlc3RfZmlsZXMvY2xhc3MvIGZvciB0aGUgZnVsbFxuICAgKiBjYXJ0ZXNpYW4gcHJvZHVjdCBvZiB0ZXN0IGNhc2VzLlxuICAgKiBAcGFyYW0gaXNFeHRlbmRzIFRydWUgaWYgd2UncmUgaW4gYW4gJ2V4dGVuZHMnLCBmYWxzZSBpbiBhbiAnaW1wbGVtZW50cycuXG4gICAqIEBwYXJhbSBoYXNFeHRlbmRzIFRydWUgaWYgdGhlcmUgYXJlIGFueSAnZXh0ZW5kcycgY2xhdXNlcyBwcmVzZW50IGF0IGFsbC5cbiAgICovXG4gIGZ1bmN0aW9uIGhlcml0YWdlTmFtZShcbiAgICAgIGlzRXh0ZW5kczogYm9vbGVhbiwgaGFzRXh0ZW5kczogYm9vbGVhbixcbiAgICAgIGV4cHI6IHRzLkV4cHJlc3Npb25XaXRoVHlwZUFyZ3VtZW50cyk6IHt0YWdOYW1lOiBzdHJpbmcsIHBhcmVudE5hbWU6IHN0cmluZ318bnVsbCB7XG4gICAgbGV0IHRhZ05hbWUgPSBpc0V4dGVuZHMgPyAnZXh0ZW5kcycgOiAnaW1wbGVtZW50cyc7XG4gICAgbGV0IHN5bSA9IG10dC50eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGV4cHIuZXhwcmVzc2lvbik7XG4gICAgaWYgKCFzeW0pIHtcbiAgICAgIC8vIEl0J3MgcG9zc2libGUgZm9yIGEgY2xhc3MgZGVjbGFyYXRpb24gdG8gZXh0ZW5kIGFuIGV4cHJlc3Npb24gdGhhdFxuICAgICAgLy8gZG9lcyBub3QgaGF2ZSBoYXZlIGEgc3ltYm9sLCBmb3IgZXhhbXBsZSB3aGVuIGEgbWl4aW4gZnVuY3Rpb24gaXNcbiAgICAgIC8vIHVzZWQgdG8gYnVpbGQgYSBiYXNlIGNsYXNzLCBhcyBpbiBgZGVjbGFyZSBNeUNsYXNzIGV4dGVuZHNcbiAgICAgIC8vIE15TWl4aW4oTXlCYXNlQ2xhc3MpYC5cbiAgICAgIC8vXG4gICAgICAvLyBIYW5kbGluZyB0aGlzIGNvcnJlY3RseSBpcyB0cmlja3kuIENsb3N1cmUgdGhyb3dzIG9uIHRoaXNcbiAgICAgIC8vIGBleHRlbmRzIDxleHByZXNzaW9uPmAgc3ludGF4IChzZWVcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvY2xvc3VyZS1jb21waWxlci9pc3N1ZXMvMjE4MikuIFdlIHdvdWxkXG4gICAgICAvLyBwcm9iYWJseSBuZWVkIHRvIGdlbmVyYXRlIGFuIGludGVybWVkaWF0ZSBjbGFzcyBkZWNsYXJhdGlvbiBhbmRcbiAgICAgIC8vIGV4dGVuZCB0aGF0LlxuICAgICAgbXR0LmRlYnVnV2FybihkZWNsLCBgY291bGQgbm90IHJlc29sdmUgc3VwZXJ0eXBlOiAke2V4cHIuZ2V0VGV4dCgpfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVzb2x2ZSBhbnkgYWxpYXNlcyB0byB0aGUgdW5kZXJseWluZyB0eXBlLlxuICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5UeXBlQWxpYXMpIHtcbiAgICAgIC8vIEl0J3MgaW1wbGVtZW50aW5nIGEgdHlwZSBhbGlhcy4gIEZvbGxvdyB0aGUgdHlwZSBhbGlhcyBiYWNrXG4gICAgICAvLyB0byB0aGUgb3JpZ2luYWwgc3ltYm9sIHRvIGNoZWNrIHdoZXRoZXIgaXQncyBhIHR5cGUgb3IgYSB2YWx1ZS5cbiAgICAgIGNvbnN0IHR5cGUgPSBtdHQudHlwZUNoZWNrZXIuZ2V0RGVjbGFyZWRUeXBlT2ZTeW1ib2woc3ltKTtcbiAgICAgIGlmICghdHlwZS5zeW1ib2wpIHtcbiAgICAgICAgLy8gSXQncyBub3QgY2xlYXIgd2hlbiB0aGlzIGNhbiBoYXBwZW4uXG4gICAgICAgIG10dC5kZWJ1Z1dhcm4oZGVjbCwgYGNvdWxkIG5vdCBnZXQgdHlwZSBvZiBzeW1ib2w6ICR7ZXhwci5nZXRUZXh0KCl9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgc3ltID0gdHlwZS5zeW1ib2w7XG4gICAgfVxuICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgc3ltID0gbXR0LnR5cGVDaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltKTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlVHJhbnNsYXRvciA9IG10dC5uZXdUeXBlVHJhbnNsYXRvcihleHByLmV4cHJlc3Npb24pO1xuICAgIGlmICh0eXBlVHJhbnNsYXRvci5pc0JsYWNrTGlzdGVkKHN5bSkpIHtcbiAgICAgIC8vIERvbid0IGVtaXQgcmVmZXJlbmNlcyB0byBibGFja2xpc3RlZCB0eXBlcy5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5DbGFzcykge1xuICAgICAgaWYgKCFpc0NsYXNzKSB7XG4gICAgICAgIC8vIENsb3N1cmUgaW50ZXJmYWNlcyBjYW5ub3QgZXh0ZW5kIG9yIGltcGxlbWVudHMgY2xhc3Nlcy5cbiAgICAgICAgbXR0LmRlYnVnV2FybihkZWNsLCBgb21pdHRpbmcgaW50ZXJmYWNlIGRlcml2aW5nIGZyb20gY2xhc3M6ICR7ZXhwci5nZXRUZXh0KCl9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCFpc0V4dGVuZHMpIHtcbiAgICAgICAgaWYgKCFoYXNFeHRlbmRzKSB7XG4gICAgICAgICAgLy8gQSBzcGVjaWFsIGNhc2U6IGZvciBhIGNsYXNzIHRoYXQgaGFzIG5vIGV4aXN0aW5nICdleHRlbmRzJyBjbGF1c2UgYnV0IGRvZXNcbiAgICAgICAgICAvLyBoYXZlIGFuICdpbXBsZW1lbnRzJyBjbGF1c2UgdGhhdCByZWZlcnMgdG8gYW5vdGhlciBjbGFzcywgd2UgY2hhbmdlIGl0IHRvXG4gICAgICAgICAgLy8gaW5zdGVhZCBiZSBhbiAnZXh0ZW5kcycuICBUaGlzIHdhcyBhIHBvb3JseS10aG91Z2h0LW91dCBoYWNrIHRoYXQgbWF5XG4gICAgICAgICAgLy8gYWN0dWFsbHkgY2F1c2UgY29tcGlsZXIgYnVnczpcbiAgICAgICAgICAvLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvY2xvc3VyZS1jb21waWxlci9pc3N1ZXMvMzEyNlxuICAgICAgICAgIC8vIGJ1dCB3ZSBoYXZlIGNvZGUgdGhhdCBub3cgcmVsaWVzIG9uIGl0LCB1Z2guXG4gICAgICAgICAgdGFnTmFtZSA9ICdleHRlbmRzJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDbG9zdXJlIGNhbiBvbmx5IEBpbXBsZW1lbnRzIGFuIGludGVyZmFjZSwgbm90IGEgY2xhc3MuXG4gICAgICAgICAgbXR0LmRlYnVnV2FybihkZWNsLCBgb21pdHRpbmcgQGltcGxlbWVudHMgb2YgYSBjbGFzczogJHtleHByLmdldFRleHQoKX1gKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3ltLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpIHtcbiAgICAgIC8vIElmIGl0J3Mgc29tZXRoaW5nIG90aGVyIHRoYW4gYSBjbGFzcyBpbiB0aGUgdmFsdWUgbmFtZXNwYWNlLCB0aGVuIGl0IHdpbGxcbiAgICAgIC8vIG5vdCBiZSBhIHR5cGUgaW4gdGhlIENsb3N1cmUgb3V0cHV0IChiZWNhdXNlIENsb3N1cmUgY29sbGFwc2VzXG4gICAgICAvLyB0aGUgdHlwZSBhbmQgdmFsdWUgbmFtZXNwYWNlcykuXG4gICAgICBtdHQuZGVidWdXYXJuKFxuICAgICAgICAgIGRlY2wsIGBvbWl0dGluZyBoZXJpdGFnZSByZWZlcmVuY2UgdG8gYSB0eXBlL3ZhbHVlIGNvbmZsaWN0OiAke2V4cHIuZ2V0VGV4dCgpfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5UeXBlTGl0ZXJhbCkge1xuICAgICAgLy8gQSB0eXBlIGxpdGVyYWwgaXMgYSB0eXBlIGxpa2UgYHtmb286IHN0cmluZ31gLlxuICAgICAgLy8gVGhlc2UgY2FuIGNvbWUgdXAgYXMgdGhlIG91dHB1dCBvZiBhIG1hcHBlZCB0eXBlLlxuICAgICAgbXR0LmRlYnVnV2FybihkZWNsLCBgb21pdHRpbmcgaGVyaXRhZ2UgcmVmZXJlbmNlIHRvIGEgdHlwZSBsaXRlcmFsOiAke2V4cHIuZ2V0VGV4dCgpfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gdHlwZVRvQ2xvc3VyZSBpbmNsdWRlcyBudWxsYWJpbGl0eSBtb2RpZmllcnMsIHNvIGNhbGwgc3ltYm9sVG9TdHJpbmcgZGlyZWN0bHkgaGVyZS5cbiAgICBjb25zdCBwYXJlbnROYW1lID0gdHlwZVRyYW5zbGF0b3Iuc3ltYm9sVG9TdHJpbmcoc3ltKTtcbiAgICBpZiAoIXBhcmVudE5hbWUpIHJldHVybiBudWxsO1xuICAgIHJldHVybiB7dGFnTmFtZSwgcGFyZW50TmFtZX07XG4gIH1cbn1cblxuLyoqXG4gKiBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24gZW1pdHMgdGhlIHR5cGUgYW5ub3RhdGlvbnMgZm9yIG1lbWJlcnMgb2YgYSBjbGFzcy4gSXQncyBuZWNlc3NhcnkgaW5cbiAqIHRoZSBjYXNlIHdoZXJlIFR5cGVTY3JpcHQgc3ludGF4IHNwZWNpZmllcyB0aGVyZSBhcmUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIG9uIHRoZSBjbGFzcywgYmVjYXVzZVxuICogdG8gZGVjbGFyZSB0aGVzZSBpbiBDbG9zdXJlIHlvdSBtdXN0IGRlY2xhcmUgdGhlc2Ugc2VwYXJhdGVseSBmcm9tIHRoZSBjbGFzcy5cbiAqXG4gKiBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24gcHJvZHVjZXMgYW4gaWYgKGZhbHNlKSBzdGF0ZW1lbnQgY29udGFpbmluZyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMsIG9yXG4gKiBudWxsIGlmIG5vIGRlY2xhcmF0aW9ucyBjb3VsZCBvciBuZWVkZWQgdG8gYmUgZ2VuZXJhdGVkIChlLmcuIG5vIG1lbWJlcnMsIG9yIGFuIHVubmFtZWQgdHlwZSkuXG4gKiBUaGUgaWYgc3RhdGVtZW50IGlzIHVzZWQgdG8gbWFrZSBzdXJlIHRoZSBjb2RlIGlzIG5vdCBleGVjdXRlZCwgb3RoZXJ3aXNlIHByb3BlcnR5IGFjY2Vzc2VzIGNvdWxkXG4gKiB0cmlnZ2VyIGdldHRlcnMgb24gYSBzdXBlcmNsYXNzLiBTZWUgdGVzdF9maWxlcy9maWVsZHMvZmllbGRzLnRzOkJhc2VUaGF0VGhyb3dzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24oXG4gICAgbXR0OiBNb2R1bGVUeXBlVHJhbnNsYXRvcixcbiAgICB0eXBlRGVjbDogdHMuQ2xhc3NEZWNsYXJhdGlvbnx0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbik6IHRzLklmU3RhdGVtZW50fG51bGwge1xuICAvLyBHYXRoZXIgcGFyYW1ldGVyIHByb3BlcnRpZXMgZnJvbSB0aGUgY29uc3RydWN0b3IsIGlmIGl0IGV4aXN0cy5cbiAgY29uc3QgY3RvcnM6IHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb25bXSA9IFtdO1xuICBsZXQgcGFyYW1Qcm9wczogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb25bXSA9IFtdO1xuICBjb25zdCBub25TdGF0aWNQcm9wczogQXJyYXk8dHMuUHJvcGVydHlEZWNsYXJhdGlvbnx0cy5Qcm9wZXJ0eVNpZ25hdHVyZT4gPSBbXTtcbiAgY29uc3Qgc3RhdGljUHJvcHM6IEFycmF5PHRzLlByb3BlcnR5RGVjbGFyYXRpb258dHMuUHJvcGVydHlTaWduYXR1cmU+ID0gW107XG4gIGNvbnN0IHVuaGFuZGxlZDogdHMuTmFtZWREZWNsYXJhdGlvbltdID0gW107XG4gIGNvbnN0IGFic3RyYWN0TWV0aG9kczogdHMuRnVuY3Rpb25MaWtlRGVjbGFyYXRpb25bXSA9IFtdO1xuICBmb3IgKGNvbnN0IG1lbWJlciBvZiB0eXBlRGVjbC5tZW1iZXJzKSB7XG4gICAgaWYgKG1lbWJlci5raW5kID09PSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yKSB7XG4gICAgICBjdG9ycy5wdXNoKG1lbWJlciBhcyB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlEZWNsYXJhdGlvbihtZW1iZXIpIHx8IHRzLmlzUHJvcGVydHlTaWduYXR1cmUobWVtYmVyKSkge1xuICAgICAgY29uc3QgaXNTdGF0aWMgPSB0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKG1lbWJlciwgdHMuTW9kaWZpZXJGbGFncy5TdGF0aWMpO1xuICAgICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICAgIHN0YXRpY1Byb3BzLnB1c2gobWVtYmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vblN0YXRpY1Byb3BzLnB1c2gobWVtYmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgICBtZW1iZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbiB8fFxuICAgICAgICBtZW1iZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5NZXRob2RTaWduYXR1cmUgfHxcbiAgICAgICAgbWVtYmVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuR2V0QWNjZXNzb3IgfHwgbWVtYmVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3IpIHtcbiAgICAgIGlmICh0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKG1lbWJlciwgdHMuTW9kaWZpZXJGbGFncy5BYnN0cmFjdCkgfHxcbiAgICAgICAgICB0cy5pc0ludGVyZmFjZURlY2xhcmF0aW9uKHR5cGVEZWNsKSkge1xuICAgICAgICBhYnN0cmFjdE1ldGhvZHMucHVzaChcbiAgICAgICAgICAgIG1lbWJlciBhcyB0cy5NZXRob2REZWNsYXJhdGlvbiB8IHRzLkdldEFjY2Vzc29yRGVjbGFyYXRpb24gfCB0cy5TZXRBY2Nlc3NvckRlY2xhcmF0aW9uKTtcbiAgICAgIH1cbiAgICAgIC8vIE5vbi1hYnN0cmFjdCBtZXRob2RzIG9ubHkgZXhpc3Qgb24gY2xhc3NlcywgYW5kIGFyZSBoYW5kbGVkIGluIHJlZ3VsYXIgZW1pdC5cbiAgICB9IGVsc2Uge1xuICAgICAgdW5oYW5kbGVkLnB1c2gobWVtYmVyKTtcbiAgICB9XG4gIH1cblxuICBpZiAoY3RvcnMubGVuZ3RoID4gMCkge1xuICAgIC8vIE9ubHkgdGhlIGFjdHVhbCBjb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggbXVzdCBiZSBsYXN0IGluIGEgcG90ZW50aWFsIHNlcXVlbmNlIG9mXG4gICAgLy8gb3ZlcmxvYWRlZCBjb25zdHJ1Y3RvcnMsIG1heSBjb250YWluIHBhcmFtZXRlciBwcm9wZXJ0aWVzLlxuICAgIGNvbnN0IGN0b3IgPSBjdG9yc1tjdG9ycy5sZW5ndGggLSAxXTtcbiAgICBwYXJhbVByb3BzID0gY3Rvci5wYXJhbWV0ZXJzLmZpbHRlcihcbiAgICAgICAgcCA9PiB0cmFuc2Zvcm1lclV0aWwuaGFzTW9kaWZpZXJGbGFnKHAsIHRzLk1vZGlmaWVyRmxhZ3MuUGFyYW1ldGVyUHJvcGVydHlNb2RpZmllcikpO1xuICB9XG5cbiAgaWYgKG5vblN0YXRpY1Byb3BzLmxlbmd0aCA9PT0gMCAmJiBwYXJhbVByb3BzLmxlbmd0aCA9PT0gMCAmJiBzdGF0aWNQcm9wcy5sZW5ndGggPT09IDAgJiZcbiAgICAgIGFic3RyYWN0TWV0aG9kcy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBUaGVyZSBhcmUgbm8gbWVtYmVycyBzbyB3ZSBkb24ndCBuZWVkIHRvIGVtaXQgYW55IHR5cGVcbiAgICAvLyBhbm5vdGF0aW9ucyBoZWxwZXIuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoIXR5cGVEZWNsLm5hbWUpIHtcbiAgICBtdHQuZGVidWdXYXJuKHR5cGVEZWNsLCAnY2Fubm90IGFkZCB0eXBlcyBvbiB1bm5hbWVkIGRlY2xhcmF0aW9ucycpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY2xhc3NOYW1lID0gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KHR5cGVEZWNsLm5hbWUpO1xuICBjb25zdCBzdGF0aWNQcm9wQWNjZXNzID0gdHMuY3JlYXRlSWRlbnRpZmllcihjbGFzc05hbWUpO1xuICBjb25zdCBpbnN0YW5jZVByb3BBY2Nlc3MgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhzdGF0aWNQcm9wQWNjZXNzLCAncHJvdG90eXBlJyk7XG4gIC8vIENsb3N1cmUgQ29tcGlsZXIgd2lsbCByZXBvcnQgY29uZm9ybWFuY2UgZXJyb3JzIGFib3V0IHRoaXMgYmVpbmcgdW5rbm93biB0eXBlIHdoZW4gZW1pdHRpbmdcbiAgLy8gY2xhc3MgcHJvcGVydGllcyBhcyB7P3x1bmRlZmluZWR9LCBpbnN0ZWFkIG9mIGp1c3Qgez99LiBTbyBtYWtlIHN1cmUgdG8gb25seSBlbWl0IHs/fHVuZGVmaW5lZH1cbiAgLy8gb24gaW50ZXJmYWNlcy5cbiAgY29uc3QgaXNJbnRlcmZhY2UgPSB0cy5pc0ludGVyZmFjZURlY2xhcmF0aW9uKHR5cGVEZWNsKTtcbiAgY29uc3QgcHJvcGVydHlEZWNscyA9IHN0YXRpY1Byb3BzLm1hcChcbiAgICAgIHAgPT4gY3JlYXRlQ2xvc3VyZVByb3BlcnR5RGVjbGFyYXRpb24oXG4gICAgICAgICAgbXR0LCBzdGF0aWNQcm9wQWNjZXNzLCBwLCBpc0ludGVyZmFjZSAmJiAhIXAucXVlc3Rpb25Ub2tlbikpO1xuICBwcm9wZXJ0eURlY2xzLnB1c2goLi4uWy4uLm5vblN0YXRpY1Byb3BzLCAuLi5wYXJhbVByb3BzXS5tYXAoXG4gICAgICBwID0+IGNyZWF0ZUNsb3N1cmVQcm9wZXJ0eURlY2xhcmF0aW9uKFxuICAgICAgICAgIG10dCwgaW5zdGFuY2VQcm9wQWNjZXNzLCBwLCBpc0ludGVyZmFjZSAmJiAhIXAucXVlc3Rpb25Ub2tlbikpKTtcbiAgcHJvcGVydHlEZWNscy5wdXNoKC4uLnVuaGFuZGxlZC5tYXAoXG4gICAgICBwID0+IHRyYW5zZm9ybWVyVXRpbC5jcmVhdGVNdWx0aUxpbmVDb21tZW50KFxuICAgICAgICAgIHAsIGBTa2lwcGluZyB1bmhhbmRsZWQgbWVtYmVyOiAke2VzY2FwZUZvckNvbW1lbnQocC5nZXRUZXh0KCkpfWApKSk7XG5cbiAgZm9yIChjb25zdCBmbkRlY2wgb2YgYWJzdHJhY3RNZXRob2RzKSB7XG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZShmbkRlY2wpO1xuICAgIGlmICghbmFtZSkge1xuICAgICAgbXR0LmVycm9yKGZuRGVjbCwgJ2Fub255bW91cyBhYnN0cmFjdCBmdW5jdGlvbicpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHt0YWdzLCBwYXJhbWV0ZXJOYW1lc30gPSBtdHQuZ2V0RnVuY3Rpb25UeXBlSlNEb2MoW2ZuRGVjbF0sIFtdKTtcbiAgICBpZiAoaGFzRXhwb3J0aW5nRGVjb3JhdG9yKGZuRGVjbCwgbXR0LnR5cGVDaGVja2VyKSkgdGFncy5wdXNoKHt0YWdOYW1lOiAnZXhwb3J0J30pO1xuICAgIC8vIG1lbWJlck5hbWVzcGFjZSBiZWNhdXNlIGFic3RyYWN0IG1ldGhvZHMgY2Fubm90IGJlIHN0YXRpYyBpbiBUeXBlU2NyaXB0LlxuICAgIGNvbnN0IGFic3RyYWN0Rm5EZWNsID0gdHMuY3JlYXRlU3RhdGVtZW50KHRzLmNyZWF0ZUFzc2lnbm1lbnQoXG4gICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKGluc3RhbmNlUHJvcEFjY2VzcywgbmFtZSksXG4gICAgICAgIHRzLmNyZWF0ZUZ1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBhc3RlcmlzayAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBuYW1lICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHBhcmFtZXRlck5hbWVzLm1hcChcbiAgICAgICAgICAgICAgICBuID0+IHRzLmNyZWF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIC8qIGRvdERvdERvdCAqLyB1bmRlZmluZWQsIG4pKSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRzLmNyZWF0ZUJsb2NrKFtdKSxcbiAgICAgICAgICAgICkpKTtcbiAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoYWJzdHJhY3RGbkRlY2wsIFtqc2RvYy50b1N5bnRoZXNpemVkQ29tbWVudCh0YWdzKV0pO1xuICAgIHByb3BlcnR5RGVjbHMucHVzaCh0cy5zZXRTb3VyY2VNYXBSYW5nZShhYnN0cmFjdEZuRGVjbCwgZm5EZWNsKSk7XG4gIH1cblxuICAvLyBTZWUgdGVzdF9maWxlcy9maWVsZHMvZmllbGRzLnRzOkJhc2VUaGF0VGhyb3dzIGZvciBhIG5vdGUgb24gdGhpcyB3cmFwcGVyLlxuICByZXR1cm4gdHMuY3JlYXRlSWYodHMuY3JlYXRlTGl0ZXJhbChmYWxzZSksIHRzLmNyZWF0ZUJsb2NrKHByb3BlcnR5RGVjbHMsIHRydWUpKTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlOYW1lKHByb3A6IHRzLk5hbWVkRGVjbGFyYXRpb24pOiBzdHJpbmd8bnVsbCB7XG4gIGlmICghcHJvcC5uYW1lKSByZXR1cm4gbnVsbDtcblxuICBzd2l0Y2ggKHByb3AubmFtZS5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICByZXR1cm4gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KHByb3AubmFtZSBhcyB0cy5JZGVudGlmaWVyKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgIC8vIEUuZy4gaW50ZXJmYWNlIEZvbyB7ICdiYXInOiBudW1iZXI7IH1cbiAgICAgIC8vIElmICdiYXInIGlzIGEgbmFtZSB0aGF0IGlzIG5vdCB2YWxpZCBpbiBDbG9zdXJlIHRoZW4gdGhlcmUncyBub3RoaW5nIHdlIGNhbiBkby5cbiAgICAgIGNvbnN0IHRleHQgPSAocHJvcC5uYW1lIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgICBpZiAoIWlzVmFsaWRDbG9zdXJlUHJvcGVydHlOYW1lKHRleHQpKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogUmVtb3ZlcyBjb21tZW50IG1ldGFjaGFyYWN0ZXJzIGZyb20gYSBzdHJpbmcsIHRvIG1ha2UgaXQgc2FmZSB0byBlbWJlZCBpbiBhIGNvbW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRm9yQ29tbWVudChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFwvXFwqL2csICdfXycpLnJlcGxhY2UoL1xcKlxcLy9nLCAnX18nKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xvc3VyZVByb3BlcnR5RGVjbGFyYXRpb24oXG4gICAgbXR0OiBNb2R1bGVUeXBlVHJhbnNsYXRvciwgZXhwcjogdHMuRXhwcmVzc2lvbixcbiAgICBwcm9wOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9ufHRzLlByb3BlcnR5U2lnbmF0dXJlfHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uLFxuICAgIG9wdGlvbmFsOiBib29sZWFuKTogdHMuU3RhdGVtZW50IHtcbiAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZShwcm9wKTtcbiAgaWYgKCFuYW1lKSB7XG4gICAgbXR0LmRlYnVnV2Fybihwcm9wLCBgaGFuZGxlIHVubmFtZWQgbWVtYmVyOlxcbiR7ZXNjYXBlRm9yQ29tbWVudChwcm9wLmdldFRleHQoKSl9YCk7XG4gICAgcmV0dXJuIHRyYW5zZm9ybWVyVXRpbC5jcmVhdGVNdWx0aUxpbmVDb21tZW50KFxuICAgICAgICBwcm9wLCBgU2tpcHBpbmcgdW5uYW1lZCBtZW1iZXI6XFxuJHtlc2NhcGVGb3JDb21tZW50KHByb3AuZ2V0VGV4dCgpKX1gKTtcbiAgfVxuXG4gIGxldCB0eXBlID0gbXR0LnR5cGVUb0Nsb3N1cmUocHJvcCk7XG4gIC8vIFdoZW4gYSBwcm9wZXJ0eSBpcyBvcHRpb25hbCwgZS5nLlxuICAvLyAgIGZvbz86IHN0cmluZztcbiAgLy8gVGhlbiB0aGUgVHlwZVNjcmlwdCB0eXBlIG9mIHRoZSBwcm9wZXJ0eSBpcyBzdHJpbmd8dW5kZWZpbmVkLCB0aGVcbiAgLy8gdHlwZVRvQ2xvc3VyZSB0cmFuc2xhdGlvbiBoYW5kbGVzIGl0IGNvcnJlY3RseSwgYW5kIHN0cmluZ3x1bmRlZmluZWQgaXNcbiAgLy8gaG93IHlvdSB3cml0ZSBhbiBvcHRpb25hbCBwcm9wZXJ0eSBpbiBDbG9zdXJlLlxuICAvL1xuICAvLyBCdXQgaW4gdGhlIHNwZWNpYWwgY2FzZSBvZiBhbiBvcHRpb25hbCBwcm9wZXJ0eSB3aXRoIHR5cGUgYW55OlxuICAvLyAgIGZvbz86IGFueTtcbiAgLy8gVGhlIFR5cGVTY3JpcHQgdHlwZSBvZiB0aGUgcHJvcGVydHkgaXMganVzdCBcImFueVwiIChiZWNhdXNlIGFueSBpbmNsdWRlc1xuICAvLyB1bmRlZmluZWQgYXMgd2VsbCkgc28gb3VyIGRlZmF1bHQgdHJhbnNsYXRpb24gb2YgdGhlIHR5cGUgaXMganVzdCBcIj9cIi5cbiAgLy8gVG8gbWFyayB0aGUgcHJvcGVydHkgYXMgb3B0aW9uYWwgaW4gQ2xvc3VyZSBpdCBtdXN0IGhhdmUgXCJ8dW5kZWZpbmVkXCIsXG4gIC8vIHNvIHRoZSBDbG9zdXJlIHR5cGUgbXVzdCBiZSA/fHVuZGVmaW5lZC5cbiAgaWYgKG9wdGlvbmFsICYmIHR5cGUgPT09ICc/JykgdHlwZSArPSAnfHVuZGVmaW5lZCc7XG5cbiAgY29uc3QgdGFncyA9IG10dC5nZXRKU0RvYyhwcm9wLCAvKiByZXBvcnRXYXJuaW5ncyAqLyB0cnVlKTtcbiAgdGFncy5wdXNoKHt0YWdOYW1lOiAndHlwZScsIHR5cGV9KTtcbiAgY29uc3QgZmxhZ3MgPSB0cy5nZXRDb21iaW5lZE1vZGlmaWVyRmxhZ3MocHJvcCk7XG4gIGlmIChmbGFncyAmIHRzLk1vZGlmaWVyRmxhZ3MuUHJvdGVjdGVkKSB7XG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiAncHJvdGVjdGVkJ30pO1xuICB9IGVsc2UgaWYgKGZsYWdzICYgdHMuTW9kaWZpZXJGbGFncy5Qcml2YXRlKSB7XG4gICAgdGFncy5wdXNoKHt0YWdOYW1lOiAncHJpdmF0ZSd9KTtcbiAgfVxuICBpZiAoaGFzRXhwb3J0aW5nRGVjb3JhdG9yKHByb3AsIG10dC50eXBlQ2hlY2tlcikpIHtcbiAgICB0YWdzLnB1c2goe3RhZ05hbWU6ICdleHBvcnQnfSk7XG4gIH1cbiAgY29uc3QgZGVjbFN0bXQgPVxuICAgICAgdHMuc2V0U291cmNlTWFwUmFuZ2UodHMuY3JlYXRlU3RhdGVtZW50KHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKGV4cHIsIG5hbWUpKSwgcHJvcCk7XG4gIC8vIEF2b2lkIHByaW50aW5nIGFubm90YXRpb25zIHRoYXQgY2FuIGNvbmZsaWN0IHdpdGggQHR5cGVcbiAgLy8gVGhpcyBhdm9pZHMgQ2xvc3VyZSdzIGVycm9yIFwidHlwZSBhbm5vdGF0aW9uIGluY29tcGF0aWJsZSB3aXRoIG90aGVyIGFubm90YXRpb25zXCJcbiAgYWRkQ29tbWVudE9uKGRlY2xTdG10LCB0YWdzLCBqc2RvYy5UQUdTX0NPTkZMSUNUSU5HX1dJVEhfVFlQRSk7XG4gIHJldHVybiBkZWNsU3RtdDtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFueSB0eXBlIGFzc2VydGlvbnMgYW5kIG5vbi1udWxsIGV4cHJlc3Npb25zIGZyb20gdGhlIEFTVCBiZWZvcmUgVHlwZVNjcmlwdCBwcm9jZXNzaW5nLlxuICpcbiAqIElkZWFsbHksIHRoZSBjb2RlIGluIGpzZG9jX3RyYW5zZm9ybWVyIGJlbG93IHNob3VsZCBqdXN0IHJlbW92ZSB0aGUgY2FzdCBleHByZXNzaW9uIGFuZFxuICogcmVwbGFjZSBpdCB3aXRoIHRoZSBDbG9zdXJlIGVxdWl2YWxlbnQuIEhvd2V2ZXIgQW5ndWxhcidzIGNvbXBpbGVyIGlzIGZyYWdpbGUgdG8gQVNUXG4gKiBub2RlcyBiZWluZyByZW1vdmVkIG9yIGNoYW5naW5nIHR5cGUsIHNvIHRoZSBjb2RlIG11c3QgcmV0YWluIHRoZSB0eXBlIGFzc2VydGlvblxuICogZXhwcmVzc2lvbiwgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yNDg5NS5cbiAqXG4gKiB0c2lja2xlIGFsc28gY2Fubm90IGp1c3QgZ2VuZXJhdGUgYW5kIGtlZXAgYSBgKC8uLiBAdHlwZSB7U29tZVR5cGV9IC4vIChleHByIGFzIFNvbWVUeXBlKSlgXG4gKiBiZWNhdXNlIFR5cGVTY3JpcHQgcmVtb3ZlcyB0aGUgcGFyZW50aGVzaXplZCBleHByZXNzaW9ucyBpbiB0aGF0IHN5bnRheCwgKHJlYXNvbmFibHkpIGJlbGlldmluZ1xuICogdGhleSB3ZXJlIG9ubHkgYWRkZWQgZm9yIHRoZSBUUyBjYXN0LlxuICpcbiAqIFRoZSBmaW5hbCB3b3JrYXJvdW5kIGlzIHRoZW4gdG8ga2VlcCB0aGUgVHlwZVNjcmlwdCB0eXBlIGFzc2VydGlvbnMsIGFuZCBoYXZlIGEgcG9zdC1Bbmd1bGFyXG4gKiBwcm9jZXNzaW5nIHN0ZXAgdGhhdCByZW1vdmVzIHRoZSBhc3NlcnRpb25zIGJlZm9yZSBUeXBlU2NyaXB0IHNlZXMgdGhlbS5cbiAqXG4gKiBUT0RPKG1hcnRpbnByb2JzdCk6IHJlbW92ZSBvbmNlIHRoZSBBbmd1bGFyIGlzc3VlIGlzIGZpeGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVHlwZUFzc2VydGlvbnMoKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHtcbiAgICByZXR1cm4gKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHtcbiAgICAgIGZ1bmN0aW9uIHZpc2l0b3Iobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUge1xuICAgICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlQXNzZXJ0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXNFeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHRzLnZpc2l0Tm9kZSgobm9kZSBhcyB0cy5Bc3NlcnRpb25FeHByZXNzaW9uKS5leHByZXNzaW9uLCB2aXNpdG9yKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTm9uTnVsbEV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gdHMudmlzaXROb2RlKChub2RlIGFzIHRzLk5vbk51bGxFeHByZXNzaW9uKS5leHByZXNzaW9uLCB2aXNpdG9yKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmlzaXRvcihzb3VyY2VGaWxlKSBhcyB0cy5Tb3VyY2VGaWxlO1xuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICoganNkb2NUcmFuc2Zvcm1lciByZXR1cm5zIGEgdHJhbnNmb3JtZXIgZmFjdG9yeSB0aGF0IGNvbnZlcnRzIFR5cGVTY3JpcHQgdHlwZXMgaW50byB0aGUgZXF1aXZhbGVudFxuICogSlNEb2MgYW5ub3RhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqc2RvY1RyYW5zZm9ybWVyKFxuICAgIGhvc3Q6IEFubm90YXRvckhvc3QsIHRzT3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLCB0c0hvc3Q6IHRzLkNvbXBpbGVySG9zdCxcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10pOlxuICAgIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+IHtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOiB0cy5UcmFuc2Zvcm1lcjx0cy5Tb3VyY2VGaWxlPiA9PiB7XG4gICAgcmV0dXJuIChzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgICBjb25zdCBtb2R1bGVUeXBlVHJhbnNsYXRvciA9IG5ldyBNb2R1bGVUeXBlVHJhbnNsYXRvcihcbiAgICAgICAgICBzb3VyY2VGaWxlLCB0eXBlQ2hlY2tlciwgaG9zdCwgZGlhZ25vc3RpY3MsIC8qaXNGb3JFeHRlcm5zKi8gZmFsc2UpO1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgc2V0IG9mIGFsbCBuYW1lcyBleHBvcnRlZCBmcm9tIGFuIGV4cG9ydCAqIGluIHRoZSBjdXJyZW50IG1vZHVsZS4gVXNlZCB0byBwcmV2ZW50XG4gICAgICAgKiBlbWl0dGluZyBkdXBsaWNhdGVkIGV4cG9ydHMuIFRoZSBmaXJzdCBleHBvcnQgKiB0YWtlcyBwcmVjZWRlbmNlIGluIEVTNi5cbiAgICAgICAqL1xuICAgICAgY29uc3QgZXhwYW5kZWRTdGFySW1wb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gICAgICAvKipcbiAgICAgICAqIFdoaWxlIENsb3N1cmUgY29tcGlsZXIgc3VwcG9ydHMgcGFyYW1ldGVyaXplZCB0eXBlcywgaW5jbHVkaW5nIHBhcmFtZXRlcml6ZWQgYHRoaXNgIG9uXG4gICAgICAgKiBtZXRob2RzLCBpdCBkb2VzIG5vdCBzdXBwb3J0IGNvbnN0cmFpbnRzIG9uIHRoZW0uIFRoYXQgbWVhbnMgdGhhdCBhbiBgXFxAdGVtcGxhdGVgZCB0eXBlIGlzXG4gICAgICAgKiBhbHdheXMgY29uc2lkZXJlZCB0byBiZSBgdW5rbm93bmAgd2l0aGluIHRoZSBtZXRob2QsIGluY2x1ZGluZyBgVEhJU2AuXG4gICAgICAgKlxuICAgICAgICogVG8gaGVscCBDbG9zdXJlIENvbXBpbGVyLCB3ZSBrZWVwIHRyYWNrIG9mIGFueSB0ZW1wbGF0ZWQgdGhpcyByZXR1cm4gdHlwZSwgYW5kIHN1YnN0aXR1dGVcbiAgICAgICAqIGV4cGxpY2l0IGNhc3RzIHRvIHRoZSB0ZW1wbGF0ZWQgdHlwZS5cbiAgICAgICAqXG4gICAgICAgKiBUaGlzIGlzIGFuIGluY29tcGxldGUgc29sdXRpb24gYW5kIHdvcmtzIGFyb3VuZCBhIHNwZWNpZmljIHByb2JsZW0gd2l0aCB3YXJuaW5ncyBvbiB1bmtub3duXG4gICAgICAgKiB0aGlzIGFjY2Vzc2VzLiBNb3JlIGdlbmVyYWxseSwgQ2xvc3VyZSBhbHNvIGNhbm5vdCBpbmZlciBjb25zdHJhaW50cyBmb3IgYW55IG90aGVyXG4gICAgICAgKiB0ZW1wbGF0ZWQgdHlwZXMsIGJ1dCB0aGF0IG1pZ2h0IHJlcXVpcmUgYSBtb3JlIGdlbmVyYWwgc29sdXRpb24gaW4gQ2xvc3VyZSBDb21waWxlci5cbiAgICAgICAqL1xuICAgICAgbGV0IGNvbnRleHRUaGlzVHlwZTogdHMuVHlwZXxudWxsID0gbnVsbDtcblxuICAgICAgZnVuY3Rpb24gdmlzaXRDbGFzc0RlY2xhcmF0aW9uKGNsYXNzRGVjbDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHRzLlN0YXRlbWVudFtdIHtcbiAgICAgICAgY29uc3QgY29udGV4dFRoaXNUeXBlQmFja3VwID0gY29udGV4dFRoaXNUeXBlO1xuXG4gICAgICAgIGNvbnN0IG1qc2RvYyA9IG1vZHVsZVR5cGVUcmFuc2xhdG9yLmdldE11dGFibGVKU0RvYyhjbGFzc0RlY2wpO1xuICAgICAgICBpZiAodHJhbnNmb3JtZXJVdGlsLmhhc01vZGlmaWVyRmxhZyhjbGFzc0RlY2wsIHRzLk1vZGlmaWVyRmxhZ3MuQWJzdHJhY3QpKSB7XG4gICAgICAgICAgbWpzZG9jLnRhZ3MucHVzaCh7dGFnTmFtZTogJ2Fic3RyYWN0J30pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF5YmVBZGRUZW1wbGF0ZUNsYXVzZShtanNkb2MudGFncywgY2xhc3NEZWNsKTtcbiAgICAgICAgaWYgKCFob3N0LnVudHlwZWQpIHtcbiAgICAgICAgICBtYXliZUFkZEhlcml0YWdlQ2xhdXNlcyhtanNkb2MudGFncywgbW9kdWxlVHlwZVRyYW5zbGF0b3IsIGNsYXNzRGVjbCk7XG4gICAgICAgIH1cbiAgICAgICAgbWpzZG9jLnVwZGF0ZUNvbW1lbnQoKTtcbiAgICAgICAgY29uc3QgZGVjbHM6IHRzLlN0YXRlbWVudFtdID0gW107XG4gICAgICAgIGNvbnN0IG1lbWJlckRlY2wgPSBjcmVhdGVNZW1iZXJUeXBlRGVjbGFyYXRpb24obW9kdWxlVHlwZVRyYW5zbGF0b3IsIGNsYXNzRGVjbCk7XG4gICAgICAgIC8vIFdBUk5JTkc6IG9yZGVyIGlzIHNpZ25pZmljYW50OyB3ZSBtdXN0IGNyZWF0ZSB0aGUgbWVtYmVyIGRlY2wgYmVmb3JlIHRyYW5zZm9ybWluZyBhd2F5XG4gICAgICAgIC8vIHBhcmFtZXRlciBwcm9wZXJ0eSBjb21tZW50cyB3aGVuIHZpc2l0aW5nIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgICAgZGVjbHMucHVzaCh0cy52aXNpdEVhY2hDaGlsZChjbGFzc0RlY2wsIHZpc2l0b3IsIGNvbnRleHQpKTtcbiAgICAgICAgaWYgKG1lbWJlckRlY2wpIGRlY2xzLnB1c2gobWVtYmVyRGVjbCk7XG4gICAgICAgIGNvbnRleHRUaGlzVHlwZSA9IGNvbnRleHRUaGlzVHlwZUJhY2t1cDtcbiAgICAgICAgcmV0dXJuIGRlY2xzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIHZpc2l0SGVyaXRhZ2VDbGF1c2Ugd29ya3MgYXJvdW5kIGEgQ2xvc3VyZSBDb21waWxlciBpc3N1ZSwgd2hlcmUgdGhlIGV4cHJlc3Npb24gaW4gYW5cbiAgICAgICAqIFwiZXh0ZW5kc1wiIGNsYXVzZSBtdXN0IGJlIGEgc2ltcGxlIGlkZW50aWZpZXIsIGFuZCBpbiBwYXJ0aWN1bGFyIG11c3Qgbm90IGJlIGEgcGFyZW50aGVzaXplZFxuICAgICAgICogZXhwcmVzc2lvbi5cbiAgICAgICAqXG4gICAgICAgKiBUaGlzIGlzIHRyaWdnZXJlZCB3aGVuIFRTIGNvZGUgd3JpdGVzIFwiY2xhc3MgWCBleHRlbmRzIChGb28gYXMgQmFyKSB7IC4uLiB9XCIsIGNvbW1vbmx5IGRvbmVcbiAgICAgICAqIHRvIHN1cHBvcnQgbWl4aW5zLiBGb3IgZXh0ZW5kcyBjbGF1c2VzIGluIGNsYXNzZXMsIHRoZSBjb2RlIGJlbG93IGRyb3BzIHRoZSBjYXN0IGFuZCBhbnlcbiAgICAgICAqIHBhcmVudGhldGljYWxzLCBsZWF2aW5nIGp1c3QgdGhlIG9yaWdpbmFsIGV4cHJlc3Npb24uXG4gICAgICAgKlxuICAgICAgICogVGhpcyBpcyBhbiBpbmNvbXBsZXRlIHdvcmthcm91bmQsIGFzIENsb3N1cmUgd2lsbCBzdGlsbCBiYWlsIG9uIG90aGVyIHN1cGVyIGV4cHJlc3Npb25zLFxuICAgICAgICogYnV0IHJldGFpbnMgY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBwcmV2aW91cyBlbWl0IHRoYXQgKGFjY2lkZW50YWxseSkgZHJvcHBlZCB0aGUgY2FzdFxuICAgICAgICogZXhwcmVzc2lvbi5cbiAgICAgICAqXG4gICAgICAgKiBUT0RPKG1hcnRpbnByb2JzdCk6IHJlbW92ZSB0aGlzIG9uY2UgdGhlIENsb3N1cmUgc2lkZSBpc3N1ZSBoYXMgYmVlbiByZXNvbHZlZC5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gdmlzaXRIZXJpdGFnZUNsYXVzZShoZXJpdGFnZUNsYXVzZTogdHMuSGVyaXRhZ2VDbGF1c2UpIHtcbiAgICAgICAgaWYgKGhlcml0YWdlQ2xhdXNlLnRva2VuICE9PSB0cy5TeW50YXhLaW5kLkV4dGVuZHNLZXl3b3JkIHx8ICFoZXJpdGFnZUNsYXVzZS5wYXJlbnQgfHxcbiAgICAgICAgICAgIGhlcml0YWdlQ2xhdXNlLnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkludGVyZmFjZURlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHRzLnZpc2l0RWFjaENoaWxkKGhlcml0YWdlQ2xhdXNlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGVyaXRhZ2VDbGF1c2UudHlwZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3IuZXJyb3IoXG4gICAgICAgICAgICAgIGhlcml0YWdlQ2xhdXNlLCBgZXhwZWN0ZWQgZXhhY3RseSBvbmUgdHlwZSBpbiBjbGFzcyBleHRlbnNpb24gY2xhdXNlYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IGhlcml0YWdlQ2xhdXNlLnR5cGVzWzBdO1xuICAgICAgICBsZXQgZXhwcjogdHMuRXhwcmVzc2lvbiA9IHR5cGUuZXhwcmVzc2lvbjtcbiAgICAgICAgd2hpbGUgKHRzLmlzUGFyZW50aGVzaXplZEV4cHJlc3Npb24oZXhwcikgfHwgdHMuaXNOb25OdWxsRXhwcmVzc2lvbihleHByKSB8fFxuICAgICAgICAgICAgICAgdHMuaXNBc3NlcnRpb25FeHByZXNzaW9uKGV4cHIpKSB7XG4gICAgICAgICAgZXhwciA9IGV4cHIuZXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHMudXBkYXRlSGVyaXRhZ2VDbGF1c2UoaGVyaXRhZ2VDbGF1c2UsIFt0cy51cGRhdGVFeHByZXNzaW9uV2l0aFR5cGVBcmd1bWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsIHR5cGUudHlwZUFyZ3VtZW50cyB8fCBbXSwgZXhwcildKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmlzaXRJbnRlcmZhY2VEZWNsYXJhdGlvbihpZmFjZTogdHMuSW50ZXJmYWNlRGVjbGFyYXRpb24pOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgICAgIGNvbnN0IHN5bSA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaWZhY2UubmFtZSk7XG4gICAgICAgIGlmICghc3ltKSB7XG4gICAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3IuZXJyb3IoaWZhY2UsICdpbnRlcmZhY2Ugd2l0aCBubyBzeW1ib2wnKTtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhpcyBzeW1ib2wgaXMgYm90aCBhIHR5cGUgYW5kIGEgdmFsdWUsIHdlIGNhbm5vdCBlbWl0IGJvdGggaW50byBDbG9zdXJlJ3NcbiAgICAgICAgLy8gc2luZ2xlIG5hbWVzcGFjZS5cbiAgICAgICAgaWYgKHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlZhbHVlKSB7XG4gICAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3IuZGVidWdXYXJuKFxuICAgICAgICAgICAgICBpZmFjZSwgYHR5cGUvc3ltYm9sIGNvbmZsaWN0IGZvciAke3N5bS5uYW1lfSwgdXNpbmcgez99IGZvciBub3dgKTtcbiAgICAgICAgICByZXR1cm4gW3RyYW5zZm9ybWVyVXRpbC5jcmVhdGVTaW5nbGVMaW5lQ29tbWVudChcbiAgICAgICAgICAgICAgaWZhY2UsICdXQVJOSU5HOiBpbnRlcmZhY2UgaGFzIGJvdGggYSB0eXBlIGFuZCBhIHZhbHVlLCBza2lwcGluZyBlbWl0JyldO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFncyA9IG1vZHVsZVR5cGVUcmFuc2xhdG9yLmdldEpTRG9jKGlmYWNlLCAvKiByZXBvcnRXYXJuaW5ncyAqLyB0cnVlKSB8fCBbXTtcbiAgICAgICAgdGFncy5wdXNoKHt0YWdOYW1lOiAncmVjb3JkJ30pO1xuICAgICAgICBtYXliZUFkZFRlbXBsYXRlQ2xhdXNlKHRhZ3MsIGlmYWNlKTtcbiAgICAgICAgaWYgKCFob3N0LnVudHlwZWQpIHtcbiAgICAgICAgICBtYXliZUFkZEhlcml0YWdlQ2xhdXNlcyh0YWdzLCBtb2R1bGVUeXBlVHJhbnNsYXRvciwgaWZhY2UpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0cmFuc2Zvcm1lclV0aWwuZ2V0SWRlbnRpZmllclRleHQoaWZhY2UubmFtZSk7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVycyA9IHRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcoaWZhY2UsIHRzLk1vZGlmaWVyRmxhZ3MuRXhwb3J0KSA/XG4gICAgICAgICAgICBbdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkKV0gOlxuICAgICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBkZWNsID0gdHMuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgICAgICB0cy5jcmVhdGVGdW5jdGlvbkRlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG1vZGlmaWVycyxcbiAgICAgICAgICAgICAgICAvKiBhc3RlcmlzayAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgLyogcGFyYW1ldGVycyAqL1tdLFxuICAgICAgICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIC8qIGJvZHkgKi8gdHMuY3JlYXRlQmxvY2soW10pLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBpZmFjZSk7XG4gICAgICAgIGFkZENvbW1lbnRPbihkZWNsLCB0YWdzKTtcbiAgICAgICAgY29uc3QgbWVtYmVyRGVjbCA9IGNyZWF0ZU1lbWJlclR5cGVEZWNsYXJhdGlvbihtb2R1bGVUeXBlVHJhbnNsYXRvciwgaWZhY2UpO1xuICAgICAgICByZXR1cm4gbWVtYmVyRGVjbCA/IFtkZWNsLCBtZW1iZXJEZWNsXSA6IFtkZWNsXTtcbiAgICAgIH1cblxuICAgICAgLyoqIEZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBhcmUgZW1pdHRlZCBhcyB0aGV5IGFyZSwgd2l0aCBvbmx5IEpTRG9jIGFkZGVkLiAqL1xuICAgICAgZnVuY3Rpb24gdmlzaXRGdW5jdGlvbkxpa2VEZWNsYXJhdGlvbihmbkRlY2w6IHRzLkZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uKSB7XG4gICAgICAgIGlmICghZm5EZWNsLmJvZHkpIHtcbiAgICAgICAgICAvLyBUd28gY2FzZXM6IGFic3RyYWN0IG1ldGhvZHMgYW5kIG92ZXJsb2FkZWQgbWV0aG9kcy9mdW5jdGlvbnMuXG4gICAgICAgICAgLy8gQWJzdHJhY3QgbWV0aG9kcyBhcmUgaGFuZGxlZCBpbiBlbWl0VHlwZUFubm90YXRpb25zSGFuZGxlci5cbiAgICAgICAgICAvLyBPdmVybG9hZHMgYXJlIHVuaW9uLWl6ZWQgaW50byB0aGUgc2hhcmVkIHR5cGUgaW4gRnVuY3Rpb25UeXBlLlxuICAgICAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChmbkRlY2wsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4dHJhVGFncyA9IFtdO1xuICAgICAgICBpZiAoaGFzRXhwb3J0aW5nRGVjb3JhdG9yKGZuRGVjbCwgdHlwZUNoZWNrZXIpKSBleHRyYVRhZ3MucHVzaCh7dGFnTmFtZTogJ2V4cG9ydCd9KTtcblxuICAgICAgICBjb25zdCB7dGFncywgdGhpc1JldHVyblR5cGV9ID1cbiAgICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmdldEZ1bmN0aW9uVHlwZUpTRG9jKFtmbkRlY2xdLCBleHRyYVRhZ3MpO1xuICAgICAgICBjb25zdCBtanNkb2MgPSBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRNdXRhYmxlSlNEb2MoZm5EZWNsKTtcbiAgICAgICAgbWpzZG9jLnRhZ3MgPSB0YWdzO1xuICAgICAgICBtanNkb2MudXBkYXRlQ29tbWVudCgpO1xuICAgICAgICBtb2R1bGVUeXBlVHJhbnNsYXRvci5ibGFja2xpc3RUeXBlUGFyYW1ldGVycyhmbkRlY2wsIGZuRGVjbC50eXBlUGFyYW1ldGVycyk7XG5cbiAgICAgICAgY29uc3QgY29udGV4dFRoaXNUeXBlQmFja3VwID0gY29udGV4dFRoaXNUeXBlO1xuICAgICAgICBjb250ZXh0VGhpc1R5cGUgPSB0aGlzUmV0dXJuVHlwZTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdHMudmlzaXRFYWNoQ2hpbGQoZm5EZWNsLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICAgICAgY29udGV4dFRoaXNUeXBlID0gY29udGV4dFRoaXNUeXBlQmFja3VwO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEluIG1ldGhvZHMgd2l0aCBhIHRlbXBsYXRlZCB0aGlzIHR5cGUsIGFkZHMgZXhwbGljaXQgY2FzdHMgdG8gYWNjZXNzZXMgb24gdGhpcy5cbiAgICAgICAqXG4gICAgICAgKiBAc2VlIGNvbnRleHRUaGlzVHlwZVxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiB2aXNpdFRoaXNFeHByZXNzaW9uKG5vZGU6IHRzLlRoaXNFeHByZXNzaW9uKSB7XG4gICAgICAgIGlmICghY29udGV4dFRoaXNUeXBlKSByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIHJldHVybiBjcmVhdGVDbG9zdXJlQ2FzdChub2RlLCBub2RlLCBjb250ZXh0VGhpc1R5cGUpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIHZpc2l0VmFyaWFibGVTdGF0ZW1lbnQgZmxhdHRlbnMgdmFyaWFibGUgZGVjbGFyYXRpb24gbGlzdHMgKGB2YXIgYSwgYjtgIHRvIGB2YXIgYTsgdmFyXG4gICAgICAgKiBiO2ApLCBhbmQgYXR0YWNoZXMgSlNEb2MgY29tbWVudHMgdG8gZWFjaCB2YXJpYWJsZS4gSlNEb2MgY29tbWVudHMgcHJlY2VkaW5nIHRoZVxuICAgICAgICogb3JpZ2luYWwgdmFyaWFibGUgYXJlIGF0dGFjaGVkIHRvIHRoZSBmaXJzdCBuZXdseSBjcmVhdGVkIG9uZS5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gdmlzaXRWYXJpYWJsZVN0YXRlbWVudCh2YXJTdG10OiB0cy5WYXJpYWJsZVN0YXRlbWVudCk6IHRzLlN0YXRlbWVudFtdIHtcbiAgICAgICAgY29uc3Qgc3RtdHM6IHRzLlN0YXRlbWVudFtdID0gW107XG5cbiAgICAgICAgLy8gXCJjb25zdFwiLCBcImxldFwiLCBldGMgYXJlIHN0b3JlZCBpbiBub2RlIGZsYWdzIG9uIHRoZSBkZWNsYXJhdGlvbkxpc3QuXG4gICAgICAgIGNvbnN0IGZsYWdzID0gdHMuZ2V0Q29tYmluZWROb2RlRmxhZ3ModmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QpO1xuXG4gICAgICAgIGxldCB0YWdzOiBqc2RvYy5UYWdbXXxudWxsID1cbiAgICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmdldEpTRG9jKHZhclN0bXQsIC8qIHJlcG9ydFdhcm5pbmdzICovIHRydWUpO1xuICAgICAgICBjb25zdCBsZWFkaW5nID0gdHMuZ2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKHZhclN0bXQpO1xuICAgICAgICBpZiAobGVhZGluZykge1xuICAgICAgICAgIC8vIEF0dGFjaCBub24tSlNEb2MgY29tbWVudHMgdG8gYSBub3QgZW1pdHRlZCBzdGF0ZW1lbnQuXG4gICAgICAgICAgY29uc3QgY29tbWVudEhvbGRlciA9IHRzLmNyZWF0ZU5vdEVtaXR0ZWRTdGF0ZW1lbnQodmFyU3RtdCk7XG4gICAgICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKGNvbW1lbnRIb2xkZXIsIGxlYWRpbmcuZmlsdGVyKGMgPT4gYy50ZXh0WzBdICE9PSAnKicpKTtcbiAgICAgICAgICBzdG10cy5wdXNoKGNvbW1lbnRIb2xkZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVjbExpc3QgPSB0cy52aXNpdE5vZGUodmFyU3RtdC5kZWNsYXJhdGlvbkxpc3QsIHZpc2l0b3IpO1xuICAgICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgZGVjbExpc3QuZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgY29uc3QgbG9jYWxUYWdzOiBqc2RvYy5UYWdbXSA9IFtdO1xuICAgICAgICAgIGlmICh0YWdzKSB7XG4gICAgICAgICAgICAvLyBBZGQgYW55IHRhZ3MgYW5kIGRvY3MgcHJlY2VkaW5nIHRoZSBlbnRpcmUgc3RhdGVtZW50IHRvIHRoZSBmaXJzdCB2YXJpYWJsZS5cbiAgICAgICAgICAgIGxvY2FsVGFncy5wdXNoKC4uLnRhZ3MpO1xuICAgICAgICAgICAgdGFncyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEFkZCBhbiBAdHlwZSBmb3IgcGxhaW4gaWRlbnRpZmllcnMsIGJ1dCBub3QgZm9yIGJpbmRpbmdzIHBhdHRlcm5zIChpLmUuIG9iamVjdCBvciBhcnJheVxuICAgICAgICAgIC8vIGRlc3RydWN0dXJpbmcpIC0gdGhvc2UgZG8gbm90IGhhdmUgYSBzeW50YXggaW4gQ2xvc3VyZS5cbiAgICAgICAgICBpZiAodHMuaXNJZGVudGlmaWVyKGRlY2wubmFtZSkpIHtcbiAgICAgICAgICAgIC8vIEZvciB2YXJpYWJsZXMgdGhhdCBhcmUgaW5pdGlhbGl6ZWQgYW5kIHVzZSBhIGJsYWNrbGlzdGVkIHR5cGUsIGRvIG5vdCBlbWl0IGEgdHlwZSBhdFxuICAgICAgICAgICAgLy8gYWxsLiBDbG9zdXJlIENvbXBpbGVyIG1pZ2h0IGJlIGFibGUgdG8gaW5mZXIgYSBiZXR0ZXIgdHlwZSBmcm9tIHRoZSBpbml0aWFsaXplciB0aGFuXG4gICAgICAgICAgICAvLyB0aGUgYD9gIHRoZSBjb2RlIGJlbG93IHdvdWxkIGVtaXQuXG4gICAgICAgICAgICAvLyBUT0RPKG1hcnRpbnByb2JzdCk6IGNvbnNpZGVyIGRvaW5nIHRoaXMgZm9yIGFsbCB0eXBlcyB0aGF0IGdldCBlbWl0dGVkIGFzID8sIG5vdCBqdXN0XG4gICAgICAgICAgICAvLyBmb3IgYmxhY2tsaXN0ZWQgb25lcy5cbiAgICAgICAgICAgIGNvbnN0IGJsYWNrTGlzdGVkSW5pdGlhbGl6ZWQgPVxuICAgICAgICAgICAgICAgICEhZGVjbC5pbml0aWFsaXplciAmJiBtb2R1bGVUeXBlVHJhbnNsYXRvci5pc0JsYWNrTGlzdGVkKGRlY2wpO1xuICAgICAgICAgICAgaWYgKCFibGFja0xpc3RlZEluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgIC8vIGdldE9yaWdpbmFsTm9kZShkZWNsKSBpcyByZXF1aXJlZCBiZWNhdXNlIHRoZSB0eXBlIGNoZWNrZXIgY2Fubm90IHR5cGUgY2hlY2tcbiAgICAgICAgICAgICAgLy8gc3ludGhlc2l6ZWQgbm9kZXMuXG4gICAgICAgICAgICAgIGNvbnN0IHR5cGVTdHIgPSBtb2R1bGVUeXBlVHJhbnNsYXRvci50eXBlVG9DbG9zdXJlKHRzLmdldE9yaWdpbmFsTm9kZShkZWNsKSk7XG4gICAgICAgICAgICAgIGxvY2FsVGFncy5wdXNoKHt0YWdOYW1lOiAndHlwZScsIHR5cGU6IHR5cGVTdHJ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgbmV3U3RtdCA9IHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgICAgICAgICB2YXJTdG10Lm1vZGlmaWVycywgdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QoW2RlY2xdLCBmbGFncykpO1xuICAgICAgICAgIGlmIChsb2NhbFRhZ3MubGVuZ3RoKSBhZGRDb21tZW50T24obmV3U3RtdCwgbG9jYWxUYWdzLCBqc2RvYy5UQUdTX0NPTkZMSUNUSU5HX1dJVEhfVFlQRSk7XG4gICAgICAgICAgc3RtdHMucHVzaChuZXdTdG10KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdG10cztcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBzaG91bGRFbWl0RXhwb3J0c0Fzc2lnbm1lbnRzIHJldHVybnMgdHJ1ZSBpZiB0c2lja2xlIHNob3VsZCBlbWl0IGBleHBvcnRzLkZvbyA9IC4uLmAgc3R5bGVcbiAgICAgICAqIGV4cG9ydCBzdGF0ZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIFR5cGVTY3JpcHQgbW9kdWxlcyBjYW4gZXhwb3J0IHR5cGVzLiBCZWNhdXNlIHR5cGVzIGFyZSBwdXJlIGRlc2lnbi10aW1lIGNvbnN0cnVjdHMgaW5cbiAgICAgICAqIFR5cGVTY3JpcHQsIGl0IGRvZXMgbm90IGVtaXQgYW55IGFjdHVhbCBleHBvcnRlZCBzeW1ib2xzIGZvciB0aGVzZS4gQnV0IHRzaWNrbGUgaGFzIHRvIGVtaXRcbiAgICAgICAqIGFuIGV4cG9ydCwgc28gdGhhdCBkb3duc3RyZWFtIENsb3N1cmUgY29kZSAoaW5jbHVkaW5nIHRzaWNrbGUtY29udmVydGVkIENsb3N1cmUgY29kZSkgY2FuXG4gICAgICAgKiBpbXBvcnQgdXBzdHJlYW0gdHlwZXMuIHRzaWNrbGUgaGFzIHRvIHBpY2sgYSBtb2R1bGUgZm9ybWF0IGZvciB0aGF0LCBiZWNhdXNlIHRoZSBwdXJlIEVTNlxuICAgICAgICogZXhwb3J0IHdvdWxkIGdldCBzdHJpcHBlZCBieSBUeXBlU2NyaXB0LlxuICAgICAgICpcbiAgICAgICAqIHRzaWNrbGUgdXNlcyBDb21tb25KUyB0byBlbWl0IGdvb2dtb2R1bGUsIGFuZCBjb2RlIG5vdCB1c2luZyBnb29nbW9kdWxlIGRvZXNuJ3QgY2FyZSBhYm91dFxuICAgICAgICogdGhlIENsb3N1cmUgYW5ub3RhdGlvbnMgYW55d2F5LCBzbyB0c2lja2xlIHNraXBzIGVtaXR0aW5nIGV4cG9ydHMgaWYgdGhlIG1vZHVsZSB0YXJnZXRcbiAgICAgICAqIGlzbid0IGNvbW1vbmpzLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBzaG91bGRFbWl0RXhwb3J0c0Fzc2lnbm1lbnRzKCkge1xuICAgICAgICByZXR1cm4gdHNPcHRpb25zLm1vZHVsZSA9PT0gdHMuTW9kdWxlS2luZC5Db21tb25KUztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmlzaXRUeXBlQWxpYXNEZWNsYXJhdGlvbih0eXBlQWxpYXM6IHRzLlR5cGVBbGlhc0RlY2xhcmF0aW9uKTogdHMuU3RhdGVtZW50W10ge1xuICAgICAgICAvLyBJZiB0aGUgdHlwZSBpcyBhbHNvIGRlZmluZWQgYXMgYSB2YWx1ZSwgc2tpcCBlbWl0dGluZyBpdC4gQ2xvc3VyZSBjb2xsYXBzZXMgdHlwZSAmIHZhbHVlXG4gICAgICAgIC8vIG5hbWVzcGFjZXMsIHRoZSB0d28gZW1pdHMgd291bGQgY29uZmxpY3QgaWYgdHNpY2tsZSBlbWl0dGVkIGJvdGguXG4gICAgICAgIGNvbnN0IHN5bSA9IG1vZHVsZVR5cGVUcmFuc2xhdG9yLm11c3RHZXRTeW1ib2xBdExvY2F0aW9uKHR5cGVBbGlhcy5uYW1lKTtcbiAgICAgICAgaWYgKHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlZhbHVlKSByZXR1cm4gW107XG4gICAgICAgIC8vIFR5cGUgYWxpYXNlcyBhcmUgYWx3YXlzIGVtaXR0ZWQgYXMgdGhlIHJlc29sdmVkIHVuZGVybHlpbmcgdHlwZSwgc28gdGhlcmUgaXMgbm8gbmVlZCB0b1xuICAgICAgICAvLyBlbWl0IGFueXRoaW5nLCBleGNlcHQgZm9yIGV4cG9ydGVkIHR5cGVzLlxuICAgICAgICBpZiAoIXRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcodHlwZUFsaWFzLCB0cy5Nb2RpZmllckZsYWdzLkV4cG9ydCkpIHJldHVybiBbXTtcbiAgICAgICAgaWYgKCFzaG91bGRFbWl0RXhwb3J0c0Fzc2lnbm1lbnRzKCkpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCB0eXBlTmFtZSA9IHR5cGVBbGlhcy5uYW1lLmdldFRleHQoKTtcblxuICAgICAgICAvLyBCbGFja2xpc3QgYW55IHR5cGUgcGFyYW1ldGVycywgQ2xvc3VyZSBkb2VzIG5vdCBzdXBwb3J0IHR5cGUgYWxpYXNlcyB3aXRoIHR5cGVcbiAgICAgICAgLy8gcGFyYW1ldGVycy5cbiAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3IubmV3VHlwZVRyYW5zbGF0b3IodHlwZUFsaWFzKS5ibGFja2xpc3RUeXBlUGFyYW1ldGVycyhcbiAgICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLnN5bWJvbHNUb0FsaWFzZWROYW1lcywgdHlwZUFsaWFzLnR5cGVQYXJhbWV0ZXJzKTtcbiAgICAgICAgY29uc3QgdHlwZVN0ciA9XG4gICAgICAgICAgICBob3N0LnVudHlwZWQgPyAnPycgOiBtb2R1bGVUeXBlVHJhbnNsYXRvci50eXBlVG9DbG9zdXJlKHR5cGVBbGlhcywgdW5kZWZpbmVkKTtcbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYW4gZXhwb3J0LCB3ZSBjYW5ub3QgZW1pdCBhIGBleHBvcnQgdmFyIGZvbztgIGJlY2F1c2UgVHlwZVNjcmlwdCBkcm9wc1xuICAgICAgICAvLyBleHBvcnRzIHRoYXQgYXJlIG5ldmVyIGFzc2lnbmVkIHZhbHVlcywgYW5kIENsb3N1cmUgcmVxdWlyZXMgdXMgdG8gbm90IGFzc2lnbiB2YWx1ZXMgdG9cbiAgICAgICAgLy8gdHlwZWRlZiBleHBvcnRzLiBJbnRyb2R1Y2luZyBhIG5ldyBsb2NhbCB2YXJpYWJsZSBhbmQgZXhwb3J0aW5nIGl0IGNhbiBjYXVzZSBidWdzIGR1ZSB0b1xuICAgICAgICAvLyBuYW1lIHNoYWRvd2luZyBhbmQgY29uZnVzaW5nIFR5cGVTY3JpcHQncyBsb2dpYyBvbiB3aGF0IHN5bWJvbHMgYW5kIHR5cGVzIHZzIHZhbHVlcyBhcmVcbiAgICAgICAgLy8gZXhwb3J0ZWQuIE1hbmdsaW5nIHRoZSBuYW1lIHRvIGF2b2lkIHRoZSBjb25mbGljdHMgd291bGQgYmUgcmVhc29uYWJseSBjbGVhbiwgYnV0IHdvdWxkXG4gICAgICAgIC8vIHJlcXVpcmUgYSB0d28gcGFzcyBlbWl0IHRvIGZpcnN0IGZpbmQgYWxsIHR5cGUgYWxpYXMgbmFtZXMsIG1hbmdsZSB0aGVtLCBhbmQgZW1pdCB0aGUgdXNlXG4gICAgICAgIC8vIHNpdGVzIG9ubHkgbGF0ZXIuIFdpdGggdGhhdCwgdGhlIGZpeCBoZXJlIGlzIHRvIG5ldmVyIGVtaXQgdHlwZSBhbGlhc2VzLCBidXQgYWx3YXlzXG4gICAgICAgIC8vIHJlc29sdmUgdGhlIGFsaWFzIGFuZCBlbWl0IHRoZSB1bmRlcmx5aW5nIHR5cGUgKGZpeGluZyByZWZlcmVuY2VzIGluIHRoZSBsb2NhbCBtb2R1bGUsXG4gICAgICAgIC8vIGFuZCBhbHNvIGFjcm9zcyBtb2R1bGVzKS4gRm9yIGRvd25zdHJlYW0gSmF2YVNjcmlwdCBjb2RlIHRoYXQgaW1wb3J0cyB0aGUgdHlwZWRlZiwgd2VcbiAgICAgICAgLy8gZW1pdCBhbiBcImV4cG9ydC5Gb287XCIgdGhhdCBkZWNsYXJlcyBhbmQgZXhwb3J0cyB0aGUgdHlwZSwgYW5kIGZvciBUeXBlU2NyaXB0IGhhcyBub1xuICAgICAgICAvLyBpbXBhY3QuXG4gICAgICAgIGNvbnN0IHRhZ3MgPSBtb2R1bGVUeXBlVHJhbnNsYXRvci5nZXRKU0RvYyh0eXBlQWxpYXMsIC8qIHJlcG9ydFdhcm5pbmdzICovIHRydWUpO1xuICAgICAgICB0YWdzLnB1c2goe3RhZ05hbWU6ICd0eXBlZGVmJywgdHlwZTogdHlwZVN0cn0pO1xuICAgICAgICBjb25zdCBkZWNsID0gdHMuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgICAgICB0cy5jcmVhdGVTdGF0ZW1lbnQodHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoXG4gICAgICAgICAgICAgICAgdHMuY3JlYXRlSWRlbnRpZmllcignZXhwb3J0cycpLCB0cy5jcmVhdGVJZGVudGlmaWVyKHR5cGVOYW1lKSkpLFxuICAgICAgICAgICAgdHlwZUFsaWFzKTtcbiAgICAgICAgYWRkQ29tbWVudE9uKGRlY2wsIHRhZ3MsIGpzZG9jLlRBR1NfQ09ORkxJQ1RJTkdfV0lUSF9UWVBFKTtcbiAgICAgICAgcmV0dXJuIFtkZWNsXTtcbiAgICAgIH1cblxuICAgICAgLyoqIEVtaXRzIGEgcGFyZW50aGVzaXplZCBDbG9zdXJlIGNhc3Q6IGAoLyoqIFxcQHR5cGUgLi4uICogLyAoZXhwcikpYC4gKi9cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZUNsb3N1cmVDYXN0KGNvbnRleHQ6IHRzLk5vZGUsIGV4cHJlc3Npb246IHRzLkV4cHJlc3Npb24sIHR5cGU6IHRzLlR5cGUpIHtcbiAgICAgICAgY29uc3QgaW5uZXIgPSB0cy5jcmVhdGVQYXJlbihleHByZXNzaW9uKTtcbiAgICAgICAgY29uc3QgY29tbWVudCA9IGFkZENvbW1lbnRPbihcbiAgICAgICAgICAgIGlubmVyLCBbe3RhZ05hbWU6ICd0eXBlJywgdHlwZTogbW9kdWxlVHlwZVRyYW5zbGF0b3IudHlwZVRvQ2xvc3VyZShjb250ZXh0LCB0eXBlKX1dKTtcbiAgICAgICAgY29tbWVudC5oYXNUcmFpbGluZ05ld0xpbmUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRzLnNldFNvdXJjZU1hcFJhbmdlKHRzLmNyZWF0ZVBhcmVuKGlubmVyKSwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIC8qKiBDb252ZXJ0cyBhIFR5cGVTY3JpcHQgdHlwZSBhc3NlcnRpb24gaW50byBhIENsb3N1cmUgQ2FzdC4gKi9cbiAgICAgIGZ1bmN0aW9uIHZpc2l0QXNzZXJ0aW9uRXhwcmVzc2lvbihhc3NlcnRpb246IHRzLkFzc2VydGlvbkV4cHJlc3Npb24pIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKGFzc2VydGlvbi50eXBlKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUNsb3N1cmVDYXN0KGFzc2VydGlvbiwgdHMudmlzaXRFYWNoQ2hpbGQoYXNzZXJ0aW9uLCB2aXNpdG9yLCBjb250ZXh0KSwgdHlwZSk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ29udmVydHMgYSBUeXBlU2NyaXB0IG5vbi1udWxsIGFzc2VydGlvbiBpbnRvIGEgQ2xvc3VyZSBDYXN0LCBieSBzdHJpcHBpbmcgfG51bGwgYW5kXG4gICAgICAgKiB8dW5kZWZpbmVkIGZyb20gYSB1bmlvbiB0eXBlLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiB2aXNpdE5vbk51bGxFeHByZXNzaW9uKG5vbk51bGw6IHRzLk5vbk51bGxFeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlQ2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbihub25OdWxsLmV4cHJlc3Npb24pO1xuICAgICAgICBjb25zdCBub25OdWxsVHlwZSA9IHR5cGVDaGVja2VyLmdldE5vbk51bGxhYmxlVHlwZSh0eXBlKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUNsb3N1cmVDYXN0KFxuICAgICAgICAgICAgbm9uTnVsbCwgdHMudmlzaXRFYWNoQ2hpbGQobm9uTnVsbCwgdmlzaXRvciwgY29udGV4dCksIG5vbk51bGxUeXBlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmlzaXRJbXBvcnREZWNsYXJhdGlvbihpbXBvcnREZWNsOiB0cy5JbXBvcnREZWNsYXJhdGlvbikge1xuICAgICAgICAvLyBObyBuZWVkIHRvIGZvcndhcmQgZGVjbGFyZSBzaWRlIGVmZmVjdCBpbXBvcnRzLlxuICAgICAgICBpZiAoIWltcG9ydERlY2wuaW1wb3J0Q2xhdXNlKSByZXR1cm4gaW1wb3J0RGVjbDtcbiAgICAgICAgLy8gSW50cm9kdWNlIGEgZ29vZy5mb3J3YXJkRGVjbGFyZSBmb3IgdGhlIG1vZHVsZSwgc28gdGhhdCBpZiBUeXBlU2NyaXB0IGRvZXMgbm90IGVtaXQgdGhlXG4gICAgICAgIC8vIG1vZHVsZSBiZWNhdXNlIGl0J3Mgb25seSB1c2VkIGluIHR5cGUgcG9zaXRpb25zLCB0aGUgSlNEb2MgY29tbWVudHMgc3RpbGwgcmVmZXJlbmNlIGFcbiAgICAgICAgLy8gdmFsaWQgQ2xvc3VyZSBsZXZlbCBzeW1ib2wuXG4gICAgICAgIGNvbnN0IHN5bSA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIpO1xuICAgICAgICAvLyBTY3JpcHRzIGRvIG5vdCBoYXZlIGEgc3ltYm9sLCBhbmQgbmVpdGhlciBkbyB1bnVzZWQgbW9kdWxlcy4gU2NyaXB0cyBjYW4gc3RpbGwgYmVcbiAgICAgICAgLy8gaW1wb3J0ZWQsIGVpdGhlciBhcyBzaWRlIGVmZmVjdCBpbXBvcnRzIG9yIHdpdGggYW4gZW1wdHkgaW1wb3J0IHNldCAoXCJ7fVwiKS4gVHlwZVNjcmlwdFxuICAgICAgICAvLyBkb2VzIG5vdCBlbWl0IGEgcnVudGltZSBsb2FkIGZvciBhbiBpbXBvcnQgd2l0aCBhbiBlbXB0eSBsaXN0IG9mIHN5bWJvbHMsIGJ1dCB0aGUgaW1wb3J0XG4gICAgICAgIC8vIGZvcmNlcyBhbnkgZ2xvYmFsIGRlY2xhcmF0aW9ucyBmcm9tIHRoZSBsaWJyYXJ5IHRvIGJlIHZpc2libGUsIHdoaWNoIGlzIHdoYXQgdXNlcnMgdXNlXG4gICAgICAgIC8vIHRoaXMgZm9yLiBObyBzeW1ib2xzIGZyb20gdGhlIHNjcmlwdCBuZWVkIGZvcndhcmQgZGVjbGFyYXRpb24sIHNvIGp1c3QgcmV0dXJuLlxuICAgICAgICBpZiAoIXN5bSkgcmV0dXJuIGltcG9ydERlY2w7XG4gICAgICAgIC8vIFdyaXRlIHRoZSBleHBvcnQgZGVjbGFyYXRpb24gaGVyZSBzbyB0aGF0IGZvcndhcmQgZGVjbGFyZXMgY29tZSBhZnRlciBpdCwgYW5kXG4gICAgICAgIC8vIGZpbGVvdmVydmlldyBjb21tZW50cyBkbyBub3QgZ2V0IG1vdmVkIGJlaGluZCBzdGF0ZW1lbnRzLlxuICAgICAgICBjb25zdCBpbXBvcnRQYXRoID0gZ29vZ21vZHVsZS5yZXNvbHZlTW9kdWxlTmFtZShcbiAgICAgICAgICAgIHtvcHRpb25zOiB0c09wdGlvbnMsIGhvc3Q6IHRzSG9zdH0sIHNvdXJjZUZpbGUuZmlsZU5hbWUsXG4gICAgICAgICAgICAoaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dCk7XG5cbiAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3IuZm9yd2FyZERlY2xhcmUoXG4gICAgICAgICAgICBpbXBvcnRQYXRoLCBzeW0sIC8qIGlzRXhwbGljaXRseUltcG9ydGVkPyAqLyB0cnVlLFxuICAgICAgICAgICAgLyogZGVmYXVsdCBpbXBvcnQ/ICovICEhaW1wb3J0RGVjbC5pbXBvcnRDbGF1c2UubmFtZSk7XG4gICAgICAgIHJldHVybiBpbXBvcnREZWNsO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENsb3N1cmUgQ29tcGlsZXIgd2lsbCBmYWlsIHdoZW4gaXQgZmluZHMgaW5jb3JyZWN0IEpTRG9jIHRhZ3Mgb24gbm9kZXMuIFRoaXMgZnVuY3Rpb25cbiAgICAgICAqIHBhcnNlcyBhbmQgdGhlbiByZS1zZXJpYWxpemVzIEpTRG9jIGNvbW1lbnRzLCBlc2NhcGluZyBvciByZW1vdmluZyBpbGxlZ2FsIHRhZ3MuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGVzY2FwZUlsbGVnYWxKU0RvYyhub2RlOiB0cy5Ob2RlKSB7XG4gICAgICAgIGNvbnN0IG1qc2RvYyA9IG1vZHVsZVR5cGVUcmFuc2xhdG9yLmdldE11dGFibGVKU0RvYyhub2RlKTtcbiAgICAgICAgbWpzZG9jLnVwZGF0ZUNvbW1lbnQoKTtcbiAgICAgIH1cblxuICAgICAgLyoqIFJldHVybnMgdHJ1ZSBpZiBhIHZhbHVlIGV4cG9ydCBzaG91bGQgYmUgZW1pdHRlZCBmb3IgdGhlIGdpdmVuIHN5bWJvbCBpbiBleHBvcnQgKi4gKi9cbiAgICAgIGZ1bmN0aW9uIHNob3VsZEVtaXRWYWx1ZUV4cG9ydEZvclN5bWJvbChzeW06IHRzLlN5bWJvbCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoc3ltLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuQWxpYXMpIHtcbiAgICAgICAgICBzeW0gPSB0eXBlQ2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKHN5bSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChzeW0uZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5WYWx1ZSkgPT09IDApIHtcbiAgICAgICAgICAvLyBOb3RlOiBXZSBjcmVhdGUgZXhwbGljaXQgZXhwb3J0cyBvZiB0eXBlIHN5bWJvbHMgZm9yIGNsb3N1cmUgaW4gdmlzaXRFeHBvcnREZWNsYXJhdGlvbi5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0c09wdGlvbnMucHJlc2VydmVDb25zdEVudW1zICYmIHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkNvbnN0RW51bSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiB2aXNpdEV4cG9ydERlY2xhcmF0aW9uIGZvcndhcmQgZGVjbGFyZXMgZXhwb3J0ZWQgbW9kdWxlcyBhbmQgZW1pdHMgZXhwbGljaXQgZXhwb3J0cyBmb3JcbiAgICAgICAqIHR5cGVzICh3aGljaCBub3JtYWxseSBkbyBub3QgZ2V0IGVtaXR0ZWQgYnkgVHlwZVNjcmlwdCkuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHZpc2l0RXhwb3J0RGVjbGFyYXRpb24oZXhwb3J0RGVjbDogdHMuRXhwb3J0RGVjbGFyYXRpb24pOiB0cy5Ob2RlfHRzLk5vZGVbXSB7XG4gICAgICAgIGNvbnN0IGltcG9ydGVkTW9kdWxlU3ltYm9sID0gZXhwb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIgJiZcbiAgICAgICAgICAgIHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oZXhwb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIpITtcbiAgICAgICAgaWYgKGltcG9ydGVkTW9kdWxlU3ltYm9sKSB7XG4gICAgICAgICAgLy8gRm9yd2FyZCBkZWNsYXJlIGFsbCBleHBsaWNpdGx5IGltcG9ydGVkIG1vZHVsZXMsIHNvIHRoYXQgc3ltYm9scyBjYW4gYmUgcmVmZXJlbmNlZCBhbmRcbiAgICAgICAgICAvLyB0eXBlIG9ubHkgbW9kdWxlcyBnZXQgZm9yY2UtbG9hZGVkLlxuICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmZvcndhcmREZWNsYXJlKFxuICAgICAgICAgICAgICAoZXhwb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dCwgaW1wb3J0ZWRNb2R1bGVTeW1ib2wsXG4gICAgICAgICAgICAgIC8qIGlzRXhwbGljaXRseUltcG9ydGVkPyAqLyB0cnVlLCAvKiBkZWZhdWx0IGltcG9ydD8gKi8gZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHlwZXNUb0V4cG9ydDogQXJyYXk8W3N0cmluZywgdHMuU3ltYm9sXT4gPSBbXTtcbiAgICAgICAgaWYgKCFleHBvcnREZWNsLmV4cG9ydENsYXVzZSkge1xuICAgICAgICAgIC8vIGV4cG9ydCAqIGZyb20gJy4uLidcbiAgICAgICAgICAvLyBSZXNvbHZlIHRoZSAqIGludG8gYWxsIHZhbHVlIHN5bWJvbHMgZXhwb3J0ZWQsIGFuZCB1cGRhdGUgdGhlIGV4cG9ydCBkZWNsYXJhdGlvbi5cblxuICAgICAgICAgIC8vIEV4cGxpY2l0bHkgc3BlbGxlZCBvdXQgZXhwb3J0cyAoaS5lLiB0aGUgZXhwb3J0cyBvZiB0aGUgY3VycmVudCBtb2R1bGUpIHRha2UgcHJlY2VkZW5jZVxuICAgICAgICAgIC8vIG92ZXIgaW1wbGljaXQgb25lcyBmcm9tIGV4cG9ydCAqLiBVc2UgdGhlIGN1cnJlbnQgbW9kdWxlJ3MgZXhwb3J0cyB0byBmaWx0ZXIuXG4gICAgICAgICAgY29uc3QgY3VycmVudE1vZHVsZVN5bWJvbCA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oc291cmNlRmlsZSk7XG4gICAgICAgICAgY29uc3QgY3VycmVudE1vZHVsZUV4cG9ydHMgPSBjdXJyZW50TW9kdWxlU3ltYm9sICYmIGN1cnJlbnRNb2R1bGVTeW1ib2wuZXhwb3J0cztcblxuICAgICAgICAgIGlmICghaW1wb3J0ZWRNb2R1bGVTeW1ib2wpIHtcbiAgICAgICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmVycm9yKGV4cG9ydERlY2wsIGBleHBvcnQgKiB3aXRob3V0IG1vZHVsZSBzeW1ib2xgKTtcbiAgICAgICAgICAgIHJldHVybiBleHBvcnREZWNsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBleHBvcnRlZFN5bWJvbHMgPSB0eXBlQ2hlY2tlci5nZXRFeHBvcnRzT2ZNb2R1bGUoaW1wb3J0ZWRNb2R1bGVTeW1ib2wpO1xuICAgICAgICAgIGNvbnN0IGV4cG9ydFNwZWNpZmllcnM6IHRzLkV4cG9ydFNwZWNpZmllcltdID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBzeW0gb2YgZXhwb3J0ZWRTeW1ib2xzKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudE1vZHVsZUV4cG9ydHMgJiYgY3VycmVudE1vZHVsZUV4cG9ydHMuaGFzKHN5bS5lc2NhcGVkTmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSBhbHJlYWR5IGdlbmVyYXRlZCBhbiBleHBvcnQgZm9yIHRoZSBnaXZlbiBzeW1ib2wuXG4gICAgICAgICAgICBpZiAoZXhwYW5kZWRTdGFySW1wb3J0cy5oYXMoc3ltLm5hbWUpKSBjb250aW51ZTtcbiAgICAgICAgICAgIGV4cGFuZGVkU3RhckltcG9ydHMuYWRkKHN5bS5uYW1lKTtcbiAgICAgICAgICAgIC8vIE9ubHkgY3JlYXRlIGFuIGV4cG9ydCBzcGVjaWZpZXIgZm9yIHZhbHVlcyB0aGF0IGFyZSBleHBvcnRlZC4gRm9yIHR5cGVzLCB0aGUgY29kZVxuICAgICAgICAgICAgLy8gYmVsb3cgY3JlYXRlcyBzcGVjaWZpYyBleHBvcnQgc3RhdGVtZW50cyB0aGF0IG1hdGNoIENsb3N1cmUncyBleHBlY3RhdGlvbnMuXG4gICAgICAgICAgICBpZiAoc2hvdWxkRW1pdFZhbHVlRXhwb3J0Rm9yU3ltYm9sKHN5bSkpIHtcbiAgICAgICAgICAgICAgZXhwb3J0U3BlY2lmaWVycy5wdXNoKHRzLmNyZWF0ZUV4cG9ydFNwZWNpZmllcih1bmRlZmluZWQsIHN5bS5uYW1lKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0eXBlc1RvRXhwb3J0LnB1c2goW3N5bS5uYW1lLCBzeW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZXhwb3J0RGVjbCA9IHRzLnVwZGF0ZUV4cG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICBleHBvcnREZWNsLCBleHBvcnREZWNsLmRlY29yYXRvcnMsIGV4cG9ydERlY2wubW9kaWZpZXJzLFxuICAgICAgICAgICAgICB0cy5jcmVhdGVOYW1lZEV4cG9ydHMoZXhwb3J0U3BlY2lmaWVycyksIGV4cG9ydERlY2wubW9kdWxlU3BlY2lmaWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGV4cCBvZiBleHBvcnREZWNsLmV4cG9ydENsYXVzZS5lbGVtZW50cykge1xuICAgICAgICAgICAgY29uc3QgZXhwb3J0ZWROYW1lID0gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KGV4cC5uYW1lKTtcbiAgICAgICAgICAgIHR5cGVzVG9FeHBvcnQucHVzaChcbiAgICAgICAgICAgICAgICBbZXhwb3J0ZWROYW1lLCBtb2R1bGVUeXBlVHJhbnNsYXRvci5tdXN0R2V0U3ltYm9sQXRMb2NhdGlvbihleHAubmFtZSldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRG8gbm90IGVtaXQgdHlwZWRlZiByZS1leHBvcnRzIGluIHVudHlwZWQgbW9kZS5cbiAgICAgICAgaWYgKGhvc3QudW50eXBlZCkgcmV0dXJuIGV4cG9ydERlY2w7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0OiB0cy5Ob2RlW10gPSBbZXhwb3J0RGVjbF07XG4gICAgICAgIGZvciAoY29uc3QgW2V4cG9ydGVkTmFtZSwgc3ltXSBvZiB0eXBlc1RvRXhwb3J0KSB7XG4gICAgICAgICAgbGV0IGFsaWFzZWRTeW1ib2wgPSBzeW07XG4gICAgICAgICAgaWYgKHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgICAgICAgICBhbGlhc2VkU3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBpc1R5cGVBbGlhcyA9IChhbGlhc2VkU3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuVmFsdWUpID09PSAwICYmXG4gICAgICAgICAgICAgIChhbGlhc2VkU3ltYm9sLmZsYWdzICYgKHRzLlN5bWJvbEZsYWdzLlR5cGVBbGlhcyB8IHRzLlN5bWJvbEZsYWdzLkludGVyZmFjZSkpICE9PSAwO1xuICAgICAgICAgIGlmICghaXNUeXBlQWxpYXMpIGNvbnRpbnVlO1xuICAgICAgICAgIGNvbnN0IHR5cGVOYW1lID1cbiAgICAgICAgICAgICAgbW9kdWxlVHlwZVRyYW5zbGF0b3Iuc3ltYm9sc1RvQWxpYXNlZE5hbWVzLmdldChhbGlhc2VkU3ltYm9sKSB8fCBhbGlhc2VkU3ltYm9sLm5hbWU7XG4gICAgICAgICAgY29uc3Qgc3RtdCA9IHRzLmNyZWF0ZVN0YXRlbWVudChcbiAgICAgICAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3ModHMuY3JlYXRlSWRlbnRpZmllcignZXhwb3J0cycpLCBleHBvcnRlZE5hbWUpKTtcbiAgICAgICAgICBhZGRDb21tZW50T24oc3RtdCwgW3t0YWdOYW1lOiAndHlwZWRlZicsIHR5cGU6ICchJyArIHR5cGVOYW1lfV0pO1xuICAgICAgICAgIHRzLmFkZFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudChcbiAgICAgICAgICAgICAgc3RtdCwgdHMuU3ludGF4S2luZC5TaW5nbGVMaW5lQ29tbWVudFRyaXZpYSwgJyByZS1leHBvcnQgdHlwZWRlZicsIHRydWUpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHN0bXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgaWRlbnRpZmllcnMgZXhwb3J0ZWQgaW4gYSBzaW5nbGUgZXhwb3J0ZWQgc3RhdGVtZW50IC0gdHlwaWNhbGx5IGp1c3Qgb25lXG4gICAgICAgKiBpZGVudGlmaWVyIChlLmcuIGZvciBgZXhwb3J0IGZ1bmN0aW9uIGZvbygpYCksIGJ1dCBtdWx0aXBsZSBmb3IgYGV4cG9ydCBkZWNsYXJlIHZhciBhLCBiYC5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZ2V0RXhwb3J0RGVjbGFyYXRpb25OYW1lcyhub2RlOiB0cy5Ob2RlKTogdHMuSWRlbnRpZmllcltdIHtcbiAgICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQ6XG4gICAgICAgICAgICBjb25zdCB2YXJEZWNsID0gbm9kZSBhcyB0cy5WYXJpYWJsZVN0YXRlbWVudDtcbiAgICAgICAgICAgIHJldHVybiB2YXJEZWNsLmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubWFwKChkKSA9PiBnZXRFeHBvcnREZWNsYXJhdGlvbk5hbWVzKGQpWzBdKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnVuY3Rpb25EZWNsYXJhdGlvbjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1vZHVsZURlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb246XG4gICAgICAgICAgICBjb25zdCBkZWNsID0gbm9kZSBhcyB0cy5OYW1lZERlY2xhcmF0aW9uO1xuICAgICAgICAgICAgaWYgKCFkZWNsLm5hbWUgfHwgZGVjbC5uYW1lLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbZGVjbC5uYW1lXTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZUFsaWFzRGVjbGFyYXRpb246XG4gICAgICAgICAgICBjb25zdCB0eXBlQWxpYXMgPSBub2RlIGFzIHRzLlR5cGVBbGlhc0RlY2xhcmF0aW9uO1xuICAgICAgICAgICAgcmV0dXJuIFt0eXBlQWxpYXMubmFtZV07XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmVycm9yKFxuICAgICAgICAgICAgbm9kZSwgYHVuc3VwcG9ydGVkIGV4cG9ydCBkZWNsYXJhdGlvbiAke3RzLlN5bnRheEtpbmRbbm9kZS5raW5kXX06ICR7bm9kZS5nZXRUZXh0KCl9YCk7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBBbWJpZW50IGRlY2xhcmF0aW9ucyBkZWNsYXJlIHR5cGVzIGZvciBUeXBlU2NyaXB0J3MgYmVuZWZpdCwgYW5kIHdpbGwgYmUgcmVtb3ZlZGUgYnlcbiAgICAgICAqIFR5cGVTY3JpcHQgZHVyaW5nIGl0cyBlbWl0IHBoYXNlLiBEb3duc3RyZWFtIENsb3N1cmUgY29kZSBob3dldmVyIG1pZ2h0IGJlIGltcG9ydGluZ1xuICAgICAgICogc3ltYm9scyBmcm9tIHRoaXMgbW9kdWxlLCBzbyB0c2lja2xlIG11c3QgZW1pdCBhIENsb3N1cmUtY29tcGF0aWJsZSBleHBvcnRzIGRlY2xhcmF0aW9uLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiB2aXNpdEV4cG9ydGVkQW1iaWVudChub2RlOiB0cy5Ob2RlKTogdHMuTm9kZVtdIHtcbiAgICAgICAgaWYgKGhvc3QudW50eXBlZCB8fCAhc2hvdWxkRW1pdEV4cG9ydHNBc3NpZ25tZW50cygpKSByZXR1cm4gW25vZGVdO1xuXG4gICAgICAgIGNvbnN0IGRlY2xOYW1lcyA9IGdldEV4cG9ydERlY2xhcmF0aW9uTmFtZXMobm9kZSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdDogdHMuTm9kZVtdID0gW25vZGVdO1xuICAgICAgICBmb3IgKGNvbnN0IGRlY2wgb2YgZGVjbE5hbWVzKSB7XG4gICAgICAgICAgY29uc3Qgc3ltID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihkZWNsKSE7XG4gICAgICAgICAgY29uc3QgaXNWYWx1ZSA9IHN5bS5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlZhbHVlO1xuICAgICAgICAgIC8vIE5vbi12YWx1ZSBvYmplY3RzIGRvIG5vdCBleGlzdCBhdCBydW50aW1lLCBzbyB3ZSBjYW5ub3QgYWNjZXNzIHRoZSBzeW1ib2wgKGl0IG9ubHlcbiAgICAgICAgICAvLyBleGlzdHMgaW4gZXh0ZXJucykuIEV4cG9ydCB0aGVtIGFzIGEgdHlwZWRlZiwgd2hpY2ggZm9yd2FyZHMgdG8gdGhlIHR5cGUgaW4gZXh0ZXJucy5cbiAgICAgICAgICAvLyBOb3RlOiBUeXBlU2NyaXB0IGVtaXRzIG9kZCBjb2RlIGZvciBleHBvcnRlZCBhbWJpZW50cyAoZXhwb3J0cy54IGZvciB2YXJpYWJsZXMsIGp1c3QgeFxuICAgICAgICAgIC8vIGZvciBldmVyeXRoaW5nIGVsc2UpLiBUaGF0IHNlZW1zIGJ1Z2d5LCBhbmQgaW4gZWl0aGVyIGNhc2UgdGhpcyBjb2RlIHNob3VsZCBub3QgYXR0ZW1wdFxuICAgICAgICAgIC8vIHRvIGZpeCBpdC5cbiAgICAgICAgICAvLyBTZWUgYWxzbyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzgwMTUuXG4gICAgICAgICAgaWYgKCFpc1ZhbHVlKSB7XG4gICAgICAgICAgICAvLyBEbyBub3QgZW1pdCByZS1leHBvcnRzIGZvciBNb2R1bGVEZWNsYXJhdGlvbnMuXG4gICAgICAgICAgICAvLyBBbWJpZW50IE1vZHVsZURlY2xhcmF0aW9ucyBhcmUgYWx3YXlzIHJlZmVyZW5jZWQgYXMgZ2xvYmFsIHN5bWJvbHMsIHNvIHRoZXkgZG9uJ3RcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gYmUgZXhwb3J0ZWQuXG4gICAgICAgICAgICBpZiAobm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLk1vZHVsZURlY2xhcmF0aW9uKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IG1hbmdsZWROYW1lID0gbW9kdWxlTmFtZUFzSWRlbnRpZmllcihob3N0LCBzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IGRlY2xOYW1lID0gdHJhbnNmb3JtZXJVdGlsLmdldElkZW50aWZpZXJUZXh0KGRlY2wpO1xuICAgICAgICAgICAgY29uc3Qgc3RtdCA9IHRzLmNyZWF0ZVN0YXRlbWVudChcbiAgICAgICAgICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVJZGVudGlmaWVyKCdleHBvcnRzJyksIGRlY2xOYW1lKSk7XG4gICAgICAgICAgICBhZGRDb21tZW50T24oc3RtdCwgW3t0YWdOYW1lOiAndHlwZWRlZicsIHR5cGU6IGAhJHttYW5nbGVkTmFtZX0uJHtkZWNsTmFtZX1gfV0pO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goc3RtdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0b3Iobm9kZTogdHMuTm9kZSk6IHRzLk5vZGV8dHMuTm9kZVtdIHtcbiAgICAgICAgaWYgKGlzQW1iaWVudChub2RlKSkge1xuICAgICAgICAgIGlmICghdHJhbnNmb3JtZXJVdGlsLmhhc01vZGlmaWVyRmxhZyhub2RlIGFzIHRzLkRlY2xhcmF0aW9uLCB0cy5Nb2RpZmllckZsYWdzLkV4cG9ydCkpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmlzaXRFeHBvcnRlZEFtYmllbnQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW1wb3J0RGVjbGFyYXRpb246XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRJbXBvcnREZWNsYXJhdGlvbihub2RlIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhwb3J0RGVjbGFyYXRpb246XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRFeHBvcnREZWNsYXJhdGlvbihub2RlIGFzIHRzLkV4cG9ydERlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIHJldHVybiB2aXNpdENsYXNzRGVjbGFyYXRpb24obm9kZSBhcyB0cy5DbGFzc0RlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRJbnRlcmZhY2VEZWNsYXJhdGlvbihub2RlIGFzIHRzLkludGVyZmFjZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSGVyaXRhZ2VDbGF1c2U6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRIZXJpdGFnZUNsYXVzZShub2RlIGFzIHRzLkhlcml0YWdlQ2xhdXNlKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ29uc3RydWN0b3I6XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HZXRBY2Nlc3NvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3I6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRGdW5jdGlvbkxpa2VEZWNsYXJhdGlvbihub2RlIGFzIHRzLkZ1bmN0aW9uTGlrZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRUaGlzRXhwcmVzc2lvbihub2RlIGFzIHRzLlRoaXNFeHByZXNzaW9uKTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQ6XG4gICAgICAgICAgICByZXR1cm4gdmlzaXRWYXJpYWJsZVN0YXRlbWVudChub2RlIGFzIHRzLlZhcmlhYmxlU3RhdGVtZW50KTtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBc3NpZ25tZW50OlxuICAgICAgICAgICAgZXNjYXBlSWxsZWdhbEpTRG9jKG5vZGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBhcmFtZXRlcjpcbiAgICAgICAgICAgIC8vIFBhcmFtZXRlciBwcm9wZXJ0aWVzIChlLmcuIGBjb25zdHJ1Y3RvcigvKiogZG9jcyAqLyBwcml2YXRlIGZvbzogc3RyaW5nKWApIG1pZ2h0IGhhdmVcbiAgICAgICAgICAgIC8vIEpTRG9jIGNvbW1lbnRzLCBpbmNsdWRpbmcgSlNEb2MgdGFncyByZWNvZ25pemVkIGJ5IENsb3N1cmUgQ29tcGlsZXIuIFByZXZlbnQgZW1pdHRpbmdcbiAgICAgICAgICAgIC8vIGFueSBjb21tZW50cyBvbiB0aGVtLCBzbyB0aGF0IENsb3N1cmUgZG9lc24ndCBlcnJvciBvbiB0aGVtLlxuICAgICAgICAgICAgLy8gU2VlIHRlc3RfZmlsZXMvcGFyYW1ldGVyX3Byb3BlcnRpZXMudHMuXG4gICAgICAgICAgICBjb25zdCBwYXJhbURlY2wgPSBub2RlIGFzIHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybWVyVXRpbC5oYXNNb2RpZmllckZsYWcoXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtRGVjbCwgdHMuTW9kaWZpZXJGbGFncy5QYXJhbWV0ZXJQcm9wZXJ0eU1vZGlmaWVyKSkge1xuICAgICAgICAgICAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMocGFyYW1EZWNsLCBbXSk7XG4gICAgICAgICAgICAgIGpzZG9jLnN1cHByZXNzTGVhZGluZ0NvbW1lbnRzUmVjdXJzaXZlbHkocGFyYW1EZWNsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlQWxpYXNEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIHJldHVybiB2aXNpdFR5cGVBbGlhc0RlY2xhcmF0aW9uKG5vZGUgYXMgdHMuVHlwZUFsaWFzRGVjbGFyYXRpb24pO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Bc0V4cHJlc3Npb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlR5cGVBc3NlcnRpb25FeHByZXNzaW9uOlxuICAgICAgICAgICAgcmV0dXJuIHZpc2l0QXNzZXJ0aW9uRXhwcmVzc2lvbihub2RlIGFzIHRzLlR5cGVBc3NlcnRpb24pO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Ob25OdWxsRXhwcmVzc2lvbjpcbiAgICAgICAgICAgIHJldHVybiB2aXNpdE5vbk51bGxFeHByZXNzaW9uKG5vZGUgYXMgdHMuTm9uTnVsbEV4cHJlc3Npb24pO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIHNvdXJjZUZpbGUgPSB0cy52aXNpdEVhY2hDaGlsZChzb3VyY2VGaWxlLCB2aXNpdG9yLCBjb250ZXh0KTtcblxuICAgICAgcmV0dXJuIG1vZHVsZVR5cGVUcmFuc2xhdG9yLmluc2VydEZvcndhcmREZWNsYXJlcyhzb3VyY2VGaWxlKTtcbiAgICB9O1xuICB9O1xufVxuIl19