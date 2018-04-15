//*****************************************************************************************
//                  Loading page LAYOUT, also risk context
//*****************************************************************************************
LayoutManager.FinishIntermediateLayout = {};
LayoutManager.setFinishIntermediateLayout = function(obj) {

	if ((obj !== undefined && obj.registerNewNavigation == false))
		LayoutNavigator.addNewLayoutToHistoryOnly(null, GlobalVariables.Layouts.FINISH_INTERMEDIATE_LAYOUT, null);
	else
		LayoutNavigator.addNewLayout(null, GlobalVariables.Layouts.FINISH_INTERMEDIATE_LAYOUT, null);

	LayoutManager.clearLayout();
	$('body').removeClass();

	// a temp hack to make the menu options appear.
	if (GlobalVariables.currentMygraceVersionPathways == null)
		GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_LIFE;

	GlobalVariables.previousLayout = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.FINISH_INTERMEDIATE_LAYOUT;
	GlobalVariables.currentMindMapMode = GlobalVariables.MindMapModes.FULL;

	var data = '<div id="top-header"></div><div id="finishIntermediatePanel"></div>';

	$('body').removeClass();
	$('body').html(data);
	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();
	//$('#top-header').webuiPopover('destroy');

	$('#finishIntermediatePanel').css('margin-top', (GlobalVariables.headerHeight + 10) + 'px');
	var heading = "<h2>" + GlobalVariables.strings['galassify-finishgui-extra1'] + "</h2>";

	var topTitle = thoughtsString = risksString = plansString = null;
	var overallComment = '<h4>' + GlobalVariables.strings['galassify-finishgui-h3'] + '<img class="helpIcon questionButtonIcon" src="' + GlobalVariables.images.help + '" title="' + GlobalVariables.strings['galassify-finishgui-imgtooltip'] + '"/></h4>';
	overallComment += '<div id="assessment-context-wrapper" style="display:none;"><p id="overall-risk-comment-instructions">' + GlobalVariables.strings['galassify-finishgui-overallcomment'] + '</p><textarea id="overall-comment"></textarea></div>';
	overallComment += '<a id="assessment-context-anchor" href="#">' + GlobalVariables.strings['galassify-finishgui-extra2'] + '</a>';
	var adviceTop = '<div id="advicePagetop"></div>';

	//$('#advicePagetop').html(GlobalVariables.htmlFragments.supportAndAdviceMsg);

	Utilities.getAndAssignMg(GlobalVariables.cat.documentElement);
	var actionsTriggeredRAW = ActionAlert.getTriggeredActions(GlobalVariables.cat.documentElement, GlobalVariables.qt);
	var dialogData = LayoutManager.AdviceLayout.getAdviceTable(actionsTriggeredRAW);
	var actionPlanButtonName = (GlobalVariables.catPopulation == 'friends-supporters') ? GlobalVariables.strings['galassify-actionLayout-1'] : GlobalVariables.strings['galassify-actionLayout-2'];

	var buttonHolder = '<p><a id="advicepage-actionplan-button" title="' + GlobalVariables.strings['galassify-menu-footer-action-plan-tooltip'] + '" class="footer-button">' + actionPlanButtonName + '</a>&nbsp;&nbsp;&nbsp;<a title="' + GlobalVariables.strings['galassify-finishgui-report-button'] + '" id="show-report-button">' + GlobalVariables.strings['galassify-finishgui-report-button-title'] + '</a></p>';

	//var bottomPanel = '<div id="finish-intermediate-bottom"><a id="finish-intermediate-finish">' + GlobalVariables.strings['galassify-riskjudge-warning-7'] + '</a><a id="finish-intermediate-suspend">' + GlobalVariables.strings['galassify-finishgui-button-suspend'] + '</a></div>';
	//#CHANGE
	var bottomPanel = '<div id="finish-intermediate-bottom"><a id="finish-intermediate-finish" title="This will log you out of myGRaCE, and return you to the myGRaCE website.">' + 'Log Out' + '</a>';
	//bottomPanel += '<a id="finish-intermediate-suspend">' + GlobalVariables.strings['galassify-finishgui-button-suspend'] + '</a>';
	bottomPanel += '</div>';
	
	$('#finishIntermediatePanel').html(heading + overallComment + adviceTop + buttonHolder + dialogData + bottomPanel);
	
	img$ = $('div#finishIntermediatePanel img.helpIcon');
	img$.webuiPopover(Utilities.createPopOverOptions('', img$.prop('title'), {
		placement : 'auto',
		delay : {
			show : 0,
			hide : 0
		}
	})).prop('title', '');
		
		
	$('#action-alert-table').css('margin-bottom', '70px');
	LayoutManager.AdviceLayout.registerAdviceTableButtons(actionsTriggeredRAW);
	$('#advicepage-actionplan-button').button().click(function() {
		LayoutManager._riskPlanButtonClicked();
	});
	$('#show-report-button').button().click(function() {
		LayoutManager._showReportFromServer();
	});
	$('#finish-intermediate-finish').button().click(function() {
		LayoutManager._finishAssessment();
		//LayoutManager._suspendAssessment();
	});

	$('#finish-intermediate-suspend').button().click(function() {
		LayoutManager._suspendAssessment();
	});

	if (GlobalVariables.isfixErrorFlagTrue == true) {
		$('#finish-intermediate-suspend').css({
			'opacity' : 0.35
		});
	}

	$('#advicePagetop').html(GlobalVariables.htmlFragments.supportAndAdviceMsg);

	var tempData = $('#advicePagetop h2').html();
	$('#advicePagetop h2').after("<h4>" + tempData + "</h4>").remove();

	var actionsTriggered = ActionAlert.getActionsFlattenedForDisplay(actionsTriggeredRAW);
	if (actionsTriggered.length == 0)
		$('#no-actions-triggered-box').show();

	if (GlobalVariables.overallRiskComment != null)
		$('#overall-comment').val(GlobalVariables.overallRiskComment);
	$('#overall-comment').change(LayoutManager._overallCommentListener);

	//$('#finishIntermediatePanel').html(GlobalVariables.htmlFragments.openingPageMsg);
	$('#assessment-context-anchor').click(function() {
		var wrapper$ = $('#assessment-context-wrapper');
		if (wrapper$.is(":visible")) {
			wrapper$.hide(400);
			$('#assessment-context-anchor').html(GlobalVariables.strings['galassify-finishgui-extra2']);
		} else {
			wrapper$.show(400);
			$('#assessment-context-anchor').html(GlobalVariables.strings['galassify-finishgui-extra3']);
		}
	});

	LayoutManager.dealWithAvatar();

};
