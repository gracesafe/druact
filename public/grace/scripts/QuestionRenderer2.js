function QuestionRenderer() {
}

/**
 * isFirstRun: set to true when called from the tree... basically we need to know when to set the scroll bar to top.
 * 					this function is also called after opening any filter or layer.. we don't want to reset the scroll bar then
 */

QuestionRenderer.traverseTree = function(node, container$, isFirstRun, optionalParam) {
	optionalParam = (typeof optionalParam !== 'undefined') ?  optionalParam : {};
	var questionsToRender = new Array();
	QuestionRenderer._renderQuestionTemplates(questionsToRender, node, container$);
	//console.log("traverse tree called");
	//console.log(optionalParam);
	var i = 0;
	var innerLoopFunction = (function() {

		var start = new Date().getTime();
		for (; i < questionsToRender.length; i++) {
			var questionToRender = questionsToRender[i];

			// do things here...

			if (questionToRender.type == 'nominal') {
				QuestionRenderer.outputNominalQuestionView(questionToRender.question, questionToRender.node, questionToRender.path, questionToRender.container);
			} else if (questionToRender.type == 'scale') {
				QuestionRenderer.outputScaleQuestionView(questionToRender.question, questionToRender.node, questionToRender.path, questionToRender.container);
			} else if (questionToRender.type == 'date') {
				QuestionRenderer.outputDateQuestionView(questionToRender.question, questionToRender.node, questionToRender.path, questionToRender.container);
			} else if (questionToRender.type == 'number') {
				QuestionRenderer.outputNumberQuestionView(questionToRender.question, questionToRender.node, questionToRender.path, questionToRender.container);
			} else if (questionToRender.type == 'filter') {
				QuestionRenderer.outputFilterQuestionView(questionToRender.question, questionToRender.node, questionToRender.path, questionToRender.container, questionToRender.subContainer);
			} else if (questionToRender.type == 'layer') {
				QuestionRenderer.outputLayerQuestionView(questionToRender.question, questionToRender.node, questionToRender.path, questionToRender.container, questionToRender.subContainer);
			} else if (questionToRender.type == 'header') {
				QuestionRenderer.outputHeaderQuestionView(questionToRender.header, questionToRender.container);
			} else if (questionToRender.type == 'textInput') {
				QuestionRenderer.outputTextInputQuestionView(questionToRender.code, questionToRender.textInputString, questionToRender.container);
			}

			//QuestionRenderer.notifyFinish(isFirstRun);

			if (new Date().getTime() - start > 50) {
				i++;
				var id = setTimeout(innerLoopFunction, 0);
				GlobalVariables.timerQueueArray.push(id);
				break;
			}
		}

		clearTimeout(window.timer1);
		if (i > questionsToRender.length - 2)
			QuestionRenderer.notifyFinish(isFirstRun, container$, optionalParam);

	});
	innerLoopFunction();
};

QuestionRenderer._renderQuestionTemplates = function(questionsToRender, node, container$) {
	var question = null;
	var openFilterOrLayer = false;
	//if a question is a filter or a layer with answer = yes
	//if(node.hasAttributes()) { fucking IE7 does not support it
	if (node.attributes.length > 0) {

		var code = node.getAttribute("code");
		var riskJudgementFlag = node.getAttribute("riskJudgementFlag");
		var isInterimFlag = node.getAttribute("showInterim");
		var isRapidRepeatFlag = node.getAttribute("showInRapidRepeat");
		var isScreeningFlag = node.getAttribute("showInScreeningTree");
		var isRiskSpecificFlag = node.getAttribute("isSpecificRisk");
		var isGenericFlag = node.getAttribute("isGenericRootNodeInserteredByTool");
		var isWellBeingFlag = node.getAttribute("showInWellBeing");
		var isSilverPadLockOnly = node.getAttribute("showInSilverOnly");
		var isGoldPadLockOnly = node.getAttribute("showInGoldOnly");

		var showThisQuestion = true;
		//lets assume that we need to show this question. it would be set to false later if needed.
		var selectedInRiskSelection = true;

		if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
			if (riskJudgementFlag != 'true')
				showThisQuestion = false;
		} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {
			if (riskJudgementFlag == 'true')
				showThisQuestion = false;

			if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT && isRapidRepeatFlag != 'true')
				showThisQuestion = false;
			else if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.INTERIM && isInterimFlag != 'true')
				showThisQuestion = false;
			else if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK && isSilverPadLockOnly != 'true')
				showThisQuestion = false;
			else if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK && isGoldPadLockOnly != 'true')
				showThisQuestion = false;

			if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING && isScreeningFlag != 'true')
				showThisQuestion = false;
			else if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.RISK_SPECIFIC_ONLY && isRiskSpecificFlag != 'true')
				showThisQuestion = false;
			else if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.GENERIC_ONLY && isGenericFlag != 'true')
				showThisQuestion = false;
			else if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC && (isGenericFlag != 'true' && isRiskSpecificFlag != 'true')) {
				showThisQuestion = false;
			} else if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.WELL_BEING) {

				if ((isWellBeingFlag == 'true') && (isGenericFlag == 'true' || isRiskSpecificFlag == 'true')) {
					// this is the positive case. do nothing.
				} else {
					showThisQuestion = false;
				}

			}
		}

		//lets check for risk selection
		if ($.inArray(code, GlobalVariables.riskSelectionObject.getAllRisks()) != -1) {
			//we are at top level, now check if this code in the selected risks
			if ($.inArray(code, GlobalVariables.riskSelectionObject.getSelected()) == -1) {
				showThisQuestion = false;
				selectedInRiskSelection = false;
			}
		}

		if (code != null && code != "" && showThisQuestion == true) {
			question = GlobalVariables.qt[code];
			if (question != null) {
				var qType = question.getQuestionType();

				//console.log(q.getCode());
				var path = (Utilities.getPathAsCodes(node)).join("#");

				var questionTemplate = '<div class="questionPanel" code="' + question.getCode() + '" path="' + path + '"></div>';

				if (qType == 'nominal') {
					var questionDiv$ = $(questionTemplate).appendTo(container$);
					questionsToRender.push({
						type : 'nominal',
						question : question,
						node : node,
						path : path,
						container : questionDiv$
					});
				} else if (qType == 'scale') {
					var questionDiv$ = $(questionTemplate).appendTo(container$);
					questionsToRender.push({
						type : 'scale',
						question : question,
						node : node,
						path : path,
						container : questionDiv$
					});
				} else if (qType.substr(0, 4) == 'date') {
					var questionDiv$ = $(questionTemplate).appendTo(container$);
					questionsToRender.push({
						type : 'date',
						question : question,
						node : node,
						path : path,
						container : questionDiv$
					});
				} else if (qType == 'integer' || qType == 'real') {
					var questionDiv$ = $(questionTemplate).appendTo(container$);
					questionsToRender.push({
						type : 'number',
						question : question,
						node : node,
						path : path,
						container : questionDiv$
					});
				} else if (qType == 'filter-q') {
					if (question.getAnswer() != null && question.getAnswer().toLowerCase() == 'yes')
						openFilterOrLayer = true;

					if (node.getAttribute("multiple-tick") != null)
						openFilterOrLayer = false;

					var questionDiv$ = $(questionTemplate).appendTo(container$);
					filterOrLayerWrapperOrHeader$ = $('<div class="subQuestionWrapper"></div>').appendTo(questionDiv$);
					questionsToRender.push({
						type : 'filter',
						question : question,
						node : node,
						path : path,
						container : questionDiv$,
						subContainer : filterOrLayerWrapperOrHeader$
					});
				} else if (qType == 'layer') {
					if (question.getAnswer() != null && question.getAnswer().toLowerCase() == 'yes')
						openFilterOrLayer = true;

					if (node.getAttribute("multiple-tick") != null)
						openFilterOrLayer = false;

					var questionDiv$ = $(questionTemplate).appendTo(container$);
					filterOrLayerWrapperOrHeader$ = $('<div class="subQuestionWrapper"></div>').appendTo(questionDiv$);
					questionsToRender.push({
						type : 'layer',
						question : question,
						node : node,
						path : path,
						container : questionDiv$,
						subContainer : filterOrLayerWrapperOrHeader$
					});
				}

			} else {//question is null... check if there is a header or textinput
				var header = node.getAttribute("header");
				if (header != null) {
					openFilterOrLayer = true;
					var headerTemplate = '<div class="questionPanel"></div>';
					var questionDiv$ = $(headerTemplate).appendTo(container$);
					filterOrLayerWrapperOrHeader$ = $('<div class="subQuestionWrapper"></div>').appendTo(questionDiv$);
					questionsToRender.push({
						type : 'header',
						header : header,
						container : questionDiv$
					});
				}

				var textinput = node.getAttribute("text-input");
				if (textinput != null) {
					openFilterOrLayer = true;
					//just in case there are children nodes
					var template = '<div class="questionPanel"></div>';
					var questionDiv$ = $(template).appendTo(container$);
					filterOrLayerWrapperOrHeader$ = $('<div class="subQuestionWrapper"></div>').appendTo(questionDiv$);
					questionsToRender.push({
						type : 'textInput',
						textInputString : textinput,
						code : code,
						container : questionDiv$
					});
				}
			}
		}
	}

	//we do not want to iterate its children if the risk is removed from riskSelection
	if (selectedInRiskSelection != false) {
		if (question == null || openFilterOrLayer == true || node.parentNode.parentNode.nodeName == "#document")//these are top level questions that are displayed only in risk judgement
		{

			if (openFilterOrLayer == true)
				container$ = filterOrLayerWrapperOrHeader$;

			for (var i = 0; i < node.childNodes.length; i++) {

				var childNode = node.childNodes[i];
				if (childNode.nodeType != 1)//only want element nodes
					continue;
				QuestionRenderer._renderQuestionTemplates(questionsToRender, node.childNodes[i], container$);
			}
		}
	}
};

QuestionRenderer.notifyFinish = function(isFirstRun, container$, optionalParam) {
	optionalParam = (typeof optionalParam !== 'undefined') ?  optionalParam : {};
	//console.log("notify called");
	if ( typeof (isFirstRun) === 'undefined')
		isFirstRun = false;
	clearTimeout(window.timer1);
	window.timer1 = setTimeout(function() {
		QuestionRenderer._callAfterQuestionsHaveBeenRendered(isFirstRun, container$, optionalParam);
	}, 10);
};

QuestionRenderer._callAfterQuestionsHaveBeenRendered = function(isFirstRun, container$, optionalParam) {
	optionalParam = (typeof optionalParam !== 'undefined') ?  optionalParam : {};
	console.log("DONE!!!!!!!!!");
	var endTime = new Date().getTime();
	console.log('time taken: ' + (endTime - window.startTime));
	$('#loadingMessage').hide(0);
	LayoutManager.QuestionnaireLayout._updateProgressBar();
	if (isFirstRun == true)
		$(window).scrollTop(0);
	//otherwise firefox remembers where the scroll bar was last time and automatically scrolls down there.

	if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT && LayoutManager.RiskJudgementLayout.CopyPasteButtonsAdded == false) {
		$('#right-questionPanel').children('div').each(function() {
			LayoutManager.RiskJudgementLayout.addCopyPasteButton(this);
		});
		LayoutManager.RiskJudgementLayout.CopyPasteButtonsAdded = true;
	}
	if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT && GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		$('#risk-formulation-area').show(0);
	}
	
	

	//lets add avatar to 'i' icons in questionnair
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		$('img.helpIcon', container$).each(function(index) {
			//console.log($(this));
			img$ = $(this);
			img$.webuiPopover(Utilities.createPopOverOptions('', img$.prop('title'), {
				placement : 'auto',
				delay : {
					show : 0,
					hide : 0
				}
			})).prop('title', '');
		});
		$('img.persistentIcon', container$).each(function(index) {
			//console.log($(this));
			img$ = $(this);
			img$.webuiPopover(Utilities.createPopOverOptions('', img$.prop('title'), {
				placement : 'auto',
				delay : {
					show : 0,
					hide : 0
				}
			})).prop('title', '');
		});

		if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
			var commentString = GlobalVariables.strings['galassify-questionLayout-16'];
			var mgmtCommentString = GlobalVariables.strings['galassify-questionLayout-17'];
		} else {
			var commentString = GlobalVariables.strings['galassify-questionLayout-18'];
			var mgmtCommentString = GlobalVariables.strings['galassify-questionLayout-19'];
		}

		var linkBackString = GlobalVariables.strings['galassify-questionLayout-20'];

		$('img.questionButtonIcon', container$).each(function(index) {
			//console.log($(this));
			
			
			img$ = $(this);
			var displayText = '';
			if (img$.hasClass('commentIcon'))
				displayText = commentString;
			else if (img$.hasClass('mgmtCommentIcon'))
				displayText = mgmtCommentString;
			else if (img$.hasClass('linkBackIcon'))
				displayText = linkBackString;
			if (displayText != '')
				img$.webuiPopover(Utilities.createPopOverOptions('', displayText, {
					placement : 'auto',
					delay : {
						show : 1000,
						hide : null
					}
				})).prop('title', '');
		});
	}
	else {
		$('img.helpIcon, img.persistentIcon').tooltip();
	}
	
	// lets deal with warning messages
	if(optionalParam.showWarningAfterRender != undefined) {
		//console.log(optionalParam.showWarningAfterRender);
		var warningHtml = '<div class="warning-message">'+optionalParam.showWarningAfterRender.message+'</div>';
		
		container$.append(warningHtml);
	}

};

QuestionRenderer._showAvatarForInfoIconInQuestions = function(container$) {
	if (GlobalVariables.currentPopulationBasedMode != GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		return;
	$('img.helpIcon', container$).each(function(index) {
		//console.log($(this));
		img$ = $(this);
		img$.webuiPopover(Utilities.createPopOverOptions('', img$.prop('title'), {
			placement : 'auto',
			delay : {
				show : 0,
				hide : 0
			}
		})).prop('title', '');
	});
};
/*************************************************************************************
 * 				QUESTION RENDERERS
 **************************************************************************************/

QuestionRenderer.outputNominalQuestionView = function(question, node, path, questionDiv$) {
	var questionText = QuestionRenderer._getQuestionTextDiv(question, node);
	var valueMgMap = Utilities.getValueMgMapfromLispString(node.getAttribute("value-mg"));
	var answerText = "";
	var answer = question.getAnswer();

	var disabled = "";
	if (question.isDisabled())
		disabled = ' disabled="disabled" ';
	for (var i = 0; i < valueMgMap.length; i++) {
		var isChecked = ''; 
		var styleAttrib = 'style="padding:5px;"';
		var colour = Utilities.getRiskColor(valueMgMap[i].mg);

		if (answer != null && answer == valueMgMap[i].value) {
			isChecked = ' checked="checked" ';
			if (Utilities._isDemographicQuestion(path) != true)
				styleAttrib = 'style="padding:5px; background-color:' + colour.back + '; color:' + colour.front + '"';
		}

		answerText += '<label><span class="noWrap nominalValueHolder" ' + styleAttrib + ' origBackCol="' + colour.back + '" origFrontCol="' + colour.front + '" ><input type="radio" name="' + path + '" value="' + valueMgMap[i].value + '" ' + isChecked + disabled + '>' + valueMgMap[i].value.toLowerCase() + '</span></label> &nbsp;';
	}

	if (answer == 'DK')
		isChecked = ' checked="checked "';
	else
		isChecked = '';

	answerText += '<label><span class="noWrap nominalValueHolder"><input type="radio" name="' + path + '" value="DK" ' + isChecked + disabled + '>don\'t know</span></label>&nbsp;';
	if (Utilities._isDemographicQuestion(path) != true)
		answerText += '<label><div class="scaleAnswerHolder resetBox" value="null" style="border:0px;display: inline-block;"><img src="images/bin2.png" title="'+GlobalVariables.strings['galassify-questionLayout-41']+'"></img></div></label><div class="reset-notify" style="display:none; border: 2px solid red; padding:5px" path="' + path + '"><b>'+GlobalVariables.strings['galassify-questionLayout-42']+'</b></div>';
	answerText = '<div class="answerPanel">' + answerText + '</div>';

	var commentBoxes = QuestionRenderer._getCommentBoxes(question);
	questionDiv$.addClass('nominal').html(questionText + answerText + commentBoxes);

	var dataPackage = {
		code : question.getCode(),
		path : path,
		questionType : 'nominal',
		node : node
	};
	$('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.nominalAndScaleListener);
	questionDiv$.find('.resetBox').click(dataPackage, QuestionRenderer.nominalAndScaleListener);
	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);

	questionDiv$.data('valueMgMap', valueMgMap);

};

QuestionRenderer.outputScaleQuestionView = function(question, node, path, questionDiv$) {
	//console.log(question.getCode());

	var questionText = QuestionRenderer._getQuestionTextDiv(question, node);
	var answerText = "";
	var answer = question.getAnswer();
	var valueMgLispString = jQuery.trim(node.getAttribute("value-mg"));

	//check that answer is right type
	if(answer != null && answer != "DK" && answer != "dk" && isNaN(answer)) {
		console.log("ERROR: invalid answer found for "+question.getCode());
		answer = null;
	}
	
	var isValueMgTypical = isValueMgTypicalReversed = false;
	var valueMgList = null;
	if (valueMgLispString == '((0 0) (10 1))')//to save some exrta time.. why go through all the drama when we know what the mg is going to be for different answers,
		isValueMgTypical = true;
	else if (valueMgLispString == '((0 1)(10 0))')
		isValueMgTypicalReversed = true;
	else
		var valueMgList = Utilities.getValueMgList(node);

	var colour = origColor = null;

	if (answer != null && answer != 'DK') {
		var mg;
		if (isValueMgTypical)
			mg = parseFloat(answer) / 10.0;
		else if (isValueMgTypicalReversed)
			mg = 1.0 - parseFloat(answer) / 10.0;
		else
			mg = question.calculateValueMg(answer, valueMgList);
		colour = Utilities.getRiskColor(mg);
	}

	for (var i = 0; i < 11; i++) {
		var isChecked = '';
		if (answer != null && answer == i)
			isChecked = ' checked="checked "';

		var mg;
		if (isValueMgTypical)
			mg = i / 10.0;
		else if (isValueMgTypicalReversed)
			mg = 1 - (i / 10.0);
		else
			mg = question.calculateValueMg(i, valueMgList);

		origColor = Utilities.getRiskColor(mg);
		if (answer == null || answer == 'DK') {
			colour = origColor;
		}

		if (Utilities._isDemographicQuestion(path) == true) {
			colour = {
				front : '',
				back : ''
			};
		}

		answerText += '<label><div class="scaleAnswerHolder" origBackCol="' + origColor.back + '" origFrontCol="' + origColor.front + '" style="background-color:' + colour.back + '; color:' + colour.front + '"><input type="radio" name="' + path + '" value="' + i + '" ' + isChecked + ' >' + i + '</div></label>';
	}

	if (answer == 'DK')
		isChecked = ' checked="checked" ';
	else
		isChecked = '';

	if (Utilities._isDemographicQuestion(path) == false)
		answerText += '<label><div class="scaleAnswerHolder dkBox" style="background-color: #CCCCCC; color:#000000" origFrontCol="#000000" origBackCol="#CCCCCC" ><input type="radio" name="' + path + '" value="DK"  ' + isChecked + '>don\'t know </div></label>';
	else
		answerText += '<label><div class="scaleAnswerHolder dkBox" origFrontCol="#000000" origBackCol="#CCCCCC" ><input type="radio" name="' + path + '" value="DK"  ' + isChecked + '>don\'t know </div></label>';
	
	if (Utilities._isDemographicQuestion(path) != true)
		answerText += '<label><div class="scaleAnswerHolder resetBox" value="null" style="border:0px"><img src="images/bin2.png" title="Reset this answer" ></img></div></label><div class="reset-notify" style="display:none; border: 2px solid red; padding:5px" path="' + path + '"><b>Answer reset to the one carried over from the previous assessment.</b></div>';

	answerText = '<div class="answerPanel">' + answerText + '</div>';

	//var extraHelpTextForScaleQuestions = QuestionRenderer._getExtraHelpForScale(question);

	var commentBoxes = QuestionRenderer._getCommentBoxes(question);

	questionDiv$.addClass('scale').html(questionText + answerText + "<div class=\"scale-pole-text\"></div><div class=\"scale-help-text\"></div>" + commentBoxes);

	var disableSavingAnswersToAT;
	if (questionDiv$.data('disableSavingAnswersToAT') == true)
		disableSavingAnswersToAT = true;
	else
		disableSavingAnswersToAT = false;

	var dataPackage = {
		code : question.getCode(),
		path : path,
		questionType : 'scale',
		node : node,
		disableSavingAnswersToAT : disableSavingAnswersToAT
	};
	questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.nominalAndScaleListener);
	//questionDiv$.find('.resetBox').click(function(){console.log("zz");});
	questionDiv$.find('.resetBox').click(dataPackage, QuestionRenderer.nominalAndScaleListener);
	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);

	if (valueMgList != null)
		questionDiv$.data('valueMgMap', valueMgList);
	else
		questionDiv$.data('valueMgLispString', valueMgLispString);

	if (GlobalVariables.showHelpTextForScaleQuestions == true && question.getHelp() != null) {
		$('div.scale-help-text', questionDiv$).html(question.getHelp());
	}

	if (question.getScaleType() != null) {
		$('div.scale-pole-text', questionDiv$).html(Utilities.getPoleTextForScaleQuestion(question));
	}

};

QuestionRenderer.outputDateQuestionView = function(question, node, path, questionDiv$) {
	var questionText = QuestionRenderer._getQuestionTextDiv(question, node);
	var answerText = '<span class="dateQuestionInstructions">(Please enter a date in the format ddmmyyyy, mmyyyy or just yyyy)</span>&nbsp;&nbsp;';
	var answer = question.getAnswer();
	var answerValue = isChecked = styleAttrib = '';

	if (answer != null && answer != 'DK') {
		answerValue = answer;

		if (Utilities._isDemographicQuestion(path) == false) {
			var mg = question.calculateValueMg(answer, Utilities.getValueMgList(node));
			var colour = Utilities.getRiskColor(mg);
			styleAttrib = ' style="background-color:' + colour.back + '; color:' + colour.front + '" ';
		}
	} else if (answer == 'DK')
		isChecked = ' checked="checked" ';

	var disabled = "";
	if (question.isDisabled())
		disabled = ' disabled="disabled" ';
	answerText += '<input type="text" name="' + path + '" value="' + answerValue + '" ' + styleAttrib + disabled + ' />';
	answerText += '<label><span class="noWrap"><input type="radio" name="' + path + '" value="DK" ' + isChecked + disabled + '  >don\'t know</span></label>';
	answerText = '<div class="answerPanel">' + answerText + '</div>';
	var errorDialog = '<div id="errorDialog" class="validationErrorBox"></div>';
	var commentBoxes = QuestionRenderer._getCommentBoxes(question);

	questionDiv$.addClass('date').html(questionText + answerText + errorDialog + commentBoxes);

	var dataPackage = {
		code : question.getCode(),
		path : path,
		questionType : 'date',
		node : node
	};
	questionDiv$.find('input:text[name="' + path + '"]').change(dataPackage, QuestionRenderer.numberAndDateTypeAnswerListener);
	questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.numberAndDateTypeAnswerListener);
	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);

	var valueMgLispString = jQuery.trim(node.getAttribute("value-mg"));
	questionDiv$.data('valueMgLispString', valueMgLispString);
};

QuestionRenderer.outputNumberQuestionView = function(question, node, path, questionDiv$) {
	var questionText = QuestionRenderer._getQuestionTextDiv(question, node);
	var answerText = '<span class="numberQuestionInstructions">(' + GlobalVariables.strings['galassify-questionLayout-21'] + ')</span>&nbsp;&nbsp;';
	var answer = question.getAnswer();
	var answerValue = isChecked = styleAttrib = '';
	if (answer != null && answer != 'DK') {
		answerValue = answer;
		if (Utilities._isDemographicQuestion(path) == false) {
			var mg = question.calculateValueMg(answer, Utilities.getValueMgList(node));
			var colour = Utilities.getRiskColor(mg);
			styleAttrib = 'style="background-color:' + colour.back + '; color:' + colour.front + '"';
		}
	} else if (answer == 'DK')
		isChecked = ' checked="checked"';
	var disabled = "";
	if (question.isDisabled())
		disabled = ' disabled="disabled" ';
	answerText += '<input type="text" name="' + path + '" value="' + answerValue + '" ' + styleAttrib + disabled + ' />';
	answerText += '<label><span class="noWrap"><input type="radio" name="' + path + '" value="DK" ' + isChecked + disabled + '  >don\'t know</span></label>';
	answerText = '<div class="answerPanel">' + answerText + '</div>';

	var errorDialog = '<div id="errorDialog" class="validationErrorBox">' + GlobalVariables.strings['galassify-questionLayout-22'] + '</div>';
	var commentBoxes = QuestionRenderer._getCommentBoxes(question);

	questionDiv$.addClass('number').html(questionText + answerText + errorDialog + commentBoxes);

	var dataPackage = {
		code : question.getCode(),
		path : path,
		questionType : question.getQuestionType(),
		node : node
	};
	questionDiv$.find('input:text[name="' + path + '"]').change(dataPackage, QuestionRenderer.numberAndDateTypeAnswerListener);
	questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.numberAndDateTypeAnswerListener);
	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);

	var valueMgLispString = jQuery.trim(node.getAttribute("value-mg"));
	questionDiv$.data('valueMgLispString', valueMgLispString);
};

QuestionRenderer.outputFilterQuestionView = function(question, node, path, questionDiv$, subContainer$) {
	var questionText = QuestionRenderer._getQuestionTextDiv(question, node);
	var answerInLowercase = question.getAnswer();
	if (answerInLowercase != null)
		answerInLowercase = answerInLowercase.toLowerCase();
	var isYesChecked = isNoChecked = isDKChecked = '';

	if (answerInLowercase == 'yes')
		isYesChecked = ' checked="checked" ';
	else if (answerInLowercase == 'no')
		isNoChecked = ' checked="checked" ';
	else if (answerInLowercase == 'dk')
		isDKChecked = ' checked="checked" ';

	var disabled = "";
	if (question.isDisabled())
		disabled = ' disabled="disabled" ';

	var answerText = '<label class="radioLabel"><input type="radio" name="' + path + '" value="YES" ' + isYesChecked + disabled + '>yes</label>';
	answerText += '<label class="radioLabel"><input type="radio" name="' + path + '" value="NO" ' + isNoChecked + disabled + '>no</label>';
	answerText += '<label class="radioLabel"><input type="radio" name="' + path + '" value="DK" ' + isDKChecked + disabled + '>don\'t know</label>';
	
	if (Utilities._isDemographicQuestion(path) != true)
		answerText += '<label><div class="scaleAnswerHolder resetBox" value="null" style="border:0px;display: inline-block;"><img src="images/bin2.png" title="'+GlobalVariables.strings['galassify-questionLayout-41']+'"></img></div></label><div class="reset-notify" style="display:none; border: 2px solid red; padding:5px" path="' + path + '"><b>'+GlobalVariables.strings['galassify-questionLayout-42']+'</b></div>';
	
	answerText = '<div class="answerPanel">' + answerText + '</div>';
	var commentBoxes = QuestionRenderer._getCommentBoxes(question);

	questionDiv$.addClass('filter-q').prepend(questionText + answerText + commentBoxes);

	var wrapper$ = subContainer$;
	//$('<div class="subQuestionWrapper"></div>').appendTo(questionDiv$);

	var dataPackage = {
		question : question,
		node : node,
		path : path,
		wrapper$ : wrapper$
	};
	if (node.getAttribute("multiple-tick") != null) {
		if (answerInLowercase == null || answerInLowercase != 'yes')
			wrapper$.hide(0);
		QuestionRenderer.addMultipleTicks(node, wrapper$, path);
		questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.layerAndFilterWithMultipleTickListener);
	} else
		questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.layerAndFilterListenerWrapper);

	if (answerInLowercase == null || answerInLowercase != 'yes') {
		questionDiv$.addClass('showBottomBorder');
	} else {//answer is yes. we may still need to show bottom border

		//if in screening mode, and there are no screening questions underneath, we must show the bottom border
		if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING) {
			var showBottomBorder = true;
			for (var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes[i];
				if (childNode.nodeType != 1)//only want element nodes
					continue;
				if (childNode.getAttribute("showInScreeningTree") != null) {
					showBottomBorder = false;
					break;
				}
			}
			if (showBottomBorder == true)
				questionDiv$.addClass('showBottomBorder');
		}
	}
	questionDiv$.find('.resetBox').click(dataPackage, QuestionRenderer.layerAndFilterListenerWrapper);
	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);
};

QuestionRenderer.outputLayerQuestionView = function(question, node, path, questionDiv$, subContainer$) {
	var questionText = QuestionRenderer._getQuestionTextDiv(question, node);
	var pathArray = (Utilities.getPathAsCodes(node));

	var answerInLowercase = question.getAnswer();
	if (answerInLowercase != null)
		answerInLowercase = answerInLowercase.toLowerCase();

	var isYesChecked = isNoChecked = '';

	if (answerInLowercase == 'yes')
		isYesChecked = ' checked="checked" ';
	else if (answerInLowercase == 'no')
		isNoChecked = ' checked="checked" ';

	var disabled = "";
	if (question.isDisabled())
		disabled = ' disabled="disabled" ';

	var answerText = '<label  class="radioLabel"><input type="radio" name="' + path + '" value="YES" ' + isYesChecked + disabled + '>yes</label>';
	answerText += '<label  class="radioLabel"><input type="radio" name="' + path + '" value="NO" ' + isNoChecked + disabled + '>no</label>';
	if (Utilities._isDemographicQuestion(path) != true)
		answerText += '<label><div class="scaleAnswerHolder resetBox" value="null" style="border:0px;display: inline-block;"><img src="images/bin2.png" title="'+GlobalVariables.strings['galassify-questionLayout-41']+'"></img></div></label><div class="reset-notify" style="display:none; border: 2px solid red; padding:5px" path="' + path + '"><b>'+GlobalVariables.strings['galassify-questionLayout-42']+'</b></div>';
	answerText = '<div class="answerPanel">' + answerText + '</div>';

	var commentBoxes = QuestionRenderer._getCommentBoxes(question);

	questionDiv$.addClass('layer').prepend(questionText + answerText + commentBoxes);
	var wrapper$ = subContainer$;

	var dataPackage = {
		question : question,
		node : node,
		path : path,
		wrapper$ : wrapper$
	};
	questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, QuestionRenderer.layerAndFilterListener);

	if (answerInLowercase == null || answerInLowercase != 'yes') {
		questionDiv$.addClass('showBottomBorder');
	} else {//answer is yes. we may still need to show bottom border

		//if in screening mode, and there are no screening questions underneath, we must show the bottom border
		if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING) {
			var showBottomBorder = true;
			for (var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes[i];
				if (childNode.nodeType != 1)//only want element nodes
					continue;
				if (childNode.getAttribute("showInScreeningTree") != null) {
					showBottomBorder = false;
					break;
				}
			}
			if (showBottomBorder == true)
				questionDiv$.addClass('showBottomBorder');
		}
	}
	questionDiv$.find('.resetBox').click(dataPackage, QuestionRenderer.layerAndFilterListener);
	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);
};

QuestionRenderer.outputHeaderQuestionView = function(header, questionDiv$) {
	var questionText = '<div class="questionTextPanel"><b>' + header + '</b></div>';
	questionDiv$.addClass('header').prepend(questionText);
};

QuestionRenderer.outputTextInputQuestionView = function(code, inputTextString, questionDiv$) {
	var inputTextParam = Utilities.parseTextInputAttribute(inputTextString);

	var questionText = '<div class="questionTextPanel">' + inputTextParam.header + '</div>';

	var heightStyle = "";
	if (inputTextParam.height != null)
		heightStyle = 'style="height:' + (parseInt(inputTextParam.height) + 1) + 'em"';

	var textBox = '<div class="commentBox" style="display:inline;"><textarea class="comment" ' + heightStyle + ' ></textarea></div>';
	questionDiv$.addClass('textInput').prepend(questionText + textBox);
	questionDiv$.addClass('showBottomBorder');

	if (GlobalVariables.textInputData[code] != null && GlobalVariables.textInputData[code] != '')
		questionDiv$.find('> div.commentBox textarea').val(GlobalVariables.textInputData[code]);

	var dataPackage = {
		code : code
	};
	questionDiv$.find('> div.commentBox textarea').change(dataPackage, QuestionRenderer.textInputtextBoxListener);

};

QuestionRenderer._getQuestionTextDiv = function(question, node) {
	var meta = "";

	if ((LayoutManager.QuestionnaireLayout.showScreeningMarker == true) && (node != null) && (node.getAttribute("showInScreeningTree") === 'true'))
		meta += "<b>Screening: </b>";

	if(GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
		var label = node.getAttribute("label");
		
		meta += "<b>"+label.charAt(0).toUpperCase()+label.slice(1)+"</b><br/>";
	}
	//meta = question.getQuestionType();//+" "+question.getCode();

	var commentIcon = mgmtCommentIcon = null;
	var helpIconHtml = persistentIconHtml = '';

	if (question.getComment() != null)
		commentIcon = GlobalVariables.images.commentFull;
	else if (question.getPreviousComment() != null)
		commentIcon = GlobalVariables.images.commentPrevious;
	else
		commentIcon = GlobalVariables.images.commentEmpty;

	if (question.getManagementComment() != null)
		mgmtCommentIcon = GlobalVariables.images.mgmtcommentFull;
	else if (question.getPreviousManagementComment() != null)
		mgmtCommentIcon = GlobalVariables.images.mgmtcommentPrevious;
	else
		mgmtCommentIcon = GlobalVariables.images.mgmtCommentEmpty;

	if (question.getHelp() != null) {
		helpIconHtml = '<img class="helpIcon questionButtonIcon" src="' + GlobalVariables.images.help + '" title="' + question.getHelp() + '"/>';
	}

	if (question.getPersistent() != null) {
		var persistent = question.getPersistent();
		var persistentIcon = null;
		var tooltip = "";

		if (persistent == 'hard') {
			persistentIcon = GlobalVariables.images.persistentHard;
			tooltip = GlobalVariables.strings['galassify-questionLayout-23'];
		} else if (persistent == 'soft') {
			persistentIcon = GlobalVariables.images.persistentSoft;
			tooltip = GlobalVariables.strings['galassify-questionLayout-24'];
		} else
			console.error("an unexpected value found for persistent: " + persistent);

		if (persistentIcon != null)
			persistentIconHtml = '<img class="persistentIcon questionButtonIcon" src="' + persistentIcon + '" title="' + tooltip + '"/>';
	}

	var managementCommentText = 'management comment';
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		managementCommentText = 'self-management comment';

	var buttons = ' <span class="noWrap">';
	buttons += '<img class="commentIcon questionButtonIcon" src="' + commentIcon + '" title="' + GlobalVariables.strings['galassify-questionLayout-25'] + '"/>';
	buttons += '<img class="mgmtCommentIcon questionButtonIcon" src="' + mgmtCommentIcon + '" title="Use this to enter a ' + managementCommentText + ' for this question"/>';

	//if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT && LayoutManager.QuestionnaireLayout.showTree == true)// we don't want this on risk judgement page'
	//buttons += '<img class="linkBackIcon questionButtonIcon" src="' + GlobalVariables.images.linkBackIcon + '" title="' + GlobalVariables.strings['galassify-questionLayout-26'] + '"/>';

	buttons += persistentIconHtml;
	buttons += helpIconHtml;
	buttons += '</span>';

	var pAnswerText = '';
	var pAnswer = question.getPreviousAnswer();
	if (pAnswer != null) {
		pAnswerText = '<br/><span class="noWrap previousAnswer">' + GlobalVariables.strings['galassify-questionLayout-27'] + ': ' + pAnswer;
		pAnswerText += '</span>';
	}
	var qText = question.getQuestionText();

	/*
	 if(qText.length > 80) {
	 qText = qText.substr(0, 80) + "<br/>" + qText.substr(80);
	 }
	 */

	var questionText = '<div class="questionTextPanel">' + meta + " " + qText + buttons + pAnswerText + '</div>';
	return questionText;
};

QuestionRenderer._doCommonPostAppendOperations = function(path, question, questionDiv$) {
	var dataPackage = {
		path : path,
		question : question
	};
	questionDiv$.find('> div.questionTextPanel img.questionButtonIcon').click(dataPackage, QuestionRenderer.buttonListener);
	questionDiv$.find('> div.commentTextAreas textarea').change(dataPackage, QuestionRenderer.textBoxListener);

	questionDiv$.find('> div.commentTextAreas textarea').on("click change keyup paste", QuestionRenderer.textBoxCopyPasteListener);

};

QuestionRenderer._getCommentBoxes = function(question) {
	//#CHANGE
	GlobalVariables.strings['galassify-questionLayout-31'] = 'My Action';
	
	var managementCommentText = GlobalVariables.strings['galassify-questionLayout-30'];
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		managementCommentText = GlobalVariables.strings['galassify-questionLayout-31'];
	if (GlobalVariables.catPopulation == 'friends-supporters')
		managementCommentText = GlobalVariables.strings['galassify-questionLayout-30'];
	return '<div class="commentTextAreas">' + '<div class="commentBox"> <span class="commentBoxTitle">' + GlobalVariables.strings['galassify-questionLayout-28'] + '</span><br/><div style="display:none;" class="staticWarning"></div><div style="border: 2px solid red; display: none; margin: 10px 0; padding: 10px;background-color: #ffffe6;" class="copyWarning">dd</div><textarea class="comment"></textarea></div>' + '<div class="previousCommentBox"><span class="previousCommentBoxTitle">' + GlobalVariables.strings['galassify-questionLayout-29'] + '</span><br/><textarea class="comment" readonly="readonly"></textarea></div>' + '<div class="mgmtCommentBox"><span class="mgmtCommentBoxTitle">' + managementCommentText + '</span><br/><div style="display:none;" class="staticWarning"></div><div style="border: 2px solid red; display: none; margin: 10px 0; padding: 10px;background-color: #ffffe6;" class="copyWarning"></div><textarea class="mgmtComment"></textarea></div>' + '<div class="previousMgmtCommentBox"><span class="previousMgmtCommentBoxTitle">' + managementCommentText + ' ' + GlobalVariables.strings['galassify-questionLayout-32'] + '</span><br/><textarea class="mgmtComment" readonly="readonly"></textarea></div>' + '</div>';
};

//TODO: change the name
QuestionRenderer.textBoxListener = function(evt) {
	var path = evt.data.path;
	var question = evt.data.question;
	var code = question.getCode();
	var value = $.trim($(this).val());
	if ($(this).hasClass('comment')) {
		if (value == null || value == '') {
			question.setComment(null);
		} else {
			if (value.length > 2000)
				value = value.substr(0, 2000) + " ...[STRING TRUNCATED AFTER 2000 CHARACTERS]";
			question.setComment(value);
		}

		var commentIcon;
		if (question.getComment() != null)
			commentIcon = GlobalVariables.images.commentFull;
		else if (question.getPreviousComment() != null)
			commentIcon = GlobalVariables.images.commentPrevious;
		else
			commentIcon = GlobalVariables.images.commentEmpty;
		$('div.questionPanel[code="' + code + '"] > div.questionTextPanel img.commentIcon').attr("src", commentIcon);
	} else if ($(this).hasClass('mgmtComment')) {
		if (value == null || value == '') {
			question.setManagementComment(null);
		} else {
			question.setManagementComment(value);
		}

		var mgmtCommentIcon;
		if (question.getManagementComment() != null)
			mgmtCommentIcon = GlobalVariables.images.mgmtcommentFull;
		else if (question.getPreviousManagementComment() != null)
			mgmtCommentIcon = GlobalVariables.images.mgmtcommentPrevious;
		else
			mgmtCommentIcon = GlobalVariables.images.mgmtCommentEmpty;

		$('div.questionPanel[code="' + code + '"] > div.questionTextPanel img.mgmtCommentIcon').attr("src", mgmtCommentIcon);

	}
	//console.log(question);

};
QuestionRenderer.textInputtextBoxListener = function(evt) {
	var code = evt.data.code;
	var value = $.trim($(this).val());
	//console.log(value);
	if ($(this).hasClass('comment')) {
		if (value == null || value == '') {
			//question.setComment(null);
			// how to store these!???
			GlobalVariables.textInputData[code] = null;
		} else {
			if (value.length > 2000)
				value = value.substr(0, 2000) + " ...[STRING TRUNCATED AFTER 2000 CHARACTERS]";
			//question.setComment(value);
			GlobalVariables.textInputData[code] = value;
		}
	}

};

QuestionRenderer.textBoxCopyPasteListener = function(evt) {

	var warningBox$ = $('div.copyWarning', $(this).parent());
	warningBox$.html("").hide(0);

	var containsDateHeadingRegExp = /(19|20)\d\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[\s]+[\=]+/;
	var matches = $(this).val().match(containsDateHeadingRegExp);
	if ($.isArray(matches)) {
		warningBox$.html("<img src='images/exclamation.png'></img> <b>" + GlobalVariables.strings['galassify-questionLayout-33'] + "</b>").show(0);
		//$('<div id="commBoxDateWarning_'+commBoxID+'" style="font-size:8pt; margin-bottom:3px; border:1px solid red; background-color:#FFFFCC; line-height: 130%; padding:5px;"><img src="/images/warning1.png" style="width:15px; height:15px;" /> <em><strong>It looks like you have entered/pasted some historical information into this box. This box is for new information only. If you really wish to include this information here, please remove any date headings from the text.</strong></em></div>' ).insertBefore($(this));
	}
};

QuestionRenderer.buttonListener = function(evt) {
	//console.log(evt);
	//console.log($(this));
	var path = evt.data.path;
	var question = evt.data.question;
	//var commentType;
	var persistentIcon = "";
	if (question.getPersistent() == 'hard')
		persistentIcon = GlobalVariables.images.persistentHard;
	else if (question.getPersistent() == 'soft') {
		persistentIcon = GlobalVariables.images.persistentSoft;
	}
	var staticWarningTxtComment = "<img src=" + persistentIcon + " ></img> - <i>" + GlobalVariables.strings['galassify-questionLayout-34'] + "</i>";
	var staticWarningTxtMgmt = "<img src=" + persistentIcon + " ></img> - <i>" + GlobalVariables.strings['galassify-questionLayout-35'] + "</i>";
	if ($(this).hasClass('commentIcon')) {
		var commentBox$ = $('div.questionPanel[path="' + path + '"] > div.commentTextAreas > div.commentBox');
		var prevCommentBox$ = $('div.questionPanel[path="' + path + '"] > div.commentTextAreas > div.previousCommentBox');
		if (commentBox$.is(":visible")) {
			commentBox$.hide('fast');
			//this automatically triggers change event on textbox.. check if it works in IE
			prevCommentBox$.hide('fast');
		} else {
			if (question.getComment() != null)
				$('textarea', commentBox$).val(question.getComment());
			else
				$('textarea', commentBox$).val('');
			commentBox$.show('fast');
			$('textarea', commentBox$).first().scrollTop(0).focus();

			if (question.getPreviousComment() != null) {

				$('textarea', prevCommentBox$).val(question.getPreviousComment());
				prevCommentBox$.show('fast');
				$('textarea', prevCommentBox$).scrollTop(0);

				var staticWarning$ = $('div.staticWarning', commentBox$);
				if (staticWarning$.html() == '')
					staticWarning$.html(staticWarningTxtComment).show(0);
			}

		}

	} else if ($(this).hasClass('mgmtCommentIcon')) {
		var mgmtCommentBox$ = $('div.questionPanel[path="' + path + '"] > div.commentTextAreas > div.mgmtCommentBox');
		var prevMgmtCommentBox$ = $('div.questionPanel[path="' + path + '"] > div.commentTextAreas > div.previousMgmtCommentBox');
		if (mgmtCommentBox$.is(":visible")) {
			mgmtCommentBox$.hide('fast');
			prevMgmtCommentBox$.hide('fast');
		} else {
			if (question.getManagementComment() != null)
				$('textarea', mgmtCommentBox$).val(question.getManagementComment());
			else
				$('textarea', mgmtCommentBox$).val('');
			mgmtCommentBox$.show('fast');
			$('textarea', mgmtCommentBox$).first().scrollTop(0).focus();
			if (question.getPreviousManagementComment() != null) {

				$('textarea', prevMgmtCommentBox$).val(question.getPreviousManagementComment());
				prevMgmtCommentBox$.show('fast');
				$('textarea', prevMgmtCommentBox$).scrollTop(0);

				var staticWarning$ = $('div.staticWarning', mgmtCommentBox$);
				if (staticWarning$.html() == '')
					staticWarning$.html(staticWarningTxtMgmt).show(0);
			}
		}
	} else if ($(this).hasClass('linkBackIcon')) {
		QuestionRenderer.highlightQuestionInTree(path);
	}

};

QuestionRenderer.highlightQuestionInTree = function(path) {
	if (GlobalVariables.currentLayout != GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT || LayoutManager.QuestionnaireLayout.showTree != true)// we don't want this on risk judgement page'
		return;

	//console.log("path to hightlight: "+path);
	var node = $("#tree").dynatree("getTree").getNodeByKey(path);
	node.activateSilently();

	var activeLi = node.li;
	//console.log(activeLi);
	var calculated = ($(activeLi).offset().top - $('#left-sidebar').offset().top);

	//console.log("zzz: "+$('#left-sidebar').offset().top);
	if (calculated < 0 || calculated > $('#left-sidebar').height()) {
		$('#left-sidebar').animate({
			scrollTop : $(activeLi).offset().top - $('#left-sidebar').offset().top + $('#left-sidebar').scrollTop() - 10
		}, 'fast');
	}
};

QuestionRenderer.addMultipleTicks = function(node, wrapper$, path) {
	//wrapper$.append("BOOM!");
	var wrapperData = "";
	for (var i = 0; i < node.childNodes.length; i++) {
		var childNode = node.childNodes[i];
		if (childNode.nodeType != 1)//only want element nodes
			continue;
		//wrapper$.append(childNode.getAttribute("label"));
		var code = childNode.getAttribute("code");
		var question = GlobalVariables.qt[code];
		var answer = question.getAnswer();

		var valueMgMap = Utilities.getValueMgMapfromLispString(childNode.getAttribute("value-mg"));

		var yesMg = 1;
		//by default. we will override it with value-mg list
		for (var j = 0; j < valueMgMap.length; j++) {
			if (valueMgMap[j].value.toLowerCase() == 'yes') {
				yesMg = valueMgMap[j].mg;
				break;
			}
		}
		var colour = Utilities.getRiskColor(yesMg);
		var isSelected = styleAttrib = "";

		if (answer != null && answer.toLowerCase() == 'yes') {
			isSelected = ' checked ';
			if (Utilities._isDemographicQuestion(path) != true)
				styleAttrib = 'style="background-color:' + colour.back + '; color:' + colour.front + '"';
		}

		wrapperData += '<div class="showinline"><input type="checkbox" code="' + code + '" path="' + path + '" yesMg="' + yesMg + '" value="YES" ' + isSelected + '><span ' + styleAttrib + '>' + childNode.getAttribute("label") + '</span></div>';

	}
	wrapper$.append(wrapperData);
	$("input[type='checkbox']", wrapper$).change(QuestionRenderer.multipleTickListener);

};
QuestionRenderer.multipleTickListener = function(evt) {
	var code = this.getAttribute("code");
	var question = GlobalVariables.qt[code];
	var yesMg = parseFloat(this.getAttribute("yesMg"));
	var path = this.getAttribute("path");
	var thisNode = $(this);
	var textNode$ = $('span', thisNode.parent());

	QuestionRenderer.highlightQuestionInTree(path);

	if (this.checked) {
		question.setAnswer(this.getAttribute("value"), true);
		if (Utilities._isDemographicQuestion(path) != true) {
			var colour = Utilities.getRiskColor(yesMg);
			textNode$.css({
				"background-color" : colour.back,
				"color" : colour.front
			});
		}
	} else {
		question.setAnswer(null, true);
		if (Utilities._isDemographicQuestion(path) != true) {
			textNode$.removeAttr("style");
		}
	}
};
QuestionRenderer.layerAndFilterWithMultipleTickListener = function(evt) {
	//console.log("changed!!");
	var value = $(this).val();
	var question = evt.data.question;
	var node = evt.data.node;
	var wrapper$ = evt.data.wrapper$;
	var oldAnswer = question.getAnswer();
	var path = evt.data.path;
	QuestionRenderer.highlightQuestionInTree(path);
	question.setAnswer(value, true);

	if (value.toLowerCase() == 'yes') {
		wrapper$.show('fast');
	} else if (value.toLowerCase() == 'no' || value.toLowerCase() == 'dk') {

		if (wrapper$.is(":visible")) {
			wrapper$.hide('fast');
		}

	}
	LayoutManager.QuestionnaireLayout._updateProgressBar();
};

QuestionRenderer.layerAndFilterListenerWrapper = function(evt) {
	var context = this;
	var value = $(this).val();
	var resetButtonClicked = false;
	if ($(this).hasClass("resetBox")) {
		value = null;
		resetButtonClicked = true;
	}
	var question = evt.data.question;
	var node = evt.data.node;
	var wrapper$ = evt.data.wrapper$;
	var oldAnswer = question.getAnswer();
	var path = evt.data.path;
	
	
	
	if(resetButtonClicked) {
		var persistent = question.getPersistent();
		if((persistent == 'hard' || persistent == 'soft') && (question.getPreviousAnswer() != null && question.getPreviousAnswer() != '')) {
			console.log(question.getPreviousAnswer());
			// we must reset to previous anser now
			value = question.getPreviousAnswer();
		}
	}
	
	
	//first things first. check if filter was set no, ask user if that was intentional.
	if (question.getQuestionType() == 'filter-q' && oldAnswer != null && oldAnswer.toLowerCase() == 'yes' && (value == null || value.toLowerCase() !='yes') ) {
		var anyAnswer = false;
		for (var i = 0; i < node.childNodes.length; i++) {
			var childNode = node.childNodes[i];
			if (childNode.nodeType != 1)//only want element nodes
				continue;
			if (Utilities.hasAnyAnswer(childNode) == true) {
				anyAnswer = true;
				break;
			}
		}
		//console.log(anyAnswer);
		if (anyAnswer == true) {
			var answerToShow = "";
			if (value == "DK")
				answerToShow = 'don\'t know';
			else if (value == "NO")
				answerToShow = 'no';
			var dialogData;
			if(resetButtonClicked)
				dialogData = (GlobalVariables.strings['galassify-questionLayout-39-reset']);
			else
				dialogData = (GlobalVariables.strings['galassify-questionLayout-39']).replaceAll('######', answerToShow);
			var title = GlobalVariables.strings['galassify-questionLayout-40'];
			$('#dialog-container').html('<div id="dialog-prompt" title="' + title + '">' + dialogData + '</div>');
			$("#dialog-prompt").dialog({
				open : function(event, ui) {
					$(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
				},
				resizable : false,
				height : "auto",
				width : 800,
				closeOnEscape : false,
				modal : true,
				buttons : {
					yes : {
						text : 'Answer should stay "yes"',
						click : function() {
							$(this).dialog("close");
							var name = ($(context).attr('name'));
							$('input[name="' + name + '"][value="YES"]').prop('checked', true);
						}
					},
					no : {
						text : (resetButtonClicked)?'Answer should reset':'Answer should change to "' + answerToShow + '"',
						click : function() {
							$(this).dialog("close");
							QuestionRenderer.layerAndFilterListener.call(context, evt);
						}
					},
					cancel : {
						text : 'Cancel',
						click : function() {
							$(this).dialog("close");
							var name = ($(context).attr('name'));
							$('input[name="' + name + '"][value="YES"]').prop('checked', true);
						}
					}
				}
			});
		} else
			QuestionRenderer.layerAndFilterListener.call(context, evt);
	} else
		QuestionRenderer.layerAndFilterListener.call(context, evt);
};

QuestionRenderer.layerAndFilterListener = function(evt) {
	var value = $(this).val();
	var resetButtonClicked = false;
	if ($(this).hasClass("resetBox")) {
		value = null;
		resetButtonClicked = true;
	}
	var question = evt.data.question;
	var node = evt.data.node;
	var wrapper$ = evt.data.wrapper$;
	var oldAnswer = question.getAnswer();
	var path = evt.data.path;

	//console.log("starting..... value=");
	//console.log(value);
	QuestionRenderer.highlightQuestionInTree(path);
	
	if(resetButtonClicked) {
		var persistent = question.getPersistent();
		if((persistent == 'hard' || persistent == 'soft') && (question.getPreviousAnswer() != null && question.getPreviousAnswer() != '')) {
			console.log(question.getPreviousAnswer());
			// we must reset to previous anser now
			value = question.getPreviousAnswer();
			console.log("resetting to previous answer for persistent node");
			$('div.reset-notify[path="'+path+'"]').show().effect("highlight", {}, 2000, function() {$(this).hide();});
		}
	}
	
	
	question.setAnswer(value, true);
	
	var hideWarning = node.getAttribute("hideWarningOnResponse");
	if(hideWarning == 'true') {
		$('div#right-questionPanel div.warning-message').hide();
		node.setAttribute("hideWarningOnResponse", "");
	}

	if (value != null && value.toLowerCase() == 'yes') {
		if(GlobalVariables.hideClosedNodesInTree)
			LayoutManager.QuestionnaireLayout.addFilterLayerChildrenNodeInTree(node);

		if (wrapper$.is(':empty')) {
			if (oldAnswer != value)//this is so that it does not show opening animation for layer that are automatically clicked yes on initialisation
				wrapper$.hide(0);

			//console.log("creating elements for children nodes");
			for (var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes[i];
				if (childNode.nodeType != 1)//only want element nodes
					continue;
				QuestionRenderer.traverseTree(node.childNodes[i], wrapper$);
				//console.log(out);
			}

		}
		
		var removeBottomBorder = true;
		if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING) {
			var removeBottomBorder = false;
			for (var i = 0; i < node.childNodes.length; i++) {
				var childNode = node.childNodes[i];
				if (childNode.nodeType != 1)//only want element nodes
					continue;
				if (childNode.getAttribute("showInScreeningTree") != null) {
					removeBottomBorder = true;
					break;
				}
			}
		}
		
		if (removeBottomBorder == false)
			wrapper$.show(0);
		else
			wrapper$.show('fast');

		if (removeBottomBorder == true) {
			setTimeout(function() {
				wrapper$.parent().removeClass('showBottomBorder');
			}, 100);
		}

	} else if (value == null || value.toLowerCase() == 'no' || value.toLowerCase() == 'dk') {
		if(GlobalVariables.hideClosedNodesInTree)
			LayoutManager.QuestionnaireLayout.removeFilterLayerChildrenNodeInTree(node);
		if (wrapper$.is(":visible") && !wrapper$.is(':empty')) {
			wrapper$.hide('fast');
		}
		if (question.getQuestionType() == 'filter-q' && oldAnswer != null && oldAnswer.toLowerCase() == 'yes') {
			//QuestionRenderer._manipulateFilterChildrenQuestions(node, 'disable');
			wrapper$.html('');
		}
		wrapper$.parent().addClass('showBottomBorder');
	}
	
	
	if(resetButtonClicked) {
		console.log(path);
		$('div.questionPanel[path="' + path + '"]  ').each(function(index, domEle) {
			
			if (value != null)
				$('input:radio[name="'+path+'"][value="' + value + '"]', $(this)).prop("checked", true);
			else
				$('input:radio[name="'+path+'"]', $(this)).removeAttr("checked");
		});
	}
	
	LayoutManager.QuestionnaireLayout._updateProgressBar();
};

/**
 * expects the data to be of the form
 * {
 * 		code: "<question code>"
 * 		path: "<path of the node>"
 * 		questionType: "nominal" OR "scale"
 * }
 */
QuestionRenderer.nominalAndScaleListener = function(evt) {
	//var parentContainer$ = $(this).parent(); //only used for nominal
	var value = $(this).val();
	var resetButtonClicked = false;
	if ($(this).hasClass("resetBox")) {
		value = null;
		resetButtonClicked = true;
	}

	var code = evt.data.code;
	var path = evt.data.path;
	var type = evt.data.questionType;
	var node = evt.data.node;
	if (evt.data.hasOwnProperty('disableSavingAnswersToAT') && evt.data.disableSavingAnswersToAT == true) {
		// donot save the answer in AT
		console.log("answer not written in AT");
	} else {
		var question = (GlobalVariables.qt[code]);
		if(resetButtonClicked) {
			var persistent = question.getPersistent();
			if((persistent == 'hard' || persistent == 'soft') && (question.getPreviousAnswer() != null && question.getPreviousAnswer() != '')) {
				console.log(question.getPreviousAnswer());
				// we must reset to previous anser now
				value = question.getPreviousAnswer();
				console.log("resetting to previous answer for persistent node");
				$('div.reset-notify[path="'+path+'"]').show().effect("highlight", {}, 2000, function() {$(this).hide();});
			}
			
		}
		
		console.log(code + '=' + value);
		question.setAnswer(value, true);
		QuestionRenderer.highlightQuestionInTree(path);
	}

	$('div.questionPanel[code="' + code + '"]  ').each(function(index, domEle) {
		var thispath = $(this).attr("path");
		var thisValueMgList = $(this).data('valueMgMap');
		if (thisValueMgList == null && type == 'scale') {
			var valueMgLispString = $(this).data('valueMgLispString');

			if (valueMgLispString == '((0 0) (10 1))')
				mg = parseFloat(value) / 10.0;
			else if (valueMgLispString == '((0 1)(10 0))')
				mg = 1.0 - parseFloat(value) / 10.0;
			var color = Utilities.getRiskColor(mg);
		} else {
			var mg = (GlobalVariables.qt[code]).calculateValueMg(value, thisValueMgList);
			var color = Utilities.getRiskColor(mg);
		}

		//if (thispath != path) 
		{//we want questions other than the one that was clicked on.
			$("input:radio", $(this)).removeAttr("checked");
			if (value != null)
				$('input[value="' + value + '"]', $(this)).prop("checked", true);

		}

		if (Utilities._isDemographicQuestion(thispath) == false) {//we only want to change colours for non-demographic questions
			if (type == 'scale') {
				if (value == 'DK' || value == 'dk' || value == null) {
					$("div.scaleAnswerHolder", $(this)).each(function(index, domEle) {
						var bCol = $(this).attr("origBackCol");
						var fCol = $(this).attr("origFrontCol");
						$(this).css("background-color", bCol).css("color", fCol);
					});
					if (value == null) {
						$("input:radio", $(this)).removeAttr("checked");
					}
				} else {
					$("div.scaleAnswerHolder", $(this)).not(".dkBox").not(".resetBox").css("background-color", color.back).css("color", color.front);
				}
			
			
			} else if (type == 'nominal') {
				$("span.nominalValueHolder", $(this)).each(function(index, domEle) {
					$(this).css("background-color", '').css("color", '');
					if (!(value == 'DK' || value == 'dk' || value == null) && $('input', $(this)).val() == value)
						$(this).css("background-color", color.back).css("color", color.front);

				});
				if (value == null) {
					$("input:radio", $(this)).removeAttr("checked");
				}
			}
		}

	});
	LayoutManager.QuestionnaireLayout._updateProgressBar();
	//return false;
};

/**
 * expects the data to be of the form
 * {
 * 		code: "<question code>"
 * 		path: "<path of the node>"
 * 		questionType: "number" OR "date"
 * }
 */
QuestionRenderer.numberAndDateTypeAnswerListener = function(evt) {
	var value = $.trim($(this).val());
	var code = evt.data.code;
	var path = evt.data.path;
	var type = evt.data.questionType;
	var node = evt.data.node;

	console.log(code + '=' + value);
	QuestionRenderer.highlightQuestionInTree(path);
	if (value == '') {
		$('input:radio[name="' + path + '"]').prop('checked', false);
		$('div#errorDialog', 'div.questionPanel[path="' + path + '"]').hide('fast');
		(GlobalVariables.qt[code]).setAnswer(null, true);
		$('input:text', 'div.questionPanel[code="' + code + '"]').val('');
		//set all repeating questions with the same answer
		$('input:radio', 'div.questionPanel[code="' + code + '"]').prop('checked', false);
		$('input:text', 'div.questionPanel[code="' + code + '"]').css("background-color", '').css("color", '');
	} else if (value == 'DK' || value == 'dk') {
		$('input:text[name="' + path + '"]').val("");
		$('div#errorDialog', 'div.questionPanel[path="' + path + '"]').hide('fast');
		(GlobalVariables.qt[code]).setAnswer(value, true);
		$('input:text', 'div.questionPanel[code="' + code + '"]').val('');
		//set all repeating questions with the same answer
		$('input:radio', 'div.questionPanel[code="' + code + '"]').prop('checked', true);
		$('input:text', 'div.questionPanel[code="' + code + '"]').css("background-color", '').css("color", '');
	} else {

		//console.log(evt);
		var validatorFunction;
		if (type.substr(0, 4) == 'date')
			validatorFunction = QuestionRenderer._validateDate;
		else if (type == 'integer') {
			value = parseInt(value);
			validatorFunction = function(answer) {
				return $.isNumeric(answer);
			};
		} else if (type == 'real') {
			value = parseFloat(value);
			validatorFunction = function(answer) {
				return $.isNumeric(answer);
			};
		} else {
			console.error("This should not have happend... the question type is unknown");
		}

		if (validatorFunction(value) == true) {

			$('div#errorDialog', 'div.questionPanel[path="' + path + '"]').hide('fast');
			$(this).val(value);
			(GlobalVariables.qt[code]).setAnswer(value, true);

			$('div.questionPanel[code="' + code + '"]  ').each(function(index, domEle) {
				//var thispath = $(this).attr("path");
				$('input:text', this).val(value);
				//set all repeating questions with the same answer
				$('input:radio', this).prop('checked', false);

				if (Utilities._isDemographicQuestion(path) == false) {
					var valueMgLispString = $(this).data('valueMgLispString');
					var mg = (GlobalVariables.qt[code]).calculateValueMg(value, Utilities.getValueMgMapfromLispString(valueMgLispString));
					var color = Utilities.getRiskColor(mg);
					$('input:text', this).css("background-color", color.back).css("color", color.front);
				}
			});
			//let's do answer constraint stuff here
			var question = GlobalVariables.qt[code];
			var answer = value;
			var answerConstraint = question.getAnswerConstraint();
			if (answerConstraint != null) {
				console.log("answer constraint found!");
				var result = Utilities.validateAnswerConstraint(answer, answerConstraint);
				if (result == false) {
					//console.log("answer contraint not satisfied for " + key);
					var targetAnswer = (GlobalVariables.qt[answerConstraint.targetNodeCode]).getAnswer();

					var reason = GlobalVariables.strings['galassify-questionLayout-36'] + " " + answer + ". " + GlobalVariables.strings['galassify-questionLayout-37'] + " " + answerConstraint.operatorInEnglish + " " + targetAnswer;
					$('div#errorDialog', 'div.questionPanel[path="' + path + '"]').html(reason).show('fast');
				} else
					$('div#errorDialog', 'div.questionPanel[path="' + path + '"]').hide('fast');
			}

		} else {
			$('div#errorDialog', 'div.questionPanel[path="' + path + '"]').html(GlobalVariables.strings['galassify-questionLayout-38']).show('fast');
			//TODO: use this later addClass('ui-state-error'));
		}

	}
	LayoutManager.QuestionnaireLayout._updateProgressBar();
};

/*
 * returns true if the answer passed could be parsed as a date. false otherwise
 */
QuestionRenderer._validateDate = function(answer) {
	if ($.isNumeric(answer) == false)
		return false;

	if (answer.length == 4 && answer > 1800 && answer < 2099) {
		return true;
	} else if (answer.length == 6) {
		var temp_month = answer.substr(0, 2);
		var temp_year = answer.substr(2, 4);
		if (temp_month > 0 && temp_month <= 12 && temp_year > 1800 && temp_year < 2099) {
			if(moment(answer, 'MMYYYY', true).isValid())
				return true;
			else
				return false;
		}
		else
			return false;
	} else if (answer.length == 8) {
		var temp_day = (answer.substr(0, 2));
		var temp_month = (answer.substr(2, 2));
		var temp_year = answer.substr(4, 4);
		if (temp_month > 0 && temp_month <= 12 && temp_day > 0 && temp_day <= 31 && temp_year > 1800 && temp_year < 2099) {
			if(moment(answer, 'DDMMYYYY', true).isValid())
				return true;
			else
				return false;
		}
		else
			return false;
	} else {
		return false;
	}
};
