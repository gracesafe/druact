//*****************************************************************************************
//					MINDMAP LAYOUT
//*****************************************************************************************
LayoutManager.MindMapLayout = {};
LayoutManager.MindMapLayout.selectedRiskContextPath = 'mental-health-risk,suic';
//select suicide by default
LayoutManager.MindMapLayout.resizeListenerSetOnce = false;
//so we don't register listener multiple times
LayoutManager.MindMapLayout.avatarDisplayed = false;

LayoutManager.setMindMapLayout = function(inputObject) {
	if (inputObject != null && inputObject.isFirstRun !== 'undefined')
		var isFirstRun = inputObject.isFirstRun;
	else
		var isFirstRun = false;

	GlobalVariables.previousLayout = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.MINDMAP_LAYOUT;

	if (inputObject !== undefined && inputObject.currentMindmapMode != undefined)
		GlobalVariables.currentMindMapMode = inputObject.currentMindmapMode;

	if (GlobalVariables.previousLayout != GlobalVariables.Layouts.MINDMAP_LAYOUT) {
		// when risk selection changes, mindmap is reloaded. we do not want to add those instances in the navigation.
		if (inputObject !== undefined && inputObject.registerNewNavigation == false)
			LayoutNavigator.addNewLayoutToHistoryOnly((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.MINDMAP_LAYOUT, inputObject);
		else
			LayoutNavigator.addNewLayout((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.MINDMAP_LAYOUT, inputObject);
	}

	GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.NORMAL;
	//in case we were on the questionnair panel and user clicked on the mindmap button before all the delayed tasks had finished working.
	clearTimeout(window.timer1);
	for (var i = 0; i < GlobalVariables.timerQueueArray.length; i++) {
		clearTimeout(GlobalVariables.timerQueueArray[i]);
	}
	var loadingMsg = "";
	if (isFirstRun == true) {
		loadingMsg = '<div id="mindMapPanel-loading">Loading. Please wait...</div>';
	}

	var data = '<div id="top-header"></div><div id="panelDescription"></div><div id="mindMapPanel">' + loadingMsg + '</div>';

	$('body').removeClass();
	$('body').html(data);

	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		LayoutManager.mygraceMyLifeLastLayoutMindMapORquestionnair = GlobalVariables.Layouts.MINDMAP_LAYOUT;
		
		//#CHANGE
		if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.FULL)
			$('#panelDescription').html('<p>'+'Select any box for specific questions or the middle myGRaCE bubble for all questions.'+'</p>');
		else
			$('#panelDescription').html('<p>'+'Select any box without a <img src="images/slash.png"> icon or the middle myGRaCE bubble for all questions.'+'</p>');
			
		/*
		if(GlobalVariables.catPopulation == 'friends-supporters')
			$('#panelDescription').html('<p>'+GlobalVariables.strings['galassify-mindmapLayout-panelDesc-friends']+'</p>');
		else
			$('#panelDescription').html('<p>'+GlobalVariables.strings['galassify-mindmapLayout-panelDesc']+'</p>');
		*/

		$('#panelDescription').height(GlobalVariables.headerDescriptionHeightInMindMap);
		//$('#nav-bar-mindmap').prop("checked", true);$('#nav-bar').buttonset('refresh');
	} else if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
		$('#panelDescription').css('height', '0px');

	} else {
		console.error('error: unknown mode. this should not have happened!');
	}

	$('#panelDescription').css('margin-top', (GlobalVariables.headerHeight + 10) + 'px');

	var imageLocation = GlobalVariables.launchMethod.mindMapImage;
	var mindmapText = GlobalVariables.mindMapText;

	var image = '<img id="mindmap-image" usemap="#fm_imagemap" src="' + imageLocation + '"  onLoad="LayoutManager.MindMapLayout.imageLoaded();">';
	image += mindmapText;
	$('#mindMapPanel').append(image);
	$('map > area').click(LayoutManager.MindMapLayout.clickListener).addClass("mindmapLink");

	var mindmapPanel$ = $('#mindMapPanel').append('<div id="mindmap-risk-indicator-container">&nbsp;</div>');

	//var img2 = '<img class="overlay-image" style="top:100px;" src="images/loader2.gif" title="this will be displayed as a tooltip"/>';
	//$('#mindmap-risk-indicator-container',mindmapPanel$).append(img2);

	if (GlobalVariables.showClassificationOption == true || GlobalVariables.showProgressIconsOnMindmap == true) {
		if (LayoutManager.MindMapLayout.resizeListenerSetOnce == false) {
			$(window).resize(LayoutManager.MindMapLayout._resizeHandler);
			LayoutManager.MindMapLayout.resizeListenerSetOnce = true;
		}
		LayoutManager.MindMapLayout._resizeHandler();

		//this is a hack for chrome... without this the icons are shifted right by a huge margin.
		setTimeout(function() {
			LayoutManager.MindMapLayout._resizeHandler();
		}, 100);
		setTimeout(function() {
			LayoutManager.MindMapLayout._resizeHandler();
		}, 1000);

		//if(LayoutManager.classificationRunAtleastOnce == true) {
		//LayoutManager.MindMapLayout.updateRiskIconsOnMindmap();
		//}

		if (GlobalVariables.showProgressIconsOnMindmap == true) {

			LayoutManager.MindMapLayout.updateProgressIconsOnMindmap();

			// this is just to make sure that all icons are set to the right places on first start. had issues where icons are not in the right place on start.
			if (isFirstRun == true) {
				setTimeout(function() {
					LayoutManager.MindMapLayout.updateProgressIconsOnMindmap();
				}, 500);
			}
		}
	}
	LayoutManager.dealWithAvatar();
};

LayoutManager.MindMapLayout.updateProgressIconsOnMindmap = function() {
	// we are going to use the panel #mindmap-risk-indicator-container to put our icons
	// this is so because the panel is already setup to update properly for showing risk icons.(coloured boxes.)

	//console.log("updateProgressIconsOnMindmap CALLED!!");
	$('#mindmap-risk-indicator-container').html('');
	var mindMap$ = $(GlobalVariables.mindMapText);

	mindMap$.find("area").each(function() {
		var coordString = this.getAttribute("coords");
		var coords = coordString.split(",");
		var codePath = this.getAttribute("code-path");
		//var codePath;
		//if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.FULL)
		// 	codePath = $(this).attr('code-path');

		//var codePathOriginal = this.getAttribute("code-path");
		var showProgressIcon = this.getAttribute("showProgressIcon");
		//console.log(showProgressIcon);

		if (codePath == null || codePath == '')
			return;

		//console.log(codePath);

		//code path could have risk context dependent paths
		var differentRiskContextSpecificPaths = codePath.split("##");

		codePath = differentRiskContextSpecificPaths[0];
		//lets select the first one by default and we will change it if a match is found
		if (differentRiskContextSpecificPaths.length == 1) {//no risk context defined for this node. happens for the nodes in the right hand side
			//console.log("single path found");
			//LayoutManager.MindMapLayout.selectedRiskContextPath = $.trim(codePath);
		} else {
			for (var i = 0; i < differentRiskContextSpecificPaths.length; i++) {
				var thisContext = $.trim(differentRiskContextSpecificPaths[i]);
				if (thisContext.indexOf(LayoutManager.MindMapLayout.selectedRiskContextPath) == 0) {
					codePath = thisContext;
					//console.log("a match found for risk context. using path:");
					break;
				}
			}
		}

		var fullPathArray = codePath.split(",");
		var accessiblePathArray = Utilities.getPathArrayThatisAccessible(fullPathArray);

		//lets check if we need to disable this node because of risk selection.
		var isThisNodeOk = false;
		if (accessiblePathArray.length == 1)//this is root node!
			isThisNodeOk = true;
		else {
			for (var i = 0; i < accessiblePathArray.length; i++) {
				if (accessiblePathArray[i] == 'genericRootNode-added-by-tool' || $.inArray(accessiblePathArray[i], GlobalVariables.riskSelectionObject.getSelected()) != -1) {
					isThisNodeOk = true;
					break;
				}
			}
		}

		//console.log(accessiblePathArray+" - "+isThisNodeOk);
		var iconName = null;
		var iconTitle = null;
		if (isThisNodeOk == false) {
			iconName = 'slash.png';
			iconTitle = "You have chosen not to assess this risk.";
			$('area[coords="' + coordString + '"]').css('cursor', 'not-allowed');
			if (showProgressIcon == 'false')
				return;

		} else {
			if (showProgressIcon == 'false')
				return;

			var catJsNode = Utilities.findCatjsNode(accessiblePathArray, GlobalVariables.jsCat);
			var xmlNode = (catJsNode.xmlNode);

			var newjsNode = catJsNode;
			if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT
				|| GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK
				|| GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK) {
				newjsNode = $.extend(true, {}, catJsNode);
				Utilities.treeUpdateForRapidRepeatAndInterim(newjsNode, GlobalVariables.currentMindMapMode);
			}
			
			var answerCount = Utilities.countAnswers(newjsNode, GlobalVariables.qt);
			var percentage = Math.round((answerCount.answeredQuestion * 100.0) / (answerCount.totalQuestions));
			//console.log(percentage);
			if (isNaN(percentage))
				percentage = 100.0;

			if (answerCount.answeredQuestion == answerCount.totalQuestions && answerCount.totalQuestions != 0) {
				iconName = 'tick-circle.png';
				//CHANGE
				//iconTitle = GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-1'];
				iconTitle = 'All questions answered but they can still be changed';
			} else {
				iconName = null;
				
				if (answerCount.totalQuestions != 0) {
					//#CHANGE
					GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-2'] = '####1# questions answered so far';
					var tempTitle = GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-2'];
					tempTitle = tempTitle.replace("####1#",answerCount.answeredQuestion);
					//tempTitle = tempTitle.replace("####2#",answerCount.totalQuestions);
					iconTitle = tempTitle;
					if (percentage <= 33) {
						iconName = 'ui-progress-bar-1-blue.png';
						if (answerCount.answeredQuestion == 0){
							//#CHANGE
							GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-3'] = 'No questions answered yet.';
							iconTitle = GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-3'];
						}

					} else if (percentage <= 66) {
						iconName = 'ui-progress-bar-2-blue.png';
					} else {
						iconName = 'ui-progress-bar-3-blue.png';
					}
				} else {
					iconName = 'slash.png';
					//#CHANGE . add the following string
					if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
						iconTitle = 'There are no questions in this section.';
					}
					else {
						if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT)
							iconTitle = GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-4'];
						else if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.INTERIM)
							iconTitle = GlobalVariables.strings['galassify-mindmapLayout-icontooltip-tick-5'];	
					}
				}
				

			}
		}

		var x1 = $.trim(coords[0]);
		var y1 = $.trim(coords[1]);
		var x2 = $.trim(coords[2]);
		var y2 = $.trim(coords[3]);

		var height = parseInt(y2) - parseInt(y1);
		var width = parseInt(x2) - parseInt(x1);
		//subraction auto casts them to numbers

		var top = parseInt(y1) + height / 2 - 8;
		var left = parseInt(x1) - 20;

		if (showProgressIcon == 'right')
			left = width + left + 23;

		if (iconName != null) {
			var img = '<img class="overlay-image-progressIcon" style="top:' + top + 'px;left:' + left + 'px" src="images/' + iconName + '" title="' + iconTitle + '"/>';
			$('#mindmap-risk-indicator-container').append(img);
		}
	});

};


LayoutManager.MindMapLayout._resizeHandler = function() {
	if (GlobalVariables.currentLayout != GlobalVariables.Layouts.MINDMAP_LAYOUT)
		return;
	//console.log("resize handler called in mindmap. position of mindmap image");
	//console.log($('img#mindmap-image').position());
	var position$ = $('img#mindmap-image').position();
	if (position$ != null) {
		var left = position$.left;
		$("#mindmap-risk-indicator-container").css("margin-left", left + 'px');
	}

};

LayoutManager.MindMapLayout.imageLoaded = function() {
	$('#mindMapPanel-loading').hide();
};

LayoutManager.MindMapLayout.clickListener = function() {

	// if a rapid-repeat or interim path is missing, then the normal path will be used.
	var codePath = $(this).attr('code-path');

	if (GlobalVariables.useRiskContextForMindMap == true) {//this means codePath has many paths separated by ##
		var differentRiskContextSpecificPaths = codePath.split("##");

		codePath = differentRiskContextSpecificPaths[0];
		//lets select the first one by default and we will change it if a match is found
		if (differentRiskContextSpecificPaths.length == 1) {//no risk context defined for this node. happens for the nodes in the right hand side
			//console.log("single path found");
			LayoutManager.MindMapLayout.selectedRiskContextPath = $.trim(codePath);

		} else {
			console.log("multple path found!!! THIS SHOULD BE REMOVED!!!");
			for (var i = 0; i < differentRiskContextSpecificPaths.length; i++) {
				var thisContext = $.trim(differentRiskContextSpecificPaths[i]);
				if (thisContext.indexOf(LayoutManager.MindMapLayout.selectedRiskContextPath) == 0) {
					codePath = thisContext;
					//console.log("a match found for risk context. using path:");

					break;
				}
			}
		}

	}

	//console.log(codePath);
	var showProgressBar = $(this).attr('showProgressBar');

	var fullPathArray = codePath.split(",");

	var accessiblePathArray = Utilities.getPathArrayThatisAccessible(fullPathArray);

	//console.log(accessiblePathArray);

	/*
	if(fullPathArray.length != accessiblePathArray.length) {
	alert('The node you are trying to access is under a filter question that is'
	+' either not answered or has been answered as "no" or "don\'t know".'
	+' To access the mindmap node you just clicked, you must first answer this filter question as "yes".'
	+' You are now being directed to the filter question.');
	}
	*/

	//lets check if we need to disable this node because of risk selection.
	var isThisNodeOk = false;
	if (accessiblePathArray.length == 1)//this is root node!
		isThisNodeOk = true;
	else {
		for (var i = 0; i < accessiblePathArray.length; i++) {
			if (accessiblePathArray[i] == 'genericRootNode-added-by-tool' || $.inArray(accessiblePathArray[i], GlobalVariables.riskSelectionObject.getSelected()) != -1) {
				isThisNodeOk = true;
				break;
			}
		}
	}

	if (isThisNodeOk == false) {
		//alert(GlobalVariables.strings['galassify-mindmapLayout-msg-1']);
		LayoutManager._genericShowDialogBoxAlertReplacement(GlobalVariables.strings['galassify-mindmapLayout-msg-1']);
		
	} else {

		//we need to show sequential-grist if root node is selected.
		var catJsNode = null;
		if (accessiblePathArray.length == 1) {// this is root node!
			GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC;
			catJsNode = $.extend(true, {}, GlobalVariables.jsCat);
			Utilities.pruneJsCATforRiskSelection(catJsNode, GlobalVariables.riskSelectionObject.getSelected());
			Utilities.treeUpdateForSpecificORGenericORScreening(catJsNode, ["isSpecificRisk", "isGenericRootNodeInserteredByTool"]);
		} else {
			catJsNode = Utilities.findCatjsNode(accessiblePathArray, GlobalVariables.jsCat);
		}

		if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.FULL) {
			LayoutManager.setQuestionnaireLayout({
				jsCat : catJsNode,
				currentQuestionnairMode : GlobalVariables.currentQuestionnairMode
			});
		} else if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT 
			|| GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.INTERIM
			|| GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK
			|| GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK) {

			var newjsNode = $.extend(true, {}, catJsNode);
			Utilities.treeUpdateForRapidRepeatAndInterim(newjsNode, GlobalVariables.currentMindMapMode);
			var answerCount = Utilities.countAnswers(newjsNode, GlobalVariables.qt);
			if (answerCount.totalQuestions == 0) {
				//#CHANGE: 
				if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
					if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT)	
						LayoutManager._genericShowDialogBoxAlertReplacement('You have chosen to only see questions which may change on a daily basis. There are no such questions in this section');
					else if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK)	
						LayoutManager._genericShowDialogBoxAlertReplacement('You have chosen to only see questions related to your current life circumstances. There are no such questions in this section');
					else if(GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK)	
						LayoutManager._genericShowDialogBoxAlertReplacement('You have chosen to only see questions related to your past. There are no such questions in this section');
				}
				else {
					if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.RAPID_REPEAT)
						LayoutManager._genericShowDialogBoxAlertReplacement(GlobalVariables.strings['galassify-mindmapLayout-msg-2']);
					else if (GlobalVariables.currentMindMapMode == GlobalVariables.MindMapModes.INTERIM)
						LayoutManager._genericShowDialogBoxAlertReplacement(GlobalVariables.strings['galassify-mindmapLayout-msg-3']);
				}
				
				
				
			} else
				LayoutManager.setQuestionnaireLayout({
					jsCat : newjsNode,
					currentQuestionnairMode : GlobalVariables.currentQuestionnairMode
				});

		}

		//catJsNode.expand = false; //otherwise they stay open
	}
};