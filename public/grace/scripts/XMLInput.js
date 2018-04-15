function XMLInput() {
};

XMLInput.getScreeningXml = function(url) {
	var screening;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			screening = xml;
		},
		error : function() {
			alert('Error occured while downloading screening xml');
		}
	});
	return screening;
};

XMLInput.getAppStrings = function(url) {
	var appString;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "script",
		success : function(script) {
			appString = getAppStrings();
		},
		error : function() {
			alert('Error occured while downloading CAT');
		}
	});
	return appString;
};

XMLInput.getCat = function(url) {
	var cat;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			cat = xml;
		},
		error : function() {
			alert('Error occured while downloading CAT');
		}
	});
	return cat;
};

XMLInput.getPLP = function(url) {
	var plp;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			plp = xml;
		},
		error : function() {
			alert('Error occured while downloading PLP');
		}
	});
	return plp;
};

XMLInput.getActions = function(url) {
	$.ajax({
		type : "GET",
		async : true,
		cache : false,
		url : url,
		dataType : "json",
		data : {
			patientid : GlobalVariables.patientId,
			SID : GlobalVariables.sid
		},
		success : function(data) {
			GlobalVariables.actionsData = data;
			console.log("action data received and saved in globalVariables");
			Utilities.mergePersonalisedActionsObjectWithActionObject(data, GlobalVariables.personalisedActionsData);

		},
		error : function() {
			alert('Error occured while downloading Actions data.');
		}
	});
};

XMLInput.getMindMapText = function(url) {
	var htmlString;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			htmlString = '<map id="fm_imagemap" name="fm_imagemap">';
			$(xml).find("area").each(function() {
				//console.log(this.attributes);

				/* THE following code does not work in fucking IE. so had to use a workaround.
				 var questionNode = $(this);
				 var code = questionNode.attr("code");
				 var qText = questionNode.attr("question");
				 var qType = questionNode.attr("values");
				 */

				var shape = coords = codePath = null;
				var showRiskIcon = false;
				var showProgressIcon = false;

				for (var i = 0; i < this.attributes.length; i++) {
					if (this.attributes.item(i).nodeName.toLowerCase() == 'shape')
						shape = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName.toLowerCase() == 'coords')
						coords = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName.toLowerCase() == 'code-path' && this.attributes.item(i).nodeValue != '')
						codePath = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName.toLowerCase() == 'showriskicon')
						showRiskIcon = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName.toLowerCase() == 'showprogressicon')
						showProgressIcon = this.attributes.item(i).nodeValue;

				}

				if (shape != undefined && coords != null && codePath != undefined) {
					//had to add href="javascript:void(0);" to make these appear as links in IE so that mouse pointer changes on mouseover.  http://stackoverflow.com/questions/6589768/cursor-not-changing-to-pointer-in-usemap-area-case
					htmlString += '<area href="javascript:void(0);" shape="' + shape + '" coords="' + coords + '" code-path="' + codePath + '" showRiskIcon="' + showRiskIcon + '" ' + ' showProgressIcon="' + showProgressIcon + '" ';
					
					// this adds hover info for the root node in clinical version
					if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON && codePath != null && codePath == 'mental-health-risk')
						htmlString += ' title="'+GlobalVariables.strings['galassify-mindmapLayout-msg-4']+'" ';
					htmlString += ' />';
				}

			});
			htmlString += '</map>';
		},
		error : function() {
			console.error('Error occured while downloading mindmap text');
			alert('Error occured while downloading mindmap text');
		}
	});
	return htmlString;
};

XMLInput.getRiskSpecificNodeList = function(url) {
	var riskSpecificNodeList = Array();
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			var population = placeholder = defaultPlaceholder = null;
			$(xml).find("mapping").each(function() {
				var topLevelNodeCode = specificNodeCode = null;
				for (var i = 0; i < this.attributes.length; i++) {
					if (this.attributes.item(i).nodeName == 'topLevelNodeCode')
						topLevelNodeCode = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'specificNodeCode')
						specificNodeCode = this.attributes.item(i).nodeValue;

				}

				if (topLevelNodeCode != null && specificNodeCode != null) {
					riskSpecificNodeList[topLevelNodeCode] = specificNodeCode;
				}
			});
		},
		error : function() {
			console.error('Error occured while downloading configuration xml file');
			alert('Error occured while downloading configuration xml file');
		}
	});
	return riskSpecificNodeList;
};
/**
 * takes in a config xml and returns a string specified to the given population in the xml file
 * used to determine which mindmap and help files to use based on population
 */
XMLInput.getFolderLocationFromXMLconfig = function(url, requestedPopulation) {
	var mindmapLocation;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			var population = placeholder = defaultPlaceholder = null;
			$(xml).find("mapping").each(function() {
				var population = placeholder = null;
				for (var i = 0; i < this.attributes.length; i++) {
					if (this.attributes.item(i).nodeName == 'population')
						population = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'location')
						placeholder = this.attributes.item(i).nodeValue;
				}
				//console.log(population);
				if (population == 'default')
					defaultPlaceholder = placeholder;

				if (requestedPopulation == population) {
					mindmapLocation = placeholder;
				}

			});

			if (mindmapLocation == null) {// could not find any match
				mindmapLocation = defaultPlaceholder;
				console.error("No population matched in the configuration xml file. Using default. requested Population=" + requestedPopulation);
			}
		},
		error : function() {
			console.error('Error occured while downloading configuration xml file');
			alert('Error occured while downloading configuration xml file');
		}
	});
	return mindmapLocation;
};

XMLInput.getQT = function(url) {
	var qt;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : url,
		dataType : "xml",
		success : function(xml) {
			qt = xml;
		},
		error : function() {
			alert('Error occured while downloading QT');
		}
	});
	return qt;
};

XMLInput.mergeATwithQT = function(atUrl, questionsArray) {
	console.log("Getting AT from url: " + atUrl);
	var at;
	$.ajax({
		type : "GET",
		async : false,
		cache : false,
		url : atUrl,
		dataType : "xml",
		success : function(xml) {
			at = xml;
			$(xml).find("node").each(function() {
				//console.log(this.attributes);
				var answerNode = $(this);
				var code = null;
				var answer = null;
				var pAnswer = null;
				var comment = null;
				var management = null;
				var overallComment = null;
				var overallRiskFormulation = null;
				var overallManagement = null;
				var assessmentRisks = null;
				var previousAssessmentDate = null;
				var triggeredActions = null;
				var personalisedActions = null;
				for (var i = 0; i < this.attributes.length; i++) {
					if (this.attributes.item(i).nodeName == 'code')
						code = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'answer')
						answer = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'answer-previous')
						pAnswer = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'comment')
						comment = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'management')
						management = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'assessment-comment')
						overallComment = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'overall-formulation')
						overallRiskFormulation = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'overall-management')
						overallManagement = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'assessment-risks')
						assessmentRisks = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 'previous-assessment-date')
						previousAssessmentDate = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 's_actions-triggered')
						triggeredActions = this.attributes.item(i).nodeValue;
					else if (this.attributes.item(i).nodeName == 's_actions-personalisations')
						personalisedActions = this.attributes.item(i).nodeValue;
				}

				if (code != null && code in questionsArray) {

					if (answer != null)
						questionsArray[code].setAnswer(answer);
					//TODO: is this necessary... do we really need this for all types of questions? or just filter and layer

					if (pAnswer != null)
						questionsArray[code].setPreviousAnswer(pAnswer);

					if (comment != null) {
						var parsedCommets = XMLInput._parseComment(comment, GlobalVariables.serverLaunchType);
						questionsArray[code].setComment(parsedCommets.newComment);
						questionsArray[code].setPreviousComment(parsedCommets.previousComment);
					}

					if (management != null) {
						var parsedManagementCommets = XMLInput._parseComment(management, GlobalVariables.serverLaunchType);
						questionsArray[code].setManagementComment(parsedManagementCommets.newComment);
						questionsArray[code].setPreviousManagementComment(parsedManagementCommets.previousComment);
					}
				} else {
					//these have a code but they are not in QT
					if (comment != null) {
						GlobalVariables.textInputData[code] = comment;
					}
				}

				if (overallComment != null) {
					GlobalVariables.overallRiskComment = overallComment;
				}
				if (overallRiskFormulation != null) {
					var parsedCommetsForm = XMLInput._parseComment(overallRiskFormulation, GlobalVariables.serverLaunchType);
					GlobalVariables.overallRiskFormulationText = parsedCommetsForm.newComment;
					GlobalVariables.overallRiskFormulationTextPrevious = parsedCommetsForm.previousComment;
				}
				if (overallManagement != null) {
					var parsedCommetsOmgmt = XMLInput._parseComment(overallManagement, GlobalVariables.serverLaunchType);
					GlobalVariables.overallManagementPlanText = parsedCommetsOmgmt.newComment;
					GlobalVariables.overallManagementPlanTextPrevious = parsedCommetsOmgmt.previousComment;
				}
				if (assessmentRisks != null) {
					GlobalVariables.riskSelectionInputString = $.trim(assessmentRisks.replace(/[()]/g, ""));
				}

				if (previousAssessmentDate != null && $.trim(previousAssessmentDate) != "") {
					GlobalVariables.prevAssessmentDate = previousAssessmentDate;
					GlobalVariables.showRiskSelection = true;
				}
				
				if(triggeredActions != null && $.trim(triggeredActions) != "") {
					//console.log(triggeredActions);
					    try {
						    GlobalVariables.allActionsTriggered = JSON.parse(triggeredActions);
						} catch(e) {
						    console.log("ERROR: actions triggered json string could not be parsed! Ignoring the string");
						    GlobalVariables.allActionsTriggered = new Array();
						}
					
				}
				if(personalisedActions != null && $.trim(personalisedActions) != "") {
					//console.log(triggeredActions);
					    try {
						    GlobalVariables.personalisedActionsData = JSON.parse(personalisedActions);
						} catch(e) {
						    console.log("ERROR: actions triggered json string could not be parsed! Ignoring the string");
						    GlobalVariables.personalisedActionsData = {galassify_action_open_url_templates_overrides:[]};
						}
					
				}
				

			});
		},
		error : function() {
			console.error('Error occured while downloading AT');
		}
	});
	return at;
};

XMLInput._parseComment = function(commentRaw, assessmentType) {
	//assessmentType = 'resume'
	var prevComment = newComment = null;
	if (assessmentType == 'repeat') {
		prevComment = commentRaw;
	} else if (assessmentType == 'resume' || assessmentType == null) {//null for local launch
		var firstDivider = (commentRaw.indexOf("=========="));
		if (firstDivider == -1) {
			newComment = commentRaw;
		} else {
			newComment = $.trim(commentRaw.substring(0, firstDivider - 11));
			prevComment = $.trim(commentRaw.substring(firstDivider - 11));
		}
	} else if (assessmentType == 'new') {
		//both will be null
	} else {
		console.error("unexpected launch type found! when trying to parse comment");
		newComment = commentRaw;
	}

	if (newComment == "")
		newComment = null;
	if (prevComment == "")
		prevComment = null;
	return {
		newComment : newComment,
		previousComment : prevComment
	};
};

XMLInput.mergeAutoDemographicInfo = function(demogATstring, questionsArray, cat) {

	var demogXML = null;

	try {
		demogXML = $.parseXML(demogATstring);
		var cat$ = $(cat);

		$(demogXML).find("node").each(function() {
			var answerNode = $(this);
			var code = answer = null;
			for (var i = 0; i < this.attributes.length; i++) {
				if (this.attributes.item(i).nodeName == 'code')
					code = $.trim(this.attributes.item(i).nodeValue);
				else if (this.attributes.item(i).nodeName == 'answer')
					answer = $.trim(this.attributes.item(i).nodeValue);
			}
			if (code != null && code in questionsArray && answer != null && answer != "") {
				// the code exists in qt so the node is valid. lets check if answer is valid too.
				code = code.toLowerCase();
				answer = answer.toUpperCase();
				// console.log("checking for "+code+" with answer "+answer);
				var question = GlobalVariables.qt[code];
				var qType = question.getQuestionType();

				var valid = false;

				if (answer == 'DK') {
					valid = true;
				} else {
					if (qType == 'nominal') {
						var valueMgStr = cat$.find('node[code="' + code + '"]').attr("value-mg");
						if (valueMgStr != undefined && valueMgStr != null && valueMgStr != "") {
							var valueMgMap = Utilities.getValueMgMapfromLispString(valueMgStr);
							for (var i = 0; i < valueMgMap.length; i++) {
								if (valueMgMap[i].value == answer) {
									valid = true;
									break;
								}
							}
						}
					} else if (qType.substr(0, 4) == 'date') {
						if ($.isNumeric(answer) && Math.floor(answer) == answer && (answer.length == 8 || answer.length == 6 || answer.length == 4))
							valid = true;
					} else if (qType == 'filter-q' || qType == 'layer') {
						if (answer == "YES" || answer == "NO")
							valid = true;
					} else if (qType == 'scale') {
						if ($.isNumeric(answer) && Math.floor(answer) == answer && parseInt(answer) >= 0 && parseInt(answer) <= 10) {
							valid = true;
						}
					} else if (qType == 'integer' || qType == 'real') {
						if ($.isNumeric(answer))
							valid = true;
					}

				}

				if (valid == true) {
					console.log("auto-demographic merge setting " + code + " = " + answer);
					questionsArray[code].setAnswer(answer);
					questionsArray[code].setDisabled(true);
				}
			}
		});

	} catch(e) {
		// something went wrong... invalid xml
		console.log("ERROR! " + e.message);
	}

};

XMLInput.readHtmlFragments = function(currentPopulationBasedMode) {
	var htmlFragments = {};
	$.ajax({
		type : "GET",
		cache : false,
		async : false,
		url : 'grist/html/html-fragments.html',
		dataType : "html",
		success : function(htmlData) {
			var htmlData$ = $.parseHTML(htmlData);

			htmlFragments.hubPageMsg = $('#hub-page-msg', htmlData$).html();
			if (GlobalVariables.catPopulation == 'friends-supporters')
				htmlFragments.hubPageMsg = $('#hub-page-msg-friends', htmlData$).html();

			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
				/*if(GlobalVariables.catPopulation == 'friends-supporters') {
				htmlFragments.openingPageMsg = $('#opening-page-msg-first-person-friends-supporters', htmlData$).html();
				htmlFragments.supportAndAdviceMsg = $('#support-and-advice-msg-friends-supporters', htmlData$).html();
				}
				else */
				//{
				if (GlobalVariables.catPopulation == 'friends-supporters') {
					htmlFragments.openingPageMsg = $('#opening-page-msg-first-person-friends-carers', htmlData$).html();
					htmlFragments.supportAndAdviceMsg = $('#support-and-advice-msg-friends-supporters', htmlData$).html();
					htmlFragments.riskJudementNotes = $('#risk-jugdement-notes-friends-supporters', htmlData$).html();
				} else {
					htmlFragments.riskJudementNotes = $('#risk-jugdement-notes', htmlData$).html();
					htmlFragments.openingPageMsg = $('#opening-page-msg-first-person-service-user', htmlData$).html();
					htmlFragments.supportAndAdviceMsg = $('#support-and-advice-msg-service-user', htmlData$).html();
				}

				//}

			} else if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
				htmlFragments.openingPageMsg = $('#opening-page-msg-third-person', htmlData$).html();
			} else {
				console.error("This is not have occured! only two possible states");
			}

		},
		error : function() {
			console.error('Error occured while downloading data');
			//$('#dialog-HUB').html("An error occured while downloading the data file. Please close this window and try again.");
		}
	});
	return htmlFragments;

}; 