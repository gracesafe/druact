
//*****************************************************************************************
//					Risk overview LAYOUT
//*****************************************************************************************
LayoutManager.RiskOverviewLayout = {};
LayoutManager.setRiskOverviewLayout = function(inputObject) {
	if (inputObject !== undefined && inputObject.registerNewNavigation == false)
		LayoutNavigator.addNewLayoutToHistoryOnly((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.RISK_OVERVIEW, null);
	else
		LayoutNavigator.addNewLayout((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.RISK_OVERVIEW, null);

	LayoutManager.clearLayout();
	$('body').removeClass();
	GlobalVariables.previousLayout = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.RISK_OVERVIEW;

	var data = '<div id="top-header"></div><div id="riskOverviewPagePanel"></div>';

	$('body').removeClass();
	$('body').html(data);
	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();

	//$('#nav-bar-overview').prop("checked", true);$('#nav-bar').buttonset('refresh');

	$('#riskOverviewPagePanel').css('margin-top', (GlobalVariables.headerHeight + 10) + 'px');

	$('#riskOverviewPagePanel').html(GlobalVariables.htmlFragments.hubPageMsg);

	/*
	 if(GlobalVariables.catPopulation == 'friends-supporters') {
	 $('#my-profile-text-service-user, #my-profile-text2-service-user, #my-profile-header-service-user').hide();
	 $('#my-profile-text-friends-supporters, #my-profile-text2-friends-supporters, #my-profile-header-friends-supporters').show();
	 }
	 */
	$('#show-report-button').button().click(function() {
		LayoutManager._showReportFromServer();
	});

	Utilities.getAndAssignMg(GlobalVariables.cat.documentElement);
	var actionsTriggeredRAW = ActionAlert.getTriggeredActions(GlobalVariables.cat.documentElement, GlobalVariables.qt);
	//console.log(actionsTriggeredRAW);
	var actionsTriggered = ActionAlert.getActionsFlattenedForDisplay(actionsTriggeredRAW);
	
	//console.log(actionsTriggered);
	var highMgNodes = Utilities.getHighMgNodes(GlobalVariables.cat.documentElement, GlobalVariables.qt, GlobalVariables.highMgThresholdToTriggerHighlightedNodes);
	for (var i = 0; i < highMgNodes.length; i++) {
		var thisNodeAlreadyExists = false;
		for (var j = 0; j < actionsTriggered.length; j++) {
			if (actionsTriggered[j].xmlNode.getAttribute("code") == highMgNodes[i].getAttribute("code")) {
				thisNodeAlreadyExists = true;
				break;
			}
		}
		if (thisNodeAlreadyExists == false) {
			actionsTriggered.push({
				xmlNode : highMgNodes[i]
			});
			console.log("High Mg Node " + highMgNodes[i].getAttribute("code") + " added to the highlighted issues list");
		}
	}
	//console.log(actionsTriggered);
	//#CHANGE
	GlobalVariables.strings['galassify-riskoverview-2'] = 'Highlighted Issues';
	var highlightedIssues = '<table id="action-alert-table" class="tabledesignActions"  style="max-width:800px;">' + '<tr class="topRow"><td colspan="2" align="center"><h2>'+GlobalVariables.strings['galassify-riskoverview-2']+'</h2></td> </tr>';
	
	//#CHANGE add the tempstring to lib
	var tempstring = 'These are the areas you have identified so far as needing further consideration. You have given enough information for some of them ("All Questions Answered") but it would be useful to provide more information for those that have "More Questions to Answer".';
	highlightedIssues += '<tr><td colspan="2" style="padding: .3em 1em;">'+tempstring+'</td></tr>';
	var counter = 0;
	
	var categoryCodes = [{code:'gen-state-mind', label: 'my state of mind'}, 
		{code: 'gen-involve-social', label: 'my involvement with life and others'},
		{code: 'gen-health-care', label: 'my health and care'},
		{code: 'gen-person-thinking', label: 'my personality and way of thinking'},
		{code: 'adv-life-event', label: 'my life journey'},
		{code: '', label: 'others'}];
	
	for(var l=0; l<actionsTriggered.length ; l++) {
		actionsTriggered[l].displayed = false;
	}
	
	for(var j=0; j<categoryCodes.length ; j++) {
		for(var k=0; k<actionsTriggered.length ; k++) {
				console.log(categoryCodes[j].label + ' : ' + actionsTriggered[k].displayed);
				
				if(actionsTriggered[k].displayed == true)
					continue;
				
				var categoryLabel = "";
				if(categoryCodes[j].code != '') {
					if($.inArray(categoryCodes[j].code, Utilities.getPathAsCodes(actionsTriggered[k].xmlNode)) != -1) {
						categoryLabel = categoryCodes[j].label;
					}
					else
						continue;
				}
				else {
					categoryLabel = categoryCodes[j].label;
				}
				
				
				actionsTriggered[k].displayed = true;
				counter++;
				var idOdd = "";
				//if ((counter % 2) == 1)
				//	idOdd = 'class="odd"';
				
				if(categoryCodes[j].headerShown != true) {
					var headerToShow = 'Issues related to: ' + categoryCodes[j].label;
					if(categoryCodes[j].code == '')
						headerToShow = 'Other issues';
					highlightedIssues += '<tr class="category-header"><td colspan="2"><h3>'+headerToShow+'</h3></td></tr>';
					categoryCodes[j].headerShown = true;
				}
				
				
				var label = actionsTriggered[k].xmlNode.getAttribute("label");
				var mg = actionsTriggered[k].xmlNode.getAttribute("mg");
				var txt = Utilities.getRiskText(mg);
				var color = Utilities.getRiskColor(mg);
				var rowData1 = label + ' (level <b><span style="padding-left:5px;padding-right:5px;background:' + color.back + ';color:' + color.front + '">' + parseInt((Math.round(mg * 100) / 100) * 10) + '</span></b>, ' + txt.toLowerCase() + ' concern)<br/>';
				//rowData1 += '  ##'+categoryLabel;
				
				var shownAtleastOneOpenUrl = false;
				var answerCount = Utilities.countAnswers(Utilities.xmlToJson(actionsTriggered[k].xmlNode.parentNode), GlobalVariables.qt);
				
				//#CHANGE
				GlobalVariables.strings['galassify-riskoverview-3'] = 'All Questions Answered';
				GlobalVariables.strings['galassify-riskoverview-4'] = 'More Questions to Answer';
				var buttonText = (answerCount.answeredQuestion == answerCount.totalQuestions) ? GlobalVariables.strings['galassify-riskoverview-3'] : GlobalVariables.strings['galassify-riskoverview-4'];
				var buttonTitle = (answerCount.answeredQuestion == answerCount.totalQuestions) ? GlobalVariables.strings['galassify-riskoverview-5'] : GlobalVariables.strings['galassify-riskoverview-6'];
				var rowData2 = '<a title="' + buttonTitle + '" id="action-alert-execute-button-' + k + '">' + buttonText + '</a>';

				
				highlightedIssues += '<tr ' + idOdd + ' ><td>' + rowData1 + '</td><td>' + rowData2 + '</td></tr>';
	
			
	
		}
	}
	
	highlightedIssues += '</table>';
	if (actionsTriggered.length == 0)
		$('#no-highlightedIssues-box').show();
	else
		$('#highlightedIssues-contents').html(highlightedIssues);

	for (var i = 0; i < actionsTriggered.length; i++) {
		$('#action-alert-execute-button-' + i).button().click({
			actionData : actionsTriggered[i]
		}, function(evt) {
			//var button$ = $(this).button('option', 'label', 'Working...').button( "option", "disabled", true );

			setTimeout(function() {
				var actionData = evt.data.actionData;
				//console.log(actionData.xmlNode);
				GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.NORMAL;
				LayoutManager.setQuestionnaireLayout({
					jsCat : Utilities.xmlToJson(actionData.xmlNode.parentNode),
					currentQuestionnairMode : GlobalVariables.currentQuestionnairMode
				});
				//xmlNode
				//Utilities.xmlToJson(catRoot)

			}, 10);
		});
	}
	LayoutManager.dealWithAvatar();
};