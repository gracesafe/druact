function LayoutManager() {
}

LayoutManager.layoutJustBeforeSocnet = null;

/*
 declare a mode-before-socnet
 then use that in revertModemethod to revert to previous mode
 then fix the tree listener so that it does not have multiple events
 tree listener to check which mode is active and continue accordingly
 add code in the listener in questionair layout so that it does its thing only when we are
 in that mode, not to get triggered when in socnet mode as it is happending now.
 */

LayoutManager.classificationRunAtleastOnce = false;
LayoutManager.helpOverviewText = null;
LayoutManager.quickTipText = null;
LayoutManager.myplanHelp = null;
LayoutManager.keyMenuText = null;
LayoutManager.genericPopUpTexts = new Array();
// this stores the text so that ajax request is made only once. subsequent requests use this var.

//also has the risk context selection
LayoutManager.SocnetLayout = {};

LayoutManager.AvatarMsgsDisplayedFor = new Array();
// keeps track of all the avatar layout messages that have been dispalyed.

LayoutManager.mygraceMyLifeLastLayoutMindMapORquestionnair = null;
// used to track if the last displayed layout in my life was a mindmap or questionnair

LayoutManager.clearLayout = function() {
	$('body').html('');
};
/**
 * called when exiting socnet mode
 */
LayoutManager.revertLayoutFromSocnetMode = function() {
	if (LayoutManager.layoutJustBeforeSocnet == GlobalVariables.Layouts.MINDMAP_LAYOUT)
		LayoutManager.setMindMapLayout();
	else if (LayoutManager.layoutJustBeforeSocnet == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT)
		LayoutManager.setRiskJudgementLayout();
	else if (LayoutManager.layoutJustBeforeSocnet == GlobalVariables.Layouts.DETAILED_HELP_LAYOUT)
		LayoutManager.setDetailedHelpLayout();
	else if (LayoutManager.layoutJustBeforeSocnet == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT)
		LayoutManager.setQuestionnaireLayout({
			jsCat : LayoutManager.QuestionnaireLayout._jsCATSelectedFromMindmap
		});
	else if (LayoutManager.layoutJustBeforeSocnet == GlobalVariables.Layouts.FINISHED_LAYOUT)
		LayoutManager.setupFinishedLayout();

};

LayoutManager.setupScreeningAllQuestions = function() {
	//GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC;
	var newJsCat = $.extend(true, {}, GlobalVariables.jsCat);
	Utilities.pruneJsCATforRiskSelection(newJsCat, GlobalVariables.riskSelectionObject.getSelected());
	Utilities.treeUpdateForSpecificORGenericORScreening(newJsCat, ["isSpecificRisk", "isGenericRootNodeInserteredByTool"]);
	LayoutManager.setQuestionnaireLayout({
		jsCat : newJsCat,
		currentQuestionnairMode : GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC,
		showScreeningMarker : true
	});
};

LayoutManager.setupScreeningOnly = function() {
	var screeningJsNode = $.extend(true, {}, GlobalVariables.jsCat);
	Utilities.pruneJsCATforRiskSelection(screeningJsNode, GlobalVariables.riskSelectionObject.getSelected());
	Utilities.treeUpdateForSpecificORGenericORScreening(screeningJsNode, ["showInScreeningTree"]);
	//GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.SCREENING;
	LayoutManager.setQuestionnaireLayout({
		jsCat : screeningJsNode,
		currentQuestionnairMode : GlobalVariables.QuestionnairModes.SCREENING
	});
	
};


LayoutManager.setupSequentialAssessment = function() {
	// GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC;
	var newJsCat = $.extend(true, {}, GlobalVariables.jsCat);
	Utilities.pruneJsCATforRiskSelection(newJsCat, GlobalVariables.riskSelectionObject.getSelected());
	Utilities.treeUpdateForSpecificORGenericORScreening(newJsCat, ["isSpecificRisk", "isGenericRootNodeInserteredByTool"]);
	console.log(newJsCat);
	LayoutManager.setQuestionnaireLayout({
		jsCat : newJsCat,
		currentQuestionnairMode : GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC
	});
};

LayoutManager.setupWellBeingAssessment = function() {
	//GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.WELL_BEING;
	var newJsCat = $.extend(true, {}, GlobalVariables.jsCat);
	Utilities.treeUpdateForWellBeing(newJsCat);
	if (GlobalVariables.catPopulation == 'friends-supporters')
		newJsCat.title = "Wellbeing";
	else
		newJsCat.title = "My Wellbeing";
	LayoutManager.setQuestionnaireLayout({
		jsCat : newJsCat,
		currentQuestionnairMode : GlobalVariables.QuestionnairModes.WELL_BEING
	});
};

LayoutManager.setupHeader = function() {

	$('#top-header').append('<div id="dialog-container"></div><div id="search-dialog-container"></div>').height(GlobalVariables.headerHeight);
	//$('#footer').append('<div id="footer-left">left</div><div id="footer-right">right</div><div id="footer-center">center</div>');

	//var footerColorClass = (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? 'footerGreen' : 'footerBlue';

	//var footerHeight = (GlobalVariables.currentLayout == GlobalVariables.Layouts.OPENING_PAGE_LAYOUT) ? GlobalVariables.footerHeightOpeningPage : GlobalVariables.footerHeight;
	//$('#footer').addClass(footerColorClass).height(footerHeight - 24);
	//footer height - 2*padding -border pixel.

	document.title = GlobalVariables.title;
};

LayoutManager._getRiskContextHtml = function() {
	var catRoot = GlobalVariables.cat.documentElement;
	var contexts = Utilities.getRiskContexts(catRoot);

	var riskContextDropDownBox = '<select id="riskContextSelector">';

	for (var i = 0; i < contexts.length; i++) {
		var isSelected = '';
		if (LayoutManager.MindMapLayout.selectedRiskContextPath == contexts[i].path)
			isSelected = 'selected';
		riskContextDropDownBox += '<option value="' + contexts[i].path + '" ' + isSelected + '>' + contexts[i].label + '</option>';
	}
	riskContextDropDownBox += '</select> ';
	return riskContextDropDownBox;
};

LayoutManager._getMindmapModeHtml = function() {
	var catRoot = GlobalVariables.cat.documentElement;
	var contexts = Utilities.getRiskContexts(catRoot);

	var mindmapModeDropDownBox = '<select id="mindmapModeSelector">';

	for (var key in GlobalVariables.MindMapModes) {
		//console.log(key, GlobalVariables.MindMapModes[key]);
		var isSelected = '';
		if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes[key])
			isSelected = 'selected';
		mindmapModeDropDownBox += '<option value="' + key + '" ' + isSelected + '>' + GlobalVariables.MindMapModes[key] + '</option>';
	}

	mindmapModeDropDownBox += '</select> ';
	return mindmapModeDropDownBox;
};
/*
 LayoutManager._addMenuButtonsInScreeningMode = function() {
 var data = '<div id=menuButtons>';
 data += '<span>Am I safe? When you have finished, these first questions will allow the myGRiST expert panel to assess your safety</span>';

 //data += '<a id="exit-screening" class="rightButton" title="Click here to...[ASK CHRIS]">Finish Screening</a>';
 //data += '<a id="save-button" class="rightButton" title="Click here to save all the answers filled in so far">Save</a>';
 data += '</div>';

 data += '<div id="second-menu-row">';
 data += '<div id="progressBarContainer" style="margin-right:10px"><div id="progressbar" title="This shows the progress"><div class="progress-label">...</div></div><img title="Click on the progress bar to hightlight unanswered questions" src="images/information-frame.png"/></div>';
 //data += '<a id="show-unanswered-button" title="Click here to hightlight unanswered questions">Highlight</a>';
 data += '<a id="save-button" title="Click here to save all the answers filled in so far">Save</a>';
 data += '<a id="suspend-button" title="Click here to suspend this assessment. All answers would be saved and the assessment can be resumed at a later time">Suspend</a>';
 data += '<a id="exit-screening" title="Click here to...[ASK CHRIS]">Finish Screening</a>';

 data += '</div>';

 var patientName = "";
 if(GlobalVariables.patientName != null && GlobalVariables.patientName != '')
 patientName = 'Patient: '+GlobalVariables.patientName;

 data += '<div id="third-menu-row"><span id="notify-warning-panel"></span>';

 data += '</div>';

 $('#top-header').append(data);
 //$('#notify-warning-panel').html("Showing screening questions only.");

 var progressLabel$ = $(".progress-label");
 var progressbar$ = $("#progressbar");

 progressbar$.progressbar({
 value : false,
 change : function() {
 progressLabel$.text(progressbar$.progressbar("value") + "% Questions Answered");
 $('#exit-screening').button( "disable" );
 },
 complete : function() {
 progressLabel$.text("All Questions Answered");

 var answerCount = Utilities.countAnswers(LayoutManager.QuestionnaireLayout._jsCATSelectedFromMindmap, GlobalVariables.qt);
 if(answerCount.answeredQuestion == answerCount.totalQuestions) {
 $('#exit-screening').button( "enable" );
 if(LayoutManager.QuestionnaireLayout.screeningFinishMsgGiven == false) {
 LayoutManager.QuestionnaireLayout.screeningFinishMsgGiven = true;
 //alert("Instructions on what to do next.[ASK CHRIS]");
 LayoutManager._finishScreeningButtonClicked();
 }
 }

 }
 });
 progressbar$.click(function() {
 LayoutManager.QuestionnaireLayout._hightlightUnansweredQuestions();
 });

 // $('#show-unanswered-button').button().click(function() {
 // LayoutManager.QuestionnaireLayout._hightlightUnansweredQuestions();
 // });

 $('#save-button').button().click(function() {
 LayoutManager._saveAssessment();
 });

 $('#suspend-button').button().click(function() {
 LayoutManager._suspendAssessment();
 });

 $('#exit-screening').button().click(function() {
 LayoutManager._finishScreeningButtonClicked();
 //LayoutManager.setMindMapLayout();
 });
 $('#exit-screening').button( "disable" );
 }
 */

LayoutManager._addMenuButtons = function() {

	var patientName = "";
	if (GlobalVariables.patientName != null && GlobalVariables.patientName != '' && GlobalVariables.patientName != 'null')
		patientName = GlobalVariables.patientName;

	var headerColorClass = (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? 'upperBlockinHeaderGreen' : 'upperBlockinHeaderBlue';

	var data = '<div id=upperBlockinHeader class="' + headerColorClass + '"><div id="upperBlockinHeader-left"><span id="upperBlockinHeader-left-person"></span><span id="upperBlockinHeader-left-mode"></span></div><div id="upperBlockinHeader-right">';
	//add help stuff for clinical tool
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
		if (GlobalVariables.currentLayout == GlobalVariables.Layouts.OPENING_PAGE_LAYOUT)
			data += '<a href="#" id="context-help-button">' + (GlobalVariables.strings['galassify-menu-contexthelp-opening-pg']).replace("<br/>", " ") + '</a> | ';
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.MINDMAP_LAYOUT)
			data += '<a href="#" id="context-help-button">' + (GlobalVariables.strings['galassify-menu-contexthelp-mindmap']).replace("<br/>", " ") + '</a> | ';
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT)
			data += '<a href="#" id="context-help-button">' + (GlobalVariables.strings['galassify-menu-contexthelp-questions']).replace("<br/>", " ") + '</a> | ';
	}

	data += '<a id="key-button" href="#" title="' + GlobalVariables.strings['galassify-menu-key-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-key'] + '</a> | ';
	data += '<a href="#" id="preference-button" title="' + GlobalVariables.strings['galassify-menu-pref-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-pref'] + '</a> | ';
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		var tooltip = (GlobalVariables.strings['galassify-menu-overview-tooltip']).replace('######', GlobalVariables.title);
		var text = (GlobalVariables.strings['galassify-menu-overview']).replace('######', GlobalVariables.title);
		data += '<a id="help-overview" href="#" title="' + tooltip + '">' + text + '</a> ';
	} else {
		data += '<a id="help-quickTips" href="#" title="">' + GlobalVariables.strings['galassify-menu-quicktips'] + '</a> | ';
		data += '<a id="help-overview" href="#" title="' + GlobalVariables.strings['galassify-menu-overview-1p-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-overview-1p'] + '</a> ';
	}

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON && GlobalVariables.catPopulation != 'friends-supporters' && patientName != "")
		data += ' | <span id="patient-welcome">' + GlobalVariables.strings['galassify-menu-welcome'] + ': ' + patientName + "</span>";

	data += '</div></div>';
	
	//#CHANGE update this
	GlobalVariables.strings['galassify-menu-homepage-tooltip'] = 'Select this button to go to the home page.';
	
	data += '<div id="logo-container" title="' + GlobalVariables.strings['galassify-menu-homepage-tooltip'] + '"></div>';
	data += '<div id=menuButtons>';

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		var tooltipMyAdvice = (GlobalVariables.catPopulation == 'friends-supporters') ? (GlobalVariables.strings['galassify-menu-my-advice-tooltip-friends']) : (GlobalVariables.strings['galassify-menu-my-advice-tooltip']);
		var tooltipMyAssessment = (GlobalVariables.catPopulation == 'friends-supporters') ? (GlobalVariables.strings['galassify-menu-my-assessment-tooltip-friends']) : (GlobalVariables.strings['galassify-menu-my-assessment-tooltip']);
		var tooltipMyProfile = (GlobalVariables.catPopulation == 'friends-supporters') ? (GlobalVariables.strings['galassify-menu-preview-report-tooltip-friends']) : (GlobalVariables.strings['galassify-menu-preview-report-tooltip']);

		//GlobalVariables.currentMygraceVersionPathways = null;
		if (GlobalVariables.currentMygraceVersionPathways == null) {
			data += '<a id="show-finish-gui" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-finish-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-finish'] + '</a>';
			if(GlobalVariables.ACASstatus == null)
				data += '<a id="suspend-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-suspend-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-suspend'] + '</a>';
			
			//#CHANGE
			if(GlobalVariables.ACASstatus != null)
				data += '<a id="previous-report-button" class="" title="' + 'Click here to view your previous reports.' + '">' + 'Previous<br/>Reports' + '</a>';			
			//data += '<a id="previous-report-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-previous-reports-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-previous-reports'] + '</a>';
			if (LayoutNavigator.isStackEmpty() == false)
				data += '<a id="go-back-top-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-goback-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-goback-top'] + '</a>';
			//data += '<a id="suspend-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-suspend-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-suspend'] + '</a>';
		} else {
			//data += '<a id="goto-homepage-button" title="' + GlobalVariables.strings['galassify-menu-homepage-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-homepage'] + '</a>';
			//#CHANGE the following 
			GlobalVariables.strings['galassify-menu-preview-report'] = 'Review<br/>Answers';
			data += '<a id="my-profile-button" class="special-top-button" title="' + tooltipMyProfile + '">' + GlobalVariables.strings['galassify-menu-preview-report'] + '</a>';
			if (GlobalVariables.catPopulation == 'friends-supporters') {
				data += '<a id="risk-judgement-button" class="special-top-button" title="' + tooltipMyAssessment + '">' + GlobalVariables.strings['galassify-menu-my-assessment-friends'] + '</a>';
				data += '<a id="my-advice-button" class="special-top-button" title="' + tooltipMyAdvice + '">' + GlobalVariables.strings['galassify-menu-my-advice-friends'] + '</a>';
			} else {
				data += '<a id="risk-judgement-button" class="special-top-button" title="' + tooltipMyAssessment + '">' + GlobalVariables.strings['galassify-menu-my-assessment'] + '</a>';
				data += '<a id="my-advice-button" class="special-top-button" title="' + tooltipMyAdvice + '">' + GlobalVariables.strings['galassify-menu-my-advice'] + '</a>';
			}

			data += '<a id="show-finish-gui" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-finish-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-finish'] + '</a>';
			if(GlobalVariables.ACASstatus == null)
				data += '<a id="suspend-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-suspend-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-suspend'] + '</a>';
			data += '<a id="save-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-save-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-save'] + '</a>';
			data += '<a id="go-back-top-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-goback-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-goback-top'] + '</a>';
			if ((GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE
				|| GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_NO_PADLOCK
				|| GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_SILVER_PADLOCK
				|| GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_GOLD_PADLOCK) && (GlobalVariables.currentLayout != GlobalVariables.Layouts.MINDMAP_LAYOUT)) {
				//data += '<a id="return-to-mindmap-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-return-mindmap-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-return-mindmap'] + '</a>';
				data += '<a id="return-to-mindmap-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-return-mindmap-tooltip'] + '">' + '<img style="display: inline-block; height: 30px" src="images/mind_map_small.png"></img><div style="display: inline-block;margin-left: 5px;">' + GlobalVariables.strings['galassify-menu-return-mindmap'] + '</div></a>';
			}
		}

		//right aligned buttons

	} else if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {

		if (GlobalVariables.currentClinicianVersionPathway == null) {
			//we are in opening page. don't show any options

			//data += '<a id="show-finish-gui" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-finish-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-finish'] + '</a>';
			//data += '<a id="suspend-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-suspend-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-suspend'] + '</a>';
			if (LayoutNavigator.isStackEmpty() == false)
				data += '<a id="go-back-top-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-goback-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-goback-top'] + '</a>';
		} else {
			//data += '<a id="goto-homepage-button" title="' + GlobalVariables.strings['galassify-menu-homepage-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-homepage'] + '</a>';
			data += '<a id="risk-judgement-button" title="' + GlobalVariables.strings['galassify-menu-riskJudgement-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-riskJudgement'] + '</a>';
			data += '<a id="risk-formulation-button" title="' + GlobalVariables.strings['galassify-menu-riskFormulation-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-riskFormulation'] + '</a>';
			data += '<a id="safety-plan-button" title="' + GlobalVariables.strings['galassify-menu-safetyplan-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-safetyplan'] + '</a>';

			//right aligned buttons
			data += '<a id="show-finish-gui" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-finish-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-finish'] + '</a>';
			data += '<a id="suspend-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-suspend-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-suspend'] + '</a>';
			data += '<a id="save-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-save-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-save'] + '</a>';
			data += '<a id="go-back-top-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-goback-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-goback-top'] + '</a>';
			if ((GlobalVariables.currentLayout != GlobalVariables.Layouts.MINDMAP_LAYOUT) && ((GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.FULL_ASSESSMENT) || (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.RAPID_REPEAT_ASSESSMENT))) {
				//data += '<a id="return-to-mindmap-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-return-mindmap-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-return-mindmap'] + '</a>';
				data += '<a id="return-to-mindmap-button" class="rightButton" title="' + GlobalVariables.strings['galassify-menu-return-mindmap-tooltip'] + '">' + '<img style="display: inline-block; height: 30px" src="images/mind_map_small.png"></img><div style="display: inline-block;margin-left: 5px;">' + GlobalVariables.strings['galassify-menu-return-mindmap'] + '</div></a>';
			}

		}
	}

	data += '</div>';

	data += '<div id="third-menu-row"><span id="myguide-container"></span><span id="where-to-next-container"></span><span id="risk-selection-container"></span><span id="show-report-panel"></span><span id="notify-warning-panel"></span>';
	data += '<div id="loadingMessage">' + GlobalVariables.strings['galassify-menu-loading'] + '<img src="images/loader2.gif"></img></div>';
	data += '<div id="savingAnswers">' + GlobalVariables.strings['galassify-menu-saving'] + '<img src="images/loader2.gif"></img></div>';
	data += '</div>';

	$('#top-header').append(data);

	var showRiskSelection = true;
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		showRiskSelection = false;
	else if ((GlobalVariables.currentLayout == GlobalVariables.Layouts.STEPPED_SCREENING) || (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) || ((GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) && ((GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.FULL_ASSESSMENT) || (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.RAPID_REPEAT_ASSESSMENT)))) {

		showRiskSelection = false;
	}

	if (showRiskSelection && GlobalVariables.showRiskSelection) {
		var riskSelectionHtml = '<span style="vertical-align: top;">' + GlobalVariables.strings['galassify-menu-riskselection-header'] + ': </span><select multiple="multiple" placeholder="None" class="riskSelectionBox">';
		for (var i = 0; i < GlobalVariables.riskSelectionObject.riskSelectionArray.length; i++) {
			var riskSelectionObj = GlobalVariables.riskSelectionObject.riskSelectionArray[i];
			riskSelectionHtml += '<option ' + ((riskSelectionObj.selected) ? "selected" : "") + ' value="' + riskSelectionObj.code + '">' + riskSelectionObj.label + '</option>';
		}
		riskSelectionHtml += '</select>';
		riskSelectionHtml += '<img title="' + GlobalVariables.strings['galassify-menu-riskselection-tooltip'] + '" src="images/information-frame.png" class="helpIcon questionButtonIcon">';

		riskSelectionHtml += '';

		//

		$('#risk-selection-container').html(riskSelectionHtml);

		$('.riskSelectionBox').SumoSelect({
			okCancelInMulti : true,
			selectAll : true
		});
		$('.helpIcon').tooltip();
		$('.riskSelectionBox').change(function() {

			var selectedCodes = $(this).val();
			for (var i = 0; i < GlobalVariables.riskSelectionObject.riskSelectionArray.length; i++) {
				var riskSelectionObj = GlobalVariables.riskSelectionObject.riskSelectionArray[i];
				if ($.inArray(riskSelectionObj.code, selectedCodes) != -1)
					riskSelectionObj.selected = true;
				else
					riskSelectionObj.selected = false;
			}

			//lets check if unselected nodes have any answer inside, if so, show warning
			var newJsCat = $.extend(true, {}, GlobalVariables.jsCat);
			Utilities.treeUpdateForSpecificORGenericORScreening(newJsCat, ["isSpecificRisk"]);
			var unselectedRisksWithAnswersInside = new Array();
			var risksLabelsNotAssessed = new Array();
			for (var j = 0; j < newJsCat.children.length; j++) {
				var child = newJsCat.children[j];
				if ($.inArray(child.code, GlobalVariables.riskSelectionObject.getSelected()) == -1) {
					risksLabelsNotAssessed.push(child.title);
					//console.log(child.code);
					var answerCount = Utilities.countAnswers(child, GlobalVariables.qt);
					if (answerCount.answeredQuestion > 0) {
						//console.log("!answers for "+child.code);
						unselectedRisksWithAnswersInside.push(child);
					}
				}
			}

			var redirectAfterRiskSelectionFunction = function() {
				if (GlobalVariables.currentLayout == GlobalVariables.Layouts.MINDMAP_LAYOUT) {
					LayoutManager.setMindMapLayout();
				} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
					LayoutManager.setRiskJudgementLayout();
				} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {

					if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SCREENING_ALL_DATA) {
						LayoutManager.setupScreeningAllQuestions();
					} else if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SCREENING_ONLY) {
						LayoutManager.setupScreeningOnly();
					} else if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SEQUENTIAL_ASSESSMENT) {
						LayoutManager.setupSequentialAssessment();
					}
				}
			};

			if (unselectedRisksWithAnswersInside.length > 0) {
				//we have some un-selected nodes with answers inside them. give a warning!

				//console.log(unselectedRisksWithAnswersInside);
				//we also have a list of risks that are disabled and have an answer inside them

				var warningMsg = '<b>' + GlobalVariables.strings['galassify-menu-riskselection-warning-1'] + ':</b><br/><br/> <i>' + risksLabelsNotAssessed.toString().replaceAll(',', ', ') + '</i><br/><br/>' + GlobalVariables.strings['galassify-menu-riskselection-warning-2'];
				$('#dialog-container').html('<div id="dialog-msg" title="' + GlobalVariables.strings['galassify-menu-riskselection-warning-header'] + '">' + warningMsg + '</div>');

				$("#dialog-msg").dialog({
					modal : true,
					width : '50%',
					close : function(event, ui) {
						$(this).dialog("destroy");
						$('#dialog-container').html('');
						LayoutManager._unfreezeScrollBarInBackground();
						redirectAfterRiskSelectionFunction();
					},
					buttons : {
						cancel : {

							text : 'OK',
							click : function() {
								$(this).dialog("close");
							}
						}
					}
				});
				LayoutManager._freezeScrollBarInBackground();

			} else {
				redirectAfterRiskSelectionFunction();
			}

		});
	}

	//add my-guide button
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {

		if (GlobalVariables.currentLayout != GlobalVariables.Layouts.FINISH_INTERMEDIATE_LAYOUT) {
			var myguideHtml = '<a id="show-myguide-button">' + '<img style="display: inline-block; height: 30px" src="images/popoverBG2_small.jpg"></img><div style="display: inline-block;">' + GlobalVariables.strings['galassify-menu-myguide'].replace(" ", "<br/>") + '</div></a>';
			$('#myguide-container').html(myguideHtml);
			$('#show-myguide-button').button({

			}).click(function() {
				//console.log("click");
				if ($('div.avatarshowing').length == 0)
					$('#top-header').webuiPopover('show');
				else
					$('#top-header').webuiPopover('hide');
			});
			$('#show-myguide-button .ui-button-text').css({
				"font-size" : "small",
				'padding-bottom' : '0.1em',
				'padding-top' : '0.1em'
			});
		}
		var whereToNextString = "";

		if (GlobalVariables.currentLayout == GlobalVariables.Layouts.OPENING_PAGE_LAYOUT)
			whereToNextString = (GlobalVariables.strings['galassify-menu-whereto-openingPage']).replace("######", GlobalVariables.title);
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.MINDMAP_LAYOUT) {
			whereToNextString = GlobalVariables.strings['galassify-menu-whereto-mindmap'];
			if (GlobalVariables.catPopulation == 'friends-supporters')
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-mindmap-friends'];
		} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {
			if(GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.NORMAL || GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC)
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-questionnairNormal'];
			else if(GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.WELL_BEING)
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-questionnair-mysafety'];
			else if(GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING)
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-questionnair-mysafety'];
				
		}
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_OVERVIEW) {
			whereToNextString = GlobalVariables.strings['galassify-menu-whereto-riskOverview'];
			if (GlobalVariables.catPopulation == 'friends-supporters')
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-riskOverview-friends'];
		} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
			whereToNextString = GlobalVariables.strings['galassify-menu-whereto-riskJudgement'];
			if (GlobalVariables.catPopulation == 'friends-supporters')
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-riskJudgement-friends'];
		} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.ADVICE_LAYOUT) {
			whereToNextString = GlobalVariables.strings['galassify-menu-whereto-adviceLayout'];
			if (GlobalVariables.catPopulation == 'friends-supporters')
				whereToNextString = GlobalVariables.strings['galassify-menu-whereto-adviceLayout-friends'];

		}
		if (whereToNextString != '' && GlobalVariables.currentLayout != GlobalVariables.Layouts.OPENING_PAGE_LAYOUT)
			whereToNextString += "<br/><br/>" + GlobalVariables.strings["galassify-menu-whereto-commonToAll"];

		if (whereToNextString != '') {
			var whereToNextHtml = '<a id="whereTo-button"><img style="display: inline-block; height: 30px; width: 0px" src="images/popoverBG2_small.jpg"></img><div style="display: inline-block;">' + GlobalVariables.strings['galassify-menu-whereto'].replace(" ", "<br/>") + '</div></a>';
			$('#where-to-next-container').append(whereToNextHtml);
			$('#whereTo-button').button().click(function() {
			});
			$('#whereTo-button .ui-button-text').css({
				"font-size" : "small",
				'padding-bottom' : '0.1em',
				'padding-top' : '0.1em'
			});
			$('#whereTo-button').webuiPopover(Utilities.createPopOverOptions(GlobalVariables.strings['galassify-menu-whereto'], whereToNextString, {
				placement : 'bottom',
				delay : {
					show : 0,
					hide : 0
				}
			}));

		}
		if ((GlobalVariables.currentLayout != GlobalVariables.Layouts.MINDMAP_LAYOUT)) {
			//var returnToMindMap = '<a id="return-to-mindmap-button">' + GlobalVariables.strings['galassify-menu-return-mindmap'] + '</a>';
			//$('#where-to-next-container').append(returnToMindMap);
			var currentMindmapMode;
			if(GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE)
				currentMindmapMode = GlobalVariables.MindMapModes.FULL;
			else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_NO_PADLOCK)
				currentMindmapMode = GlobalVariables.MindMapModes.RAPID_REPEAT;
			else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_SILVER_PADLOCK)
				currentMindmapMode = GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK;
			else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_GOLD_PADLOCK)
				currentMindmapMode = GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK;
			$('#return-to-mindmap-button').button().click(function() {
				LayoutManager.setMindMapLayout({
					currentMindmapMode : currentMindmapMode
				});
			});

		}

	} else if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
		
		//lets show patient's name
		$('#upperBlockinHeader-left-person').html(GlobalVariables.strings['galassify-menu-welcome-3p']+": "+patientName);
		
		if (GlobalVariables.currentLayout != GlobalVariables.Layouts.OPENING_PAGE_LAYOUT) {
			//show-report-panel
			$('#show-report-panel').append('&nbsp;<a id="show-report-button">' + GlobalVariables.strings['galassify-menu-preview-report-3p'] + '</a>');
			$('#show-report-button').button().click(function() {
				LayoutManager._showReportFromServer();
			});
			$('#show-report-button .ui-button-text').css({
				"font-size" : "small",
				'padding-bottom' : '0.1em',
				'padding-top' : '0.1em'
			});
		}
		if ((GlobalVariables.currentLayout != GlobalVariables.Layouts.MINDMAP_LAYOUT) && ((GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.FULL_ASSESSMENT) || (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.RAPID_REPEAT_ASSESSMENT))) {
			//var returnToMindMap = '<a id="return-to-mindmap-button">' + GlobalVariables.strings['galassify-menu-return-mindmap'] + '</a>';
			//$('#show-report-panel').append(returnToMindMap);
			$('#return-to-mindmap-button').button().click(function() {
				var mindmapMode = (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.RAPID_REPEAT_ASSESSMENT) ? GlobalVariables.MindMapModes.RAPID_REPEAT : GlobalVariables.MindMapModes.FULL;
				LayoutManager.setMindMapLayout({
					currentMindmapMode : mindmapMode
				});
			});
		}

	}

	//some code to set logo and adjust margins based on which logo was used.
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
		//$('#top-header').css('background-image', 'url("grist/images/grace-tree-small.png")').css('background-position', '10px 40px');
		$('#logo-container').html('<img src="grist/images/grace-tree-small.png"/>').click(function() {
			LayoutManager.setOpeningPageLayout();
		});
		;
		$('#menuButtons, #third-menu-row').css('padding-left', '110px');
	} else {
		//$('#top-header').css('background-image', 'url("grist/images/mygracelogo.png")').css('background-position', '10px 40px');
		$('#logo-container').html('<img src="grist/images/mygracelogo.png"/>').click(function() {
			LayoutManager.setOpeningPageLayout();
		});
		;
		$('#menuButtons, #third-menu-row').css('padding-left', '150px');
	}

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		$('#my-advice-button').button().click(function() {
			LayoutManager.setAdviceLayout();
		});

		$('#my-profile-button').button().click(function() {
			LayoutManager.setRiskOverviewLayout();
		});
		$('#go-back-to-my-safety').button().click(function() {
			LayoutManager.setupScreeningOnly();
		});

		$('#go-back-to-mindmap').button().click(function() {
			LayoutManager.setMindMapLayout();
		});

		// class="special-top-button"
		var helpButtonCssObj = {
			'background' : '#d6e7c6',
			'color' : '#3f3731',
			'border' : '1px solid #cdc3b7',
			'font-weight' : 'normal'
		};
		var helpButtonHoverCssObj = {
			'background' : '#f5f0e5',
			'color' : '#a46313',
			'border' : '1px solid #f5ad66',
			'font-weight' : 'normal'
		};
		/*
		$('.special-top-button').css(helpButtonCssObj).hover(function() {
		$( this ).css(helpButtonHoverCssObj);
		}, function() {
		$( this ).css(helpButtonCssObj);
		}
		);
		*/

		//now set selection colour
		if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_OVERVIEW)
			$('#my-profile-button').css(helpButtonHoverCssObj);
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT)
			$('#risk-judgement-button').css(helpButtonHoverCssObj);
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.ADVICE_LAYOUT)
			$('#my-advice-button').css(helpButtonHoverCssObj);
		else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.FINISH_INTERMEDIATE_LAYOUT)
			$('#show-finish-gui').css(helpButtonHoverCssObj);

		//#CHANGE
		var modeMsg = 'Questions selected: ';
		//var modeMsg = GlobalVariables.strings['galassify-menu-mode-msg'];
		if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE) {
				if (GlobalVariables.catPopulation == 'friends-supporters')
					modeMsg += GlobalVariables.strings['galassify-menu-mode-mylife-friends'];
				else
					modeMsg += GlobalVariables.strings['galassify-menu-mode-mylife'];
		}
		else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_NO_PADLOCK) {
			//#CHANGE
			modeMsg += 'Things that can change on a daily basis';
		}
		else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_SILVER_PADLOCK) {
			//#CHANGE
			modeMsg += 'Current life circumstances';
		}
		else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_LIFE_GOLD_PADLOCK) {
			//#CHANGE
			modeMsg += 'Past';
		}
		else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_SAFETY)
			if (GlobalVariables.catPopulation == 'friends-supporters')
				modeMsg += GlobalVariables.strings['galassify-menu-mode-mysafety-friends'];
			else
				modeMsg += GlobalVariables.strings['galassify-menu-mode-mysafety'];
		else if (GlobalVariables.currentMygraceVersionPathways == GlobalVariables.mygraceVersionPathways.MY_WELLBEING)
			if (GlobalVariables.catPopulation == 'friends-supporters')
				modeMsg += GlobalVariables.strings['galassify-menu-mode-mywellbeing-friends'];
			else
				modeMsg += GlobalVariables.strings['galassify-menu-mode-mywellbeing'];
		else if (GlobalVariables.currentMygraceVersionPathways == null)
			modeMsg = '';
		$('#upperBlockinHeader-left-mode').html(modeMsg);

	} else if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {

		$('#context-help-button').click(function(event) {
			event.preventDefault();

			if (GlobalVariables.currentLayout == GlobalVariables.Layouts.MINDMAP_LAYOUT) {
				LayoutManager._genericShowDialogBox(GlobalVariables.strings['galassify-menu-contexthelp-help'], 'grist/html/grist-context-help-mindmap.html');
			} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {
				LayoutManager._genericShowDialogBox(GlobalVariables.strings['galassify-menu-contexthelp-help'], 'grist/html/grist-context-help-questionnair.html');
			} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.OPENING_PAGE_LAYOUT)
				LayoutManager._genericShowDialogBox(GlobalVariables.strings['galassify-menu-contexthelp-help'], 'grist/html/grist-context-help-opening-page.html');
		});

		$('#go-back-to-mindmap').button().click(function() {
			LayoutManager.setMindMapLayout();
		});

		var helpButtonHoverCssObj = {
			'background' : '#f5f0e5',
			'color' : '#a46313',
			'border' : '1px solid #f5ad66',
			'font-weight' : 'normal'
		};
		if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT)
			$('#risk-judgement-button').css(helpButtonHoverCssObj);

		//lets set the current mode information
		var modeMsg = GlobalVariables.strings['galassify-menu-mode-msg-3p'];
		if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SCREENING_ALL_DATA)
			modeMsg += GlobalVariables.strings['galassify-menu-mode-screening-all'];
		else if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SCREENING_ONLY)
			modeMsg += GlobalVariables.strings['galassify-menu-mode-screening'];
		else if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.SEQUENTIAL_ASSESSMENT)
			modeMsg += GlobalVariables.strings['galassify-menu-mode-seq'];
		else if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.FULL_ASSESSMENT)
			modeMsg += GlobalVariables.strings['galassify-menu-mode-full'];
		else if (GlobalVariables.currentClinicianVersionPathway == GlobalVariables.ClinicianVersionPathways.RAPID_REPEAT_ASSESSMENT)
			modeMsg += GlobalVariables.strings['galassify-menu-mode-rapid'];
		else if (GlobalVariables.currentClinicianVersionPathway == null)
			modeMsg = '';

		$('#upperBlockinHeader-left-mode').html(modeMsg);

	}

	$('#loadingMessage, #savingAnswers').hide(0);

	$('#goto-homepage-button').button().click(function() {
		LayoutManager.setOpeningPageLayout();
	});

	$('#preference-button').click(function(event) {
		event.preventDefault();
		LayoutManager._preferenceButtonClicked();

	});

	$('#help-overview').click(function(event) {
		event.preventDefault();
		var boxTitle = (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? (GlobalVariables.strings['galassify-menu-overview-advice'] + ' ' + GlobalVariables.title) : GlobalVariables.strings['galassify-menu-overview-1p'];

		LayoutManager._helpOverviewClicked(boxTitle);
	});
	$('#help-quickTips').click(function(event) {
		event.preventDefault();
		LayoutManager._quickTipClicked();
	});

	$('#key-button').click(function(event) {
		event.preventDefault();
		LayoutManager._KeyMenuButtonClicked();
	});

	$('#show-finish-gui').button().click(function() {
		if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
			//LayoutManager.setFinishIntermediateLayout();
			LayoutManager._finishAssessment();
		}
		else
			LayoutManager._showFinishGui();
	});
	
	$('#previous-report-button').button().click(function() {
		LayoutManager._finishAssessment(true);
	});

	$('#save-button').button().click(function() {
		LayoutManager._saveAssessment();

	});
	$('#suspend-button').button().click(function() {
		LayoutManager._suspendAssessment();
	});
	//make the suspend button look disabled if fe is set to true
	if (GlobalVariables.isfixErrorFlagTrue == true) {
		//$('#suspend-button').button("disable");
		$('#suspend-button').css({
			'opacity' : 0.35
		});
	}

	$('#safety-plan-button').button().click(function() {
		LayoutManager._riskPlanButtonClicked();
	});

	$('#risk-formulation-button').button().click(function() {
		LayoutManager._riskFormulationButtonClicked();
	});

	$('#risk-judgement-button').button().click(function() {
		LayoutManager.setRiskJudgementLayout();
	});

	$('#go-back-top-button').button().click(function() {
		LayoutNavigator.goBack();
	});

	//LayoutManager.addFooter();

	// ***************************************************************************************************
	//								 AVATAR data for top menu buttons
	// ***************************************************************************************************

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		var options = {};
		var suspendButton$ = $('#suspend-button');
		suspendButton$.webuiPopover(Utilities.createPopOverOptions('', suspendButton$.prop('title'), options)).prop('title', '');

		var saveButton$ = $('#save-button');
		saveButton$.webuiPopover(Utilities.createPopOverOptions('', saveButton$.prop('title'), options)).prop('title', '');

		var goBackTopButton$ = $('#go-back-top-button');
		goBackTopButton$.webuiPopover(Utilities.createPopOverOptions('', goBackTopButton$.prop('title'), options)).prop('title', '');

		var finishButton$ = $('#show-finish-gui');
		finishButton$.webuiPopover(Utilities.createPopOverOptions('', finishButton$.prop('title'), options)).prop('title', '');

		var homepageButton$ = $('#logo-container');
		homepageButton$.webuiPopover(Utilities.createPopOverOptions('', homepageButton$.prop('title'), options)).prop('title', '');

		if (GlobalVariables.currentMygraceVersionPathways != null) {
			var myProfileButton$ = $('#my-profile-button');
			myProfileButton$.webuiPopover(Utilities.createPopOverOptions('', myProfileButton$.prop('title'), options)).prop('title', '');

			var myAssessmentButton$ = $('#risk-judgement-button');
			myAssessmentButton$.webuiPopover(Utilities.createPopOverOptions('', myAssessmentButton$.prop('title'), options)).prop('title', '');

			var graceAdviceButton$ = $('#my-advice-button');
			graceAdviceButton$.webuiPopover(Utilities.createPopOverOptions('', graceAdviceButton$.prop('title'), options)).prop('title', '');

			var backSafety$ = $('#go-back-to-my-safety');
			backSafety$.webuiPopover(Utilities.createPopOverOptions('', backSafety$.prop('title'), options)).prop('title', '');
			var backMindmap$ = $('#go-back-to-mindmap');
			backMindmap$.webuiPopover(Utilities.createPopOverOptions('', backMindmap$.prop('title'), options)).prop('title', '');
			var returnToMindmap$ = $('#return-to-mindmap-button');
			returnToMindmap$.webuiPopover(Utilities.createPopOverOptions('', returnToMindmap$.prop('title'), options)).prop('title', '');

		}

	}

};

/**
 * deal with avatar stuff from inside a layout
 */
LayoutManager.dealWithAvatar = function() {
	if (GlobalVariables.currentPopulationBasedMode != GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		return;

	// to manually trigger popup:  $('#top-header').webuiPopover('show');
	// backdrop:true  to make background black

	var options = {
		closeable : true,
		trigger : 'manual',
		width : 400,
		arrow : false,
		placement : 'bottom-left',
		onShow : function($e) {
			$e.addClass("avatarshowing");
		},
		onHide : function($e) {
			$e.removeClass("avatarshowing");
		}
	};
	var optionsBigBox = $.extend(true, {}, options);
	//optionsBigBox.width = 800;

	var avatarHeaders = [];
	if (GlobalVariables.catPopulation == 'friends-supporters') {
		avatarHeaders['mylife'] = GlobalVariables.strings['galassify-menu-mode-mylife-friends'];
		avatarHeaders['mywellbeing'] = GlobalVariables.strings['galassify-menu-mode-mywellbeing-friends'];
		avatarHeaders['mysafety'] = GlobalVariables.strings['galassify-menu-mode-mysafety-friends'];
	} else {
		avatarHeaders['mylife'] = GlobalVariables.strings['galassify-menu-mode-mylife'];
		avatarHeaders['mywellbeing'] = GlobalVariables.strings['galassify-menu-mode-mywellbeing'];
		avatarHeaders['mysafety'] = GlobalVariables.strings['galassify-menu-mode-mysafety'];
		
		//#CHANGE add these to lib
		avatarHeaders['mylife-rapidrepeat'] = 'Things that can change on a daily basis';
		avatarHeaders['mylife-silveronly'] = 'My current life circumstances';
		avatarHeaders['mylife-goldonly'] = 'My past';
	}

	if (GlobalVariables.currentLayout == GlobalVariables.Layouts.OPENING_PAGE_LAYOUT) {
		//if(GlobalVariables.previousLayout == null)
		
		//#CHANGE update this
		GlobalVariables.strings['galassify-avatar-homepage-1st-message'] = "Hello #name#,<br/><br/>There are six pathways you can follow through myGRaCE, depending on what is most important to you today. Hover over the information icon next to the pathways to see what they do.<br/><br/>You can come back to this page to choose a different pathway at any time if you wish, by selecting the GRaCE logo at the top left of the screen.<br/><br/>To get help, select \"My Guide\" on the top left hand side of each page or the \"Where next?\" button.";
		
		var msg = GlobalVariables.strings['galassify-avatar-homepage-1st-message'];
		if (GlobalVariables.catPopulation == 'friends-supporters')
			msg = GlobalVariables.strings['galassify-avatar-homepage-1st-message-friends'];
		$('#top-header').webuiPopover(Utilities.createPopOverOptions('', msg.replace("#name#", GlobalVariables.patientName), options));

		if ($.inArray('homepage-1st-message', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			LayoutManager.AvatarMsgsDisplayedFor.push('homepage-1st-message');
			$('#top-header').webuiPopover('show');
		}

		/*else if($.inArray('homepage-2nd-message',LayoutManager.AvatarMsgsDisplayedFor) == -1 ) {
		 LayoutManager.AvatarMsgsDisplayedFor.push('homepage-2nd-message');
		 $('#top-header').webuiPopover('show');
		 }*/
	} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {
		if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.WELL_BEING) {
			$('#top-header').webuiPopover(Utilities.createPopOverOptions(avatarHeaders['mywellbeing'], GlobalVariables.strings['galassify-avatar-myguide-mylife-questionnair'], optionsBigBox));
		} else if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING) {
			$('#top-header').webuiPopover(Utilities.createPopOverOptions(avatarHeaders['mysafety'], GlobalVariables.strings['galassify-avatar-myguide-mylife-questionnair'], optionsBigBox));
		}
		//root nodes are risk specific and generic
		else if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.NORMAL || GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC) {
			$('#top-header').webuiPopover(Utilities.createPopOverOptions(avatarHeaders['mylife'], GlobalVariables.strings['galassify-avatar-myguide-mylife-questionnair'], optionsBigBox));
		}

		if ($.inArray('mylife-questionnair', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			LayoutManager.AvatarMsgsDisplayedFor.push('mylife-questionnair');
			$('#top-header').webuiPopover('show');
		}
	} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_OVERVIEW) {

		if ($.inArray('myprofile-1st-message', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			var str = GlobalVariables.strings['galassify-avatar-myguide-myprofile-1st-message'];
			if (GlobalVariables.catPopulation == 'friends-supporters')
				str = GlobalVariables.strings['galassify-avatar-myguide-myprofile-1st-message-friends'];
			$('#top-header').webuiPopover(Utilities.createPopOverOptions('Preview Report', str, options));
			LayoutManager.AvatarMsgsDisplayedFor.push('myprofile-1st-message');
			$('#top-header').webuiPopover('show');
		} else if ($.inArray('myprofile-2nd-message', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			var str = GlobalVariables.strings['galassify-avatar-myguide-myprofile-2nd-message'];
			if (GlobalVariables.catPopulation == 'friends-supporters')
				str = GlobalVariables.strings['galassify-avatar-myguide-myprofile-2nd-message-friends'];
			$('#top-header').webuiPopover(Utilities.createPopOverOptions('Preview Report', str, options));
			LayoutManager.AvatarMsgsDisplayedFor.push('myprofile-2nd-message');
			$('#top-header').webuiPopover('show');
		} else {
			$('#top-header').webuiPopover(Utilities.createPopOverOptions('My Profile', GlobalVariables.strings['galassify-avatar-myguide-myprofile-2nd-message'], options));
		}

	} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
		var str = GlobalVariables.strings['galassify-avatar-myguide-myassessment'];
		if (GlobalVariables.catPopulation == 'friends-supporters')
			str = GlobalVariables.strings['galassify-avatar-myguide-myassessment-friends'];
		$('#top-header').webuiPopover(Utilities.createPopOverOptions('My Assessment', str, options));
		if ($.inArray('myassessment', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			LayoutManager.AvatarMsgsDisplayedFor.push('myassessment');
			$('#top-header').webuiPopover('show');
		}
	} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.ADVICE_LAYOUT) {
		var str = GlobalVariables.strings['galassify-avatar-myguide-grace-advice'];
		if (GlobalVariables.catPopulation == 'friends-supporters') {
			str = GlobalVariables.strings['galassify-avatar-myguide-grace-advice-friends'];
			$('#top-header').webuiPopover(Utilities.createPopOverOptions('Safety Plan and GRaCE Advice', str, options));
		} else
			$('#top-header').webuiPopover(Utilities.createPopOverOptions('GRaCE Advice and My Plan', str, options));

		if ($.inArray('grace-advice', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			LayoutManager.AvatarMsgsDisplayedFor.push('grace-advice');
			$('#top-header').webuiPopover('show');
		}
	} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.MINDMAP_LAYOUT) {
		//#CHANGE add these to lib
		GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap-rapidrepeat'] = 'This mind map gives access to those questions with answers that can change on a daily basis, which means there are not so many to answer. <br><br>You can do them all at once by selecting the middle myGRaCE bubble or you can choose particular areas by selecting a single branch without a "no entry" sign.';
		GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap-only-silver'] = 'This mind map gives access to those questions with answers about your current life circumstances such as where you live, your general health, etc. These can change but not usually on a daily basis.<br><br> You can do them all at once by selecting the middle myGRaCE bubble or you can choose particular areas by selecting a single branch without a "no entry" sign.';
		GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap-only-gold'] = 'This mind map gives access to questions about your life history. These don\'t change once you have answered them but may be important for understanding your current situation.<br><br> You can do them all at once by selecting the middle myGRaCE bubble or you can choose particular areas by selecting a single branch without a "no entry" sign.';
		
		var mindmapAvatarText;
		var mindmapAvatarHeader;
		var mindmapAvatarName;
		if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT) {
			mindmapAvatarText = GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap-rapidrepeat'];
			mindmapAvatarHeader = avatarHeaders['mylife-rapidrepeat'];
			mindmapAvatarName = 'mindmap-mylife-rapidrepeat';
		}
		else if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK) {
			mindmapAvatarText = GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap-only-silver'];
			mindmapAvatarHeader = avatarHeaders['mylife-silveronly'];
			mindmapAvatarName = 'mindmap-mylife-silveronly';
		}
		else if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK) {
			mindmapAvatarText = GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap-only-gold'];
			mindmapAvatarHeader = avatarHeaders['mylife-goldonly'];
			mindmapAvatarName = 'mindmap-mylife-goldonly';
		}
		else {
			mindmapAvatarText = GlobalVariables.strings['galassify-avatar-myguide-mylife-mindmap'];
			mindmapAvatarHeader = avatarHeaders['mylife'];
			mindmapAvatarName = 'mindmap-mylife';
		}
		
		$('#top-header').webuiPopover(Utilities.createPopOverOptions(mindmapAvatarHeader, mindmapAvatarText, options));
		if ($.inArray(mindmapAvatarName, LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			LayoutManager.AvatarMsgsDisplayedFor.push(mindmapAvatarName);
			$('#top-header').webuiPopover('show');
		}
	} else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.FINISH_INTERMEDIATE_LAYOUT) {
		$('#top-header').webuiPopover(Utilities.createPopOverOptions(avatarHeaders['mylife'], " ", options));
	}
	else if (GlobalVariables.currentLayout == GlobalVariables.Layouts.STEPPED_SCREENING) {
		$('#top-header').webuiPopover(Utilities.createPopOverOptions(avatarHeaders['mysafety'], GlobalVariables.strings['galassify-avatar-myguide-stepped-screening'], optionsBigBox));		
		if ($.inArray('stepped-screening', LayoutManager.AvatarMsgsDisplayedFor) == -1) {
			LayoutManager.AvatarMsgsDisplayedFor.push('stepped-screening');
			$('#top-header').webuiPopover('show');
		}
	}






	// this closes pop up when mouse is clicked outside!

	$(document).mouseup(function(e) {
		var container = $("div.webui-popover, #show-myguide-button");
		if (!container.is(e.target)// if the target of the click isn't the container...
		&& container.has(e.target).length === 0)// ... nor a descendant of the container
		{
			$('#top-header').webuiPopover('hide');
		}
	});

	//GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.WELL_BEING;

};

LayoutManager.riskForumulationTextBoxListener = function() {
	var value = $.trim($(this).val());
	//console.log(value);
	//console.log(GlobalVariables.overallRiskFormulationDefaultText);
	if ($(this).hasClass('comment')) {
		if (value == null || value == '' || value == $.trim(GlobalVariables.overallRiskFormulationDefaultText)) {
			GlobalVariables.overallRiskFormulationText = null;
		} else {
			if (value.length > 5000)
				value = value.substr(0, 5000) + " ...[STRING TRUNCATED AFTER 5000 CHARACTERS]";
			GlobalVariables.overallRiskFormulationText = value;
		}
	} else if ($(this).hasClass('mgmtComment')) {
		if (value == null || value == '' || value == $.trim(GlobalVariables.overallManagementPlanDefaultText)) {
			GlobalVariables.overallManagementPlanText = null;
		} else {
			if (value.length > 5000)
				value = value.substr(0, 5000) + " ...[STRING TRUNCATED AFTER 5000 CHARACTERS]";
			GlobalVariables.overallManagementPlanText = value;
		}
	}

};

//LayoutManager._showRiskConsensusGUI.assessmentRequest = null; // save it outside
LayoutManager._showRiskConsensusGUI = function(requestText) {
	//process requestText
	var requestText = '<verification mode="top-level-risk-judgements" assessment-cache-id="a random string "><mg-deviations>';
	requestText += '<node code="suic" mg-supplied="0.7" mg-consensual="0.2" mg-deviation-threshold="0.3"/>';
	requestText += '<node code="hto" mg-supplied="0.4" mg-consensual="0.9" mg-deviation-threshold="0.1"/>';
	requestText += '<node code="sh" mg-supplied="0.1" mg-consensual="0.8" mg-deviation-threshold="0.2"/>';
	requestText += '</mg-deviations></verification>';

	// this would be provided to us along with request XML
	var lastAToutputURLused = 'dss-run.php?SID=8re8eijr6bmgrpt1vc9894g846&patient-id=57903&assessment-id=434745&resume=1';
	var consensusResponseUrl = lastAToutputURLused.replace('dss-run.php', 'post-verification-submission.php');

	//console.log(requestText);

	var assessmentRequest = Utilities.parseRiskConsensusRequest(requestText);

	//this won't be necessary in real as the input would already be xml formatted from ajax submit response.
	var assessmentRequestXML = $.parseXML(requestText);

	//LayoutManager._showRiskConsensusGUI.assessmentRequest = assessmentRequest;
	//console.log(assessmentRequest);

	var catRoot = GlobalVariables.cat.documentElement;
	var optionsRadio = '<div id="options-radio">';
	optionsRadio += '<input type="radio" id="radio1" name="radio-options" checked="checked"><label for="radio1">Modify Judgement below and continue with submit</label>';
	optionsRadio += '<br/><input type="radio" id="radio2" name="radio-options"><label for="radio2">Keep Judgment and continue with submit</label>';
	optionsRadio += '<br/><input type="radio" id="radio3" name="radio-options"><label for="radio3">Cancel Submission and go back</label><br/><br/>';
	optionsRadio += '</div>';

	var dialogData = '<div id="fixed-top">Some risk assessments were significantly different from our risk consensus. Please select from one of the following options:<br/><br/>';
	dialogData += optionsRadio;
	dialogData += '</div>';
	dialogData += '<div id="rest-of-it">';

	for (var i = 0; i < assessmentRequest.consensusNodes.length; i++) {
		var catNodeForThisRisk;
		for (var j = 0; j < catRoot.childNodes.length; j++) {
			var child = catRoot.childNodes.item(j);
			if (child.nodeType != 1)//only want element nodes
				continue;
			if (child.getAttribute("code") == assessmentRequest.consensusNodes[i].code) {
				catNodeForThisRisk = child;
				break;
			}
		}

		var colourConsensus = Utilities.getRiskColor(assessmentRequest.consensusNodes[i].mgConsensual);
		var colourUsergiven = Utilities.getRiskColor(assessmentRequest.consensusNodes[i].mgSupplied);
		var riskAssessmentDiv = '<div class="riskAssessmentBox" code="' + assessmentRequest.consensusNodes[i].code + '">';
		//riskAssessmentDiv += '<h3>Risk: '+assessmentRequest.consensusNodes[i].code+'</h3>';
		riskAssessmentDiv += '<div class="questionText"></div>';
		riskAssessmentDiv += '<div class="informationText">For the above question, mg provided by you: <span class="mgColourText" style="color:' + colourUsergiven.front + ';background-color:' + colourUsergiven.back + '">' + assessmentRequest.consensusNodes[i].mgSupplied + '</span> Whereas mg predicted by us: <span class="mgColourText" style="color:' + colourConsensus.front + ';background-color:' + colourConsensus.back + '">' + assessmentRequest.consensusNodes[i].mgConsensual + '</span></div>';
		riskAssessmentDiv += '<div class="interactionText">';
		riskAssessmentDiv += 'What would you like to do:';
		riskAssessmentDiv += '<br/><label><input class="keep-radio" type="radio" value="false" name="change-answer-' + assessmentRequest.consensusNodes[i].code + '"/>Keep my answer</label>';
		riskAssessmentDiv += '<br/><label><input class="change-radio" type="radio" value="true" name="change-answer-' + assessmentRequest.consensusNodes[i].code + '"/>Change my answer</label>';
		riskAssessmentDiv += '</div>';
		riskAssessmentDiv += '<div class="errorMsg" id="interaction-unanswered">[Please tell us if you would like to keep your answer or change it]</div>';
		riskAssessmentDiv += '<div class="questionPanel" code="' + assessmentRequest.consensusNodes[i].code + '" path="' + (Utilities.getPathAsCodes(catNodeForThisRisk)).join("#") + '"></div>';
		riskAssessmentDiv += '<div class="errorMsg" id="question-unanswered">[Please give your new answer]</div>';
		riskAssessmentDiv += '<div class="commentPanel" code="' + assessmentRequest.consensusNodes[i].code + '">';
		riskAssessmentDiv += 'Please tell us why you would like to <span class="keepOrChangeText" style="font-weight: bold">###</span> your answer';
		riskAssessmentDiv += '<div><textarea class="usercomment"></textarea></div>';
		riskAssessmentDiv += '</div>';
		riskAssessmentDiv += '</div>';
		dialogData += riskAssessmentDiv;
	}

	dialogData += '</div>';
	//id="rest-of-it"

	$('#dialog-container').html('<div id="dialog-consensus" title="Risk Assessment[CHANGE]">' + dialogData + '</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-consensus").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		closeOnEscape : false,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {
			cancel : {
				class1 : 'rightButton',
				id : 'dialog-close-button',
				text : 'Cancel submit',
				click : function() {
					$(this).dialog("close");
				}
			},
			resubmit : {
				class1 : 'rightButton',
				id : 'dialog-resubmit-button',
				text : 'Re-submit',
				click : function() {
					var assessmentRequest = $('#dialog-consensus').data('assessmentRequest');
					var allAnswered = true;
					for (var i = 0; i < assessmentRequest.consensusNodes.length; i++) {
						var riskAssessmentBox$ = $('#dialog-consensus div.riskAssessmentBox[code="' + assessmentRequest.consensusNodes[i].code + '"]');
						var changeAnswer = $('input[name="change-answer-' + assessmentRequest.consensusNodes[i].code + '"]:checked', riskAssessmentBox$).val();
						var scaleAnswer = $('div.questionPanel div.answerPanel input:checked', riskAssessmentBox$).val();
						var userComment = $('div.commentPanel textarea.usercomment', riskAssessmentBox$).val();

						assessmentRequest.consensusNodes[i].scaleAnswer = scaleAnswer;
						assessmentRequest.consensusNodes[i].changeAnswer = changeAnswer;
						assessmentRequest.consensusNodes[i].userComment = userComment;
						if (!changeAnswer) {
							allAnswered = false;
							riskAssessmentBox$[0].scrollIntoView();
							$('div.interactionText', riskAssessmentBox$).effect("highlight", {}, 2000);
							$('div.errorMsg#interaction-unanswered', riskAssessmentBox$).show();
						} else if (changeAnswer == 'true' && !scaleAnswer) {
							allAnswered = false;
							//console.log('scale not answered for '+assessmentRequest.consensusNodes[i].code);
							riskAssessmentBox$[0].scrollIntoView();
							$('div.questionPanel', riskAssessmentBox$).effect("highlight", {}, 2000);
							$('div.errorMsg#question-unanswered', riskAssessmentBox$).show();
							//setTimeout( function() { $('div.errorMsg#question-unanswered', riskAssessmentBox$).hide();  }, 3000);
						}
					}

					if (allAnswered == true) {
						console.log("all answered");
						console.log(assessmentRequest);
						console.log(assessmentRequestXML);
						var output = XMLOutput.submitConsensusResponseXML(assessmentRequestXML, assessmentRequest, consensusResponseUrl);
						if (output == true) {
							$(this).dialog("close");
						}

					}

				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();

	//TODO questions should not be italics and grey, they should be bold or some other way to make them prominent.
	// make the dialog box not disappear on esc. also remove close option
	// convert the js object received at the end to xml.

	$('#dialog-consensus #rest-of-it').height($('#dialog-consensus').height() - $('#fixed-top').height());
	$('#dialog-close-button').hide();

	//$("#dialog-consensus #options-radio").buttonset();
	$('#dialog-consensus #options-radio input[type=radio]').change(function() {
		//console.log(this.id);
		if (this.id == 'radio1') {
			$('#dialog-consensus div.riskAssessmentBox div.interactionText').show();
			$('#dialog-consensus div.riskAssessmentBox div.interactionText input:radio').prop('checked', false);
			$('#dialog-consensus div.riskAssessmentBox div.questionPanel,div.commentPanel,div.errorMsg').hide();
			$('#dialog-resubmit-button').show();
			$('#dialog-close-button').hide();

		} else if (this.id == 'radio2') {//keep judgement and submit
			$('#dialog-consensus div.riskAssessmentBox .keep-radio').click();
			$('#dialog-consensus div.riskAssessmentBox div.interactionText,div.errorMsg').hide();
			$('#dialog-consensus div.riskAssessmentBox div.commentPanel').show();
			$('#dialog-resubmit-button').show();
			$('#dialog-close-button').hide();
		} else if (this.id == 'radio3') {
			$('#dialog-consensus div.riskAssessmentBox div.interactionText,div.questionPanel,div.commentPanel,div.errorMsg').hide();
			$('#dialog-resubmit-button').hide();
			$('#dialog-close-button').show();
		}
	});

	for (var i = 0; i < assessmentRequest.consensusNodes.length; i++) {

		//lets get the corresponding node in cat
		var catNodeForThisRisk;
		for (var j = 0; j < catRoot.childNodes.length; j++) {
			var child = catRoot.childNodes.item(j);
			if (child.nodeType != 1)//only want element nodes
				continue;
			if (child.getAttribute("code") == assessmentRequest.consensusNodes[i].code) {
				catNodeForThisRisk = child;
				break;
			}
		}

		var path = (Utilities.getPathAsCodes(catNodeForThisRisk)).join("#");
		var question = GlobalVariables.qt[assessmentRequest.consensusNodes[i].code];

		$('div.riskAssessmentBox[code="' + assessmentRequest.consensusNodes[i].code + '"] div.questionText').text(question.getQuestionText());
		var questionPanelUserGiven$ = $('div.riskAssessmentBox[code="' + assessmentRequest.consensusNodes[i].code + '"] div.questionPanel');
		questionPanelUserGiven$.data("disableSavingAnswersToAT", true);
		QuestionRenderer.outputScaleQuestionView(question, catNodeForThisRisk, path, questionPanelUserGiven$);

		$('#dialog-consensus div.interactionText input:radio[name="change-answer-' + assessmentRequest.consensusNodes[i].code + '"]').change({
			code : assessmentRequest.consensusNodes[i].code
		}, LayoutManager._showRiskConsensusGUI.radioButtonlistener);

	}

	$('.questionTextPanel, .scale-pole-text, .scale-help-text', '#dialog-consensus div.questionPanel').remove();
	$('#dialog-consensus div.questionPanel').css("border", "none");
	$('#dialog-consensus').data('assessmentRequest', assessmentRequest);
	//so we could get to this when a button is clicked in the dialog.
	$('#dialog-consensus').data('assessmentRequestXML', assessmentRequestXML);

};

LayoutManager._showRiskConsensusGUI.radioButtonlistener = function(evt) {
	var value = $(this).val();
	var code = evt.data.code;
	$riskAssessmentBox = $('#dialog-consensus div.riskAssessmentBox[code="' + code + '"]');
	//console.log($riskAssessmentBox);
	if (value == 'true') {
		$('div.questionPanel', $riskAssessmentBox).show(200);
		$('div.commentPanel span.keepOrChangeText', $riskAssessmentBox).html('change');
	} else {
		$('div.questionPanel', $riskAssessmentBox).hide(200);
		$('div.commentPanel span.keepOrChangeText', $riskAssessmentBox).html('keep');
	}
	if ($('div.commentPanel', $riskAssessmentBox).css('display') == 'none')
		$('div.commentPanel', $riskAssessmentBox).show(200);

	$('div.errorMsg', $riskAssessmentBox).hide();
};

LayoutManager._showFinishGui = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');

	var topTitle = thoughtsString = risksString = plansString = null;
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		topTitle = GlobalVariables.strings["galassify-finishgui-title-1p"];
		thoughtsString = GlobalVariables.strings["galassify-finishgui-thoughts-1p"];
		risksString = GlobalVariables.strings["galassify-finishgui-risk-1p"];
		plansString = GlobalVariables.strings["galassify-finishgui-plan-1p"];
	} else {
		topTitle = GlobalVariables.strings["galassify-finishgui-title-3p"];
		thoughtsString = GlobalVariables.strings["galassify-finishgui-thoughts-3p"];
		risksString = GlobalVariables.strings["galassify-finishgui-risk-3p"];
		plansString = GlobalVariables.strings["galassify-finishgui-plan-3p"];

	}

	var dialogData = '<table id="risk-judgement-table" class="tabledesign">' + '<tr class="topRow"><td width="20%">&nbsp;</td> <td width="10%">' + risksString + '</td> <td width="35%">' + thoughtsString + '</td> <td width="35%">' + plansString + '</td> </tr>';

	var catRoot = GlobalVariables.cat.documentElement;
	for (var i = 0,
	    counter = 0; i < catRoot.childNodes.length; i++) {
		var item = catRoot.childNodes.item(i);
		if (item.nodeType != 1)
			continue;
		counter++;
		var code = item.getAttribute("code");

		var label = item.getAttribute("label");
		var question = GlobalVariables.qt[code];
		if (question == null)
			continue;
		var answer = question.getAnswer();
		var comment = question.getComment();
		var management = question.getManagementComment();
		var notGiven = "<i>" + GlobalVariables.strings["galassify-finishgui-notgiven"] + "</i>";
		var idOdd = "";
		if ((counter % 2) == 1)
			idOdd = 'class="odd"';
		if ($.inArray(code, GlobalVariables.riskSelectionObject.getSelected()) == -1) {
			answer = management = comment = GlobalVariables.strings["galassify-finishgui-notassessed"];
		}

		dialogData += '<tr id="sample" ' + idOdd + ' ><td class="column1">' + label + '</td><td>' + ( answer ? answer : notGiven) + '</td><td class="risk-judgement-table-td"><div class="risk-judgement-table-div">' + ( comment ? comment : notGiven) + '</div></td><td class="risk-judgement-table-td"><div class="risk-judgement-table-div">' + ( management ? management : notGiven) + '</div></td></tr>';
	}
	dialogData += '</table>';

	var overallComment = '<h3>' + GlobalVariables.strings["galassify-finishgui-h3"] + ' <img class="helpIcon questionButtonIcon" src="' + GlobalVariables.images.help + '" title="' + GlobalVariables.strings["galassify-finishgui-imgtooltip"] + '"/></h3>';
	overallComment += '<p id="overall-risk-comment-instructions">' + GlobalVariables.strings["galassify-finishgui-overallcomment"] + '</p><textarea id="overall-comment"></textarea>';

	$('#dialog-container').html('<div id="dialog-confirm" title="' + topTitle + '">' + overallComment + dialogData + '</div>');
	if (GlobalVariables.overallRiskComment != null)
		$('#overall-comment').val(GlobalVariables.overallRiskComment);
	$('#overall-comment').change(LayoutManager._overallCommentListener);
	$('img.helpIcon').tooltip();

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.8);
	$("#dialog-confirm").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			// cancel : {
			// // using the word class here causes the program to crash in IE7... can we selectively add this if it is not ie7
			// class1 : 'leftButton',
			// text : 'Cancel',
			// click : function() {
			// $(this).dialog("close");
			// }
			// },

			finish : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-finishgui-button-submit'],
				click : function() {
					$(this).dialog("close");
					LayoutManager._checkIfAnyRiskJudgementWarningsHaveToBeShown(GlobalVariables.riskAssessmentWarningData, function() {
						console.log("ending.");
						LayoutManager._finishAssessment();
					});
				}
			},
			suspend : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-finishgui-button-suspend'],
				click : function() {
					$(this).dialog("close");
					LayoutManager._suspendAssessment();
				}
			},
			modify : {
				class1 : 'rightButton',
				text : (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? GlobalVariables.strings['galassify-finishgui-button-modify-1p'] : GlobalVariables.strings['galassify-finishgui-button-modify-3p'],
				click : function() {
					$(this).dialog("close");
					if (GlobalVariables.currentClinicianVersionPathway == null)
						GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.SEQUENTIAL_ASSESSMENT;
					LayoutManager.setRiskJudgementLayout();
				}
			}
		}
	});
	$('.risk-judgement-table-div').scrollTop(0);
	$('#dialog-confirm').scrollTop(0);

	LayoutManager._freezeScrollBarInBackground();
};

LayoutManager._checkIfAnyRiskJudgementWarningsHaveToBeShown = function(riskAssessmentWarningData, callbackIfOK) {
	var results = Utilities.generateRiskJudementWarning(riskAssessmentWarningData);
	var interruptUser = false;
	var stringOutput;

	//this feature seems to be absent in php tool. so being disabled for now.
	/*
	 if (results.previousJudementPresentButCurrentMissing.length != 0) {
	 interruptUser = true;
	 var culprits = "<ul>";
	 for (var i = 0; i < results.previousJudementPresentButCurrentMissing.length; i++)
	 culprits += "<li>" + results.previousJudementPresentButCurrentMissing[i].riskJudgementLabel + "</li>";
	 culprits += "</ul>";
	 stringOutput = GlobalVariables.strings['galassify-riskjudge-warning-1'] + ":<br/>" + culprits + GlobalVariables.strings['galassify-riskjudge-warning-2'];

	 //var choice=confirm(stringOutput);
	 //if (choice == true)
	 //	callbackIfOK();

	 } else */
	if (results.riskSpecificDataPresentButNoCurrentJudgement.length != 0) {
		interruptUser = true;
		var culprits = "<ul>";
		for (var i = 0; i < results.riskSpecificDataPresentButNoCurrentJudgement.length; i++)
			culprits += "<li>" + results.riskSpecificDataPresentButNoCurrentJudgement[i].riskJudgementLabel + "</li>";
		culprits += "</ul>";
		stringOutput = GlobalVariables.strings['galassify-riskjudge-warning-3'] + ":<br/>" + culprits + GlobalVariables.strings['galassify-riskjudge-warning-4'];

		//var choice=confirm(stringOutput);
		//if (choice == true)
		//callbackIfOK();
	}

	if (interruptUser == true) {
		$('#dialog-container').html('<div id="dialog-ask-user" title="' + GlobalVariables.strings['galassify-riskjudge-warning-5'] + '">' + stringOutput + '</div>');
		var ht = ($(window).height() * 0.8);
		var width = ($(window).width() * 0.5);
		$("#dialog-ask-user").dialog({
			resizable : true,
			//height : ht,
			width : width,
			modal : true,
			close : function(event, ui) {
				$(this).dialog("destroy");
				$('#dialog-container').html('');
				LayoutManager._unfreezeScrollBarInBackground();
			},
			buttons : {
				cancel : {
					class1 : 'rightButton',
					text : GlobalVariables.strings['galassify-riskjudge-warning-6'],
					click : function() {
						$(this).dialog("close");
						if (GlobalVariables.currentClinicianVersionPathway == null)
							GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.SEQUENTIAL_ASSESSMENT;
						LayoutManager.setRiskJudgementLayout();
					}
				},
				ok : {
					class1 : 'rightButton',
					text : GlobalVariables.strings['galassify-riskjudge-warning-7'],
					click : function() {
						$(this).dialog("close");
						// lets set risk judgement to DK for risks that have data but no risk judgement.
						if (results.riskSpecificDataPresentButNoCurrentJudgement.length != 0) {
							for (var i = 0; i < results.riskSpecificDataPresentButNoCurrentJudgement.length; i++) {
								//console.log();
								var question = GlobalVariables.qt[results.riskSpecificDataPresentButNoCurrentJudgement[i].riskJudgementCode];
								question.setAnswer('DK');
							}
						}

						callbackIfOK();

					}
				}
			}
		});
		LayoutManager._freezeScrollBarInBackground();
	} else
		callbackIfOK();

};

LayoutManager._freezeScrollBarInBackground = function() {
	$('body').css('overflow', 'hidden');
	$(window).trigger('resize');
	// this makes sure resize handler for mindmap generator gets called as hiding and showing scrollbars messes up the alignment of nodes.
};

LayoutManager._unfreezeScrollBarInBackground = function() {
	$('body').css('overflow', '');
	$(window).trigger('resize');
};

LayoutManager._overallCommentListener = function(evt) {
	//console.log("called");
	var value = $.trim($(this).val());
	if (value != "")
		GlobalVariables.overallRiskComment = value;
	else
		GlobalVariables.overallRiskComment = null;
};

LayoutManager._helpOverviewClicked = function(boxTitle) {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	$('#dialog-container').html('<div id="dialog-help" title="' + boxTitle + '">Loading help text. Please wait...</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.9);
	$("#dialog-help").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}
			/*
			 finish : {
			 class1 : 'leftButton',
			 text : 'Tell Me More',
			 click : function() {
			 $(this).dialog("close");
			 LayoutManager.setDetailedHelpLayout();
			 }
			 }*/

		}
	});
	LayoutManager._freezeScrollBarInBackground();
	if (LayoutManager.helpOverviewText == null) {
		$.ajax({
			type : "GET",
			cache : false,
			url : GlobalVariables.launchMethod.quickHelpUrl,
			dataType : "html",
			success : function(htmlData) {
				LayoutManager.helpOverviewText = htmlData;
				$('#dialog-help').html(htmlData);
				$("#dialog-help tr:even").not(':first').addClass('odd');
			},
			error : function() {
				console.error('Error occured while downloading quick help');
				$('#dialog-help').html("An error occured while downloading the help file. Please close this window and try again.");
			}
		});
	} else {
		console.log("using local copy");
		$('#dialog-help').html(LayoutManager.helpOverviewText);
		$("#dialog-help tr:even").not(':first').addClass('odd');
	}
};

LayoutManager._quickTipClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	$('#dialog-container').html('<div id="dialog-help" title="Quick Tips">Loading help text. Please wait...</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-help").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();
	if (LayoutManager.quickTipText == null) {
		$.ajax({
			type : "GET",
			cache : false,
			url : 'grist/html/grist-quickTips.html',
			dataType : "html",
			success : function(htmlData) {
				$('#dialog-help').html(htmlData);
				LayoutManager.quickTipText = htmlData;
				//$( "#dialog-help tr:even" ).not(':first').addClass('odd');
			},
			error : function() {
				console.error('Error occured while downloading quick help');
				$('#dialog-help').html("An error occured while downloading the help file. Please close this window and try again.");
			}
		});
	} else {
		console.log("using local copy");
		$('#dialog-help').html(LayoutManager.quickTipText);
	}
};

LayoutManager._genericShowDialogBoxAlertReplacement = function(text, title) {
	if (title == undefined)
		title = "Please Note";
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	$('#dialog-container').html('<div id="dialog-help" title="' + title + '">' + text + '</div>');

	var ht = (300);
	var width = (500);
	$("#dialog-help").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();
};

LayoutManager._genericShowDialogBox = function(title, url) {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	$('#dialog-container').html('<div id="dialog-help" title="' + title + '">Loading. Please wait...</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-help").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();
	if (!( url in LayoutManager.genericPopUpTexts)) {
		$.ajax({
			type : "GET",
			cache : false,
			url : url,
			dataType : "html",
			success : function(htmlData) {
				$('#dialog-help').html(htmlData);
				LayoutManager.genericPopUpTexts[url] = htmlData;
				//$( "#dialog-help tr:even" ).not(':first').addClass('odd');
			},
			error : function() {
				console.error('Error occured while downloading data');
				$('#dialog-help').html("An error occured while downloading a file. Please close this window and try again.");
			}
		});
	} else {
		console.log("using local");
		$('#dialog-help').html(LayoutManager.genericPopUpTexts[url]);
	}
};

LayoutManager._preferenceButtonClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	var temp = '';
	if (GlobalVariables.showHelpTextForScaleQuestions == true)
		temp = 'checked';

	var temp2 = '';
	if (GlobalVariables.showButtonPopover == true)
		temp2 = 'checked';

	var showHelpTextForScale = '<div><input type="checkbox" id="showHelpTextForScale-check-box" value="true" ' + temp + '/>' + GlobalVariables.strings['galassify-pref-1'] + '</div>';
	var showPopOverForButtons = '<div><input type="checkbox" id="showpopover-for-buttons" value="true" ' + temp2 + '/>' + GlobalVariables.strings['galassify-pref-2'] + '</div>';
	var showZoomInfo = '<br/><br/><div>' + GlobalVariables.strings['galassify-pref-3a'] + '<ul><li>' + GlobalVariables.strings['galassify-pref-3b'] + '</li><li>' + GlobalVariables.strings['galassify-pref-3c'] + '</li></ul></div>';

	if (GlobalVariables.currentPopulationBasedMode != GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		showPopOverForButtons = '';

	//lets remove the option to disable avatars. it messes up other interface elements.
	showPopOverForButtons = '';

	$('#dialog-container').html('<div id="dialog-preferences" title="' + GlobalVariables.strings['galassify-pref-title'] + '">' + showHelpTextForScale + showPopOverForButtons + '</div>');
	$('#showHelpTextForScale-check-box', '#dialog-container').click(function() {
		if ($(this).is(':checked'))
			GlobalVariables.showHelpTextForScaleQuestions = true;
		else
			GlobalVariables.showHelpTextForScaleQuestions = false;
	});

	$('#showpopover-for-buttons', '#dialog-container').click(function() {
		if ($(this).is(':checked'))
			GlobalVariables.showButtonPopover = true;
		else
			GlobalVariables.showButtonPopover = false;
	});

	var ht = ($(window).height() * 0.6);
	var width = ($(window).width() * 0.6);
	$("#dialog-preferences").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();
};

LayoutManager._riskPlanButtonClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	var catRoot = GlobalVariables.cat.documentElement;
	var code = catRoot.getAttribute("code");
	var mgmtCommentsObj = Utilities.getManagementCommentsForCopyPasteDropDownList(code);
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		var toolTipData = GlobalVariables.strings['galassify-riskplan-imgtooltip-1p'];
	else
		var toolTipData = GlobalVariables.strings['galassify-riskplan-imgtooltip-3p'];

	var iconData = '<img class="helpIcon questionButtonIcon" src="' + GlobalVariables.images.help + '" title="' + toolTipData + '"/>';
	var tempData = '<div id="jui-dropdown-' + code + '" style="margin-left:0px;margin-bottom:10px;">';
	tempData += '<div id="jui-launcher-' + code + '-container"><button id="jui-launcher-' + code + '">' + GlobalVariables.strings['galassify-riskplan-button'] + '</button>' + iconData + '</div>';
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
		tempData += '<li>' + GlobalVariables.strings['galassify-riskplan-nocomm'] + '</li>';
	}
	tempData += '</ul></div>';

	var riskFormulationBoxHtml = '<div style="height:90%" class="commentTextAreas">' + 
		'<div class="mgmtCommentBox" style="display:block;height:50%"><b>' + GlobalVariables.strings['galassify-riskplan-current'] + '</b><br/><textarea class="mgmtComment" style="resize: none;width:100%;height:90%;font-family: monospace;font-size:medium"></textarea></div>' 
		+ '<div class="previousMgmtCommentBox" style="display:block;height:50%;margin-top:20px;"><span id="history-header"><b>' + GlobalVariables.strings['galassify-riskplan-history'] + '</b></span> &nbsp;(<a id="risk-formulation-Box-history-hide" style="mouse: pointer;">Select to hide</a>)<br/><textarea class="mgmtComment" readonly="readonly" style="resize: none;background-color:#eceae9;width:100%;height:90%;font-family: monospace;font-size:medium"></textarea></div>' + '</div>';

	//#CHANGE show and hide string added
	$('#dialog-container').html('<div id="dialog-plan" title="' + GlobalVariables.overallManagementPlanDefaultTitle + '">' + tempData + riskFormulationBoxHtml + '</div>');
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		img$ = $('div#dialog-plan img.helpIcon');
		img$.webuiPopover(Utilities.createPopOverOptions('', img$.prop('title'), {
			placement : 'auto',
			delay : {
				show : 0,
				hide : 0
			}
		})).prop('title', '');
	} else
		$('.helpIcon').tooltip();

	var riskForulation$ = $('#dialog-plan');

	var managementPlanComment = GlobalVariables.overallManagementPlanText;
	if (managementPlanComment == null || managementPlanComment == '')
		riskForulation$.find('div.mgmtCommentBox textarea.mgmtComment').val(GlobalVariables.overallManagementPlanDefaultText);
	else
		riskForulation$.find('div.mgmtCommentBox textarea.mgmtComment').val(managementPlanComment);

	var managementPlanCommentPrevious = GlobalVariables.overallManagementPlanTextPrevious;
	if (managementPlanCommentPrevious == null || managementPlanCommentPrevious == '') {
		riskForulation$.find('div.previousMgmtCommentBox').hide();
		riskForulation$.find('div.mgmtCommentBox').height("100%");
	} else
		riskForulation$.find('div.previousMgmtCommentBox textarea.mgmtComment').val(managementPlanCommentPrevious);
	
	$('#risk-formulation-Box-history-hide').click(function() {
		//#CHANGE show and hide string added
		if(riskForulation$.find('div.previousMgmtCommentBox textarea').is(':visible')) {
			riskForulation$.find('div.previousMgmtCommentBox textarea').hide();
			//$('#history-header').hide();
			riskForulation$.find('div.mgmtCommentBox').height("90%");
			riskForulation$.find('div.previousMgmtCommentBox').height("10%");
			$('#risk-formulation-Box-history-hide').text("Select to show");
		}
		else {
			riskForulation$.find('div.previousMgmtCommentBox textarea').show();
			//$('#history-header').show();
			$('#risk-formulation-Box-history-hide').text("Select to hide");
			riskForulation$.find('div.mgmtCommentBox').height("50%");
			riskForulation$.find('div.previousMgmtCommentBox').height("50%");
		}
	
	});

	riskForulation$.find('div.mgmtCommentBox textarea').change(null, LayoutManager.riskForumulationTextBoxListener);

	var ht = ($(window).height() * 0.9);
	var width = ($(window).width() * 0.8);

	$("#dialog-plan").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-riskplan-sv-cl'],
				click : function() {
					$(this).dialog("close");
				}
			},
			help : {
				class1 : 'rightButton',
				text : (GlobalVariables.catPopulation == 'friends-supporters') ? GlobalVariables.strings['galassify-riskplan-help-friends'] : GlobalVariables.strings['galassify-riskplan-help'],
				click : function() {
					$(this).dialog("close");
					LayoutManager._riskPlanHelpButtonClicked();

				}
			}

		}
	});
	LayoutManager._freezeScrollBarInBackground();

	$("#jui-dropdown-" + code, riskForulation$).jui_dropdown({
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

LayoutManager._riskPlanHelpButtonClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	$('#dialog-container').html('<div id="dialog-myplan-help" title="' + GlobalVariables.strings['galassify-riskplanhelp-title'] + '">Loading help text. Please wait...</div>');

	var ht = ($(window).height() * 0.9);
	var width = ($(window).width() * 0.8);
	$("#dialog-myplan-help").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-ok'],
				click : function() {
					$(this).dialog("close");
					LayoutManager._riskPlanButtonClicked();
				}
			}

		}
	});
	LayoutManager._freezeScrollBarInBackground();
	if (LayoutManager.myplanHelp == null) {
		$.ajax({
			type : "GET",
			cache : false,
			url : 'grist/html/myplan-help.html',
			dataType : "html",
			success : function(htmlData) {
				if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
					htmlData = htmlData.replaceAll("myGRiST", "myGRaCE", true);
				$('#dialog-myplan-help').html(htmlData);
				LayoutManager.myplanHelp = htmlData;
			},
			error : function() {
				console.error('Error occured while downloading quick help');
				$('#dialog-help').html("An error occured while downloading the help file. Please close this window and try again.");
			}
		});
	} else {
		console.log("using local copy");
		$('#dialog-myplan-help').html(LayoutManager.myplanHelp);
	}

};

LayoutManager._showPersonalisedMyPlanDialog = function(code, label) {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	
	//#CHANGE
	var lableHeader = "Topic";
	
	var myPlanContents = '<p><b>'+ lableHeader +'</b>: '+label+'</p>';
	var question = GlobalVariables.qt[code];
	var mgmtComment = question.getManagementComment();
	var prevMgmtComment = Utilities.getMostRecentPreviousManagementComment(question);
	var textareaContents = "";
	if((mgmtComment != null && mgmtComment != '') || (prevMgmtComment == null || prevMgmtComment == '')) {
		//#CHANGE
		var boxHeader = 'My Plan';
		
		myPlanContents += '<b>'+boxHeader+': </b><div class="mgmtCommentBox" style="display:block;"><textarea class="mgmtComment" style="resize: none;width:100%;height:250px;font-family: monospace;font-size:medium"></textarea></div>';
		textareaContents = mgmtComment;
	}
	else {
		//#CHANGE
		var boxHeader = 'My Previous Plan';
		
		myPlanContents += '<b>'+boxHeader+': </b><div class="previousMgmtCommentBox"  style="display:block;"><textarea class="prevMgmtComment" readonly="readonly" style="background-color:#eceae9;resize: none;width:100%;height:250px;font-family: monospace;font-size:medium"></textarea></div>';
		textareaContents = prevMgmtComment;
		myPlanContents += '<br/><a id="make-plan-current">Make My Previous Plan Current</a>';
	}
	
	//#CHANGE
	var myPlanTitle = 'My Action';
	
	$('#dialog-container').html('<div id="dialog-myplan-personalised" title="' + myPlanTitle + '">'+myPlanContents+'</div>');
	$('#dialog-myplan-personalised textarea').val(textareaContents);
	$('#make-plan-current').button().click(function() {
		question.setManagementComment(textareaContents);
		$("#dialog-myplan-personalised").dialog( "close" );
		LayoutManager._showPersonalisedMyPlanDialog(code, label);
	});
	$('#dialog-myplan-personalised textarea').change(function(){
		if ($(this).hasClass('mgmtComment')) {
			var value = $.trim($(this).val());
			if (value == null || value == '') {
				question.setManagementComment(null);
			} else {
				if (value.length > 5000)
					value = value.substr(0, 5000) + " ...[STRING TRUNCATED AFTER 5000 CHARACTERS]";
				question.setManagementComment(value);
				//console.log("my plan saved");
			}
		} 
	});
	
	
	
	var ht = 500;
	var width = ($(window).width() * 0.8);
	$("#dialog-myplan-personalised").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-ok'],
				click : function() {
					$(this).dialog("close");
					
				}
			}

		}
	});
	LayoutManager._freezeScrollBarInBackground();
};


LayoutManager._riskFormulationButtonClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');

	var msg = (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? GlobalVariables.strings['galassify-riskformulation-1-1p'] : GlobalVariables.strings['galassify-riskformulation-1-3p'];
	var riskFormulationBoxHtml = '<div class="commentTextAreas" style="height:100%">' + '<div class="commentBox" style="display:block;height:50%"><b>' + msg + '</b><br/><textarea class="comment" style="width:100%;height:90%;font-family: monospace;font-size:medium"></textarea></div>' + '<div class="previousCommentBox" style="display:block;height:50%"><b>' + GlobalVariables.strings['galassify-riskplan-history'] + '</b><br/><textarea class="comment" readonly="readonly" style="background-color:#eceae9;width:100%;height:90%;font-family: monospace;font-size:medium"></textarea></div>' + '</div>';

	$('#dialog-container').html('<div id="dialog-formulation" title="' + GlobalVariables.overallRiskFormulationDefaultTitle + '">' + riskFormulationBoxHtml + '</div>');

	var riskForulation$ = $('#dialog-formulation');

	var riskFormulationComment = GlobalVariables.overallRiskFormulationText;
	if (riskFormulationComment == null || riskFormulationComment == '')
		riskForulation$.find('div.commentBox textarea.comment').val(GlobalVariables.overallRiskFormulationDefaultText);
	else
		riskForulation$.find('div.commentBox textarea.comment').val(riskFormulationComment);

	var riskFormulationCommentPrevious = GlobalVariables.overallRiskFormulationTextPrevious;
	if (riskFormulationCommentPrevious == null || riskFormulationCommentPrevious == '') {
		riskForulation$.find('div.previousCommentBox').hide();
		riskForulation$.find('div.commentBox').height("100%");
	} else
		riskForulation$.find('div.previousCommentBox textarea.comment').val(riskFormulationCommentPrevious);

	riskForulation$.find('div.commentBox textarea').change(null, LayoutManager.riskForumulationTextBoxListener);

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.8);

	$("#dialog-formulation").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-riskplan-sv-cl'],
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();

};

LayoutManager._KeyMenuButtonClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	$('#dialog-container').html('<div id="dialog-key" title="' + GlobalVariables.strings['galassify-keymenu-1'] + '">Loading. Please wait...</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-key").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {
			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	LayoutManager._freezeScrollBarInBackground();
	var url = "grist/html/key-to-icons.html";
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		url = "grist/html/key-to-icons-mygrace.html";
	if (LayoutManager.keyMenuText == null) {
		$.ajax({
			type : "GET",
			cache : false,
			url : url,
			dataType : "html",
			success : function(htmlData) {
				$('#dialog-key').html(htmlData);
				LayoutManager.keyMenuText = htmlData;
			},
			error : function() {
				console.error('Error occured while downloading file');
				$('#dialog-help').html("An error occured while downloading the help file. Please close this window and try again.");
			}
		});
	} else {
		console.log("using local copy");
		$('#dialog-key').html(LayoutManager.keyMenuText);
	}
};

LayoutManager._showReportFromServer = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');
	var response = XMLOutput.updateAT(GlobalVariables.cat.documentElement, GlobalVariables.qt, GlobalVariables.at, 'in progress');
	var atInString = XMLOutput._xml_to_string(GlobalVariables.at);
	console.log(atInString);

	var title = GlobalVariables.strings['galassify-showreport-1p'];
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON)
		title = GlobalVariables.strings['galassify-showreport-3p'];

	$('#dialog-container').html('<div id="dialog-riskReport" title="' + title + '"><iframe width="100%" height="100%" frameborder="0" id="preview-iframe"></iframe> </div>');

	var ht = ($(window).height() * 0.8);
	//var width = ($(window).width() * 0.8);
	var width = (830);
	//to make it as wide as the report in iframe
	$("#dialog-riskReport").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			LayoutManager._unfreezeScrollBarInBackground();
		},
		buttons : {

			cancel : {
				class1 : 'rightButton',
				text : GlobalVariables.strings['galassify-menu-close'],
				click : function() {
					$(this).dialog("close");
				}
			}

		}
	});
	LayoutManager._freezeScrollBarInBackground();

	var escapedAT = atInString.replace(/[<>&'"]/g, function(c) {
		switch (c) {
		case '<':
			return '&lt;';
		case '>':
			return '&gt;';
		case '&':
			return '&amp;';
		case '\'':
			return '&apos;';
		case '"':
			return '&quot;';
		}
	});

	var reportUrl = '../reports/client-answers-preview/client-answers-preview.php?patient-id=' + GlobalVariables.patientId + '&pop=' + GlobalVariables.catPopulation + '&toolType=java';
	var report = 'Loading...<form name="form2" style="display: none;" method="post" action="' + reportUrl + '">';
	report += '<input type="hidden" name="AT" value="' + escapedAT + '">';

	//TODO!!!!!! careful. this might not work in all browsers. http://stackoverflow.com/questions/3999101/html-getting-document-from-iframe
	report += '<input type="submit" value="Submit"> </form> <script type="text/javascript">document.getElementById("preview-iframe").contentWindow.document.form2.submit();</script>';

	setTimeout(function() {
		$('#preview-iframe').contents().find('html').html(report);
	}, 500);
};

LayoutManager._saveAssessment = function() {
	$('#savingAnswers').show(0);
	var response = XMLOutput.updateAT(GlobalVariables.cat.documentElement, GlobalVariables.qt, GlobalVariables.at, 'in progress');
	if (response == true) {
		XMLOutput.writeATbackToServerOrLocalDisk(GlobalVariables.at, function() {
			//nothing extra to do here.
		});
	}
};
LayoutManager._suspendAssessment = function(byPassWarning) {
	if (GlobalVariables.isfixErrorFlagTrue == true) {
		LayoutManager._genericShowDialogBoxAlertReplacement(GlobalVariables.strings['galassify-finishgui-suspend-fixerror']);
		return;
	}

	$('#savingAnswers').show(0);
	var response = XMLOutput.updateAT(GlobalVariables.cat.documentElement, GlobalVariables.qt, GlobalVariables.at, 'in progress');
	if (response == true) {
		XMLOutput.writeATbackToServerOrLocalDisk(GlobalVariables.at, function() {
			if(byPassWarning == true) {
				LayoutManager.setupFinishedLayout('in progress');
			}
			else {
				var stringOutput = GlobalVariables.strings['galassify-suspendassessment'];
				$('#dialog-container').html('<div id="dialog-suspend" title="' + GlobalVariables.strings['galassify-suspendassessment-title'] + '">' + stringOutput + '</div>');
				$("#dialog-suspend").dialog({
					dialogClass : 'no-close',
					closeOnEscape : false,
					resizable : true,
					width : 400,
					modal : true,
					close : function(event, ui) {
						$(this).dialog("destroy");
						$('#dialog-container').html('');
						LayoutManager._unfreezeScrollBarInBackground();
					},
					buttons : {
						ok : {
							text : 'OK',
							click : function() {
								$(this).dialog("close");
								LayoutManager.setupFinishedLayout('in progress');
							}
						}
					}
				});
			}
		});
	}
};
LayoutManager._finishAssessment = function(skipPopup) {
	$('#savingAnswers').show(0);
	var response = XMLOutput.updateAT(GlobalVariables.cat.documentElement, GlobalVariables.qt, GlobalVariables.at, 'completed');
	
	if (response == true) {
		XMLOutput.writeATbackToServerOrLocalDisk(GlobalVariables.at, function(assessmentId) {
			//this is success callback and only called from online mode, not offline

			var stringOutput = null;
			var bottomButtonTxt;
			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
				//lets send back a record of all the actions the user has triggered. only needed for first person mode.
				
				//mygrace
				//#CHANGE
				//change the strings as mentioned in the task list and remove avatar
				if (GlobalVariables.clinicianClientID == null || GlobalVariables.clinicianClientID == 'annon') {
					//stringOutput = GlobalVariables.strings['galassify-finishassessment-1p-annon'];
				}
				else {
					//#CHANGE. the string below is changed.
					//GlobalVariables.strings['galassify-finishassessment-1p-a'] = 'You will now log out of myGRaCE and return to the website.';
					stringOutput = "<p>" + GlobalVariables.strings['galassify-finishassessment-1p-b'] + ": <a style=\"color: blue\" target=\"_blank\" href=\"https://www.secure.egrist.org/panel/mhexperts/mygrace-survey.php\">myGRaCE feedback</a>. <br/><br/><i>" + GlobalVariables.strings['galassify-finishassessment-1p-c'] + "</i></p>";
					// we have to show a pop to make the survey more in-your-face
					var options = {
						closeable : true,
						trigger : 'manual',
						width : 500,
						arrow : false,
						placement : 'bottom-left',
						onShow : function($e) {
							$e.addClass("avatarshowing");
						},
						onHide : function($e) {
							$e.removeClass("avatarshowing");
						}
					};
					$('#top-header').webuiPopover('destroy');
					var finSurvey = GlobalVariables.strings['galassify-avatar-myguide-grace-finish-survey-friends'];
					if (GlobalVariables.catPopulation == 'friends-supporters')
						finSurvey = GlobalVariables.strings['galassify-avatar-myguide-grace-finish-survey-friends'];
					//$('#top-header').webuiPopover(Utilities.createPopOverOptions(null, finSurvey.replace("#name#", GlobalVariables.patientName), options));
					//$('#top-header').webuiPopover('show');
				}
				
				//bottomButtonTxt = GlobalVariables.strings["galassify-menu-close"] + " " + GlobalVariables.title;
				//#CHANGE
				GlobalVariables.strings["galassify-menu-close"] = 'Close';
				bottomButtonTxt = GlobalVariables.strings["galassify-menu-close"];
				
				//#CHANGE
				GlobalVariables.strings['galassify-finishassessment-title'] = 'Feedback on myGRaCE';
				
			} else {
				// galassify
				stringOutput = GlobalVariables.strings['galassify-finishassessment-3p'];
				bottomButtonTxt = GlobalVariables.strings['galassify-menu-ok'];
			}

			if(skipPopup != true && stringOutput != null) {
				$('#dialog-container').html('<div id="dialog-suspend" title="' + GlobalVariables.strings['galassify-finishassessment-title'] + '">' + stringOutput + '</div>');
				$("#dialog-suspend").dialog({
					dialogClass : 'no-close',
					closeOnEscape : false,
					resizable : true,
					width : 500,
					modal : true,
					close : function(event, ui) {
						$(this).dialog("destroy");
						$('#dialog-container').html('');
						LayoutManager._unfreezeScrollBarInBackground();
					},
					buttons : {
						ok : {
							text : bottomButtonTxt,
							click : function() {
								$(this).dialog("close");
								LayoutManager.setupFinishedLayout('completed');
							}
						}
					}
				});
			}
			else {
				LayoutManager.setupFinishedLayout('completed');
			}

		}, function(text) {// this is called if we have received any risk consensus stuff. and text is the stuff received.
			console.log("risk consensus request received.");
			LayoutManager._showRiskConsensusGUI(text);
		});
	}
};

LayoutManager._redrawTree = function(treeNode) {
	var catNode = treeNode.data.xmlNode;
	var mg = catNode.getAttribute("mg");
	if (mg == null || mg == '')
		mg = null;

	var iconName;
	iconName = Utilities.getRiskIconFileName(mg);

	treeNode.data.icon = iconName;
	treeNode.render();

	if (treeNode.hasChildren()) {
		var children = treeNode.getChildren();
		for (var i = 0; i < children.length; i++) {
			LayoutManager._redrawTree(children[i]);
		}

	}

};

