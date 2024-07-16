import { Node } from 'jsonc-parser'
import { CBSContributor } from './autoComplete'

export class booleanCbsContributor implements CBSContributor {

    accept(key: string | null): boolean {
        return key === "must" || key === "must_not" || key === "should";
    }

    contributeKey(parentKey: string, node: Node, suggestion: string[]) {
        if (parentKey === "must") {
            suggestion.push("conjuncts")
        } else if (parentKey == "must_not" || parentKey == "should") {
            suggestion.push("disjuncts")
        }

    }

    contributeValue(attributeKey: string, node: Node, suggestion: string[]) {

    }

}