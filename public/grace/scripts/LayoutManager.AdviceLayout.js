//*****************************************************************************************
//					Advice LAYOUT
//*****************************************************************************************
LayoutManager.AdviceLayout = {};
LayoutManager.setAdviceLayout = function(inputObj) {

	if (inputObj !== undefined && inputObj.registerNewNavigation == false)
		LayoutNavigator.addNewLayoutToHistoryOnly((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.ADVICE_LAYOUT, null);
	else
		LayoutNavigator.addNewLayout((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.ADVICE_LAYOUT, null);

	LayoutManager.clearLayout();
	$('body').removeClass();

	GlobalVariables.previousLayout = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.ADVICE_LAYOUT;

	var data = '<div id="top-header"></div><div id="footer"></div><div id="advicePagePanel"><div id="advicePagetop" style="max-width: 800px;margin: 1em auto;">Loading...</div><div id="advicePagebottom" style="max-width: 800px;margin: 1em auto;"></div></div>';

	$('body').removeClass();
	$('body').html(data);
	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();

	//$('#nav-bar-advice').prop("checked", true);$('#nav-bar').buttonset('refresh');
	$('#advicePagePanel').css('margin-top', (GlobalVariables.headerHeight + 10) + 'px').css("margin-bottom", (GlobalVariables.footerHeight + 5) + 'px');

	Utilities.getAndAssignMg(GlobalVariables.cat.documentElement);
	var actionsTriggeredRAW = ActionAlert.getTriggeredActions(GlobalVariables.cat.documentElement, GlobalVariables.qt);

	//we need to add nodes which have a management comment in it.
	var catRoot = GlobalVariables.cat.documentElement;
	var code = catRoot.getAttribute("code");
	var mgmtCommentsObj = Utilities.getManagementCommentsForCopyPasteDropDownList(code, true);

	//console.log(mgmtCommentsObj);
	for (var z = 0; z < mgmtCommentsObj.length; z++) {
		var mgmtCommentObj = mgmtCommentsObj[z];
		if((mgmtCommentObj.code in actionsTriggeredRAW))
			continue;
		else
			actionsTriggeredRAW[mgmtCommentObj.code] = new Array();
		
		var actionObj = {addedForPersonalAction : true, 
						 node_code: code,
						 xmlNode: mgmtCommentObj.xmlNode };
	 	actionsTriggeredRAW[mgmtCommentObj.code].push(actionObj);
	}

	//console.log(actionsTriggeredRAW);
	var actionsTriggered = ActionAlert.getActionsFlattenedForDisplay(actionsTriggeredRAW);
	//console.log(actionsTriggered);

	//LayoutManager._actionAlertAskUser(actionsTriggered);

	var actionPlanButtonName = (GlobalVariables.catPopulation == 'friends-supporters') ? 'Action Plan' : 'My Action Plan';

	var actionPlanHelpButtonName = 'Putting my Plan into Action';
	/*if(GlobalVariables.catPopulation == 'friends-supporters') {
	 actionPlanButtonName = 'Action Plan'; actionPlanHelpButtonName = 'Help with Action Plan';
	 }*/

	var buttonHolder = '<p><a id="advicepage-actionplan-button" title="Select this option to create your overall action plan." class="footer-button">' + actionPlanButtonName + '</a>';
	//buttonHolder += '&nbsp;&nbsp;&nbsp;<a title="Select this option for ideas about how to put your plan into action." id="advicepage-actionplan-help-button" class="footer-button">' + actionPlanHelpButtonName + '</a></p><br/>';

	var dialogData = LayoutManager.AdviceLayout.getAdviceTable(actionsTriggeredRAW);
	$('#advicePagebottom').html(buttonHolder + dialogData);
	LayoutManager.AdviceLayout.registerAdviceTableButtons(actionsTriggeredRAW);
	$('#advicepage-actionplan-button').button().click(function() {
		LayoutManager._riskPlanButtonClicked();
	});
	$('#advicepage-actionplan-help-button').button().click(function() {
		LayoutManager._riskPlanHelpButtonClicked();
	});

	$('#advicePagetop').html(GlobalVariables.htmlFragments.supportAndAdviceMsg);
	if (actionsTriggered.length == 0)
		$('#no-actions-triggered-box').show();
	LayoutManager.dealWithAvatar();
};

LayoutManager.AdviceLayout.getAdviceTable = function(actionsTriggeredRAW) {
	//console.log(actionsTriggeredRAW);
	
	//#CHANGE
	var tableHeader1 = 'Issues';
	var tableHeader2 = 'GRaCE Advice';
	var tableHeader3 = 'My Action';
	
	var dialogData = '<table id="action-alert-table" class="tabledesignActions" style="max-width:800px">' + '<tr class="topRow" align="center"><td width="50%">'+tableHeader1+'</td> <td width="30%">'+tableHeader2+'</td><td width="20%">'+tableHeader3+'</td> </tr>';
	var counter = 0;

	var categoryCodes = [{
		code : 'gen-state-mind',
		label : 'my state of mind'
	}, {
		code : 'gen-involve-social',
		label : 'my involvement with life and others'
	}, {
		code : 'gen-health-care',
		label : 'my health and care'
	}, {
		code : 'gen-person-thinking',
		label : 'my personality and way of thinking'
	}, {
		code : 'adv-life-event',
		label : 'my life journey'
	}, {
		code : '',
		label : 'others'
	}];

	for (var j = 0; j < categoryCodes.length; j++) {
		for (var key in actionsTriggeredRAW) {
			if (actionsTriggeredRAW[key].length > 0) {

				if (actionsTriggeredRAW[key].displayed == true)
					continue;

				var categoryLabel = "";
				if (categoryCodes[j].code != '') {
					if ($.inArray(categoryCodes[j].code, Utilities.getPathAsCodes(actionsTriggeredRAW[key][0].xmlNode)) != -1) {
						categoryLabel = categoryCodes[j].label;
					} else
						continue;
				} else {
					categoryLabel = categoryCodes[j].label;
				}

				actionsTriggeredRAW[key].displayed = true;
				counter++;
				var idOdd = "";
				//if ((counter % 2) == 1)
				//	idOdd = 'class="odd"';

				if (categoryCodes[j].headerShown != true) {
					//#CHANGE
					var headerToShow = 'Issues related to: ' + categoryCodes[j].label;
					if (categoryCodes[j].code == '')
						headerToShow = 'Other issues';
					dialogData += '<tr class="category-header"><td colspan="3"><h3>' + headerToShow + '</h3></td></tr>';
					categoryCodes[j].headerShown = true;
				}

				var label = actionsTriggeredRAW[key][0].xmlNode.getAttribute("label");
				var mg = actionsTriggeredRAW[key][0].xmlNode.getAttribute("mg");
				var code = actionsTriggeredRAW[key][0].xmlNode.getAttribute("code");
				var question = GlobalVariables.qt[code];
				var txt = Utilities.getRiskText(mg);
				var color = Utilities.getRiskColor(mg);
				var rowData1 = label;
				if(question.getAnswer() != null) {
					if (question != null) {
						rowData1 += ': answer ' + question.getAnswer();
						if (question.getQuestionType() == 'scale' && question.getScaleType() != null)
							rowData1 += '<br><span style="font-style: italic;font-size: 90%;"> where ' + Utilities.getPoleTextForScaleQuestion(question) + '</span>';
					} 
				}
				//rowData1 += '  ##'+categoryLabel;
				if(actionsTriggeredRAW[key][0].addedForPersonalAction != true) {
					var rowData2 = '<div style="padding: 2px;margin-right:10px;display: inline-block;max-width: 70px;text-align:center;background:' + color.back + ';"><span style="color:' + color.front + '">' + txt.toLowerCase() + ' concern </span></div>';
					var shownAtleastOneOpenUrl = false;
					for (var i = 0; i < actionsTriggeredRAW[key].length; i++) {
						var action = actionsTriggeredRAW[key][i];
						var buttonTitle = "";
						var buttonTooltip = "";
						if (action.action_type_table_name == 'galassify_action_open_url_templates') {
							if (shownAtleastOneOpenUrl == true)
								continue;
							shownAtleastOneOpenUrl = true;
							
							//#CHANGE
							buttonTitle = "Advice and<br/> Support";
							
							//#CHANGE
							buttonTooltip = "Selecting this will take you to our web page with suitable help for the particular issue.";
						} else if (action.action_type_table_name == 'galassify_action_send_email_templates') {
							buttonTitle = "Send Email";
						}
						rowData2 += '<a style="margin-bottom:5px;" title="' + buttonTooltip + '" id="action-alert-execute-button-' + key + '-' + i + '">' + buttonTitle + '</a>&nbsp;&nbsp;';
					}
				}
				else
					rowData2 = '';
				var rowData3 = '<a style="margin-bottom:5px;" class="action-alert-myplan-button" code="' + code + '" label="' + label + '">My Action</a>';
				dialogData += '<tr ' + idOdd + ' ><td>' + rowData1 + '</td><td style="padding-left: 10px;">' + rowData2 + '</td><td style="padding-left: 1em;text-align: center;">' + rowData3 + '</td></tr>';

			}

		}
	}
	if (counter == 0)
		dialogData = '';

	return dialogData;
};

LayoutManager.AdviceLayout.registerAdviceTableButtons = function(actionsTriggeredRAW) {
	//ACTIONS: lets register the buttons
	for (var key in actionsTriggeredRAW) {
		var shownAtleastOneOpenUrl = false;
		for (var i = 0; i < actionsTriggeredRAW[key].length; i++) {
			if (actionsTriggeredRAW[key][i].action_type_table_name == 'galassify_action_open_url_templates') {
				if (shownAtleastOneOpenUrl == true)
					continue;
				shownAtleastOneOpenUrl = true;
			}
			$('#action-alert-execute-button-' + key + '-' + i).button().click({
				actionData : actionsTriggeredRAW[key][i],
				actionsDataRAW : actionsTriggeredRAW
			}, function(evt) {
				//var button$ = $(this).button('option', 'label', 'Working...').button( "option", "disabled", true );
				setTimeout(function() {
					ActionAlert.executeActions(evt, function(status) {
						//console.log(button$);
						// if(status == true) {
						// button$.button('option', 'label', 'Done');
						// }
						// else {
						// button$.button('option', 'label', 'Execute').button( "option", "disabled", false );
						// }
					});
				}, 10);
			});

		}
	}
	$('.action-alert-myplan-button').each(function() {
		var code = $(this).attr("code");
		var label = $(this).attr("label");
		//console.log(code);
		$(this).button().click({
			code : code,
			label : label
		}, function(e) {
			LayoutManager._showPersonalisedMyPlanDialog(code, label);
			
		});
	});
};
