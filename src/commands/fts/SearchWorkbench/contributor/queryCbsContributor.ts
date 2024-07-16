import { Node } from "jsonc-parser";
import { CompletionItem } from "vscode";
import { CBSContributor } from "./autoComplete";
import { cbsTemplate } from "./cbsTemplates";
import { cbsTemplateDef } from "./cbsTemplateDef";
import * as vscode from 'vscode';

export class queryCbsContributor implements CBSContributor {

    public static allQueryKeys: Set<string> = new Set();
    private boolQueries = ["must", "must_not", "should"];
    private compound = ["disjuncts", "conjuncts"];
    private query = ["boost", "conjuncts"];
    private match = ["match", "analyzer", "operator", "boost", "fuzziness", "prefix_length", "field"];
    private matchPhrase = ["match_phrase", "analyzer", "operator", "boost", "fuzziness", "prefix_length", "field"];
    private bool = ["bool", "boost", "field"];
    private prefix = ["prefix", "boost", "field"];
    private regexp = ["regexp", "boost", "field"];
    private terms = ["terms", "boost", "field"];
    private cidr = ["cidr", "boost", "field"];
    private wildcard = ["wildcard", "boost", "field"];
    private term = ["term", "boost", "field", "fuzziness"];
    private polygon = ["polygon_points", "boost", "field"];
    private numeric = ["min", "max", "inclusive_min", "inclusive_max", "field", "boost"];
    private date = ["start", "end", "inclusive_start", "inclusive_end", "field", "boost"];
    private radius = ["location", "distance", "field", "boost"];
    private rectangle = ["top_left", "bottom_right", "field", "boost"];
    private geometry = ["geometry", "field", "boost"];
    private special = ["match_all", "match_none"];


    constructor() {
        this.addAllKeys();
    }

    private addAllKeys(): void {

        ["query",
            ...this.boolQueries,
            ...this.compound,
            ...this.query,
            ...this.match,
            ...this.matchPhrase,
            ...this.bool,
            ...this.prefix,
            ...this.regexp,
            ...this.terms,
            ...this.cidr,
            ...this.wildcard,
            ...this.term,
            ...this.polygon,
            ...this.numeric,
            ...this.date,
            ...this.radius,
            ...this.rectangle,
            ...this.geometry,
            ...this.special].forEach(key => {
                queryCbsContributor.allQueryKeys.add(key);
            });
    }

    accept(key: string | null): boolean {
        return key === "query" || key === "disjuncts" || key === "conjuncts";
    }

    contributeKey(parentKey: string | null, node: Node, suggestion: string[], result: CompletionItem[], existingKeys: string[]) {

        if (existingKeys.length === 0) {
            queryCbsContributor.allQueryKeys.forEach(key => suggestion.push(key));
        }

        if (this.boolQueries.some(query => existingKeys.includes(query))) {
            this.boolQueries.filter(query => !existingKeys.includes(query)).forEach(query => {
                suggestion.push(query);
            });
            this.addBooleanTemplates(existingKeys, result);
        } else if (!existingKeys.includes("query") && !this.compound.some(comp => existingKeys.includes(comp))) {

            if (!existingKeys.includes("field")) {
                suggestion.push("field");
            }

            if (existingKeys.length === 0) {
                result.push(cbsTemplate.getQueryTemplate(existingKeys));
                suggestion.push("query");
                this.addBooleanTemplates(existingKeys, result);
                result.push(cbsTemplate.getConjunctsTemplate(existingKeys));
                result.push(cbsTemplate.getDisjunctsTemplate(existingKeys));
                result.push(cbsTemplate.getEmptyTemplate("match_all", "match_all template"))
                result.push(cbsTemplate.getEmptyTemplate("match_none", "match_all template"))
            }

            const boolContributors = this.getBoolContributors(existingKeys, result);
            const cidrContributors = this.getCidrContributors(existingKeys, result);
            const prefixContributors = this.getPrefixContributors(existingKeys, result)
            const regexexpContributors = this.getRegexpContributors(existingKeys, result)
            const termContributors = this.getTermContributors(existingKeys, result)
            const termsContributors = this.getTermsContributors(existingKeys, result)
            const rectangleContributors = this.getRectangleContributors(existingKeys, result)
            const polygonContributors = this.getPolygonContributors(existingKeys, result)
            const radiusContributors = this.getRadiusContributors(existingKeys, result)
            const wildCardContributors = this.getWildCardContributors(existingKeys, result)
            const numericContributors = this.getNumericContributors(existingKeys, result)
            const dateContributors = this.getDateContributors(existingKeys, result)
            const matchQuery = this.getMatchContributors(existingKeys, result)
            const matchPhraseQuery = this.getMatchPhraseContributors(existingKeys, result)
            this.addGeometryContributors(existingKeys, result)
            const allContributors = [...boolContributors, ...cidrContributors, ...prefixContributors, ...regexexpContributors, ...termContributors, ...termsContributors, ...rectangleContributors, ...polygonContributors, ...radiusContributors, ...wildCardContributors, ...numericContributors, ...dateContributors, ...matchQuery, ...matchPhraseQuery];

            allContributors.forEach(contributor => {
                if (!suggestion.includes(contributor)) {
                    suggestion.push(contributor);
                }
            });


        }
    }

    addBooleanTemplates(existingKeys: string[], result: CompletionItem[]) {
        if (!existingKeys.includes("must")) {
            result.push(cbsTemplate.getMustTemplate())
        }
        if (!existingKeys.includes("must_not")) {
            result.push(cbsTemplate.getMustNotTemplate())
        }
        if (!existingKeys.includes("should")) {
            result.push(cbsTemplate.getShouldTemplate())
        }

    }

    addGeometryContributors(existingKeys: string[], result: CompletionItem[]) {
        if (existingKeys.every(key => this.geometry.includes(key))) {
            result.push(cbsTemplate.getGeoTemplate("point_geo_query", "Point GeoJSON Query", "Point", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("linestring_geo_query", "LineString GeoJSON Query", "Point", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("polygon_geo_query", "Polygon GeoJSON Query", "Polygon", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("multi_point_geo_query", "MultiPoint GeoJSON Query", "MultiPoint", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("multi_linestring_geo_query", "MultiLineString GeoJSON Query", "MultiLineString", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("multi_polygon_geo_query", "MultiPolygon GeoJSON Query", "MultiPolygon", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("envelope_geo_query", "Envelope GeoJSON Query", "Envelope", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("circle_geo_query", "Circle GeoJSON Query", "Circle", existingKeys))
            result.push(cbsTemplate.getGeoTemplate("geometry_col_geo_query", "Geometry Collection GeoJSON Query", "GeometryCollection", existingKeys))
        }
    }

    getPolygonContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("polygon_points_query", "Polygon Based Geopoint queries", this.polygon);
        return this.genericContributor(this.polygon, existingKeys, result, [template]);
    }

    getRectangleContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        if (existingKeys.every(key => this.rectangle.includes(key))) {
            result.push(cbsTemplate.getRectangleTemplate(existingKeys))
        }
        return this.genericContributor(this.rectangle, existingKeys, result, [])
    }

    getRadiusContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        if (existingKeys.every(key => this.radius.includes(key))) {
            result.push(cbsTemplate.getRadiusTemplate(existingKeys))
        }
        return this.genericContributor(this.radius, existingKeys, result, [])
    }

    getBoolContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("bool_query", "Boolean query", this.bool);
        return this.genericContributor(this.bool, existingKeys, result, [template]);
    }

    getCidrContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("cidr_query", "CIDR query", this.cidr);
        return this.genericContributor(this.cidr, existingKeys, result, [template]);
    }


    getPrefixContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("prefix_query", "Prefix query", this.prefix);
        return this.genericContributor(this.prefix, existingKeys, result, [template]);
    }

    getRegexpContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("regex_query", "Regex query", this.regexp);
        return this.genericContributor(this.regexp, existingKeys, result, [template]);
    }

    getTermContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("term_query", "Term query", this.term);
        return this.genericContributor(this.term, existingKeys, result, [template]);
    }

    getTermsContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("terms_query", "Terms query", this.terms);
        return this.genericContributor(this.terms, existingKeys, result, [template]);
    }

    getWildCardContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const template = this.getSingleTemplate("wildcard_query", "Wildcard query", this.wildcard);
        return this.genericContributor(this.wildcard, existingKeys, result, [template]);
    }

    getNumericContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const numericRangeTemplate = this.getSingleTemplate("numeric_range", "Simple numeric range search", ["field", "min", "max"]);
        const numericRangeAllTemplate = this.getSingleTemplate("numeric_range_all", "Data numeric search with all attributes", this.numeric)
        return this.genericContributor(this.numeric, existingKeys, result, [numericRangeTemplate, numericRangeAllTemplate]);
    }

    getDateContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const dateRangeTemplate = this.getSingleTemplate("date_range", "Simple data range search", ["field", "start", "end"]);
        const dateRangeAllTemplate = this.getSingleTemplate("date_range_all", "Data range search with all attributes", this.date)
        return this.genericContributor(this.date, existingKeys, result, [dateRangeTemplate, dateRangeAllTemplate]);
    }

    getMatchContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const matchQueryTemplate = this.getSingleTemplate("match_query", "Simple match query search", ["field", "match"]);
        const matchQueryAllTemplate = this.getSingleTemplate("match_query_all", "Match query search with all attributes", this.match)
        return this.genericContributor(this.match, existingKeys, result, [matchQueryTemplate, matchQueryAllTemplate]);
    }

    getMatchPhraseContributors(existingKeys: string[], result: CompletionItem[]): string[] {
        const matchPhraseQueryTemplate = this.getSingleTemplate("match_phrase_query", "Simple match phrase query search", ["field", "match_phrase"]);
        const matchPhraseQueryAllTemplate = this.getSingleTemplate("match_phrase_query_all", "Match phrase query search with all attributes", this.matchPhrase)
        return this.genericContributor(this.matchPhrase, existingKeys, result, [matchPhraseQueryTemplate, matchPhraseQueryAllTemplate]);
    }

    genericContributor(keys: string[], existingKeys: string[], result: vscode.CompletionItem[], templateDefs: cbsTemplateDef[]): string[] {
        if (existingKeys.every(key => keys.includes(key))) {
            templateDefs.forEach(def => {
                def.attrs = def.attrs.filter(attr => !existingKeys.includes(attr) && attr !== 'boost');
                result.push(cbsTemplate.createGenericTemplate(def.key, def.desc, def.attrs))
            });
            return keys;
        } else {
            return [];
        }
    }

    private getSingleTemplate(key: string, desc: string, fields: string[]): cbsTemplateDef {
        return new cbsTemplateDef(key, desc, fields);
    }

    contributeValue(attributeKey: string | null, node: Node, suggestion: string[], fields: string[]) {

        if (attributeKey == "operator") {
            suggestion.push("or", "and");
        }
        else if (attributeKey == "field") {
            suggestion.push(...fields);
        }

    }

}