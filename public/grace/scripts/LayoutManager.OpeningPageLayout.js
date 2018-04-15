//*****************************************************************************************
//					Loading page LAYOUT, also risk context
//*****************************************************************************************
LayoutManager.OpeningPageLayout = {};
LayoutManager.OpeningPageLayout.acasWarningHiddenByUser = false;
LayoutManager.setOpeningPageLayout = function(obj) {

	if(GlobalVariables.currentLayout != GlobalVariables.Layouts.OPENING_PAGE_LAYOUT) {
		if ((obj !== undefined && obj.registerNewNavigation == false))
			LayoutNavigator.addNewLayoutToHistoryOnly(null, GlobalVariables.Layouts.OPENING_PAGE_LAYOUT, null);
		else
			LayoutNavigator.addNewLayout(null, GlobalVariables.Layouts.OPENING_PAGE_LAYOUT, null);
	}
	
	LayoutManager.clearLayout();
	$('body').removeClass();

	GlobalVariables.previousLayout = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.OPENING_PAGE_LAYOUT;
	GlobalVariables.currentMindMapMode = GlobalVariables.MindMapModes.FULL;

	GlobalVariables.currentClinicianVersionPathway = null;
	GlobalVariables.currentMygraceVersionPathways = null;

	var data = '<div id="top-header"></div><div id="openingPagePanel"></div>';

	$('body').removeClass();
	$('body').html(data);
	LayoutManager.setupHeader();
	LayoutManager._addMenuButtons();

	$('#openingPagePanel').css('margin-top', (GlobalVariables.headerHeight + 10) + 'px');

	$('#openingPagePanel').html(GlobalVariables.htmlFragments.openingPageMsg);

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		//avatar popup. for attributes are only put for first person mode
		var i_mindmap$ = $('img[for="openingPage-link-mindmap"]');
		i_mindmap$.webuiPopover(Utilities.createPopOverOptions(i_mindmap$.attr('header'), i_mindmap$.prop('title'), {
			placement : 'right',
			delay : {
				show : 0,
				hide : 0
			}
		})).prop('title', '');
		var i_wellbeing$ = $('img[for="openingPage-link-wellbeing"]');
		i_wellbeing$.webuiPopover(Utilities.createPopOverOptions(i_wellbeing$.attr('header'), i_wellbeing$.prop('title'), {
			placement : 'right',
			delay : {
				show : 0,
				hide : 0
			}
		})).prop('title', '');
		var i_screening$ = $('img[for="openingPage-link-screening"]');
		i_screening$.webuiPopover(Utilities.createPopOverOptions(i_screening$.attr('header'), i_screening$.prop('title'), {
			placement : 'right',
			delay : {
				show : 0,
				hide : 0
			}
		})).prop('title', '');
	}
	else {
		$('img.helpIcon').tooltip();
	}

	if(GlobalVariables.ACASstatus == "2" && LayoutManager.OpeningPageLayout.acasWarningHiddenByUser == false) {
		$('div#acas-warning').show();
		$('a#acas-ok-button').button().click(function() {
			$('div#acas-warning').hide();
			LayoutManager.OpeningPageLayout.acasWarningHiddenByUser = true;
		});
	}


	$('#openingPage-link-screening').click(function() {
		if ($(this).hasClass("active")) {
			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
				GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.SCREENING_ONLY;
				LayoutManager.setupScreeningOnly();
			}
			else {
				GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_SAFETY;
				//LayoutManager.setSteppedScreeningLayout(); //DISABLED FOR NOW. NOT USING ALI'S ALGORITHM ANYMORE. CODE IS STILL KEPT IN AS WE MAY NEED SIMILAR INTERFACE LATER.
				LayoutManager.setupScreeningOnly();
			}
		}
	});

	$('#openingPage-link-mindmap').click(function() {
		if ($(this).hasClass("active")) {
			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON)
				GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.FULL_ASSESSMENT;
			else
				GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_LIFE;
			LayoutManager.setMindMapLayout({
				currentMindmapMode : GlobalVariables.MindMapModes.FULL
			});
		}
	});
	$('#openingPage-link-mindmap-no-padlock').click(function() {
		GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_LIFE_NO_PADLOCK;
		
		/*
		LayoutManager.setMindMapLayout({
			currentMindmapMode : GlobalVariables.MindMapModes.RAPID_REPEAT
		});
		*/
		
		GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC;
		GlobalVariables.currentMindMapMode = GlobalVariables.MindMapModes.RAPID_REPEAT;
		var catJsNode = $.extend(true, {}, GlobalVariables.jsCat);
		Utilities.treeUpdateForRapidRepeatAndInterim(catJsNode, GlobalVariables.MindMapModes.RAPID_REPEAT);
		LayoutManager.setQuestionnaireLayout({
			jsCat : catJsNode,
			currentQuestionnairMode : GlobalVariables.currentQuestionnairMode
		});
				
	});
	$('#openingPage-link-mindmap-silver-padlock').click(function() {
		GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_LIFE_SILVER_PADLOCK;
		/*
		LayoutManager.setMindMapLayout({
			currentMindmapMode : GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK
		});
		*/
		GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC;
		GlobalVariables.currentMindMapMode = GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK;
		var catJsNode = $.extend(true, {}, GlobalVariables.jsCat);
		Utilities.treeUpdateForRapidRepeatAndInterim(catJsNode, GlobalVariables.MindMapModes.ONLY_SILVER_PADLOCK);
		LayoutManager.setQuestionnaireLayout({
			jsCat : catJsNode,
			currentQuestionnairMode : GlobalVariables.currentQuestionnairMode
		});		
		
		
	});
	$('#openingPage-link-mindmap-gold-padlock').click(function() {
		GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_LIFE_GOLD_PADLOCK;
		/*
		LayoutManager.setMindMapLayout({
			currentMindmapMode : GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK
		});
		*/
		
		GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.RISK_SPECIFIC_AND_GENERIC;
		GlobalVariables.currentMindMapMode = GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK;
		var catJsNode = $.extend(true, {}, GlobalVariables.jsCat);
		Utilities.treeUpdateForRapidRepeatAndInterim(catJsNode, GlobalVariables.MindMapModes.ONLY_GOLD_PADLOCK);
		LayoutManager.setQuestionnaireLayout({
			jsCat : catJsNode,
			currentQuestionnairMode : GlobalVariables.currentQuestionnairMode
		});	
		
	});

	$('#openingPage-link-profile').click(function() {
		if ($(this).hasClass("active")) {
			LayoutManager.setRiskOverviewLayout();
		}
	});

	$('#openingPage-link-judement').click(function() {
		if ($(this).hasClass("active")) {
			LayoutManager.setRiskJudgementLayout();
		}
	});
	$('#openingPage-link-advice').click(function() {
		if ($(this).hasClass("active")) {
			LayoutManager.setAdviceLayout();
		}
	});
	$('#openingPage-link-wellbeing').click(function() {
		if ($(this).hasClass("active")) {
			GlobalVariables.currentMygraceVersionPathways = GlobalVariables.mygraceVersionPathways.MY_WELLBEING;
			LayoutManager.setupWellBeingAssessment();
		}
	});

	// these are for third person mode links
	$('#openingPage-link-sequential').click(function() {
		if ($(this).hasClass("active")) {
			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON)
				GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.SEQUENTIAL_ASSESSMENT;
			LayoutManager.setupSequentialAssessment();
		}
	});

	$('#openingPage-link-screening-all-data').click(function() {
		if ($(this).hasClass("active")) {
			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON)
				GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.SCREENING_ALL_DATA;

			LayoutManager.setupScreeningAllQuestions();
		}
	});

	$('#openingPage-link-mindmap-rapid-repeat').click(function() {
		if ($(this).hasClass("active")) {
			if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON)
				GlobalVariables.currentClinicianVersionPathway = GlobalVariables.ClinicianVersionPathways.RAPID_REPEAT_ASSESSMENT;
			LayoutManager.setMindMapLayout({
				currentMindmapMode : GlobalVariables.MindMapModes.RAPID_REPEAT
			});
		}
	});

	LayoutManager.dealWithAvatar();

};