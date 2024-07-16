import * as vscode from 'vscode';

export class cbsTemplate {

    static getQueryTemplate(existingKeys: string[]): vscode.CompletionItem {
        const QUERY = 'query';
        const snippetCompletion = new vscode.CompletionItem(QUERY, vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Query string query syntax";

        let snippetText = '';

        if (!existingKeys.includes("query")) {
            snippetText += '\t"query": "$1"\n';
        }

        snippetText = snippetText.replace(/,\n\}/g, '\n}');

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }


    static getHighlightTemplate(): vscode.CompletionItem {

        const snippetCompletion = new vscode.CompletionItem("Highlight Options", vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Highlight Options";

        let snippetText = `"highlight": {\n\t"style": "$1",\n\t"fields": [$2]\n}`;


        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getEmptyTemplate(name: string, desc: string): vscode.CompletionItem {
        const emptyTemplate = new vscode.CompletionItem(name, vscode.CompletionItemKind.Module);
        emptyTemplate.detail = desc;
        emptyTemplate.documentation = new vscode.MarkdownString(`Inserts an empty JSON object for \`${name}\``);

        let snippetText = `"${name}": {}`;

        emptyTemplate.insertText = new vscode.SnippetString(snippetText);

        // emptyTemplate.command = { title: 'Format Document', command: 'editor.action.formatDocument' };

        return emptyTemplate;
    }

    static getGeoTemplate(key: string, desc: string, type: string, existingKeys: string[]): vscode.CompletionItem {
        const geoCompletion = new vscode.CompletionItem(key, vscode.CompletionItemKind.Module);
        geoCompletion.detail = desc;
        let snippetText = '';

        let cursorPosition = 1;

        if (!existingKeys.includes("field")) {
            snippetText += `"field": "\${${cursorPosition++}}",\n`;
        }

        if (!existingKeys.includes("geometry")) {
            snippetText += '"geometry": {\n';
            snippetText += '"shape": {\n';
            snippetText += `"type": "${type}",\n`;

            if (type === "GeometryCollection") {
                snippetText += `"geometries": [\${${cursorPosition++}}]\n`;
            } else {
                snippetText += `"coordinates": [\${${cursorPosition++}}]\n`;
            }

            if (type === "Circle") {
                snippetText += `, "radius": "\${${cursorPosition++}}"\n`;
            }

            snippetText += '},\n';
            snippetText += `"relation": "\${${cursorPosition++}}"\n`;
            snippetText += '}';
        }

        snippetText = snippetText.replace(/,\n}/g, '\n}');

        geoCompletion.insertText = new vscode.SnippetString(snippetText);

        return geoCompletion;
    }



    static getKNNTemplate(): vscode.CompletionItem {
        const snippetCompletion = new vscode.CompletionItem("knn", vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Knn filter";
        let snippetText = '"knn": [{\n\t"k": $1,\n\t"field": "$2",\n\t"vector": [$3]\n}]';

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getConjunctsTemplate(existingKeys: string[]): vscode.CompletionItem {
        const CONJUNCTS_QUERY = 'conjuncts';
        const snippetCompletion = new vscode.CompletionItem(CONJUNCTS_QUERY, vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Query conjunction";

        let snippetText = '';

        if (!existingKeys.includes("conjuncts")) {
            snippetText += '\t"conjuncts": [\n\t\t{\n\t\t\t$1\n\t\t}\n\t]\n';
        }

        snippetText = snippetText.replace(/,\n\}/g, '\n}');

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getDisjunctsTemplate(existingKeys: string[]): vscode.CompletionItem {
        const DISJUNCTS_QUERY = 'disjuncts';
        const snippetCompletion = new vscode.CompletionItem(DISJUNCTS_QUERY, vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Query disjunction";

        let snippetText = '';

        if (!existingKeys.includes("disjuncts")) {
            snippetText += '\t"disjuncts": [\n\t\t{\n\t\t\t$1\n\t\t}\n\t]\n';
        }

        snippetText = snippetText.replace(/,\n\}/g, '\n}');

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getMustTemplate(): vscode.CompletionItem {
        const snippetCompletion = new vscode.CompletionItem('must');
        snippetCompletion.detail = "Must boolean query template";
        snippetCompletion.kind = vscode.CompletionItemKind.Module;

        let snippetText = '';

        snippetText += '"must": {\n\t"conjuncts": [\n\t\t{$1}\n\t]\n}';

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getShouldTemplate(): vscode.CompletionItem {
        const snippetCompletion = new vscode.CompletionItem('should');
        snippetCompletion.detail = "Should boolean query template";
        snippetCompletion.kind = vscode.CompletionItemKind.Module;

        let snippetText = '';
        snippetText += '"should": {\n\t"disjuncts": [\n\t\t{$1}\n\t]\n}';

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getMustNotTemplate(): vscode.CompletionItem {
        const snippetCompletion = new vscode.CompletionItem('must_not');
        snippetCompletion.detail = "MustNot boolean query template";
        snippetCompletion.kind = vscode.CompletionItemKind.Module;

        let snippetText = '';

        snippetText += '"must_not": {\n\t"disjuncts": [\n\t\t{$1}\n\t]\n}';

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static createGenericTemplate(key: string, description: string, attributes: string[]): vscode.CompletionItem {
        const snippetCompletion = new vscode.CompletionItem(key);
        snippetCompletion.detail = description;
        snippetCompletion.kind = vscode.CompletionItemKind.Module;

        let snippetText = '';

        attributes.forEach((attr, index) => {
            snippetText += `\t"${attr}": $${index + 1}`;
            if (index < attributes.length - 1) {
                snippetText += ",\n";
            }
        });


        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }


    static getRectangleTemplate(existingKeys: string[]): vscode.CompletionItem {
        const RECTANGLE_QUERY = 'rectangle_query';
        const snippetCompletion = new vscode.CompletionItem(RECTANGLE_QUERY, vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Rectangle-Based Geopoint Query";

        let snippetText = '';

        if (!existingKeys.includes("field")) {
            snippetText += '\t"field": "$1",\n';
        }

        if (!existingKeys.includes("top_left")) {
            snippetText += `\t"top_left": {\n\t\t"lon": "$2",\n\t\t"lat": "$3"\n\t},\n`;
        }

        if (!existingKeys.includes("bottom_right")) {
            snippetText += `\t"bottom_right": {\n\t\t"lon": "$4",\n\t\t"lat": "$5"\n\t}\n`;
        }

        snippetText = snippetText.replace(/,\n}$/g, '\n}');

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getRadiusTemplate(existingKeys: string[]): vscode.CompletionItem {
        const RADIUS_QUERY = 'radius_query';
        const snippetCompletion = new vscode.CompletionItem(RADIUS_QUERY, vscode.CompletionItemKind.Module);
        snippetCompletion.detail = "Distance/Radius-Based Geopoint Query";

        let snippetText = '';

        if (!existingKeys.includes("field")) {
            snippetText += '\t"field": "$1",\n';
        }

        if (!existingKeys.includes("distance")) {
            snippetText += '\t"distance": "$2",\n';
        }

        if (!existingKeys.includes("location")) {
            snippetText += `\t"location": {\n\t\t"lon": "$3",\n\t\t"lat": "$4"\n\t}\n`;
        }

        snippetText = snippetText.replace(/,\n\}/g, '\n}');

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);

        return snippetCompletion;
    }

    static getVectorTemplate(existingKeys: string[]): vscode.CompletionItem {
        const snippetCompletion = new vscode.CompletionItem('vector_query');
        snippetCompletion.detail = "Vector search filter";
        snippetCompletion.kind = vscode.CompletionItemKind.Module;

        let snippetText = '';

        if (!existingKeys.includes("field")) {
            snippetText += '"field": "$1",\n';
        }
        if (!existingKeys.includes("k")) {
            snippetText += '"k": $2,\n';
        }
        if (!existingKeys.includes("vector")) {
            snippetText += '"vector": [$3]\n';
        }

        snippetText = snippetText.replace(/,\n$/, '\n');

        snippetCompletion.insertText = new vscode.SnippetString(snippetText);
        // snippetCompletion.command = {
        //     title: "Format Document",
        //     command: "editor.action.formatDocument"
        // };

        return snippetCompletion;
    }

}