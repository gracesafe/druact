function XMLOutput() {
}


XMLOutput.writeATbackToServerOrLocalDisk = function(at, successCallback, riskConsensusRequestCallback) {

	if (GlobalVariables.runningFromServer == true) {
		var atOutputUrl = GlobalVariables.serverLaunch.atOutputUrl;
		if (GlobalVariables.serverLaunchType == 'new') {
			if (GlobalVariables.atHasBeenUploadedAtLeastOnce == false)
				atOutputUrl += '&resume=0';
			else
				atOutputUrl += '&resume=1';

		} else if (GlobalVariables.serverLaunchType == 'repeat') {
			if (GlobalVariables.atHasBeenUploadedAtLeastOnce == true)
				atOutputUrl += '&subsequent=1';
		}

		console.log(atOutputUrl);
		var atInString = XMLOutput._xml_to_string(at);
		console.log("trying to write the following to dss:");
		console.log(atInString);
		$.ajax({
			type : "POST",
			cache : false,
			url : atOutputUrl,
			data : {
				at : atInString
			},
			dataType : "text",
			timeout : 5000,
			success : function(text) {
				GlobalVariables.atHasBeenUploadedAtLeastOnce = true;
				//console.log("data returned from dss run: "+text);
				// output text is supposed to be like this: "<p data-assessment-id="661760">all ok</p>"
				var assessmentId = $(text).attr('data-assessment-id');
				$('#savingAnswers').hide(0);
				successCallback(assessmentId);

				//TODO: do some processing of the text returned and determine if we are showing the risk consensus stuff.
				//riskConsensusRequestCallback(atOutputUrl);

			},
			error : function(xhr, status, error) {
				$('#savingAnswers').hide(0);
				if (status === "timeout") {
					alert('The connection timed out while trying to save your answers. Our servers may be busy at the moment. Please try again after few seconds.');
				} else {
					alert('Something went wrong while trying to save answers. Please check your internet connection and try again.');
				}

				//TODO: try sent a copy of the AT somehow so that it can be recovered...
				// or give used a copy of the at and ask them to send it to us.. but this must be the absolute last resort.
			}
		});
	} else {// when running offline
		$('#savingAnswers').hide(0);
		var atInString = XMLOutput._xml_to_string(at);
		console.log(atInString);
	}
};
/**
 * returns false if answer contraints are not satisfied and user wants to change them
 */
XMLOutput.updateAT = function(catRoot, qt, at, status) {
	var nodesThatWouldNeedUpdating = Array();

	XMLOutput._traverseCATlookingForAnswersAndComments(catRoot, qt, nodesThatWouldNeedUpdating);

	var failedAnswerConstraints = XMLOutput.checkAnswerConstraints(nodesThatWouldNeedUpdating, qt);
	if (failedAnswerConstraints.length > 0) {
		
		
		
		var errorMsg = GlobalVariables.strings['galassify-xmlout-1'];
		errorMsg = errorMsg.replace("######", failedAnswerConstraints.length);
		
		for (var i = 0; i < failedAnswerConstraints.length; i++) {
			errorMsg += (i + 1) + ". "+GlobalVariables.strings['galassify-xmlout-2']+" \"" + (qt[failedAnswerConstraints[i].code]).getQuestionText() + "\" \n" + failedAnswerConstraints[i].reason + "\n\n";
		}
		//TODO: replace this with a nice jquery-ui modal dialoge
		errorMsg += "\n\n"+GlobalVariables.strings['galassify-xmlout-3'];
		var response = confirm(errorMsg);
		if (response == true) {
			$('#savingAnswers').hide(0);
			return false;
		}
	}

	//console.log(nodesThatWouldNeedUpdating);
	XMLOutput._updateNodesInAt(at, nodesThatWouldNeedUpdating, status, qt);
	//console.log(at);
	return true;
};
/**
 * goes along the cat, picking up nodes that need to be in the AT
 */
XMLOutput._traverseCATlookingForAnswersAndComments = function(node, qt, nodesThatWouldNeedUpdating) {
	var isClosedFilter = false;
	var code = null;
	if (node.attributes.length > 0) {
		code = node.getAttribute("code");
		if ((code != null) && ( code in qt)) {

			var question = qt[code];
			var answer = question.getAnswer();
			var comment = question.getComment();
			//var previousComment = question.getPreviousComment();
			var managementComment = question.getManagementComment();
			//var previousManagementComment = question.getPreviousManagementComment();
			var qType = question.getQuestionType();
			if (qType == 'filter-q' && (answer == null || answer.toLowerCase() != 'yes'))
				isClosedFilter = true;

			//the following logic will change if we want to have different comments for the same question at different location as specified in the spec.
			if (( code in nodesThatWouldNeedUpdating) == false) {
				//if(answer != null || comment != null || managementComment != null || previousComment != null || previousManagementComment != null) {
				if (answer != null || comment != null || managementComment != null) {
					nodesThatWouldNeedUpdating[code] = question;
				}
			}

			//lets deal with auto-answers
			var autoAnswerArray = question.getAutoAnswer();
			if (autoAnswerArray != null) {
				//console.log("auto answer found in "+code);
				for (var i = 0; i < autoAnswerArray.length; i++) {
					var autoAnswer = autoAnswerArray[i];

					if (autoAnswer.directive == answer) {//check case??
						//console.log("found a match");

						if (autoAnswer.type == 'data') {
							(qt[autoAnswer.code]).setAnswer(autoAnswer.data);
							if ((autoAnswer.code in nodesThatWouldNeedUpdating) == false) {
								nodesThatWouldNeedUpdating[autoAnswer.code] = qt[autoAnswer.code];
							}
						} else if (autoAnswer.type == 'inherit') {

							var codeArray = autoAnswer.path.split(">>");
							var codeSourceNode = $.trim(codeArray[codeArray.length - 1]);

							(qt[autoAnswer.code]).setAnswer((qt[codeSourceNode]).getAnswer());
							if ((autoAnswer.code in nodesThatWouldNeedUpdating) == false) {
								nodesThatWouldNeedUpdating[autoAnswer.code] = qt[autoAnswer.code];
							}
						} else
							console.error("unknown auto-answer type: " + autoAnswer.type);
					} else {
						continue;
					}
				}

			}

		}

	}

	var restrictedByRiskSelection = false;
	var isTopLevelRiskNode = false;
	if (node.parentNode != null && node.parentNode.parentNode != null && node.parentNode.parentNode.nodeName == '#document')
		isTopLevelRiskNode = true;

	if (code != null && isTopLevelRiskNode == true) {
		//console.log('checking '+code);
		if ($.inArray(code, GlobalVariables.riskSelectionObject.getAllRisks()) != -1) {
			//we are at top level, now check if this code in the selected risks
			if ($.inArray(code, GlobalVariables.riskSelectionObject.getSelected()) == -1) {
				restrictedByRiskSelection = true;
			}
		}
	}

	if (isClosedFilter == false && restrictedByRiskSelection == false) {
		for (var i = 0; i < node.childNodes.length; i++) {

			var childNode = node.childNodes[i];
			if (childNode.nodeType != 1)//only want element nodes
				continue;
			XMLOutput._traverseCATlookingForAnswersAndComments(node.childNodes[i], qt, nodesThatWouldNeedUpdating);

		}
	} else {
		if (restrictedByRiskSelection == true) {
			console.log("While generating AT, ignoring risk node: " + code);
		}
	}
};

XMLOutput._updateNodesInAt = function(at, nodesThatWouldNeedUpdating, status, qt) {
	var isOverallCommentDealtWith = false;
	// so we know if we need to add a new node or we have modified an existing one
	var isOverallFormulationDealtWith = false;
	var isOverallManagementDealtWith = false;
	var textInputNodesDealWithAlready = new Array();
	var hadAnyScreeningLevelAttribute = false;
	//clear up existing answers without removing any other attributes
	$(at).find("node").each(function() {
		var code = this.getAttribute("code");

		if (this.getAttribute("assessment-screening-level") != null) {
			hadAnyScreeningLevelAttribute = true;
		}

		var comment = null;
		this.removeAttribute('answer');
		this.removeAttribute('management');
		this.removeAttribute('assessment-status');
		this.removeAttribute('date');
		this.removeAttribute('assessment-risks');
		this.removeAttribute('assessment-screening-level');
		this.removeAttribute('s_actions-triggered');
		this.removeAttribute('s_actions-personalisations');

		if ((code != null) && ( code in qt)) {
			this.removeAttribute('comment');
			//because we are using the same attribute name to send text-input comments too. so let check if it is a question, if so it is ok to clear the comment attribute.
		} else {
			comment = this.getAttribute("comment");
		}

		var assessmentComment = this.getAttribute("assessment-comment");

		var overallFormulation = this.getAttribute("overall-formulation");
		var overallManagement = this.getAttribute("overall-management");
		if(this.getAttribute("settings") != null && this.getAttribute("s_language") != null) {
			this.removeAttribute('s_language');
		}
			

		//var textInputComment = this.getAttribute("text-input-comment");

		if ( code in nodesThatWouldNeedUpdating) {
			var question = nodesThatWouldNeedUpdating[code];

			var answer = question.getAnswer();
			comment = question.getComment();
			var previousComment = question.getPreviousComment();
			var managementComment = question.getManagementComment();
			var previousManagementComment = question.getPreviousManagementComment();

			if (answer != null)
				this.setAttribute('answer', answer);
			if (comment != null || previousComment != null) {
				var finalCommentString = XMLOutput._combineCommentsIntoOneString(comment, previousComment, status);

				//console.log('final comment string');
				//console.log(finalCommentString);
				//NOTE: we are normally be replacing new line with &#10; BUT the ampersand sign causes problem as it gets encoded again as &amp;
				// so we are omitting the & here and then putting it back again after converting from xml to string in XMLOutput._xml_to_string()
				finalCommentString = finalCommentString.replace(/[\n\r]/g, '#10;');
				//console.log('after');
				//console.log(finalCommentString);
				this.setAttribute('comment', finalCommentString);
			}
			if (managementComment != null || previousManagementComment != null) {
				var finalMgmtCommentString = XMLOutput._combineCommentsIntoOneString(managementComment, previousManagementComment, status);
				finalMgmtCommentString = finalMgmtCommentString.replace(/[\n\r]/g, '#10;');
				this.setAttribute('management', finalMgmtCommentString);
			}
			delete nodesThatWouldNeedUpdating[code];

		} else {
			// we have to deal with nodes that may have previous comment or previous management. if they are restricted by risk selection,
			// they would not come up in the array  nodesThatWouldNeedUpdating. Hence for such nodes, we need to deal with them separately.
			// lets deal with those nodes that have a previous comment or management.
			var question = qt[code];

			if (question != null && question.getPreviousComment() != null) {
				var finalCommentString = question.getPreviousComment();
				finalCommentString = finalCommentString.replace(/[\n\r]/g, '#10;');
				this.setAttribute('comment', finalCommentString);
			}
			if (question != null && question.getPreviousManagementComment() != null) {
				var finalMgmtCommentString = question.getPreviousManagementComment();
				finalMgmtCommentString = finalMgmtCommentString.replace(/[\n\r]/g, '#10;');
				this.setAttribute('management', finalMgmtCommentString);
			}
		}

		if (comment != null && ( code in qt) != true) {
			//this must be text input comment.
			var textInputCommentStoredData = GlobalVariables.textInputData[code];
			if (textInputCommentStoredData != null && textInputCommentStoredData != '')
				this.setAttribute('comment', textInputCommentStoredData.replace(/[\n\r]/g, '#10;'));
			else {
				this.removeAttribute('comment');
				if (this.attributes.length == 0)//if no other attributes, remove the node
					$(this).remove();
			}
			textInputNodesDealWithAlready.push(code);
			//isOverallManagementDealtWith = true;
		}

		if (assessmentComment != null) {
			if (GlobalVariables.overallRiskComment != null && GlobalVariables.overallRiskComment != '')
				this.setAttribute('assessment-comment', GlobalVariables.overallRiskComment.replace(/[\n\r]/g, '#10;'));
			else {
				this.removeAttribute('assessment-comment');
				if (this.attributes.length == 0)//if no other attributes, remove the node
					$(this).remove();
				//this.setAttribute('assessment-comment', ""); we don't want empty comments
			}
			isOverallCommentDealtWith = true;
		}

		if (overallFormulation != null) {
			if (GlobalVariables.overallRiskFormulationText != null || GlobalVariables.overallRiskFormulationTextPrevious != null) {
				var finaloverallCommentString = XMLOutput._combineCommentsIntoOneString(GlobalVariables.overallRiskFormulationText, GlobalVariables.overallRiskFormulationTextPrevious, status);
				this.setAttribute('overall-formulation', finaloverallCommentString.replace(/[\n\r]/g, '#10;'));
			} else {
				this.removeAttribute('overall-formulation');
				if (this.attributes.length == 0)//if no other attributes, remove the node
					$(this).remove();
				//this.setAttribute('assessment-comment', ""); we don't want empty comments
			}
			isOverallFormulationDealtWith = true;
		}
		if (overallManagement != null) {
			if (GlobalVariables.overallManagementPlanText != null || GlobalVariables.overallManagementPlanTextPrevious != null) {
				var finaloverallMgmtCommentString = XMLOutput._combineCommentsIntoOneString(GlobalVariables.overallManagementPlanText, GlobalVariables.overallManagementPlanTextPrevious, status);
				this.setAttribute('overall-management', finaloverallMgmtCommentString.replace(/[\n\r]/g, '#10;'));

			} else {
				this.removeAttribute('overall-management');
				if (this.attributes.length == 0)//if no other attributes, remove the node
					$(this).remove();
				//this.setAttribute('assessment-comment', ""); we don't want empty comments
			}
			isOverallManagementDealtWith = true;
		}

		//if it only has a code attribute and nothing else, it should be remove as no point having it.
		if (code != null && this.attributes.length == 1)
			$(this).remove();
		else if (this.attributes.length == 0)
			$(this).remove();
		
		//if there is a node with settings attribute but nothing else, remove that
		if(this.getAttribute("settings") != null && this.attributes.length == 1)
			$(this).remove();

	});

	// now lets add new nodes that are not in AT already
	var answersElement = $(at).find("answers");
	for (var key in nodesThatWouldNeedUpdating) {

		var question = nodesThatWouldNeedUpdating[key];
		var code = key;
		var answer = question.getAnswer();
		var comment = question.getComment();
		var managementComment = question.getManagementComment();
		if (answer != null || comment != null || managementComment != null) {
			var thisAnswerNode = '<node code="' + code + '" ';
			if (answer != null)
				thisAnswerNode += 'answer="' + answer + '" ';
			if (comment != null) {
				thisAnswerNode += 'comment="' + Utilities.escapeHtmlCustom(comment.replace(/[\n\r]/g, '#10;')) + '" ';
				//finalCommentString = comment.replace(/[\n\r]/g, '#10;');
			}
			if (managementComment != null)
				thisAnswerNode += 'management="' + Utilities.escapeHtmlCustom(managementComment.replace(/[\n\r]/g, '#10;')) + '" ';

			thisAnswerNode += '/>\n';

			// the following did not work in fucking IE, so had to use a workaround from http://stackoverflow.com/questions/11315138/is-this-a-bug-for-ie8-using-jquery-append
			//$(thisAnswerNode).appendTo(answersElement);
			var item = $($.parseXML(thisAnswerNode).getElementsByTagName('*')[0]);
			$(answersElement).append(item);

		}
	}

	//console.log(textInputNodesDealWithAlready);
	//lets deal with text input comments that are not already in the AT
	for (var key in GlobalVariables.textInputData) {
		if ($.inArray(key, textInputNodesDealWithAlready) != -1)
			continue;
		// we have already deal with this node
		var code = key;
		var textInputCommentData1 = GlobalVariables.textInputData[key];
		if (textInputCommentData1 != null && textInputCommentData1 != '') {
			var thisAnswerNode = '<node code="' + code + '" ';
			thisAnswerNode += 'comment="' + Utilities.escapeHtmlCustom(textInputCommentData1.replace(/[\n\r]/g, '#10;')) + '" ';
			thisAnswerNode += '/>\n';

			// the following did not work in fucking IE, so had to use a workaround from http://stackoverflow.com/questions/11315138/is-this-a-bug-for-ie8-using-jquery-append
			//$(thisAnswerNode).appendTo(answersElement);
			var item = $($.parseXML(thisAnswerNode).getElementsByTagName('*')[0]);
			$(answersElement).append(item);
		}
	}

	var date = GlobalVariables.CURRENT_DATE;
	var calculatedDate = ('0' + date.getDate()).slice(-2) + ('0' + (date.getMonth() + 1)).slice(-2) + date.getFullYear();

	var metaAssessment = '<node assessment-status="' + status + '"/>\n';
	var itemMeta = $($.parseXML(metaAssessment).getElementsByTagName('*')[0]);
	$(answersElement).append(itemMeta);

	var metaDate = '<node date="' + calculatedDate + '"/>\n';
	var itemMeta2 = $($.parseXML(metaDate).getElementsByTagName('*')[0]);
	$(answersElement).append(itemMeta2);
	
	if(GlobalVariables.language != null) {
		var metaLanguage = '<node settings="non-persistent" s_language="' + GlobalVariables.language + '"/>\n';
		var itemMetaLang = $($.parseXML(metaLanguage).getElementsByTagName('*')[0]);
		$(answersElement).append(itemMetaLang);
	}
	if(GlobalVariables.allActionsTriggered.length > 0) {
		var actions = '<node settings="non-persistent" />\n';
		var itemActions = $($.parseXML(actions).getElementsByTagName('*')[0]);
		itemActions.attr("s_actions-triggered",JSON.stringify(GlobalVariables.allActionsTriggered));
		$(answersElement).append(itemActions);
	}
	
	
	
	var nonEmptyActionPersonalisations = Utilities.getNonEmptyActionPersonalisations(GlobalVariables.personalisedActionsData);
	if(nonEmptyActionPersonalisations.galassify_action_open_url_templates_overrides.length > 0) {
		var actionsPersonalisations = '<node settings="persistent" />\n';
		var itemActions = $($.parseXML(actionsPersonalisations).getElementsByTagName('*')[0]);
		itemActions.attr("s_actions-personalisations",JSON.stringify(nonEmptyActionPersonalisations));
		$(answersElement).append(itemActions);
	}
	
	
	
	
	var riskSelectionStr = "";
	if (GlobalVariables.riskSelectionObject.getSelected().length == GlobalVariables.riskSelectionObject.getAllRisks().length)
		riskSelectionStr = "all";
	else if (GlobalVariables.riskSelectionObject.getSelected().length == 0)
		riskSelectionStr = "none";
	else {
		riskSelectionStr = "(" + GlobalVariables.riskSelectionObject.getSelected().join(" ") + ")";
	}
	var riskSelectionNode = '<node assessment-risks="' + riskSelectionStr + '"/>\n';

	var itemRiskSelection = $($.parseXML(riskSelectionNode).getElementsByTagName('*')[0]);
	$(answersElement).append(itemRiskSelection);

	// a screening node has to be inserted if we are in screening mode
	if ((GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SCREENING_ALL_DATA) || (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SCREENING_ONLY) || (GlobalVariables.currentClinicianVersionPathway == null)) {

		if (GlobalVariables.currentClinicianVersionPathway == null && hadAnyScreeningLevelAttribute == false) {
			// do nothing. we are at home page and no screening attribute was in input AT
			//console.log("ignored");
		} else {
			var screeningNode = '<node assessment-screening-level="0"/>\n';
			var screeningNodeXML = $($.parseXML(screeningNode).getElementsByTagName('*')[0]);
			$(answersElement).append(screeningNodeXML);
		}
	}

	if (isOverallCommentDealtWith == false) {
		var overallComment = GlobalVariables.overallRiskComment;
		if (overallComment != null && overallComment != '') {
			var overallCommentXML = '<node assessment-comment="' + Utilities.escapeHtmlCustom(overallComment.replace(/[\n\r]/g, '#10;')) + '"/>\n';
			var itemMeta3 = $($.parseXML(overallCommentXML).getElementsByTagName('*')[0]);
			$(answersElement).append(itemMeta3);
		}
	}

	if (isOverallFormulationDealtWith == false) {
		var overallComment = GlobalVariables.overallRiskFormulationText;
		if (overallComment != null && overallComment != '') {
			var overallCommentXML = '<node overall-formulation="' + Utilities.escapeHtmlCustom(overallComment.replace(/[\n\r]/g, '#10;')) + '"/>\n';
			var itemMeta3 = $($.parseXML(overallCommentXML).getElementsByTagName('*')[0]);
			$(answersElement).append(itemMeta3);
		}
	}

	if (isOverallManagementDealtWith == false) {
		var overallComment = GlobalVariables.overallManagementPlanText;
		if (overallComment != null && overallComment != '') {
			var overallCommentXML = '<node overall-management="' + Utilities.escapeHtmlCustom(overallComment.replace(/[\n\r]/g, '#10;')) + '"/>\n';
			var itemMeta3 = $($.parseXML(overallCommentXML).getElementsByTagName('*')[0]);
			$(answersElement).append(itemMeta3);
		}
	}

};

XMLOutput._combineCommentsIntoOneString = function(comment, previousComment, status) {
	var finalCommentString = "";
	if (status == "completed") {
		//comment|management="2011-09-22&#10;==========&#10;new data&#10;&#10;pre-existing data"

		if (comment != null) {
			if (previousComment == null)
				previousComment = "";
			var date = GlobalVariables.CURRENT_DATE;
			var calculatedDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
			finalCommentString = calculatedDate + "\n==========\n" + comment + "\n\n" + previousComment;
		} else {
			finalCommentString = previousComment;
		}
	} else {
		if (comment != null) {
			if (previousComment != null)
				finalCommentString = comment + "\n\n" + previousComment;
			else
				finalCommentString = comment;

		} else {
			finalCommentString = previousComment;
		}
	}
	return finalCommentString;
};
/**
 * THIS is used to convert a given xml to string which is then either printed or sent back to server as AT
 *
 * we had a bit of a problem trying to convert newline from comments to &#10; as the ampersand was getting encoded again as &amp;
 * So while saving the AT we only save a new line as #10; and here, in this function we look for those and put them properly as &#10; before returning the string.
 * check XMLOutput._updateNodesInAt()
 *
 */
XMLOutput._xml_to_string = function(xml_node) {
	var result;
	if (xml_node.xml)
		result = xml_node.xml;
	else if (XMLSerializer) {
		var xml_serializer = new XMLSerializer();
		result = xml_serializer.serializeToString(xml_node);
	} else {
		alert("ERROR: Extremely old browser");
		result = "";
	}

	//see function decription for why we are doing this.
	result = result.replaceAll('#10;', '&#10;');
	return result;
};
//Utilities.validateAnswerConstraint = function(answerBeingValidated, answerConstraint) {
XMLOutput.checkAnswerConstraints = function(nodesThatWouldNeedUpdating, qt) {
	var failedAnswerConstraints = new Array();
	for (var key in nodesThatWouldNeedUpdating) {
		var question = nodesThatWouldNeedUpdating[key];
		var answer = question.getAnswer();
		var answerConstraint = question.getAnswerConstraint();
		if (answerConstraint == null)
			continue;

		var result = Utilities.validateAnswerConstraint(answer, answerConstraint);
		if (result == false) {
			console.log("answer contraint not satisfied for " + key);
			var targetAnswer = (GlobalVariables.qt[answerConstraint.targetNodeCode]).getAnswer();
			var tempR = GlobalVariables.strings['galassify-xmlout-4'];
			tempR = tempR.replace("######", answer);
			var reason = tempR +" "+ answerConstraint.operatorInEnglish + " " + targetAnswer;
			failedAnswerConstraints.push({
				code : key,
				reason : reason
			});
		}

	}
	return failedAnswerConstraints;
};
/**
 * This creates consensus response xml and sends it via POST
 * @param {Object} assessmentRequestXML original request sent to us from server
 * @param {Object} assessmentRequest object containing user responses from the gui
 * @param {Object} consensusResponseUrl the url to which response would be posted.
 */
XMLOutput.submitConsensusResponseXML = function(assessmentRequestXML, assessmentRequest, consensusResponseUrl) {
	var catRoot = GlobalVariables.cat.documentElement;
	$(assessmentRequestXML).find("node").each(function() {
		var code = this.getAttribute("code");

		var thisAssessmentRequestObject;
		for (var i = 0; i < assessmentRequest.consensusNodes.length; i++) {
			if (assessmentRequest.consensusNodes[i].code == code) {
				thisAssessmentRequestObject = assessmentRequest.consensusNodes[i];
				break;
			}
		}

		var catNodeForThisRisk;
		for (var j = 0; j < catRoot.childNodes.length; j++) {
			var child = catRoot.childNodes.item(j);
			if (child.nodeType != 1)//only want element nodes
				continue;
			if (child.getAttribute("code") == thisAssessmentRequestObject.code) {
				catNodeForThisRisk = child;
				break;
			}
		}

		var valueMgList = Utilities.getValueMgList(catNodeForThisRisk);
		var question = GlobalVariables.qt[code];

		if (thisAssessmentRequestObject.changeAnswer == 'false') {
			//not checking for null answer as there must have been some answer for this node if it is flagged up in requestXML
			this.setAttribute('answer', question.getAnswer());
			this.setAttribute('answer-n', question.getAnswer());

			var mg = question.calculateValueMg(question.getAnswer(), valueMgList);
			mg = (Math.round(mg * 100)) / 100.0;
			this.setAttribute('mg-revised', mg);

		} else {
			this.setAttribute('answer', thisAssessmentRequestObject.scaleAnswer);
			this.setAttribute('answer-n', thisAssessmentRequestObject.scaleAnswer);

			var mg = question.calculateValueMg(thisAssessmentRequestObject.scaleAnswer, valueMgList);
			mg = (Math.round(mg * 100)) / 100.0;
			this.setAttribute('mg-revised', mg);
		}

		if (thisAssessmentRequestObject.userComment != null) {
			//NOTE: we are normally be replacing new line with &#10; BUT the ampersand sign causes problem as it gets encoded again as &amp;
			// so we are omitting the '&' here and then putting it back again after converting from xml to string in XMLOutput._xml_to_string()
			this.setAttribute('comment', thisAssessmentRequestObject.userComment.replace(/[\n\r]/g, '#10;'));
		} else
			this.setAttribute('comment', '');

		//console.log(code);
		//console.log(thisAssessmentRequestObject);
		//console.log(catNodeForThisRisk);

	});

	var responseXMLString = XMLOutput._xml_to_string(assessmentRequestXML);
	console.log("submitting the following consensus response xml");
	console.log(responseXMLString);

	if (GlobalVariables.runningFromServer == true) {
		$.ajax({
			type : "POST",
			cache : false,
			async : false,
			url : consensusResponseUrl,
			data : {
				verificationResponse : responseXMLString
			},
			dataType : "text",
			timeout : 5000,
			success : function(text) {
				console.log("Consensus response submitted successfully");
				return true;
			},
			error : function(xhr, status, error) {

				if (status === "timeout") {
					alert('The connection timed out. Our servers may be busy at the moment. Please try again after few seconds.');
				} else {
					alert('Something went wrong. Please check your internet connection and try again.');
				}
				return false;
			}
		});

	} else {
		console.log("running offline, so nothing to submit");
		return true;
	}
};

