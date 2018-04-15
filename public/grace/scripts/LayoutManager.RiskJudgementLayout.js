//*****************************************************************************************
//					RISK JUDGEMENT LAYOUT
//*****************************************************************************************
LayoutManager.RiskJudgementLayout = {};
LayoutManager.RiskJudgementLayout.CopyPasteButtonsAdded = false;
LayoutManager.setRiskJudgementLayout = function(inputObj) {
	if (GlobalVariables.currentLayout != GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
		GlobalVariables.previousLayout = GlobalVariables.currentLayout;
		GlobalVariables.currentLayout = GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT;
	}
	else {
		//if risk judgement clicked when it is already open. ignore the click. 
		LayoutNavigator.goBack();
		return;
	}
	LayoutManager.RiskJudgementLayout.CopyPasteButtonsAdded = false;
	
	if (inputObj !== undefined && inputObj.registerNewNavigation == false)
		LayoutNavigator.addNewLayoutToHistoryOnly((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT, null);
	else
		LayoutNavigator.addNewLayout((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT, null);

	var topTitle;
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		if(GlobalVariables.catPopulation == 'friends-supporters')
			topTitle = GlobalVariables.strings['galassify-riskjudgeLayout-1'];
		else
			topTitle = GlobalVariables.strings['galassify-riskjudgeLayout-2'];
		
	} else
		topTitle = GlobalVariables.strings['galassify-riskjudgeLayout-3'];

	var riskJudgementLayoutTemplate = '<div id="top-header"></div>'
	// +        '<div id="left-sidebar">'
	//	+ '<div id="tree"></div>'
	//+ '</div>'
	+ '<div id="right-questionPanelWrapperRiskJudgement">'
	// +        '<div id="right-instructions"></div>'
	+ '<div><h3>' + topTitle + '</h3></div>' + '<div id="right-questionPanel"></div><div id="risk-formulation-area" style="display:none;"></div>' + '</div>';
	$('body').removeClass();
	//$('body').addClass("bodyBackground");
	$('body').html(riskJudgementLayoutTemplate);
	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();
	//$('#nav-bar-judgement').prop("checked", true);$('#nav-bar').buttonset('refresh');

	//$("#right-questionPanelWrapper2").css("margin-top", (GlobalVariables.headerHeight+5) + 'px');
	$("#right-questionPanelWrapperRiskJudgement").css("margin-top", (GlobalVariables.headerHeight + 5) + 'px');

	//TODO: should we display this?
	// more css designs at: http://www.jankoatwarpspeed.com/css-message-boxes-for-different-message-types/
	//$('#right-instructions').css("margin-top", GlobalVariables.headerHeight +10+ 'px').html("<div><i>A little information explaining what is this screen and how they should use it, encouraging them to put in comments where necessary and what they should do after finishing this screen</i></div>");

	$('#loadingMessage').show(0);
	$('#right-questionPanel').hide(0);

	//this is necessary in case a new tree node was clicked before the previous one had finished loading.
	clearTimeout(window.timer1);
	for (var i = 0; i < GlobalVariables.timerQueueArray.length; i++) {
		clearTimeout(GlobalVariables.timerQueueArray[i]);
	}
	LayoutManager.QuestionnaireLayout.showScreeningMarker = false;
	setTimeout(function() {
		$('#right-questionPanel').html('');
		$('#right-questionPanel').show(0);
		window.startTime = new Date().getTime();
		var catRoot = GlobalVariables.cat.documentElement;
		QuestionRenderer.traverseTree(catRoot, $('div#right-questionPanel'));
		// copy comment button is added in the method: QuestionRenderer._callAfterQuestionsHaveBeenRendered()
	}, 1);

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#risk-formulation-area').html(GlobalVariables.htmlFragments.riskJudementNotes);

	setTimeout(function() {
		//we need different text for icon etc when in risk judgment mode.
		if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
			$('div.questionTextPanel img.commentIcon').prop('title', GlobalVariables.strings['galassify-riskjudgeLayout-4']);
			$('div.questionTextPanel img.mgmtCommentIcon').prop('title', GlobalVariables.strings['galassify-riskjudgeLayout-5']);

			$('div.questionPanel div.commentTextAreas span.commentBoxTitle').html(GlobalVariables.strings['galassify-riskjudgeLayout-6']);
			$('div.questionPanel div.commentTextAreas span.previousCommentBoxTitle').html(GlobalVariables.strings['galassify-riskjudgeLayout-7']);

			$('div.questionPanel div.commentTextAreas span.mgmtCommentBoxTitle').html(GlobalVariables.strings['galassify-riskjudgeLayout-8']);
			$('div.questionPanel div.commentTextAreas span.previousMgmtCommentBoxTitle').html(GlobalVariables.strings['galassify-riskjudgeLayout-9']);

		}
	}, 100);

	LayoutManager.dealWithAvatar();
};

LayoutManager.RiskJudgementLayout.addCopyPasteButton = function(questionPanelDiv) {
	var code = questionPanelDiv.getAttribute('code');
	var questionPanelDiv$ = $(questionPanelDiv);
	//add the button here next to mgmt box and set its prop to display: inline-block; AND vertical-align: top;
	//will need to add css entries
	//console.log(code);

	/*
	 var tempActionsObject = new Array();
	 tempActionsObject.push({code:'suic',lable:'plans and methods for ending your lifeg your lifeg your lifeg your life', mgmtComment:"some self management comment 1g your lifeg your lifeg your lifeg your lifeg your lifeg your lifeg your lifeg your life"});
	 tempActionsObject.push({code:'code2',lable:'label2', mgmtComment:"comment2"});
	 tempActionsObject.push({code:'code3',lable:'label3', mgmtComment:"comment3"});
	 */
	var mgmtCommentsObj = Utilities.getManagementCommentsForCopyPasteDropDownList(code);

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		var toolTipData = GlobalVariables.strings['galassify-riskjudgeLayout-10'];
	else
		var toolTipData = GlobalVariables.strings['galassify-riskjudgeLayout-11'];

	var iconData = '<img class="helpIcon questionButtonIcon" src="' + GlobalVariables.images.help + '" title="' + toolTipData + '"/>';

	var tempData = '<div id="jui-dropdown-' + code + '">';
	tempData += '<div id="jui-launcher-' + code + '-container"><button id="jui-launcher-' + code + '">'+GlobalVariables.strings['galassify-riskjudgeLayout-12']+'<br/><small>'+GlobalVariables.strings['galassify-riskjudgeLayout-13']+'</small></button>' + iconData + '</div>';

	tempData += '<ul id="jui-menu-' + code + '">';

	var maxLableLengthAllowed = 34;
	var maxCommentLengthAllowed = 68;
	for (var i = 0; i < mgmtCommentsObj.length; i++) {
		var tempLable = mgmtCommentsObj[i].lable;
		var tempComment = mgmtCommentsObj[i].mgmtComment;
		if (tempLable.length > maxLableLengthAllowed)
			tempLable = tempLable.slice(0, (maxLableLengthAllowed - 3)) + '...';

		if (tempComment.length > maxCommentLengthAllowed)
			tempComment = tempComment.slice(0, (maxCommentLengthAllowed - 3)) + '...';

		tempData += '<li id="qcode-' + mgmtCommentsObj[i].code + '"><a href="javascript:void(0);"><b>' + tempLable + '</b><br>' + tempComment + '</a></li>';
		if (i < mgmtCommentsObj.length - 1)
			tempData += '<hr>';
	}
	if (mgmtCommentsObj.length == 0) {
		tempData += '<li>'+GlobalVariables.strings['galassify-riskjudgeLayout-14']+'</li>';
	}

	tempData += '</ul></div>';

	$('.mgmtCommentBox', questionPanelDiv$).append(tempData);

	$("#jui-dropdown-" + code, questionPanelDiv$).jui_dropdown({
		launcher_id : 'jui-launcher-' + code,
		launcher_container_id : 'jui-launcher-' + code + '-container',
		menu_id : 'jui-menu-' + code,
		containerClass : 'jui-container',
		menuClass : 'jui-menu',
		onSelect : function(event, data) {
			$("#result").text('index: ' + data.index + ' (id: ' + data.id + ')');
			//console.log(data);
			var qcode = (data.id).substr(6);
			// this is because id is set with prefix qcode-<code>
			var mgmtBox$ = $('textArea.mgmtComment', $(this).parent());
			var question = GlobalVariables.qt[qcode];
			var mgmtComment = question.getManagementComment();

			mgmtBox$.val(mgmtBox$.val() + (mgmtBox$.val() == '' ? '' : '\n') + mgmtComment);
			mgmtBox$.change();
		}
	});
};