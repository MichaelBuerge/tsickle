/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="tsickle/src/type_translator" />
import { AnnotatorHost } from './jsdoc_transformer';
import * as ts from './typescript';
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
export declare function isValidClosurePropertyName(name: string): boolean;
/**
 * Determines if fileName refers to a builtin lib.d.ts file.
 * This is a terrible hack but it mirrors a similar thing done in Clutz.
 */
export declare function isBuiltinLibDTS(fileName: string): boolean;
export declare function typeToDebugString(type: ts.Type): string;
export declare function symbolToDebugString(sym: ts.Symbol): string;
/** TypeTranslator translates TypeScript types to Closure types. */
export declare class TypeTranslator {
    private readonly host;
    private readonly typeChecker;
    private readonly node;
    private readonly pathBlackList?;
    private readonly symbolsToAliasedNames;
    private readonly ensureSymbolDeclared;
    /**
     * A list of type literals we've encountered while emitting; used to avoid getting stuck in
     * recursive types.
     */
    private readonly seenAnonymousTypes;
    /**
     * Whether to write types suitable for an \@externs file. Externs types must not refer to
     * non-externs types (i.e. non ambient types) and need to use fully qualified names.
     */
    isForExterns: boolean;
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
    constructor(host: AnnotatorHost, typeChecker: ts.TypeChecker, node: ts.Node, pathBlackList?: Set<string> | undefined, symbolsToAliasedNames?: Map<ts.Symbol, string>, ensureSymbolDeclared?: (sym: ts.Symbol) => void);
    /**
     * Converts a ts.Symbol to a string, applying aliases and ensuring symbols are imported.
     * @return a string representation of the symbol as a valid Closure type name, or `undefined` if
     *     the type cannot be expressed (e.g. for anonymous types).
     */
    symbolToString(sym: ts.Symbol): string | undefined;
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
    maybeGetMangledNamePrefix(symbol: ts.Symbol): string | '';
    private stripClutzNamespace;
    translate(type: ts.Type): string;
    private translateUnion;
    private translateEnumLiteral;
    private translateObject;
    /**
     * translateAnonymousType translates a ts.TypeFlags.ObjectType that is also
     * ts.ObjectFlags.Anonymous. That is, this type's symbol does not have a name. This is the
     * anonymous type encountered in e.g.
     *     let x: {a: number};
     * But also the inferred type in:
     *     let x = {a: 1};  // type of x is {a: number}, as above
     */
    private translateAnonymousType;
    /** Converts a ts.Signature (function signature) to a Closure function type. */
    private signatureToClosure;
    /**
     * Converts parameters for the given signature. Takes parameter declarations as those might not
     * match the signature parameters (e.g. there might be an additional this parameter). This
     * difference is handled by the caller, as is converting the "this" parameter.
     */
    private convertParams;
    warn(msg: string): void;
    /** @return true if sym should always have type {?}. */
    isBlackListed(symbol: ts.Symbol): boolean;
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
    blacklistTypeParameters(blacklist: Map<ts.Symbol, string>, decls: ReadonlyArray<ts.TypeParameterDeclaration> | undefined): void;
}
