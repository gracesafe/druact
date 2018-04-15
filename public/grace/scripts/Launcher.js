function Launcher() {
}

Launcher.r = function() {
	var node = $("#tree").dynatree("getTree").getNodeByKey("mental-health-risk#suic#sui-specific");
	node.removeChildren();
};

Launcher.a = function() {
	var node = $("#tree").dynatree("getTree").getNodeByKey("mental-health-risk#suic#sui-specific");
	var xmlNode = node.data.xmlNode;
	var jsNode = Utilities.xmlToJson(xmlNode);
	console.log(jsNode);
	for(var i=0;i< jsNode.children.length; i++) {
		node.addChild(jsNode.children[i]);
	}
	
};

Launcher.initialiseForGristSERVERLaunch = function(launchParams) {
	GlobalVariables.runningFromServer = true;
	if (launchParams.altAssMode != null) {
		GlobalVariables.isMHA = true;
		GlobalVariables.MHAParamData = launchParams.altAssMode;
	}
	
	if (launchParams.language != null && launchParams.language != '') {
		GlobalVariables.language = launchParams.language;
		console.log("set language to "+GlobalVariables.language);
	}
	if (launchParams.patientId != null && launchParams.patientId != '')
		GlobalVariables.patientId = launchParams.patientId;

	if (launchParams.sid != null && launchParams.sid != '')
		GlobalVariables.sid = launchParams.sid;
		
		
	GlobalVariables.serverLaunch.completeUrls(launchParams, "grist");
	GlobalVariables.launchMethod = GlobalVariables.serverLaunch;

	Launcher._commonForGristLaunch(true, launchParams);

	if (launchParams.metaPatientName != null && launchParams.metaPatientName != '')
		GlobalVariables.patientName = launchParams.metaPatientName;

	if (launchParams.clinicianClientID != null && launchParams.clinicianClientID != '')
		GlobalVariables.clinicianClientID = launchParams.clinicianClientID;
	
	if (launchParams.assessmentId != null && launchParams.assessmentId != '')
		GlobalVariables.assessmentId = launchParams.assessmentId;
	

	if (launchParams.lightLaunchStatus != null && launchParams.lightLaunchStatus != '') {
		if (launchParams.lightLaunchStatus == '1' || launchParams.lightLaunchStatus == 'true')
			GlobalVariables.lightLaunchStatus = true;
		else
			GlobalVariables.lightLaunchStatus = false;
	}
			

	//LayoutManager.setQuestionnaireLayout(jsCat);

	//LayoutManager.setMindMapLayout(true);
	Launcher._commonFinalStepForGristLaunch(null);

	//console.log(jsCat);

};

Launcher.initialiseForGristLocalLaunch = function(launchParams) {
	GlobalVariables.runningFromServer = false;

	loadAT = launchParams.loadAT;
	GlobalVariables.launchMethod = GlobalVariables.localLaunchGrist;

	//GlobalVariables.serverLaunchType = 'repeat';
	GlobalVariables.serverLaunchType = 'resume';
	GlobalVariables.patientName = 'Demo Person';
	GlobalVariables.patientId = '123';
	GlobalVariables.sid = 'temp-sid';
	GlobalVariables.clinicianClientID = 'test-grist-id';
	GlobalVariables.assessmentId = '123';
	// enable this to activate language pack
	//GlobalVariables.language = 'dutch';
	Launcher._commonForGristLaunch(loadAT, launchParams);


	Launcher._commonFinalStepForGristLaunch(null);

};

Launcher._commonFinalStepForGristLaunch = function(param) {
	//LayoutManager.setMindMapLayout({isFirstRun:true});

	GlobalVariables.htmlFragments = XMLInput.readHtmlFragments(GlobalVariables.currentPopulationBasedMode);

	//the delay here makes sure all the tasks so forth are completed before carry on further. without this, config file vars are not loaded properly for IE.
	setTimeout(function() {
		LayoutManager.setOpeningPageLayout();
	}, 50);

};

Launcher._commonForGristLaunch = function(loadAT, launchParams) {
	
	Utilities.deleteTreeCookies();
	GlobalVariables.operationMode = 'grist';

	GlobalVariables.showClassificationOption = false;
	GlobalVariables.useRiskContextForMindMap = true;
	
	//initialise acas
	if(launchParams.ACAS == undefined)
		GlobalVariables.ACASstatus = null;
	else
		GlobalVariables.ACASstatus = launchParams.ACAS;
	//TEMP HACK
	//GlobalVariables.ACASstatus = "1";

	GlobalVariables.strings = XMLInput.getAppStrings(GlobalVariables.launchMethod.appStringsUrl);
	console.log("App strings loaded");
	GlobalVariables.cat = XMLInput.getCat(GlobalVariables.launchMethod.catUrl);
	var qtXML = XMLInput.getQT(GlobalVariables.launchMethod.qtUrl);
	
	
	if(GlobalVariables.language != null) {
		GlobalVariables.plp = XMLInput.getPLP(GlobalVariables.launchMethod.plpUrl);
		console.log("PLP loaded for "+GlobalVariables.language);
		Utilities.overwriteXMLwithPLP(GlobalVariables.cat.documentElement, GlobalVariables.plp.documentElement);
		Utilities.overwriteXMLwithPLP(qtXML.documentElement, GlobalVariables.plp.documentElement);
		Utilities.overwriteAppStringsWithPLP(GlobalVariables.strings, GlobalVariables.plp.documentElement);
		GlobalVariables.plp = null; //don't need it now
	}
	
	
	GlobalVariables.qt = Utilities.getParsedQTFromXML(qtXML);
	var catRoot = GlobalVariables.cat.documentElement;
	Utilities.markRiskJudgementQuestion(catRoot);

	
	

	if (loadAT == true)
		GlobalVariables.at = XMLInput.mergeATwithQT(GlobalVariables.launchMethod.atUrl, GlobalVariables.qt);
	else {
		var xml = $.parseXML("<answers></answers>");
		GlobalVariables.at = xml;
	}

	var atInString = XMLOutput._xml_to_string(GlobalVariables.at);
	console.log("AT received: ");
	console.log(atInString);

	if (launchParams.demogDataFile != null && launchParams.demogDataFile != '')
		GlobalVariables.demogData = $.trim(launchParams.demogDataFile);
	if (launchParams.personalDataJSONstring != null && launchParams.personalDataJSONstring != '') {
		try {
			GlobalVariables.personalData = $.parseJSON(launchParams.personalDataJSONstring);
			GlobalVariables.personalData = GlobalVariables.personalData.personal_info;
		} catch (e) {
			GlobalVariables.personalData = null;
			console.log("ERROR parsing personal data");
			console.log(e);
		}
	}

	if (GlobalVariables.demogData != null && GlobalVariables.demogData != "")
		XMLInput.mergeAutoDemographicInfo(GlobalVariables.demogData, GlobalVariables.qt, GlobalVariables.cat);

	if (launchParams.fe != null && launchParams.fe == '1')
		GlobalVariables.isfixErrorFlagTrue = true; //false by default
		



	if (GlobalVariables.serverLaunchType == 'repeat')
		Utilities.answerAllLayerQuestionsWithPersistentAnswers(catRoot);

	//Utilities.markSpecificAndGenericNodes(catRoot); HAD to be moved after the config file reading stage.

	GlobalVariables.catPopulation = catRoot.getAttribute("populations");
	if(launchParams.forcePopulation != null)
		GlobalVariables.catPopulation = launchParams.forcePopulation;

	//let us read the overall formulation and overall management attributes
	var overallRiskFormulationData = Utilities.parseRiskFormulationLispString(catRoot.getAttribute("overall-formulation"));
	//GlobalVariables.overallRiskFormulationDefaultTitle = 'Overall thoughts about my safety';
	//GlobalVariables.overallRiskFormulationDefaultText = '';
	GlobalVariables.overallRiskFormulationDefaultTitle = overallRiskFormulationData.title;
	GlobalVariables.overallRiskFormulationDefaultText = overallRiskFormulationData.headings;

	var overallManagementData = Utilities.parseRiskFormulationLispString(catRoot.getAttribute("overall-management"));
	//GlobalVariables.overallManagementPlanDefaultTitle = 'My Action Plan';
	//GlobalVariables.overallManagementPlanDefaultText = 'The areas I want to work on are:\n\nThings which helped me in the past are:\n\nThings which others found helpful and which I would like to try are:\n\nThe improvements I want to make are: My targets are:\n\nI need the following to help me achieve my targets:\n\nI will start on: I will check my progress on:\n\nI aim to meet my targets by:\n\nI will motivate myself by:\n\nI will get myself back on track by:\n\nMy reward for achieving my targets will be:\n\nAchieving my targets has made me feel:\n\nIn achieving my targets, I have learned:\n\n';
	GlobalVariables.overallManagementPlanDefaultTitle = overallManagementData.title;
	GlobalVariables.overallManagementPlanDefaultText = overallManagementData.headings;

	//write the values of mindmap url and image... and remove previous setters
	var placeholderForMindMap = XMLInput.getFolderLocationFromXMLconfig(GlobalVariables.launchMethod.mindMapMappingUrl, GlobalVariables.catPopulation);
	var placeholderForHelpFiles = XMLInput.getFolderLocationFromXMLconfig(GlobalVariables.launchMethod.configXMLforHTMLfiles, GlobalVariables.catPopulation);
	GlobalVariables.riskSpecificNodeList = XMLInput.getRiskSpecificNodeList(GlobalVariables.launchMethod.configXMLforRiskSpecificfiles);

	Utilities.addGenericQuestionsToCatXml(catRoot, 'suic');
	//we are copying all the generic nodes from suic to a separate top level container
	Utilities.markSpecificAndGenericNodes(catRoot);
	Utilities.markRapidRepeatAndIntermAndScreeninginNodes(catRoot);

	GlobalVariables.launchMethod.mindMapUrl = 'grist/mindmaps/' + placeholderForMindMap + '/mindmap.xml';
	GlobalVariables.launchMethod.mindMapImage = 'grist/mindmaps/' + placeholderForMindMap + '/mindmap-image.png';

	GlobalVariables.launchMethod.quickHelpUrl = 'grist/html/help-files/' + placeholderForHelpFiles + '/quickHelp.html';
	
	//GlobalVariables.launchMethod.supportAndAdviceUrl = 'grist/html/help-files/'+placeholderForHelpFiles+'/supportAndAdvice.html';

	if (GlobalVariables.catPopulation == 'service-user' || GlobalVariables.catPopulation == 'service-user-dutch' 
		|| GlobalVariables.catPopulation == 'friends-supporters' || GlobalVariables.catPopulation == 'hybrid-veteran-service-user') {

		GlobalVariables.riskBackgroungColorsHex = GlobalVariables.riskBackgroungColorsHexVIOLET;
		//GlobalVariables.launchMethod.logo = 'grist/images/mygrist-logo-green.png';
		GlobalVariables.launchMethod.bigLogo = 'grist/images/mygrist-logo-medium-green.png';

		GlobalVariables.showHelpTextForScaleQuestions = false;
		GlobalVariables.currentPopulationBasedMode = GlobalVariables.PopulationBasedModes.FIRST_PERSON;
	} else {
		GlobalVariables.riskBackgroungColorsHex = GlobalVariables.riskBackgroungColorsHexRED;
		//GlobalVariables.launchMethod.logo = 'grist/images/mygrist-logo-blue.png';
		GlobalVariables.launchMethod.bigLogo = 'grist/images/mygrist-logo-medium-blue.png';
		GlobalVariables.showHelpTextForScaleQuestions = false;
		GlobalVariables.currentPopulationBasedMode = GlobalVariables.PopulationBasedModes.THIRD_PERSON;
	}
	GlobalVariables.mindMapText = XMLInput.getMindMapText(GlobalVariables.launchMethod.mindMapUrl);
	
	//set header height. different in different modes
	if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		GlobalVariables.headerHeight = GlobalVariables.headerHeightFirstPerson;
	else
		GlobalVariables.headerHeight = GlobalVariables.headerHeightThirdPerson;

	//actions and personal info only apply to first person mode.
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		XMLInput.getActions(GlobalVariables.launchMethod.actionsDataUrl);
	}


	//create risk selection object
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		GlobalVariables.riskSelectionObject = Utilities.createRiskSelectionObject(catRoot, 'all');
	//assess all risks in mygrace
	else
		GlobalVariables.riskSelectionObject = Utilities.createRiskSelectionObject(catRoot, GlobalVariables.riskSelectionInputString);

	//set preference for showing inaccessible nodes in tree
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		GlobalVariables.hideClosedNodesInTree = true;
	else
		GlobalVariables.hideClosedNodesInTree = false;

	//add correct jquery ui css
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		$('head').append('<link rel="stylesheet" href="css/jquery-ui-css-green/jquery-ui-1.10.1.custom.min.css" type="text/css" media="screen" title="no title" charset="utf-8"/>');
		if(GlobalVariables.catPopulation == 'friends-supporters')
			GlobalVariables.title = GlobalVariables.strings['galassify-title-1p-friends'];
		else
			GlobalVariables.title = GlobalVariables.strings['galassify-title-1p'];
	} else {
		$('head').append('<link rel="stylesheet" href="css/jquery-ui-css-blue/jquery-ui-1.10.1.custom.min.css" type="text/css" media="screen" title="no title" charset="utf-8"/>');
		GlobalVariables.title = GlobalVariables.strings['galassify-title-3p'];
	}

	GlobalVariables.jsCat = Utilities.xmlToJson(catRoot);
	var screeningXml = XMLInput.getScreeningXml(GlobalVariables.launchMethod.screeningXmlUrl);
	GlobalVariables.screeningTreeJson = Utilities.getScreeningJson(screeningXml.documentElement);
	screeningXml = null; //don't need this anymore
};