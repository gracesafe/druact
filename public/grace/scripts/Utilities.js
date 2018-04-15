String.prototype.replaceAll = function(token, newToken, ignoreCase) {
	var str,
	    i = -1,
	    _token;
	if (( str = this.toString()) && typeof token === "string") {
		_token = ignoreCase === true ? token.toLowerCase() : undefined;
		while (( i = (_token !== undefined ? str.toLowerCase().indexOf(_token, i >= 0 ? i + newToken.length : 0) : str.indexOf(token, i >= 0 ? i + newToken.length : 0)
		)) !== -1) {
			str = str.substring(0, i).concat(newToken).concat(str.substring(i + token.length));
		}
	}
	return str;
};

//to avoid IE showing console.log as error
if ( typeof console == "undefined" || typeof console.log == "undefined")
	var console = {
		log : function() {
		},
		error : function() {
		}
	};

/**
 * taken from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * also see: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
String.prototype.hashCode = function() {
	var hash = 0,
	    i,
	    chr,
	    len;
	if (this.length === 0)
		return hash;
	for ( i = 0,
	len = this.length; i < len; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0;
		// Convert to 32bit integer
	}
	return hash;
};

function Utilities() {
}

/**
 * This is required because IE is so fucking shit that it can not even parse a date properly.
 * taken from: http://stackoverflow.com/questions/2182246/javascript-dates-in-ie-nan-firefox-chrome-ok
 *
 * Parses string formatted as YYYY-MM-DD to a Date object.
 * If the supplied string does not match the format, an
 * invalid Date (value NaN) is returned.
 * @param {string} dateStringInRange format YYYY-MM-DD, with year in
 * range of 0000-9999, inclusive.
 * @return {Date} Date object representing the string.
 */
Utilities.StringToDate = function(dateStringInRange) {
	var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
	    date = new Date(NaN),
	    month,
	    parts = isoExp.exec(dateStringInRange);

	if (parts) {
		month = +parts[2];
		date.setFullYear(parts[1], month - 1, parts[3]);
		if (month != date.getMonth() + 1) {
			date.setTime(NaN);
		}
	}
	return date;
};

Utilities.entityMap = {
	"&" : "&amp;",
	"<" : "&lt;",
	">" : "&gt;",
	'"' : '&quot;',
	"'" : '&#39;',
	"/" : '&#x2F;'
};
Utilities.escapeHtmlCustom = function(string) {
	return String(string).replace(/[&<>"'\/]/g, function(s) {
		return Utilities.entityMap[s];
	});
};

Utilities.isEmail = function(email) {
	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
};

/**
 * returns the formatted list
 */
Utilities.getValueMgList = function(node) {

	if (node.attributes.length > 0) {
		var valueMgStr = node.getAttribute("value-mg");
		if (valueMgStr != null) {
			return Utilities.getValueMgMapfromLispString(valueMgStr);
		} else {
			console.error("NO-ATTRIBUTE value-mg!");
			return null;
		}
	} else {
		console.error("no attributes for " + node);
		return null;
	}

};
/**
 * takes in a value-mg lisp list and returns an array of objects each containing value and mg
 * example:
 * 		INPUT:  "((0 0)(1 0.5)(3 1))"
 * 		OUTPUT: [{"value":"0","mg":0},
 * 				{"value":"1","mg":0.5},
 * 				{"value":"3","mg":1}]
 *
 * "mg" is a parsed float.
 * Requires jquery
 */
Utilities.getValueMgMapfromLispString = function(lispString) {
	var mgMap = new Array();
	lispString = jQuery.trim(lispString);
	lispString = lispString.replaceAll(")(", ") (", false);
	var items = lispString.split(") (");
	//console.log(items);

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		//console.log("processing item="+item);
		item = jQuery.trim(item.replaceAll('(', ' '));
		item = jQuery.trim(item.replaceAll(')', ' '));
		//console.log(item);
		var twoParts = item.split(" ");
		//first part is the value and second part is mg
		//console.log("two parts="+twoParts);
		var value = twoParts[0];
		var mg = parseFloat(twoParts[1]);
		if (mg > 1.0)
			console.warn("mg value greater than 1 for: " + lispString);
		mgMap.push({
			value : value,
			mg : mg
		});
	}
	return mgMap;
};

Utilities.parseRiskFormulationLispString = function(lispString) {
	if (lispString == null || lispString == '') {
		console.log("risk formulation or action plan empty in cat.");
		return {
			title : '',
			headings : ''
		};
	}
	var title = Utilities.extractFromLispAssociationList("title", lispString);
	title = title.replace(/['"]+/g, '');
	//remove the quotes around the title
	var headings = Utilities.extractFromLispAssociationList("headings", lispString);

	// we are expecting a string like this:
	//    (("Past factors (Historical, Pre-existing or Predisposing)" 2)("Risk triggers (Precipitating factors)" 2)("Persistent contextual factors (Perpetuating)" 2))

	if (headings == null)
		return {
			title : title,
			headings : ""
		};

	var startBracket = 0;
	var startingPosition = 0;
	var headingsArray = new Array();
	for (var i = 1; i < headings.length; i++) {//start with i=1, we do not want to take in account the first bracket.
		if (headings[i] == "(") {
			startBracket++;
			if (startBracket == 1)
				startingPosition = i;
		} else if (headings[i] == ")") {
			startBracket--;
			if (startBracket == 0) {
				//console.log(startingPosition+" # "+i);
				var tempHeading = (headings.substring(startingPosition + 1, i));
				tempHeading = tempHeading.split('"');
				headingsArray.push({
					string : $.trim(tempHeading[1]),
					gap : parseInt($.trim(tempHeading[2]))
				});

			}

		}

	}
	//console.log(headingsArray);

	return {
		title : title,
		headings : Utilities.formRiskFormulationText(headingsArray)
	};
};

Utilities.formRiskFormulationText = function(riskFormulationArray) {
	var finalString = "";
	for (var i = 0; i < riskFormulationArray.length; i++) {

		var str = riskFormulationArray[i].string;
		var gap = riskFormulationArray[i].gap;
		var dashes = "";
		for (var j = 0; j < str.length; j++)
			dashes += "-";

		finalString += dashes + "\n" + str + "\n" + dashes;
		for (var k = 0; k < (gap + 1); k++)
			finalString += "\n";
	}
	return finalString;
};

/*
 input: haystack: ((a 10)(b (some thing))(c delta))

 if needle="a", OUTPUT: 10
 if needle="b", OUTPUT: (some thing)
 if needle="c", OUTPUT: delta

 returns null if needle could not be found in the haystack
 */
Utilities.extractFromLispAssociationList = function(needle, haystack) {
	needle = $.trim(needle);
	var searchingFor = "(" + needle + " ";

	var startLocation = haystack.indexOf(searchingFor);
	if (startLocation != -1) {

		var extracted = (haystack.substr(haystack.indexOf(searchingFor) + searchingFor.length));
		var numOfStartBrackets = 0;
		var i = 0;
		for ( i = 0; i < extracted.length; i++) {
			if (extracted[i] == ")") {
				if (numOfStartBrackets == 0)
					break;
				else
					numOfStartBrackets--;
			} else if (extracted[i] == "(") {
				numOfStartBrackets++;
			}
		}
		return (extracted.substring(0, i));
	} else {
		//could not find the requested string.
		return null;
	}
};

Utilities._isDemographicQuestion = function(path) {
	if (path.indexOf("gen-demog") == -1)
		return false;
	else
		return true;
};

/**
 * takes in a node and returns its path as an array of codes
 * for exapmple for a node ccc at mental-health-risk > aaa > bbb > ccc
 *
 * output will be
 * [#mental-health-risk,#aaa,#bbb,#ccc]
 *
 * if code does not exists, lable will be used if both do not exist "NO-ATTRIBUTE!" is used as identifier
 *
 */
Utilities.getPathAsCodes = function(node) {
	var path = [];
	do {
		if (node.attributes.length > 0) {
			var code = node.getAttribute("code");
			var label = node.getAttribute("label");
			if (code != null)
				path.unshift(code);
			else if (label != null)
				path.unshift("LABEL-" + label);
			else
				path.unshift("NO-ATTRIBUTE!");
		} else {
			path.unshift("NO-ATTRIBUTE!");
			console.log("no attribute for " + node);
		}

	} while ((node = node.parentNode) && (node.nodeName!='#document'));

	return (path);
};

/**
 * CAREFUL!!! the codePathArray expects the first element to be the code of root element!
 * so the input would be something like: mental-health-risk,suic,gen-feel-emot
 */
Utilities.findCatjsNode = function(codePathArray, rootJsNode) {

	if (codePathArray.length == 1)
		return rootJsNode;

	var node = rootJsNode;
	for (var i = 1; i < codePathArray.length; i++) {

		for (var j = 0; j < node.children.length; j++) {
			if (node.children[j].code == jQuery.trim(codePathArray[i])) {
				node = node.children[j];
				break;
			}
		}
	}
	return node;
};

/*
 * search by key such as "mental-health-risk#suic#sui-specific#suic-past-att#suic-occur#suic-patt-att"
 */
Utilities.findCatjsNodeByConcatenatedCodeKey = function(key, jsNode) {
	if (jsNode.key == key)
		return jsNode;
	if (jsNode.children != null) {
		for (var j = 0; j < jsNode.children.length; j++) {
			var result = Utilities.findCatjsNodeByConcatenatedCodeKey(key, jsNode.children[j]);
			if (result != null)
				return result;

		}
	}
	return null;
};

/**
 * takes in rootjS cat and removes all top level nodes whose code are not in array codesToKeep
 * this is used because risk selection feature makes it necessary to remove some top level nodes
 */
Utilities.pruneJsCATforRiskSelection = function(rootJsCat, codesToKeep) {
	for (var j = rootJsCat.children.length - 1; j >= 0; j--) {
		var childNode = rootJsCat.children[j];
		if (childNode.code == 'genericRootNode-added-by-tool')
			continue;
		if ($.inArray(childNode.code, codesToKeep) == -1)
			rootJsCat.children.splice(j, 1);
	}
};

/**
 *
 * WARNING: modifies the input tree!
 * attributeToSearchFor: any attribute that we might want in the tree. put them all in an array.
 * 	ex ["isSpecificRisk","isGenericRootNodeInserteredByTool"] ==> this will generate a tree that will have specific or generic nodes
 */
Utilities.treeUpdateForSpecificORGenericORScreening = function(jsNode, attributeToSearchFor) {
	if (jsNode.children != null) {
		// this loop cleans up all the nodes immediately underneath it
		for (var j = jsNode.children.length - 1; j >= 0; j--) {
			var childNode = jsNode.children[j];

			var anyAttributeFound = false;
			for (var i = 0; i < attributeToSearchFor.length; i++) {
				if (childNode.xmlNode.getAttribute(attributeToSearchFor[i]) == 'true')
					anyAttributeFound = true;
			}

			if (anyAttributeFound == false) {
				jsNode.children.splice(j, 1);
			}

		}

		for (var k = 0; k < jsNode.children.length; k++) {
			var childNode = jsNode.children[k];
			Utilities.treeUpdateForSpecificORGenericORScreening(childNode, attributeToSearchFor);
		}
		if (jsNode.children.length == 0) {
			jsNode.isFolder = false;
		}
	}

};

Utilities.treeUpdateForRapidRepeatAndInterim = function(jsNode, mindmapMode) {
	if (mindmapMode == GlobalVariables.MindMapModes.RAPID_REPEAT) {
		Utilities.treeUpdateForSpecificORGenericORScreening(jsNode, ["showInRapidRepeat"]);
	} else if (mindmapMode == GlobalVariables.MindMapModes.INTERIM) {
		Utilities.treeUpdateForSpecificORGenericORScreening(jsNode, ["showInterim"]);
	} else if (mindmapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK) {
		Utilities.treeUpdateForSpecificORGenericORScreening(jsNode, ["showInSilverOnly"]);
	} else if (mindmapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK) {
		Utilities.treeUpdateForSpecificORGenericORScreening(jsNode, ["showInGoldOnly"]);
	}

};

Utilities.treeUpdateForWellBeing = function(newJsCat) {
	Utilities.treeUpdateForSpecificORGenericORScreening(newJsCat, ["isSpecificRisk", "isGenericRootNodeInserteredByTool"]);
	Utilities.treeUpdateForSpecificORGenericORScreening(newJsCat, ["showInWellBeing"]);
	//lets traverse over all top level nodes and remove empty ones.
	for (var j = newJsCat.children.length - 1; j >= 0; j--) {
		if (newJsCat.children[j].children.length == 0) {
			//console.log('removing '+ newJsCat.children[j].code);
			newJsCat.children.splice(j, 1);
		}

	}

};

Utilities.getRiskContexts = function(rootCatNode) {
	var riskContexts = new Array();
	for (var i = 0; i < rootCatNode.childNodes.length; i++) {
		var item = rootCatNode.childNodes.item(i);
		if (item.nodeType != 1)
			continue;
		//console.log(item);
		//var code = item.getAttribute("code");

		var isGenericAddedByTool = item.getAttribute("isGenericRootNodeInserteredByTool");
		if (isGenericAddedByTool == 'true')
			continue;

		var path = Utilities.getPathAsCodes(item);
		var label = item.getAttribute("label");
		riskContexts.push({
			path : path,
			label : label
		});
	}
	return riskContexts;
};

//TODO: strictly speaking, the risk judgemenet questions should be identified by an attribute already before being sent to me.
Utilities.markRiskJudgementQuestion = function(rootCatNode) {
	for (var i = 0; i < rootCatNode.childNodes.length; i++) {
		var item = rootCatNode.childNodes.item(i);
		if (item.nodeType != 1)
			continue;
		//console.log(item);
		item.setAttribute("riskJudgementFlag", "true");
	}
};
/**
 * returns true if a node is a filter and is closed.
 */
Utilities.isConceptNodeClosedFilter = function(node) {
	var code = node.getAttribute("code");
	if (code != null) {
		var question = GlobalVariables.qt[code];
		if (question != null && question.getQuestionType() == 'filter-q') {
			var answer = question.getAnswer();
			if (answer != null && answer.toLowerCase() != 'yes')
				return true;
			else
				return false;
		} else
			return false;
	} else
		return false;

};
/**
 *
 */
Utilities._calculateChildElements = function(node) {
	var count = 0;
	for (var i = 0; i < node.childNodes.length; i++) {
		if (node.childNodes.item(i).nodeType != 1)
			continue;
		count++;
	}
	return count;
};
/**
 * takes in a cat node
 */
Utilities.getAndAssignMg = function(node) {

	if (node.hasChildNodes()) {
		var sum = 0;

		if (Utilities.isConceptNodeClosedFilter(node)) {
			//console.log('found a closed filter');
			sum = 0;
		} else {
			//console.log('processing concept node: '+node.getAttribute("code"));
			for (var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes.item(i);
				if (childNode.nodeType != 1)
					continue;
				var ri = (childNode.getAttribute("ri"));
				if (ri == null) {// for situations when we do not have a ri attribute
					ri = (1.0 / Utilities._calculateChildElements(node));
					//console.log('for '+childNode.getAttribute("label")+' ri is null. calcultated: '+ ri);
				} else
					ri = parseFloat(ri);

				var mg = Utilities.getAndAssignMg(childNode);
				if (mg == null)
					mg = 0;
				sum += ri * mg;
			}
		}

		node.setAttribute("mg", sum);
		//console.log('mg set '+mg);
		return sum;

	} else {
		var code = node.getAttribute("code");
		var valueMgLispString = node.getAttribute("value-mg");
		var mg = null;
		if (code != null && valueMgLispString != null) {
			//console.log('processing child node: '+code);
			var question = GlobalVariables.qt[code];
			if (question != null) {
				var answer = question.getAnswer();
				if (answer == null)
					mg = null;
				//no answer contributes minimum risk
				else {
					var valueMgMap = Utilities.getValueMgMapfromLispString(node.getAttribute("value-mg"));
					var mg = question.calculateValueMg(answer, valueMgMap);
					//node.setAttribute("mg",mg);
					//console.log('mg set '+mg);
				}
			} else// this should not have happened.. this means a child node in cat has no entry in qt!
				mg = null;

		} else//this should not have happened as it would mean a child node has no code and value-mg attributes!!
			mg = null;

		if (mg == null)
			node.setAttribute("mg", '');
		else
			node.setAttribute("mg", mg);
		return mg;
	}

};

/**
 * the classifier algorithm classifies the tree according to rules defined for grist
 * advance has some special rules such as decision nodes(see spec)
 * this method should be run after the classifier has set mg to all the nodes in the tree in a normal way.(grist way)
 *
 */
Utilities.implementDecisionNodeRulesForADVANCE = function(node) {
	//console.log("running implement for ");
	//console.log(node);
	if (node.hasChildNodes() && Utilities._isADecisionNode(node)) {

		var areAllChildrenDecisionsSoFar = true;
		var maxMgEncounteredSoFar = 0.0;
		for (var i = 0; i < node.childNodes.length; i++) {
			var childNode = node.childNodes.item(i);
			if (childNode.nodeType != 1)
				continue;
			Utilities.implementDecisionNodeRulesForADVANCE(childNode);
			var mg = (childNode.getAttribute("mg"));
			if (mg > maxMgEncounteredSoFar)
				maxMgEncounteredSoFar = mg;
			if (childNode.getAttribute("decision") == null)
				areAllChildrenDecisionsSoFar = false;
		}

		if (areAllChildrenDecisionsSoFar == true) {
			//console.log("mg being updated for "+node.getAttribute("label"));
			node.setAttribute("mg", maxMgEncounteredSoFar);
		}
	}
};

Utilities._isADecisionNode = function(node) {
	if (node.getAttribute("decision") == null)
		return false;
	else
		return true;
};

/**
 * takes a cat node and returns a json object that is required by dynaTree
 */
Utilities.xmlToJson = function(node) {
	//if(typeof(includeDemographics)==='undefined') includeDemographics = true;
	// Create the return object
	var obj = {};
	var isMultiTickFilter = false;
	if (node.nodeType == 1) {// element

		if (node.attributes.length > 0) {

			//var lable = node.getAttribute("code")+'_'+ node.getAttribute("label");
			var label = node.getAttribute("label");
			obj.title = label;
			obj.key = (Utilities.getPathAsCodes(node)).join("#");
			obj.code = node.getAttribute("code");
			if (node.getAttribute("multiple-tick") != null)
				isMultiTickFilter = true;

			//if(includeDemographics == false && obj.code == 'gen-demog')
			//return null;

			var mg = node.getAttribute("mg");
			if (mg == null || mg == '')
				mg = null;

			var iconName;
			iconName = Utilities.getRiskIconFileName(mg);

			//colouring of nodes in tree disabled for now. also disabled from LayoutManager.setQuestionnaireLayout(). search _redrawTree
			//obj.icon = iconName;

			obj.xmlNode = node;
		}
	}

	// deal with children
	if (node.hasChildNodes() && isMultiTickFilter == false) {
		var childrenNodes = Array();
		for (var i = 0; i < node.childNodes.length; i++) {
			var item = node.childNodes.item(i);
			if (item.nodeType != 1)
				continue;
			var result = Utilities.xmlToJson(item);
			if (result != null)
				childrenNodes.push(result);
		}
		obj.children = childrenNodes;
		obj.isFolder = true;
	}
	return obj;
};

/*
//not used anymore.
Utilities.xmlToJsonForRiskExplorationTree = function(node) {
//if(typeof(includeDemographics)==='undefined') includeDemographics = true;
// Create the return object
var obj = {};

if (node.nodeType == 1) {// element

if (node.attributes.length > 0) {

//var lable = node.getAttribute("code")+'_'+ node.getAttribute("label");
var lable = node.getAttribute("label");
obj.name = lable;
obj.code = node.getAttribute("code");
//if(includeDemographics == false && obj.code == 'gen-demog')
//return null;

if (node.hasChildNodes() == false)
obj.isLeaf = "true";

// var mg = node.getAttribute("mg");
// if (mg == null || mg == '')
// mg = null;
//

obj.mg = Math.random();

}
}

// do children
if (node.hasChildNodes()) {
var childrenNodes = Array();

var childrenCountForNode = 0;
for (var i = 0; i < node.childNodes.length; i++) {
var item = node.childNodes.item(i);
if (item.nodeType != 1)
continue;
childrenCountForNode++;
}

for (var i = 0; i < node.childNodes.length; i++) {
var item = node.childNodes.item(i);
if (item.nodeType != 1)
continue;
var result = Utilities.xmlToJsonForRiskExplorationTree(item);
if(result != null) {
result.ri = 1.0 / childrenCountForNode;
childrenNodes.push(result);
}
}
obj.children = childrenNodes;
//obj.isFolder = true;
}
return obj;
}
*/

// this method is now redundant
/*
 Utilities.generateAnswersXML = function(qt, status) {

 //TODO
 //<node assessment-status="in progress|completed"/>
 //<node assessment-comment="any remark a clinician wishes to record, e.g., assessment meta-data" />
 //<node date="today's date"/> ???? do i send this back or server send this to me? or both?

 //console.log("answer writer called");
 var result = "<answers>\n";
 for (var key in qt) {
 var answer = qt[key].getAnswer();
 var comment = qt[key].getComment();
 var managementComment = qt[key].getManagementComment();

 if (answer != null || comment != null || managementComment != null) {
 var thisAnswerNode = '<node code="' + qt[key].getCode() + '" ';
 if (answer != null)
 thisAnswerNode += 'answer="' + answer + '" ';
 if (comment != null)
 thisAnswerNode += 'comment="' + comment + '" ';
 if (managementComment != null)
 thisAnswerNode += 'management="' + managementComment + '" ';

 thisAnswerNode += '/>\n';
 result += thisAnswerNode;
 }
 }
 result += '</answers>';

 console.log(result);

 }
 */

Utilities.getRiskText = function(mg) {
	var str = '';
	if (mg == null)
		str = "";
	else if (mg <= 0.0)
		str = "No";
	else if (mg <= 0.11)
		str = "Very low";
	else if (mg <= 0.31)
		str = "Low";
	else if (mg <= 0.61)
		str = "Medium";
	else if (mg <= 0.81)
		str = "High";
	else if (mg <= 0.91)
		str = "Very high";
	else if (mg <= 1.1)
		str = "Max";

	return str;
};

Utilities.getRiskColor = function(mg) {
	var backColor = GlobalVariables.riskBackgroungColorsHex;
	var frontColor = GlobalVariables.riskForegroundColorsHex;
	if (mg == null)
		return {
			back : backColor[11],
			front : frontColor[11]
		};
	else if (mg <= 0.0)
		return {
			back : backColor[0],
			front : frontColor[0]
		};
	else if (mg <= 0.11)
		return {
			back : backColor[1],
			front : frontColor[1]
		};
	else if (mg <= 0.21)
		return {
			back : backColor[2],
			front : frontColor[2]
		};
	else if (mg <= 0.31)
		return {
			back : backColor[3],
			front : frontColor[3]
		};
	else if (mg <= 0.41)
		return {
			back : backColor[4],
			front : frontColor[4]
		};
	else if (mg <= 0.51)
		return {
			back : backColor[5],
			front : frontColor[5]
		};
	else if (mg <= 0.61)
		return {
			back : backColor[6],
			front : frontColor[6]
		};
	else if (mg <= 0.71)
		return {
			back : backColor[7],
			front : frontColor[7]
		};
	else if (mg <= 0.81)
		return {
			back : backColor[8],
			front : frontColor[8]
		};
	else if (mg <= 0.91)
		return {
			back : backColor[9],
			front : frontColor[9]
		};
	else if (mg <= 1.1)
		return {
			back : backColor[10],
			front : frontColor[10]
		};
	else
		return null;
};
/**
 * takes in an mg and returns which risk icon should be used in the tree for the node that has that mg
 */
Utilities.getRiskIconFileName = function(mg) {
	if (mg == null)
		return 'leafNodeIcon.gif';
	else if (mg <= 0.11)
		return 'greenLeafNodeIcon.gif';
	else if (mg <= 0.31)
		return 'yellowLeafNodeIcon.gif';
	else if (mg <= 0.61)
		return 'orangeLeafNodeIcon.gif';
	else if (mg <= 0.81)
		return 'lightredLeafNodeIcon.gif';
	else
		return 'brightRedLeafNodeIcon.gif';
};

Utilities.getMindMapRiskIconFileName = function(mg) {
	if (mg == null)
		return 'block-grey.png';
	else if (mg <= 0.11)
		return 'block-green.png';
	else if (mg <= 0.31)
		return 'block-yellow.png';
	else if (mg <= 0.61)
		return 'block-orange.png';
	else if (mg <= 0.81)
		return 'block-light-red.png';
	else
		return 'block-red.png';
};

/**
 * colours are reversed here.
 */
/*
Utilities.getRiskIconFileNameForAdvance = function(mg) {
if (mg == null)
return 'leafNodeIcon.gif';
else if (mg <= 0.11)
return 'brightRedLeafNodeIcon.gif';
else if (mg <= 0.31)
return 'lightredLeafNodeIcon.gif';
else if (mg <= 0.61)
return 'orangeLeafNodeIcon.gif';
else if (mg <= 0.81)
return 'yellowLeafNodeIcon.gif';
else
return 'greenLeafNodeIcon.gif';
}
*/

/**
 * takes in the attribute value for auto-answer and returns an array of auto-answer structure.
 *
 * sample input:[NO suic-first-occ suic >> sui-specific >> suic-past-att >> suic-occur >> suic-most-rec][NO suic-how-many "1"]
 * sample output:
 [
 {	"directive":"NO",
 "code":"suic-first-occ",
 "type":"inherit",
 "path":"suic >> sui-specific >> suic-past-att >> suic-occur >> suic-most-rec"
 },
 {	"directive":"NO",
 "code":"suic-how-many",
 "type":"data",
 "data":"1asdf"
 }
 ]

 the 'type' can be either 'data' or 'inherit'
 */
Utilities.parseAutoAnswer = function(autoAnswerString) {
	if (autoAnswerString == null)
		return null;
	//console.log(autoAnswerString);
	//
	var autoAnswerStringArray = autoAnswerString.split("]");
	var autoAnswerArray = new Array();

	for (var i = 0; i < autoAnswerStringArray.length - 1; i++) {
		var autoAnswer = new Object();

		var command = $.trim(autoAnswerStringArray[i]);
		var firstSpace = (autoAnswerStringArray[i].indexOf(" "));

		autoAnswer.directive = $.trim((command.substring(1, firstSpace)));
		//YES or NO
		var temp = (command.substring(firstSpace + 1));
		var secondSpace = temp.indexOf(" ");
		autoAnswer.code = $.trim(temp.substring(0, secondSpace));
		var temp = $.trim(temp.substring(secondSpace + 1));
		if (temp.substring(0, 1) == '"') {
			//lets call this type as "data" and the other one with path as "inherit"
			autoAnswer.type = "data";
			//not the best way.. should really be using enumeration of some sort
			autoAnswer.data = temp.substring(1, temp.length - 1);
		} else {
			autoAnswer.type = "inherit";
			autoAnswer.path = temp;
		}

		//console.log(autoAnswer);
		autoAnswerArray.push(autoAnswer);
	}

	if (autoAnswerArray.length == 0)
		return null;
	else
		return autoAnswerArray;
};

/**
 * takes in the value of answer-constraint attribute from the qt and returns a data structure as given below.
 * sample input: "((>= [suic >> sui-specific >> suic-past-att >> suic-occur >> suic-patt-att >> suic-first-occ]))"
 *
 * output(json): {"operator":">=","targetNodeCode":"suic-first-occ"}
 *
 * @param {Object} answerConstraintString
 */
Utilities.parseAnswerConstraint = function(answerConstraintString) {
	if (answerConstraintString == null)
		return null;

	//lets make sure we are getting the right stuff
	answerConstraintString = $.trim(answerConstraintString);
	if ((answerConstraintString.substring(0, 2) != '((') || (answerConstraintString.substring(answerConstraintString.length - 2, answerConstraintString.length) != '))')) {
		console.error("the answer constraint received is not in the format expected! check QT. received=" + answerConstraintString);
		return null;
	}

	var relationOperator = $.trim(answerConstraintString.substring(2, answerConstraintString.indexOf("[")));
	var targetNodeCode = $.trim(answerConstraintString.substring(answerConstraintString.lastIndexOf(">>") + 2, answerConstraintString.lastIndexOf("]")));

	var answerConstraint = new Object();
	answerConstraint.operator = relationOperator;
	answerConstraint.operatorInEnglish = null;
	if (answerConstraint.operator == '<')
		answerConstraint.operatorInEnglish = GlobalVariables.strings['galassify-utils-1'];
	else if (answerConstraint.operator == '<=')
		answerConstraint.operatorInEnglish = GlobalVariables.strings['galassify-utils-2'];
	else if (answerConstraint.operator == '==')
		answerConstraint.operatorInEnglish = GlobalVariables.strings['galassify-utils-3'];
	else if (answerConstraint.operator == '>')
		answerConstraint.operatorInEnglish = GlobalVariables.strings['galassify-utils-4'];
	else if (answerConstraint.operator == '>=')
		answerConstraint.operatorInEnglish = GlobalVariables.strings['galassify-utils-5'];
	else if (answerConstraint.operator == '!=')
		answerConstraint.operatorInEnglish = GlobalVariables.strings['galassify-utils-6'];

	answerConstraint.targetNodeCode = targetNodeCode;
	return answerConstraint;
};

Utilities.validateAnswerConstraint = function(answerBeingValidated, answerConstraint) {
	if (answerConstraint == null || answerBeingValidated == null || answerBeingValidated == 'DK' || answerBeingValidated == 'dk')
		return true;
	else {
		var targetQuestion = (GlobalVariables.qt[answerConstraint.targetNodeCode]);
		var targetAnswer = targetQuestion.getAnswer();
		if (targetAnswer == null || targetAnswer == 'DK' || targetAnswer == 'dk')
			return true;
		else {
			// so if we have reached here, then both the answers are not dk

			// comparing dates is a bit tricky as the two dates can be in any format yyyy, mmyyyy or ddmmyyyy
			// and they can not be directly compared ex: 052001 and 061999
			if ((targetQuestion.getQuestionType()).substr(0, 4) == 'date') {
				console.log("we have a problem!!");

				//if they are of different length
				if (answerBeingValidated.length != targetAnswer.length) {
					if (answerBeingValidated.length < targetAnswer.length) {
						targetAnswer = targetAnswer.substring(targetAnswer.length - answerBeingValidated.length);
					} else {
						answerBeingValidated = answerBeingValidated.substring(answerBeingValidated.length - targetAnswer.length);
					}
				}

				// now that we know they are both of the same length, lets convert them to epoch time so that they can be easily compared later
				if (answerBeingValidated.length == 4) {
					answerBeingValidated = (Utilities.StringToDate(answerBeingValidated + "-07-02")).getTime();
					targetAnswer = (Utilities.StringToDate(targetAnswer + "-07-02")).getTime();
				} else if (answerBeingValidated.length == 6) {
					var temp_month = (answerBeingValidated.substr(0, 2));
					var temp_year = (answerBeingValidated.substr(2, 4));
					answerBeingValidated = (Utilities.StringToDate(temp_year + "-" + temp_month + "-15")).getTime();

					var temp_month2 = (targetAnswer.substr(0, 2));
					var temp_year2 = (targetAnswer.substr(2, 4));
					targetAnswer = (Utilities.StringToDate(temp_year2 + "-" + temp_month2 + "-15")).getTime();

				} else if (answerBeingValidated.length == 8) {
					var temp_day = (answerBeingValidated.substr(0, 2));
					var temp_month = (answerBeingValidated.substr(2, 2));
					var temp_year = (answerBeingValidated.substr(4, 4));
					answerBeingValidated = (Utilities.StringToDate(temp_year + "-" + temp_month + "-" + temp_day)).getTime();

					var temp_day2 = (targetAnswer.substr(0, 2));
					var temp_month2 = (targetAnswer.substr(2, 2));
					var temp_year2 = (targetAnswer.substr(4, 4));
					targetAnswer = (Utilities.StringToDate(temp_year2 + "-" + temp_month2 + "-" + temp_day2)).getTime();
				} else {
					console.error("while comparing dates for answer constraint: date answer has incorrect length. can only be 4,6 or 8. This should not have happened!!");
				}
			}
			//console.log("comparing answerBeingValidated="+answerBeingValidated+" target answer="+targetAnswer);

			if (answerConstraint.operator == '<') {
				if (answerBeingValidated < targetAnswer)
					return true;
				else
					return false;

			} else if (answerConstraint.operator == '<=') {
				if (answerBeingValidated <= targetAnswer)
					return true;
				else
					return false;
			} else if (answerConstraint.operator == '==') {
				if (answerBeingValidated == targetAnswer)
					return true;
				else
					return false;
			} else if (answerConstraint.operator == '>') {
				if (answerBeingValidated > targetAnswer)
					return true;
				else
					return false;
			} else if (answerConstraint.operator == '>=') {
				if (answerBeingValidated >= targetAnswer)
					return true;
				else
					return false;
			} else if (answerConstraint.operator == '!=') {
				if (answerBeingValidated != targetAnswer)
					return true;
				else
					return false;
			} else {
				console.error("invalid operation found in answer-constraint!!! for code=" + nodeCode);
				return true;
			}
		}
	}
};

Utilities._isQuestionDisplayableBeacuseOfCurrentMindMapModeRestrictions = function(question) {
	return Utilities._isQuestionDisplayableBeacuseOfMindMapModeRestrictions(question, GlobalVariables.currentMindMapMode);
};

Utilities._isQuestionDisplayableBeacuseOfMindMapModeRestrictions = function(question, mindmapMode) {
	var persistence = question.getPersistent();
	if (mindmapMode == GlobalVariables.MindMapModes.FULL) {
		return true;
		// no restrictions
	} else if (mindmapMode == GlobalVariables.MindMapModes.RAPID_REPEAT) {
		if (persistence == null || persistence == '')
			return true;
		else
			return false;

	} else if (mindmapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK) {
		if (persistence == 'soft')
			return true;
		else
			return false;
	} else if (mindmapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK) {
		if (persistence == 'hard')
			return true;
		else
			return false;
	} else
		return true;
	// mode unknown so assuming no restriction.
};

/**
 * this traverses the jsCAT node, not the XML cat node.
 *
 * For counting screening questions, we first generate a screen jsCat and feed that in this function.
 * For rapid repeat and interim, a full cat is passed, therefore we need to check in here to make sure we count the answers properly.
 */
Utilities.countAnswers = function(catNode, qt, questionCodesProcessed) {
	//return {answeredQuestion: 0, totalQuestions:0};
	if ( typeof (questionCodesProcessed) === 'undefined')
		questionCodesProcessed = new Array();

	var unansweredQuestionsList = new Array();
	var answeredQuestion = 0;
	var totalQuestions = 0;
	var isClosedFilterOrLayer = false;
	var node = catNode.xmlNode;
	var code = node.getAttribute("code");
	var riskJudgementFlag = node.getAttribute("riskJudgementFlag");
	var showInRapidRepeat = node.getAttribute("showInRapidRepeat");
	var showInInterim = node.getAttribute("showInterim");
	var isSilverPadLockOnly = node.getAttribute("showInSilverOnly");
	var isGoldPadLockOnly = node.getAttribute("showInGoldOnly");
	var question = qt[code];
	var qType = null;
	if ((code != null) && ( code in qt))
		qType = question.getQuestionType();

	//console.log(node);
	if ((code != null) && ( code in qt) && (riskJudgementFlag != "true")) {

		//we need these checks because countAnswers is also called from mindmap with full jsCAT passes as argument(not the pruned jsCat created just before going in questionair mode)
		if ((GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT && showInRapidRepeat != 'true') || (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.INTERIM && showInInterim != 'true') || (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK && isSilverPadLockOnly != 'true') || (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK && isGoldPadLockOnly != 'true')) {

			// this is an invalid case and we should not count this node.
		} else {

			//qType = question.getQuestionType();
			if ($.inArray(code, questionCodesProcessed) == -1) {
				questionCodesProcessed.push(code);
				totalQuestions++;
				//console.log(node.getAttribute("label"));
				if (question.getAnswer() != null)
					answeredQuestion++;
				else {
					unansweredQuestionsList.push(code);
					//console.log("pushing "+code);
					//console.log(unansweredQuestionsList);

				}

			}
		}
	}

	//if a closed filter or layer, return. no need to deal with multi tick here because xmltojson removes them from js tree
	if ((qType == 'filter-q' || qType == 'layer') && (question.getAnswer() == null || question.getAnswer().toLowerCase() != 'yes'))
		return {
			answeredQuestion : answeredQuestion,
			totalQuestions : totalQuestions,
			unansweredQuestionsList : unansweredQuestionsList
		};

	//if we have reached here then it is not a closed filter or layer
	if (catNode.children != undefined && catNode.children != null) {
		for (var i = 0; i < catNode.children.length; i++) {
			var childNode = catNode.children[i];
			//if(childNode.nodeType != 1) //only want element nodes
			//	continue;

			var result = Utilities.countAnswers(childNode, qt, questionCodesProcessed);

			answeredQuestion += result.answeredQuestion;
			totalQuestions += result.totalQuestions;
			unansweredQuestionsList = unansweredQuestionsList.concat(result.unansweredQuestionsList);
		}
	}
	return {
		answeredQuestion : answeredQuestion,
		totalQuestions : totalQuestions,
		unansweredQuestionsList : unansweredQuestionsList
	};
};

/**
 *
 * @param {Object} parameters: is an object with the following children
 * 		keywords: array of <string> in lowercase
 * 		searchAttributes: array of <string>
 * 		searchXMLTree: the tree to search from: LayoutManager.QuestionnaireLayout._xmlNodeSelectedFromMindmap
 *

 *
 *
 */
Utilities.search = function(parameters) {

	//console.log("parameters recieved:");
	//console.log(parameters);
	var paths = new Array();
	var resultTree = {};

	var label = parameters.searchJSTree.title;
	paths.push(label);
	Utilities._searchRecursively(parameters.searchJSTree, parameters.keywords, parameters.searchAttributes, paths, resultTree);
	// search recursively at this point....
	//console.log("\n\n");
	//console.log(resultTree);
	return resultTree;

};

Utilities._searchRecursively = function(searchJSTreeNode, searchKeywords, searchInAttributes, pathTillHere, resultTree) {

	var results = Utilities._searchInThisNode(searchKeywords, searchInAttributes, searchJSTreeNode);
	if (results != null) {
		//console.log("FOUND: ");
		//console.log(results);
		//	console.log(pathTillHere);
		Utilities._addToResultTree(resultTree, searchJSTreeNode, results, pathTillHere);
	}

	//lets check if node is closed filter/layer

	var question = GlobalVariables.qt[searchJSTreeNode.code];
	if (GlobalVariables.hideClosedNodesInTree == true && question != null && question.isClosedFilterOrLayer() == true) {
		// this is a closed filter. do not go any further
	} else {
		if (searchJSTreeNode.hasOwnProperty('children')) {
			//look under its children
			for (var i = 0; i < searchJSTreeNode.children.length; i++) {
				var item = searchJSTreeNode.children[i];
				var newPath = pathTillHere.slice(0);
				var label = item.title;
				newPath.push(label);
				Utilities._searchRecursively(item, searchKeywords, searchInAttributes, newPath, resultTree);
			}
		}

	}

};

/**
 * takes in an cat node and searches through its attributes and associated qt attributes
 * return null if nothing found in this node.
 * else returns a structure {...} fill in the details later.
 */
Utilities._searchInThisNode = function(searchKeywords, searchInAttributes, searchJSNode) {
	var results = {};
	var counter = 0;
	var code = searchJSNode.code;
	var question = GlobalVariables.qt[code];

	for (var i = 0; i < searchInAttributes.length; i++) {
		var searchAttribute = searchInAttributes[i];

		if (searchAttribute == 'label') {
			var label = searchJSNode.title;
			if (Utilities.__stringContainsAllSearchKeyword(label.toLowerCase(), searchKeywords) == true) {
				//results.label=searchCatNode.getAttribute("label");
				results.label = Utilities.__makeSearchResultTextPretty(searchJSNode.title, searchKeywords);
				counter++;
			}
		}

		//search in qt
		if (question != null) {
			if (searchAttribute == 'question') {
				if (Utilities.__stringContainsAllSearchKeyword(question.getQuestionText().toLowerCase(), searchKeywords) == true) {
					//results.question=question.getQuestionText();
					results.question = Utilities.__makeSearchResultTextPretty(question.getQuestionText(), searchKeywords);
					counter++;
				}
			}

			if (searchAttribute == 'comment') {

				if (question.getComment() != null && Utilities.__stringContainsAllSearchKeyword(question.getComment().toLowerCase(), searchKeywords) == true) {
					//results.question=question.getQuestionText();
					results.comment = Utilities.__makeSearchResultTextPretty(question.getComment(), searchKeywords);
					counter++;
				}
			}

			if (searchAttribute == 'mgmtComment') {
				if (question.getManagementComment() != null && Utilities.__stringContainsAllSearchKeyword(question.getManagementComment().toLowerCase(), searchKeywords) == true) {
					//results.question=question.getQuestionText();
					results.mgmtComment = Utilities.__makeSearchResultTextPretty(question.getManagementComment(), searchKeywords);
					counter++;
				}
			}
			if (searchAttribute == 'helpText') {
				if (question.getHelp() != null && Utilities.__stringContainsAllSearchKeyword(question.getHelp().toLowerCase(), searchKeywords) == true) {
					//results.question=question.getQuestionText();
					results.helpText = Utilities.__makeSearchResultTextPretty(question.getHelp(), searchKeywords);
					counter++;
				}
			}

		}
	}
	if (counter == 0)
		return null;
	else
		return results;
};

Utilities.__stringContainsAllSearchKeyword = function(searchString, keywords) {
	for (var i = 0; i < keywords.length; i++) {
		if (searchString.indexOf(keywords[i]) == -1)
			return false;
	}
	return true;
};

Utilities.__makeSearchResultTextPretty = function(searchText, lookingForWords) {
	//var location = searchText.indexOf(lookingForWord);
	for (var i = 0; i < lookingForWords.length; i++)
		searchText = searchText.replaceAll(lookingForWords[i], '<b>' + lookingForWords[i] + '</b>', true);
	return searchText;
};

/**
 *
 * @param {Object} resultTree is a JS object... as expected by the dynaTree... not xml tree
 * @param {Object} searchTreeNode this is the original xml tree node from cat
 * @param {Object} results
 * @param {Object} pathTillHere array of paths as labels
 */
Utilities._addToResultTree = function(resultTree, searchTreeNode, results, pathTillHere) {
	var tempVar = {};
	tempVar.children = {};
	for (var i = 0; i < pathTillHere.length; i++) {
		if (i == 0) {
			if (!(resultTree.title !== undefined)) {
				resultTree.title = pathTillHere[i];
				resultTree.expand = true;
			}
			tempVar = resultTree;
		} else {
			//look for the result label in all the children of the searchResult tree
			if (!(tempVar.children !== undefined)) {
				tempVar.children = new Array();
			}
			var found = false;
			for (var j = 0; j < tempVar.children.length; j++) {
				if (tempVar.children[j].title == pathTillHere[i]) {
					found = true;
					tempVar = tempVar.children[j];
					break;
				}
			}
			if (found == false) {
				var obj = {};
				obj.title = pathTillHere[i];
				obj.expand = true;
				var newLength = tempVar.children.push(obj);
				tempVar = tempVar.children[newLength - 1];
			}
		}
		tempVar.expand = true;
	}
	//tempVar.icon = 'greenLeafNodeIcon.gif';
	tempVar.addClass = "searchResultNode";
	tempVar.expand = true;
	if (results.label !== undefined) {
		var obj = {};

		//obj.title = GlobalVariables.strings['galassify-utils-7']+": <i>\"" + results.label + "\"</i>";
		obj.title = "<i>" + results.label + "</i>";
		obj.xmlNode = searchTreeNode.xmlNode;
		obj.addClass = "searchResultNodeLabel";
		if (!(tempVar.children !== undefined)) {
			tempVar.children = new Array();
		}
		tempVar.children.push(obj);
	}
	if (results.question !== undefined) {
		var obj = {};
		//obj.title = GlobalVariables.strings['galassify-utils-8']+": <i>\"" + results.question + "\"</i>";
		obj.title = "<i>" + results.question + "</i>";
		obj.xmlNode = searchTreeNode.xmlNode;
		obj.addClass = "searchResultNodeQuestionText";
		if (!(tempVar.children !== undefined)) {
			tempVar.children = new Array();
		}
		tempVar.children.push(obj);
	}
	if (results.comment !== undefined) {
		var obj = {};
		//obj.title = GlobalVariables.strings['galassify-utils-9']+": <i>\"" + results.comment + "\"</i>";
		obj.title = "<i>" + results.comment + "</i>";
		obj.xmlNode = searchTreeNode.xmlNode;
		obj.addClass = "searchResultNodeComments";
		if (!(tempVar.children !== undefined)) {
			tempVar.children = new Array();
		}
		tempVar.children.push(obj);
	}
	if (results.mgmtComment !== undefined) {
		var obj = {};
		//obj.title = GlobalVariables.strings['galassify-utils-10']+": <i>\"" + results.mgmtComment + "\"</i>";
		obj.title = "<i>" + results.mgmtComment + "</i>";
		obj.xmlNode = searchTreeNode.xmlNode;
		obj.addClass = "searchResultNodeMgmtComments";
		if (!(tempVar.children !== undefined)) {
			tempVar.children = new Array();
		}
		tempVar.children.push(obj);
	}
	if (results.helpText !== undefined) {
		var obj = {};
		//obj.title = GlobalVariables.strings['galassify-utils-11']+": <i>\"" + results.helpText + "\"</i>";
		obj.title = "<i>" + results.helpText + "</i>";
		obj.xmlNode = searchTreeNode.xmlNode;
		obj.addClass = "searchResultNodeHelpText";
		if (!(tempVar.children !== undefined)) {
			tempVar.children = new Array();
		}
		tempVar.children.push(obj);
	}

};

Utilities.deleteTreeCookies = function() {
	var pairs = document.cookie.split(";");
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split("=");
		var name = $.trim(pair[0]);
		if (name.match("^dynatree-cookie-custom")) {
			$.cookie(name, null);
		}
	}
};

/**
 * takes in an array of paths from mindmap and returns an array of paths that are actually accessible, i.e. path till nodes
 * that are not under any closed/unanswered filter
 */
Utilities.getPathArrayThatisAccessible = function(fullPathArray) {
	var accessiblePathsSoFar = new Array();
	for (var i = 0; i < fullPathArray.length; i++) {
		var pathSegmentToCheck = jQuery.trim(fullPathArray[i]);
		var question = GlobalVariables.qt[pathSegmentToCheck];
		if (question == null) {
			//not a question, so ok
			accessiblePathsSoFar.push(pathSegmentToCheck);
		} else {
			var qType = question.getQuestionType();
			if (!(qType === 'filter-q' || qType === 'layer')) {
				//questions other than layer or filter.
				accessiblePathsSoFar.push(pathSegmentToCheck);
			} else {
				//filter question. is it yes?
				if (question.getAnswer() != null && question.getAnswer().toLowerCase() == 'yes')
					accessiblePathsSoFar.push(pathSegmentToCheck);
				else {
					//it is a closed filter!
					accessiblePathsSoFar.push(pathSegmentToCheck);
					break;
				}
			}
		}
	}
	return accessiblePathsSoFar;
};

/**
 *  This takes in the xml cat and adds all the generic quesitons at the end of the tree.
 *  The generic questions are taken from the risk specified by nodeCodeOfSourceRisk (== suic by default)
 *
 */
Utilities.addGenericQuestionsToCatXml = function(catRootNode, nodeCodeOfSourceRisk) {

	var genericHolder = $.parseXML('<node label="' + (GlobalVariables.strings['galassify-utils-12']).toLowerCase() + '" code="genericRootNode-added-by-tool"></node>');

	for (var i = 0; i < catRootNode.childNodes.length; i++) {
		var topLevelRisk = catRootNode.childNodes.item(i);
		if (topLevelRisk.nodeType != 1)
			continue;

		var topLevelRiskCode = topLevelRisk.getAttribute("code");
		for (var j = 0; j < topLevelRisk.childNodes.length; j++) {
			var topLevelChildRisk = topLevelRisk.childNodes.item(j);
			if (topLevelChildRisk.nodeType != 1)
				continue;

			//var topLevelChildRiskCode = topLevelChildRisk.getAttribute("code");
			var topLevelChildRiskGeneric = topLevelChildRisk.getAttribute("generic-type");

			if (topLevelRiskCode == 'suic' && topLevelChildRiskGeneric == 'gd') {
				//Utilities.markThisAndAllSubNodesAsGeneric(topLevelChildRisk);
				//console.log(topLevelChildRiskCode);
				$(genericHolder).children(0).append($(topLevelChildRisk).clone());
			}

		}
		//console.log(topLevelRisk.getAttribute("code"));
	}

	$(catRootNode).append($(genericHolder).children(0));
	console.log("generic questions added to main CAT xml");
};

Utilities.createRiskSelectionObject = function(catRootNode, riskSelectionInputString) {
	var topLevelRisks = new Array();
	//var selectedRisksInput = riskSelectionInputString;

	//if(riskSelectionInputString == 'all')
	if (riskSelectionInputString == null) {
		console.log("Risk Selection attribute is NULL!!!");
	}
	for (var i = 0; i < catRootNode.childNodes.length; i++) {
		var topLevelRisk = catRootNode.childNodes.item(i);
		if (topLevelRisk.nodeType != 1)
			continue;
		var topLevelRiskCode = topLevelRisk.getAttribute("code");
		if (topLevelRiskCode == 'genericRootNode-added-by-tool')
			continue;
		var topLevelRiskLabel = topLevelRisk.getAttribute("label");

		var isSelected = true;
		if (riskSelectionInputString == null)
			isSelected = true;
		else if (riskSelectionInputString == 'all')
			isSelected = true;
		else if (riskSelectionInputString == 'none')
			isSelected = false;
		else {
			if ($.inArray(topLevelRiskCode, riskSelectionInputString.split(' ')) == -1)
				isSelected = false;
			else
				isSelected = true;

		}

		topLevelRisks.push({
			code : topLevelRiskCode,
			label : topLevelRiskLabel,
			selected : isSelected
		});
	}
	var obj = new Object();
	obj.riskSelectionArray = topLevelRisks;
	obj.getAllRisks = function() {
		var risks = new Array();
		for (var i = 0; i < topLevelRisks.length; i++) {
			risks.push(topLevelRisks[i].code);
		}
		return risks;
	};
	obj.getSelected = function() {
		var selectedArray = new Array();
		for (var i = 0; i < topLevelRisks.length; i++) {
			if (topLevelRisks[i].selected)
				selectedArray.push(topLevelRisks[i].code);
		}
		return selectedArray;
	};
	return obj;
};

Utilities.markSpecificAndGenericNodes = function(catRootNode) {

	for (var i = 0; i < catRootNode.childNodes.length; i++) {
		var topLevelRisk = catRootNode.childNodes.item(i);
		if (topLevelRisk.nodeType != 1)
			continue;
		var topLevelRiskCode = topLevelRisk.getAttribute("code");
		if (topLevelRiskCode == 'genericRootNode-added-by-tool') {
			Utilities.markThisAndAllSubNodesWithAFlag(topLevelRisk, "isGenericRootNodeInserteredByTool", "true");
		} else {
			for (var j = 0; j < topLevelRisk.childNodes.length; j++) {
				var topLevelChildRisk = topLevelRisk.childNodes.item(j);
				if (topLevelChildRisk.nodeType != 1)
					continue;
				//console.log(topLevelChildRisk.getAttribute("code"));
				var topLevelChildRiskCode = topLevelChildRisk.getAttribute("code");
				//var topLevelChildRiskGeneric = topLevelChildRisk.getAttribute("generic-type");

				if (GlobalVariables.riskSpecificNodeList[topLevelRiskCode] == topLevelChildRiskCode)

				/*if((topLevelRiskCode == 'suic' && topLevelChildRiskCode == 'sui-specific')
				 || (topLevelRiskCode == 'sh' && topLevelChildRiskCode == 'sh-specific')
				 || (topLevelRiskCode == 'hto' && topLevelChildRiskCode == 'hto-specific')
				 || (topLevelRiskCode == 'vuln-su' && topLevelChildRiskCode == 'vuln-specific'))*/
				{
					//console.log("#####matched");
					Utilities.markThisAndAllSubNodesWithAFlag(topLevelChildRisk, "isSpecificRisk", "true");
					topLevelRisk.setAttribute("isSpecificRisk", "true");
				}

				/* we do not need to mark out these as we have marked out the top level generic
				 if(topLevelChildRiskGeneric == 'gd') {
				 topLevelRisk.setAttribute("isGeneric", "true");
				 Utilities.markThisAndAllSubNodesWithAFlag(topLevelChildRisk,"isGeneric", "true");
				 }
				 */

			}
		}

		//console.log(topLevelRisk.getAttribute("code"));
	}

};

/**
 * this scans the cat and sets layer questions to yes that have any persistent answers inside them.
 */
Utilities.answerAllLayerQuestionsWithPersistentAnswers = function(catNode) {
	//catNode.setAttribute(flagName, flagValue);
	var anyChildAnswered = false;
	for (var i = 0; i < catNode.childNodes.length; i++) {
		var item = catNode.childNodes.item(i);
		if (item.nodeType != 1)
			continue;
		if (Utilities.answerAllLayerQuestionsWithPersistentAnswers(item) == true)
			anyChildAnswered = true;
	}

	var code = catNode.getAttribute("code");
	if (code != null && code != "") {
		var question = GlobalVariables.qt[code];
		if (question != null) {

			//is it a leaf node?
			if (catNode.childNodes.length == 0) {
				if (question.getAnswer() != null)
					return true;
				else
					return false;
			} else {//this must be a concept node with a question
				if (question.getQuestionType() == 'layer' && anyChildAnswered == true) {
					var answer = question.getAnswer();
					if (answer == null || answer.toLowerCase() != 'yes') {
						//these are closed or unanswered layer questions. if they have any answers inside them, set it to yes
						question.setAnswer('YES');
						console.log('Layer ' + code + ' set to YES becuase it has answers inside.');
					}
				}

				//is this cocept node answered?
				if (question.getAnswer() == null)
					return anyChildAnswered;
				else
					return true;

			}
		}
	}
	//this is for any concept node without a question attached to it.
	return anyChildAnswered;
};

Utilities.markThisAndAllSubNodesWithAFlag = function(catNode, flagName, flagValue) {
	catNode.setAttribute(flagName, flagValue);
	for (var i = 0; i < catNode.childNodes.length; i++) {
		var item = catNode.childNodes.item(i);
		if (item.nodeType != 1)
			continue;
		Utilities.markThisAndAllSubNodesWithAFlag(item, flagName, flagValue);
	}
};

Utilities.markRapidRepeatAndIntermAndScreeninginNodes = function(catNode) {
	if (catNode.hasChildNodes()) {
		var anyRapidRepeat = false;
		var anyInterim = false;
		var anyScreening = false;
		var anyWellBeing = false;
		var anySilverPadLockOnly = false;
		var anyGoldPadLockOnly = false;
		for (var i = 0; i < catNode.childNodes.length; i++) {
			var item = catNode.childNodes.item(i);
			if (item.nodeType != 1)
				continue;
			//console.log(item);
			//item.setAttribute("riskJudgementFlag", "true");
			var result = Utilities.markRapidRepeatAndIntermAndScreeninginNodes(item);
			if (result.isInterim == true)
				anyInterim = true;
			if (result.isRapidRepeat == true)
				anyRapidRepeat = true;
			if (result.isScreening == true)
				anyScreening = true;
			if (result.isWellBeing == true)
				anyWellBeing = true;
			if (result.isSilverPadLockOnly == true)
				anySilverPadLockOnly = true;
			if (result.isGoldPadLockOnly == true)
				anyGoldPadLockOnly = true;

		}

		if (anyRapidRepeat == true)
			catNode.setAttribute("showInRapidRepeat", "true");
		else
			catNode.removeAttribute('showInRapidRepeat');

		if (anyInterim == true)
			catNode.setAttribute("showInterim", "true");
		else
			catNode.removeAttribute('showInterim');

		if (anySilverPadLockOnly == true)
			catNode.setAttribute("showInSilverOnly", "true");
		else
			catNode.removeAttribute('showInSilverOnly');

		if (anyGoldPadLockOnly == true)
			catNode.setAttribute("showInGoldOnly", "true");
		else
			catNode.removeAttribute('showInGoldOnly');

		if (anyWellBeing == true)
			catNode.setAttribute("showInWellBeing", "true");
		else
			catNode.removeAttribute('showInWellBeing');

		//concept node can be screening too!
		if (catNode.getAttribute("screening") != null) {
			var screeningValue = catNode.getAttribute("screening");
			var isSpecific = catNode.getAttribute("isSpecificRisk");
			var isGenericInsertedByTool = catNode.getAttribute("isGenericRootNodeInserteredByTool");
			if (isNaN(screeningValue) == false && (isSpecific == "true" || isGenericInsertedByTool == "true"))//BAD: if(parseInt(screeningValue) != NaN)
				anyScreening = true;
		}
		if (anyScreening == true) {
			catNode.setAttribute("showInScreeningTree", "true");
		} else
			catNode.removeAttribute('showInScreeningTree');

		return {
			isInterim : anyInterim,
			isRapidRepeat : anyRapidRepeat,
			isScreening : anyScreening,
			isWellBeing : anyWellBeing,
			isSilverPadLockOnly : anySilverPadLockOnly,
			isGoldPadLockOnly : anyGoldPadLockOnly
		};
	} else {//for leaf nodes
		if (catNode.attributes.length > 0) {
			var code = catNode.getAttribute("code");
			if (code != null && code != "") {
				var question = GlobalVariables.qt[code];
				if (question != null) {
					var isRapidRepeat = Utilities._isQuestionDisplayableBeacuseOfMindMapModeRestrictions(question, GlobalVariables.MindMapModes.RAPID_REPEAT);
					var isInterim = Utilities._isQuestionDisplayableBeacuseOfMindMapModeRestrictions(question, GlobalVariables.MindMapModes.INTERIM);
					var isSilverPadLockOnly = Utilities._isQuestionDisplayableBeacuseOfMindMapModeRestrictions(question, GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK);
					var isGoldPadLockOnly = Utilities._isQuestionDisplayableBeacuseOfMindMapModeRestrictions(question, GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK);

					var isWellBeing = (catNode.getAttribute("wellbeing") == null) ? false : true;

					//lets check for screening nodes
					var isScreening = false;
					if (catNode.getAttribute("screening") != null) {
						var screeningValue = catNode.getAttribute("screening");
						var isSpecific = catNode.getAttribute("isSpecificRisk");
						var isGenericInsertedByTool = catNode.getAttribute("isGenericRootNodeInserteredByTool");
						if (isNaN(screeningValue) == false && (isSpecific == "true" || isGenericInsertedByTool == "true"))//BAD: if(parseInt(screeningValue) != NaN)
							isScreening = true;
					}

					if (isRapidRepeat == true)
						catNode.setAttribute("showInRapidRepeat", "true");
					else
						catNode.removeAttribute('showInRapidRepeat');

					if (isInterim == true)
						catNode.setAttribute("showInterim", "true");
					else
						catNode.removeAttribute('showInterim');

					if (isSilverPadLockOnly == true)
						catNode.setAttribute("showInSilverOnly", "true");
					else
						catNode.removeAttribute('showInSilverOnly');

					if (isGoldPadLockOnly == true)
						catNode.setAttribute("showInGoldOnly", "true");
					else
						catNode.removeAttribute('showInGoldOnly');

					if (isScreening == true) {
						catNode.setAttribute("showInScreeningTree", "true");
					} else
						catNode.removeAttribute('showInScreeningTree');

					if (isWellBeing == true) {
						catNode.setAttribute("showInWellBeing", "true");
						//console.log('found! '+code)
					} else
						catNode.removeAttribute('showInWellBeing');

					return {
						isInterim : isInterim,
						isRapidRepeat : isRapidRepeat,
						isScreening : isScreening,
						isWellBeing : isWellBeing,
						isSilverPadLockOnly : isSilverPadLockOnly,
						isGoldPadLockOnly : isGoldPadLockOnly
					};
				}
			}
		}
		return {
			isInterim : false,
			isRapidRepeat : false,
			isScreening : false,
			isWellBeing : false,
			isSilverPadLockOnly : false,
			isGoldPadLockOnly : false
		};
	}
};

/**
 * this includes the node passed as param
 */
Utilities.hasAnyAnswer = function(catNode) {
	//console.log(catNode);
	var code = catNode.getAttribute("code");
	if (code != null && code != "") {
		question = GlobalVariables.qt[code];
		if ((question != null) && (question.getAnswer() != null && question.getAnswer() != '')) {
			//console.log("has answer at code="+code);
			//console.log(question.getAnswer());
			return true;
		}
	}

	if (catNode.hasChildNodes()) {
		for (var i = 0; i < catNode.childNodes.length; i++) {
			var child = catNode.childNodes.item(i);

			if (child.nodeType != 1)//only want element nodes
				continue;

			if (Utilities.hasAnyAnswer(child) == true)
				return true;
		}
		return false;
	} else {
		return false;
		//
	}
};

/**
 * checks if we need to warn the user asking them to provide a risk judement,
 * see spec for details
 * INPUT:
 * expects an object of this form:

 GlobalVariables.riskAssessmentWarningData = new Array();
 GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,suic,sui-specific", riskJudgementPath:"mental-health-risk,suic"});
 GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,sh,sh-specific", riskJudgementPath:"mental-health-risk,sh"});
 GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,hto,hto-specific", riskJudgementPath:"mental-health-risk,hto"});
 GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,risk-dep,dependents-specific", riskJudgementPath:"mental-health-risk,risk-dep"});

 * RETURN:
 */
Utilities.generateRiskJudementWarning = function(riskAssessmentWarningData) {

	var jsCat = GlobalVariables.jsCat;
	Utilities.pruneJsCATforRiskSelection(jsCat, GlobalVariables.riskSelectionObject.getSelected());
	var previousJudementPresentButCurrentMissing = new Array();
	var riskSpecificDataPresentButNoCurrentJudgement = new Array();

	for (var i = 0; i < riskAssessmentWarningData.length; i++) {

		var data = riskAssessmentWarningData[i];

		var riskJudgementPath = data.riskJudgementPath;
		var riskJudgementNode = Utilities.findCatjsNode(riskJudgementPath.split(","), jsCat);
		var riskJudgementXMLNode = riskJudgementNode.xmlNode;
		var riskJudgementCode = riskJudgementXMLNode.getAttribute("code");
		var riskJudgementLabel = riskJudgementXMLNode.getAttribute("label");
		data.riskJudgementLabel = riskJudgementLabel;
		data.riskJudgementCode = riskJudgementCode;
		var riskJudementQuestion = GlobalVariables.qt[riskJudgementCode];
		if (riskJudementQuestion == null)
			continue;

		//if risk judgement given, then we do not need to do any of this.
		if (riskJudementQuestion.getAnswer() != null)
			continue;

		//so we have no current risk judement
		/*if (riskJudementQuestion.getPreviousAnswer() != null) {
		 previousJudementPresentButCurrentMissing.push(data);
		 } */
		else {
			//we do not have current or previous judgement here
			var codePathSpecificRisk = data.specificNodePath;
			var specificQuestionNode = Utilities.findCatjsNode(codePathSpecificRisk.split(","), jsCat);
			var specificQuestionXMLNode = specificQuestionNode.xmlNode;
			var riskSpecificQuestionsAnswered = Utilities.hasAnyAnswer(specificQuestionXMLNode);

			if (riskSpecificQuestionsAnswered == true) {
				riskSpecificDataPresentButNoCurrentJudgement.push(data);
			}

		}
	}//end of for

	//console.log(previousJudementPresentButCurrentMissing);

	return {
		previousJudementPresentButCurrentMissing : previousJudementPresentButCurrentMissing,
		riskSpecificDataPresentButNoCurrentJudgement : riskSpecificDataPresentButNoCurrentJudgement
	};
};

/**
 *	takes an input like this:
 * text-input="((height 50)(header some header here...))"
 *
 * and returns the height and header in a nice object
 */
Utilities.parseTextInputAttribute = function(inputString) {
	// var relationOperator = 	$.trim(answerConstraintString.substring(2,  answerConstraintString.indexOf("[")));

	//let first find the height

	var searchingFor = "(height ";
	if (inputString.indexOf(searchingFor) != -1) {
		var substring = (inputString.substr(inputString.indexOf(searchingFor) + searchingFor.length));
		var height = $.trim(substring.substr(0, substring.indexOf(")")));
	} else {
		//could not find height in the string
		var height = null;
	}

	var searchingFor = "(header \"";
	if (inputString.indexOf(searchingFor) != -1) {
		var substring = (inputString.substr(inputString.indexOf(searchingFor) + searchingFor.length));
		var header = $.trim(substring.substr(0, substring.indexOf("\")")));
	} else {
		//could not find height in the string
		var header = "";
	}

	return {
		height : height,
		header : header
	};
	//console.log(height);
	//console.log(header);

};

Utilities.parseRiskConsensusRequest = function(xmlTextString) {
	var xmlDoc = $.parseXML(xmlTextString);
	var xml$ = $(xmlDoc);
	var consensusNodes = new Array();
	var assessmentCacheID = xml$.find("verification").attr('assessment-cache-id');
	xml$.find("verification mg-deviations node").each(function() {
		var code = mgSupplied = mgConsensual = mgDeviation = null;
		for (var i = 0; i < this.attributes.length; i++) {
			if (this.attributes.item(i).nodeName.toLowerCase() == 'code')
				code = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName.toLowerCase() == 'mg-supplied')
				mgSupplied = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName.toLowerCase() == 'mg-consensual')
				mgConsensual = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName.toLowerCase() == 'mg-deviation-threshold')
				mgDeviation = this.attributes.item(i).nodeValue;
		}
		var consensusNode = {
			code : code,
			mgSupplied : mgSupplied,
			mgConsensual : mgConsensual,
			mgDeviation : mgDeviation
		};
		consensusNodes.push(consensusNode);
	});
	return {
		assessmentCacheID : assessmentCacheID,
		consensusNodes : consensusNodes
	};
};

/**
 * this function determines which management comments would appear in the drop down box (for copy-pasting mgmt comments for high level nodes)
 * it takes in the code and returns a list of comments relevant to that node code.
 * Algorithm followed is:
 * 		if code is a top level risk eg suicide or self harm
 * 			then:	go in the specific branch of that node(eg sucide specific) and pull in all the management comments underneath (go through recursively)
 * 					avoid all the generic nodes.
 * 		if code is the root node, then pick out mgmt comments from the top level nodes(not recursively) and all the generic ones (recursively)
 *
 */
Utilities.getManagementCommentsForCopyPasteDropDownList = function(code, includePreviousComments) {
	var catRoot = GlobalVariables.cat.documentElement;
	if (code == catRoot.getAttribute("code")) {
		// this is the root node.
		var mgmtComments = new Array();
		var codesVisited = new Array();
		for (var j = 0; j < catRoot.childNodes.length; j++) {
			var child = catRoot.childNodes.item(j);
			if (child.nodeType != 1)//only want element nodes
				continue;

			var code = child.getAttribute("code");
			var question = GlobalVariables.qt[code];
			if (question != null) {
				var lable = child.getAttribute("label");
				var mgmtComment = question.getManagementComment();
				var prevMgmtComment = question.getPreviousManagementComment();
				if (includePreviousComments != true)
					prevMgmtComment = null;
				if (((mgmtComment != null && mgmtComment != '') || (prevMgmtComment != null && prevMgmtComment != '')) && $.inArray(code, codesVisited) == -1) {
					mgmtComments.push({
						code : code,
						lable : lable,
						mgmtComment : mgmtComment,
						xmlNode : child
					});
					codesVisited.push(code);
				}
			}
		}
		Utilities.getManagementCommentsForCopyPasteDropDownList_riskSpecificORGeneric(catRoot, mgmtComments, codesVisited, 'isGenericRootNodeInserteredByTool', includePreviousComments);

	} else {
		var catNodeForThisRisk;
		for (var j = 0; j < catRoot.childNodes.length; j++) {
			var child = catRoot.childNodes.item(j);
			if (child.nodeType != 1)//only want element nodes
				continue;
			if (child.getAttribute("code") == code) {
				catNodeForThisRisk = child;
				break;
			}
		}
		var mgmtComments = new Array();
		var codesVisited = new Array();
		Utilities.getManagementCommentsForCopyPasteDropDownList_riskSpecificORGeneric(catNodeForThisRisk, mgmtComments, codesVisited, 'isSpecificRisk', includePreviousComments);
	}
	return mgmtComments;
};

Utilities.getManagementCommentsForCopyPasteDropDownList_riskSpecificORGeneric = function(node, mgmtComments, codesVisited, attributeToAssert, includePreviousComments) {
	for (var j = 0; j < node.childNodes.length; j++) {
		var child = node.childNodes.item(j);
		if (child.nodeType != 1)//only want element nodes
			continue;
		if (child.getAttribute(attributeToAssert) != 'true')
			continue;

		var code = child.getAttribute("code");
		var question = GlobalVariables.qt[code];
		if (question != null) {
			//have we seen this node before
			var lable = child.getAttribute("label");
			var mgmtComment = question.getManagementComment();
			var prevMgmtComment = question.getPreviousManagementComment();
			if (includePreviousComments != true)
				prevMgmtComment = null;
			if (((mgmtComment != null && mgmtComment != '') || (prevMgmtComment != null && prevMgmtComment != '')) && $.inArray(code, codesVisited) == -1) {
				mgmtComments.push({
					code : code,
					lable : lable,
					mgmtComment : mgmtComment,
					xmlNode : child
				});
				codesVisited.push(code);
			}
		}

		Utilities.getManagementCommentsForCopyPasteDropDownList_riskSpecificORGeneric(child, mgmtComments, codesVisited, attributeToAssert, includePreviousComments);
	}

};

Utilities.getHighMgNodes = function(catRoot, qt, mgThreshold) {
	var nodesTriggered = Array();
	var codesVisited = new Array();
	Utilities._traverseCATlookingForHighMg(catRoot, qt, nodesTriggered, codesVisited, mgThreshold);
	//console.log(actionsTriggered);
	return nodesTriggered;
};
Utilities._traverseCATlookingForHighMg = function(node, qt, nodesTriggered, codesVisited, mgThreshold) {
	//console.log(node);
	var isClosedFilter = false;
	var isDemographicNode = false;
	if (node.attributes.length > 0) {
		var code = node.getAttribute("code");
		if (code == 'gen-demog')
			isDemographicNode = true;
		else {
			if ((code != null) && ( code in qt)) {
				//console.log("checking "+code);
				var question = qt[code];
				var answer = question.getAnswer();
				var qType = question.getQuestionType();
				if (qType == 'filter-q' && (answer == null || answer.toLowerCase() != 'yes'))
					isClosedFilter = true;
			}

			//lets check for triggers
			var mg = (node.getAttribute("mg"));
			if (mg != null && node.hasChildNodes() == false) {// we only want leaf nodes
				mg = parseFloat(mg);
				if (mg >= mgThreshold && $.inArray(code, codesVisited) == -1) {
					codesVisited.push(code);
					nodesTriggered.push(node);
					//console.log("we got high MG for "+code);
				}
			}
		}

	}

	if (isClosedFilter == false && isDemographicNode == false) {
		for (var i = 0; i < node.childNodes.length; i++) {

			var childNode = node.childNodes[i];
			if (childNode.nodeType != 1)//only want element nodes
				continue;
			Utilities._traverseCATlookingForHighMg(node.childNodes[i], qt, nodesTriggered, codesVisited, mgThreshold);
		}
	}
};

Utilities.createPopOverOptions = function(title, contents, settings) {

	//var checkBoxStuff = '<br/><br/><div><input type="checkbox" id="showpopover-for-buttons" value="true" checked />Show help for buttons </div>';
	var def = {
		title : title,
		content : '<div class="popover-content">' + contents + '</div>',
		trigger : 'hover',
		width : 400,
		delay : {
			show : 1500,
			hide : null
		},
		showCheck : Utilities.showButtonPopover,
		multi : true
	};
	if (settings != null)
		$.extend(def, settings);
	return def;
};

Utilities.showButtonPopover = function() {
	return GlobalVariables.showButtonPopover;
};

/**
 * Takes in an xml file and a PLP(population language pack)
 * overrides all xml info with corresponding entries from plp
 */
Utilities.overwriteXMLwithPLP = function(xmlInput, plp) {

	var plp$ = $(plp);
	plp$.find("language-pack nodes node").each(function() {

		Utilities._crawlXMLrecursivelyToReplaceAttributes(xmlInput, this);

		/*
		 for (var i=0; i<this.attributes.length; i++) {
		 if(this.attributes.item(i).nodeName.toLowerCase() == 'code')
		 code = this.attributes.item(i).nodeValue;
		 }
		 */

	});

	/*
	 * 	xml$.find("verification mg-deviations node").each(function() {
	 var code = mgSupplied = mgConsensual = mgDeviation = null;
	 for (var i=0; i<this.attributes.length; i++) {
	 if(this.attributes.item(i).nodeName.toLowerCase() == 'code')
	 code = this.attributes.item(i).nodeValue;
	 else if(this.attributes.item(i).nodeName.toLowerCase() == 'mg-supplied')
	 mgSupplied = this.attributes.item(i).nodeValue;
	 else if(this.attributes.item(i).nodeName.toLowerCase() == 'mg-consensual')
	 mgConsensual = this.attributes.item(i).nodeValue;
	 else if(this.attributes.item(i).nodeName.toLowerCase() == 'mg-deviation-threshold')
	 mgDeviation = this.attributes.item(i).nodeValue;
	 }
	 var consensusNode = {code:code, mgSupplied:mgSupplied, mgConsensual:mgConsensual, mgDeviation:mgDeviation};
	 consensusNodes.push(consensusNode);
	 });
	 */
};

Utilities._crawlXMLrecursivelyToReplaceAttributes = function(xmlNode, plcNode) {

	//replace nodes
	var code = xmlNode.getAttribute("code");
	if (code != null && code == plcNode.getAttribute("code")) {
		// this is match! replace attributes
		for (var i = 0; i < plcNode.attributes.length; i++) {
			if (plcNode.attributes.item(i).nodeName.toLowerCase() == 'code')
				continue;
			if (xmlNode.getAttribute(plcNode.attributes.item(i).nodeName) != null) {
				//console.log("we found a match for plc code="+plcNode.getAttribute("code")+" cat code="+code);
				xmlNode.setAttribute(plcNode.attributes.item(i).nodeName, plcNode.attributes.item(i).nodeValue);
			}
		}
	}

	//recusrsion
	for (var i = 0; i < xmlNode.childNodes.length; i++) {
		var childNode = xmlNode.childNodes[i];
		if (childNode.nodeType != 1)//only want element nodes
			continue;
		Utilities._crawlXMLrecursivelyToReplaceAttributes(xmlNode.childNodes[i], plcNode);
	}
};

Utilities.overwriteAppStringsWithPLP = function(appStringsObj, plp) {
	var plp$ = $(plp);
	plp$.find("language-pack ui elements element").each(function() {

		var id = this.getAttribute("id");
		var text = this.getAttribute("text");

		if (id == null)
			return;
		var stringItem = appStringsObj[id];
		//console.log(stringItem);
		if (stringItem != undefined) {
			appStringsObj[id] = text;
		}
	});
	console.log(appStringsObj);
};

Utilities.getParsedQTFromXML = function(xml) {
	var questions = new Array();
	$(xml).find("node").each(function() {

		/* THE following code does not work in fucking IE. so had to use a workaround.
		 var questionNode = $(this);
		 var code = questionNode.attr("code");
		 var qText = questionNode.attr("question");
		 var qType = questionNode.attr("values");
		 */

		var code = qText = qType = help = persistent = autoAnswer = answerConstraint = scaleType = null;
		for (var i = 0; i < this.attributes.length; i++) {
			if (this.attributes.item(i).nodeName == 'code')
				code = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'question')
				qText = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'values')
				qType = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'help')
				help = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'persistent')
				persistent = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'auto-answer')
				autoAnswer = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'answer-constraint')
				answerConstraint = this.attributes.item(i).nodeValue;
			else if (this.attributes.item(i).nodeName == 'scale-type')
				scaleType = this.attributes.item(i).nodeValue;

		}

		if (code != undefined && qText != undefined && qType != undefined) {
			var question = new Question(code, qText, qType);
			question.setHelp(help);
			question.setPersistent(persistent);
			if (autoAnswer != null)
				question.setAutoAnswer(Utilities.parseAutoAnswer(autoAnswer));

			if (answerConstraint != null)
				question.setAnswerConstraint(Utilities.parseAnswerConstraint(answerConstraint));

			if (scaleType != null)
				question.setScaleType(scaleType);

			questions[code] = question;
		}

	});

	return questions;
};

Utilities.getScreeningJson = function(xmlRoot) {
	var screeningJson;

	var actualRootNode = null;
	//xml root has a wrapper node <xml>  [why!!]
	for (var i = 0; i < xmlRoot.childNodes.length; i++) {
		var childNode = xmlRoot.childNodes[i];
		if (childNode.nodeType != 1)//only want element nodes
			continue;
		if (childNode.nodeName.indexOf('_answer') != -1) {
			actualRootNode = childNode;
			break;
		}
	}

	if (actualRootNode != null)
		screeningJson = Utilities._buildScreeningTreeRecursively(actualRootNode, "");
	else {
		screeningJson = null;
		console.log("ERROR: could not parse screening xml");
	}
	return screeningJson;

};
Utilities._buildScreeningTreeRecursively = function(xmlNode, pathSoFar) {
	var nodeCode = xmlNode.nodeName.substring(0, xmlNode.nodeName.indexOf('_answer'));
	nodeCode = nodeCode.replaceAll("_", "-");
	var screeningNode = {};
	screeningNode.code = nodeCode;
	if (pathSoFar == "")
		screeningNode.path = nodeCode;
	else
		screeningNode.path = pathSoFar + "#" + nodeCode;
	//console.log(nodeCode);
	for (var i = 0; i < xmlNode.childNodes.length; i++) {
		var childNode = xmlNode.childNodes[i];
		if (childNode.nodeType != 1)//only want element nodes
			continue;
		// there should be a yes and a no node.
		if (childNode.nodeName.toLowerCase() == 'yes' || childNode.nodeName.toLowerCase() == 'no') {
			// yes or no would normally only have one child node. but iterate through for more robustness
			for (var j = 0; j < childNode.childNodes.length; j++) {
				var yesNoChild = childNode.childNodes[j];
				if (yesNoChild.nodeType != 1)//only want element nodes
					continue;
				if (yesNoChild.nodeName.indexOf('_answer') != -1) {
					//we have found the node we want.
					if (childNode.nodeName.toLowerCase() == 'yes')
						screeningNode.yes = Utilities._buildScreeningTreeRecursively(yesNoChild, screeningNode.path);
					else
						screeningNode.no = Utilities._buildScreeningTreeRecursively(yesNoChild, screeningNode.path);
					break;
				}
			}
		}
	}
	return screeningNode;
};

Utilities.getPoleTextForScaleQuestion = function(question) {
	if (question.getScaleType() != null) {
		var scaleTypeText = question.getScaleType();

		var left = scaleTypeText.match(/left "(.*?)"\)/);
		// regex is magic!

		left = left[1];
		if (left == undefined) {
			console.error("ERROR: can not parse 'left' value for scaleType for quesiton " + question.getCode());
		}

		var right = scaleTypeText.match(/right "(.*?)"\)/);
		right = right[1];
		if (right == undefined) {
			console.error("ERROR: can not parse 'right' value for scaleType for quesiton " + question.getCode());
		}
		var scaleTypeLabel = "0 = " + left + ", 10 = " + right;
		return scaleTypeLabel;
	} else
		return null;
};

Utilities.getMostRecentPreviousManagementComment = function(question) {
	var comment = question.getPreviousManagementComment();
	if (comment == null || comment == "")
		return null;
	var divider = "==========";
	var firstDivider = comment.indexOf(divider);
	if (firstDivider == -1)
		return comment;
	var tempStr = comment.substring(firstDivider + divider.length);
	var secondDivider = tempStr.indexOf(divider);
	if (secondDivider != -1)
		return $.trim(tempStr.substring(0, secondDivider - divider.length - 1));
	else
		return $.trim(tempStr);

};

Utilities.mergePersonalisedActionsObjectWithActionObject = function(actionsObj, personalisedActionsObj) {
	if (personalisedActionsObj.galassify_action_open_url_templates_overrides != null) {
		for (var i = 0; i < personalisedActionsObj.galassify_action_open_url_templates_overrides.length; i++) {
			for (var j = 0; j < actionsObj.template.galassify_action_open_url_templates.length; j++) {
				if (actionsObj.template.galassify_action_open_url_templates[j].id == personalisedActionsObj.galassify_action_open_url_templates_overrides[i].template_id) {
					actionsObj.template.galassify_action_open_url_templates[j].override = personalisedActionsObj.galassify_action_open_url_templates_overrides[i];
					break;
				}

			}
		}
	}

	if (personalisedActionsObj.galassify_action_send_email_templates_overrides != null) {
		console.log("ERROR ### email template overrides found! Merge them in main actions object!!");

	}

};

Utilities.getActionUrlTemplateById = function(id, actionsObj) {
	for (var j = 0; j < actionsObj.template.galassify_action_open_url_templates.length; j++) {
		if (actionsObj.template.galassify_action_open_url_templates[j].id == id)
			return actionsObj.template.galassify_action_open_url_templates[j];
	}
	return null;
};

Utilities.getNonEmptyActionPersonalisations = function(personalisedActionsObj) {
	var urlPersonalisations = personalisedActionsObj.galassify_action_open_url_templates_overrides;
	var nonEmptyPersonalisedActionsObj = {};
	nonEmptyPersonalisedActionsObj.galassify_action_open_url_templates_overrides = Array();
	
	for (var i = 0; i < urlPersonalisations.length; i++) {
		if(urlPersonalisations[i].text != "" || urlPersonalisations[i].url != "") {
			nonEmptyPersonalisedActionsObj.galassify_action_open_url_templates_overrides.push(urlPersonalisations[i]);
		}
		
	}
	return nonEmptyPersonalisedActionsObj;

};
