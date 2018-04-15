//*****************************************************************************************
//					STEPPED SCREENING LAYOUT
//*****************************************************************************************


//============================================================================================


//				THIS IS BASED ON ALI'S ALGORITHM WHICH IS NOT GOOD. SO NOT USING ANYMORE.
//				THE CODE IS STILL KEPT IN SO THAT WE MAY COME UP WITH NEW ALGORITHM FOR STEPPED SCREENING AND STILL KEEP THE SAME INTERFACE
//				THIS LAYOUT ISN'T CALLED FROM ANYWHERE IN THE TOOL FOR NOW.	

//============================================================================================




LayoutManager.SteppedScreeningLayout = {};

LayoutManager.setSteppedScreeningLayout = function(inputObj) {

	if (GlobalVariables.currentLayout != GlobalVariables.Layouts.STEPPED_SCREENING) {
		GlobalVariables.previousLayout = GlobalVariables.currentLayout;
		GlobalVariables.currentLayout = GlobalVariables.Layouts.STEPPED_SCREENING;
	}

	//*************** TO DO ***************************
	//TODO:
	if (inputObj !== undefined && inputObj.registerNewNavigation == false)
		LayoutNavigator.addNewLayoutToHistoryOnly((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.STEPPED_SCREENING, null);
	else
		LayoutNavigator.addNewLayout((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.STEPPED_SCREENING, null);
	//*************************************************
	var topTitle = "";

	var SteppedScreeningLayoutTemplate = '<div id="top-header"></div>'
	// +            '<div id="left-sidebar">'
	//	+ '<div id="tree"></div>'
	//+ '</div>'
	+ '<div id="right-questionPanelWrapperSteppedScreening">'
	// +            '<div id="right-instructions"></div>'
	+ '<div><h3>' + topTitle + '</h3></div>' + '<div id="right-questionPanel"></div></div>';
	$('body').removeClass();
	//$('body').addClass("bodyBackground");
	$('body').html(SteppedScreeningLayoutTemplate);
	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();
	//$('#nav-bar-judgement').prop("checked", true);$('#nav-bar').buttonset('refresh');

	//$("#right-questionPanelWrapper2").css("margin-top", (GlobalVariables.headerHeight+5) + 'px');
	$("#right-questionPanelWrapperSteppedScreening").css("margin-top", (GlobalVariables.headerHeight + 5) + 'px');

	//$('#loadingMessage').show(0);
	$('#right-questionPanel').hide(0);

	//this is necessary in case a new tree node was clicked before the previous one had finished loading.
	clearTimeout(window.timer1);
	for (var i = 0; i < GlobalVariables.timerQueueArray.length; i++) {
		clearTimeout(GlobalVariables.timerQueueArray[i]);
	}

	setTimeout(function() {
		var container$ = $('#right-questionPanel');
		container$.html('');
		container$.show(0);
		//QuestionRenderer.traverseTree(catRoot, $('div#right-questionPanel'));
		var headerTemplate = '<div class="questionPanel"></div>';
		var questionDiv$ = $(headerTemplate).appendTo(container$);
		LayoutManager.SteppedScreeningLayout.renderQuestion(GlobalVariables.screeningTreeJson, questionDiv$);

	}, 1);

	LayoutManager.dealWithAvatar();
};

LayoutManager.SteppedScreeningLayout.renderQuestion = function(screeningJsonNode, questionDiv$) {
	var code = screeningJsonNode.code;
	var path = screeningJsonNode.path;
	var question = GlobalVariables.qt[code];
	if (question == undefined)
		return;
	var qType = question.getQuestionType();
	//console.log(qType);
	if (qType != 'filter-q' && qType != 'layer')
		return;

	questionDiv$.attr("path", path);
	questionDiv$.attr("code", code);
	var questionText = QuestionRenderer._getQuestionTextDiv(question, null);
	var answerInLowercase = question.getAnswer();
	if (answerInLowercase != null)
		answerInLowercase = answerInLowercase.toLowerCase();

	var isYesChecked = isNoChecked = isDkChecked = '';

	if (answerInLowercase == 'yes')
		isYesChecked = ' checked="checked" ';
	else if (answerInLowercase == 'no')
		isNoChecked = ' checked="checked" ';
	else if (answerInLowercase == 'dk')
		isDkChecked = ' checked="checked" ';

	var disabled = "";
	if (question.isDisabled())
		disabled = ' disabled="disabled" ';

	var answerText = '<label><input type="radio" name="' + path + '" value="YES" ' + isYesChecked + disabled + '>yes</label>';
	answerText += '<label><input type="radio" name="' + path + '" value="NO" ' + isNoChecked + disabled + '>no</label>';
	if (qType == 'filter-q')
		answerText += '<label><input type="radio" name="' + path + '" value="DK" ' + isDkChecked + disabled + '>don\'t know</label>';

	answerText = '<div class="answerPanel">' + answerText + '</div>';

	var commentBoxes = QuestionRenderer._getCommentBoxes(question);
	questionDiv$.addClass('steppedScreening').prepend(questionText + answerText + commentBoxes + '<div class="question-panel-for-border"></div>');
	var childQuestionDiv = '<div class="questionPanel"></div>';
	var childQuestionDiv$ = $(childQuestionDiv).appendTo(questionDiv$);

	//questionDiv$.data(screeningJsonNode);

	var dataPackage = {
		question : question,
		screeningJsonNode : screeningJsonNode,
		path : path,
		childQuestionDiv$ : childQuestionDiv$
	};
	questionDiv$.find('input:radio[name="' + path + '"]').change(dataPackage, LayoutManager.SteppedScreeningLayout.yesNoListener);

	QuestionRenderer._doCommonPostAppendOperations(path, question, questionDiv$);

	//if question already answered
	if (question.getAnswer() != null && question.getAnswer() != "")
		LayoutManager.SteppedScreeningLayout.renderChildren(question.getAnswer(), dataPackage);

	//add avatar on info icon
	QuestionRenderer._showAvatarForInfoIconInQuestions(questionDiv$);
};

LayoutManager.SteppedScreeningLayout.yesNoListener = function(evt) {
	var value = $(this).val();
	LayoutManager.SteppedScreeningLayout.renderChildren(value, evt.data);

};

LayoutManager.SteppedScreeningLayout.renderChildren = function(answerValue, dataPackage) {
	var question = dataPackage.question;
	var screeningJsonNode = dataPackage.screeningJsonNode;
	var childQuestionDiv$ = dataPackage.childQuestionDiv$;
	var oldAnswer = question.getAnswer();
	var path = dataPackage.path;

	question.setAnswer(answerValue);
	childQuestionDiv$.html("");
	if (answerValue.toLowerCase() == 'yes' || answerValue.toLowerCase() == 'no') {
		var nextNode = (answerValue.toLowerCase() == 'yes') ? screeningJsonNode.yes : screeningJsonNode.no;
		var noMoreToShow = false;
		//console.log(nextNode);
		if (nextNode != undefined) {
			var question = GlobalVariables.qt[nextNode.code];
			if (question != undefined) {
				var qType = question.getQuestionType();
				if (qType == 'filter-q' || qType == 'layer')
					LayoutManager.SteppedScreeningLayout.renderQuestion(nextNode, childQuestionDiv$);
				else
					noMoreToShow = true;
			} else
				noMoreToShow = true;
		} else
			noMoreToShow = true;
		if (noMoreToShow)
			childQuestionDiv$.html("<h3>You have answered all the questions.</h3>");
	} else if (answerValue.toLowerCase() == 'dk') {
		var dkResponse = "<h3>This is fast track screening and only works if you know all the answers. If you don't then you should use standard screening (link below).</h3>";
		dkResponse += '<a id="standard-screening">Standard Screening</a>';
		childQuestionDiv$.html(dkResponse);
		$('#standard-screening').button().click(function() {
			LayoutManager.setupScreeningOnly();
		});
	}
};

