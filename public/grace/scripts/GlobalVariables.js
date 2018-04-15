function GlobalVariables() {}

GlobalVariables.CURRENT_DATE = new Date(); // replace this with date obtained from the server

GlobalVariables.VERSION = "2.8";

GlobalVariables.TEMP_EVALUATION = Array();

GlobalVariables.runningFromServer = false;
GlobalVariables.serverLaunchType = null; //new, resume, repeat
GlobalVariables.atHasBeenUploadedAtLeastOnce = false;


GlobalVariables.isMHA = false;
GlobalVariables.MHAParamData = null;

GlobalVariables.operationMode = null; // will either be "advance" or "grist"

GlobalVariables.qt = null;
GlobalVariables.cat = null;
GlobalVariables.at = null;
GlobalVariables.plp = null;
GlobalVariables.jsCat = null;
GlobalVariables.catPopulation = null;
GlobalVariables.language = null;
GlobalVariables.textInputData = new Array(); // this will hold all the text-input data in the same format as qt.
GlobalVariables.screeningTreeJson = null;
GlobalVariables.actionsData = null;
GlobalVariables.personalisedActionsData = {galassify_action_open_url_templates_overrides:[]};;
GlobalVariables.personalData = null;

GlobalVariables.riskSpecificNodeList = null; //initialised later from xml file

GlobalVariables.htmlFragments = null; //initlialised in launcher

GlobalVariables.showClassificationOption = false;
GlobalVariables.useActionAlerts = false;

GlobalVariables.useRiskContextForMindMap = false;
GlobalVariables.title = 'title not set';
GlobalVariables.patientName = null;
GlobalVariables.patientId = null;
GlobalVariables.sid = null;
GlobalVariables.clinicianClientID = null; //this is the gristID. we need this to redirect url after finishing with the tool
GlobalVariables.lightLaunchStatus = null;
GlobalVariables.assessmentId = null; //set later in launcher

GlobalVariables.treeWidth = 300; //overriden in config file.
GlobalVariables.headerHeight = null; //set later.
GlobalVariables.headerHeightThirdPerson = 125;
GlobalVariables.headerHeightFirstPerson = 140;
GlobalVariables.searchHeaderPanelHeight = 40;
GlobalVariables.headerDescriptionHeightInMindMap = 30;//111;
GlobalVariables.footerHeight = 64;// this included padding of 10 pixels and border of 4!!
GlobalVariables.footerHeightOpeningPage = 124;// this included padding of 10 pixels and border of 4!!

GlobalVariables.randomNumber = Math.floor(Math.random() * 1000000); //used to name cookies for the tree 

/* all timer events have their ids stored here. so we can manually clear them if a new tree node is selected before previous one was finished loading.
this is necessary as we can not delete all the timed events.. some of them might be system events.
this allows us to delete only those events that were created by us. 
*/
GlobalVariables.timerQueueArray = [];  

GlobalVariables.launchParams = null; //must be initialised if server method is used.

GlobalVariables.overallRiskComment = null;

GlobalVariables.useSocnet = false; //should be overriden by each launch type

GlobalVariables.showHelpTextForScaleQuestions = false; //should display the contents of the help-text tag in help attribute for scale questions under the boxes?


GlobalVariables.showProgressIconsOnMindmap = true; // a tick icon is shown in the mindmap when that node is complete.

//GlobalVariables.anyQuestionAnswered = false;

GlobalVariables.helpTab = null; //used to keep track of the external tab(in browser) used to show help stuff from drupal website

GlobalVariables.highMgThresholdToTriggerHighlightedNodes = 0.5; //this threshold decides if a leaf node is going to be put in "highlighted issues" list on profile page. applies to first person mode only. 

GlobalVariables.riskSelectionObject = null; //created in launcher.
GlobalVariables.riskSelectionInputString = null; //this gets set when parsing input AT and is used when creating new riskSelectionObject
GlobalVariables.showRiskSelection = false; //reset if AT has previous-assessment-date in it.


GlobalVariables.showButtonPopover = true;

GlobalVariables.myGuideStrings = {}; // this will be initialised from config file and will hold strings to show in avatar
GlobalVariables.buttonToolTip ={};
GlobalVariables.whereToText ={};


GlobalVariables.demogData = null; //initialised at startup. this feature allows trusts to send us demographic data for patients. those data fields become readonly in the tool

GlobalVariables.prevAssessmentDate = null; //initialised from AT. this is used to decide if we are showing risk selection dropdown box.
GlobalVariables.isfixErrorFlagTrue = false; //passed to the tool as param "fe"

GlobalVariables.hideClosedNodesInTree = true; //if true, closed nodes won't show up in tree. search reseults also won't show closed nodes.
/**
 * holds a list of all the actions triggered so far
 * Data structure: 
 * {
 * 		id: id of action
 * 		metaData: <more info about the action. this is action specific. blank for url action. will have more info for email actions>
 * }
 */
GlobalVariables.allActionsTriggered = new Array(); 

GlobalVariables.autoSaveTrigger = 5; //number of question that user must change before triggering an auto save
GlobalVariables.minTimeBeforeAutoSaveTrigger = 30; //wait atleast 30 seconds between auto saves.
GlobalVariables.ACASstatus = null;

//=================================================================================================
//					Population based mode
//=================================================================================================
GlobalVariables.PopulationBasedModes = {
    FIRST_PERSON : "First Person",
    THIRD_PERSON : "Third Person"
};
GlobalVariables.currentPopulationBasedMode = null; //initialised based on population

//=================================================================================================
//					SCREENING AND NORMAL MODE FOR QUESTIONNAIR LAYOUT
//=================================================================================================
GlobalVariables.QuestionnairModes = {
    NORMAL : "Normal",
    SCREENING : "Screening",
    RISK_SPECIFIC_ONLY : "Risk Specific Only", //only show risk specific questions
    GENERIC_ONLY : "Generic Only",
    RISK_SPECIFIC_AND_GENERIC : "Risk Specific and generic",
    WELL_BEING : 'well being'
};
GlobalVariables.currentQuestionnairMode = GlobalVariables.QuestionnairModes.NORMAL; //default to mode FULL

GlobalVariables.Layouts = {
    MINDMAP_LAYOUT : 1,
    RISK_JUDGEMENT_LAYOUT : 2,
    DETAILED_HELP_LAYOUT : 3,
    QUESTIONNAIRE_LAYOUT : 4,
    FINISHED_LAYOUT : 5,
    SOCNET_LAYOUT : 6,
    OPENING_PAGE_LAYOUT : 7,
    ADVICE_LAYOUT : 8,
    RISK_OVERVIEW : 9, // my profile
    FINISH_INTERMEDIATE_LAYOUT: 10,
    STEPPED_SCREENING: 11
};
GlobalVariables.currentLayout = null; //assigned later.
GlobalVariables.previousLayout = null; //assigned later.


/*=================================================================================================
 * this is used to keep track which pathway was chosen on homepage in clinician version of the tool
 =================================================================================================*/
GlobalVariables.ClinicianVersionPathways = {
    SCREENING_ALL_DATA : 1,
    SCREENING_ONLY : 2,
    FULL_ASSESSMENT : 3,
    RAPID_REPEAT_ASSESSMENT : 4,
    SEQUENTIAL_ASSESSMENT : 5
};
GlobalVariables.currentClinicianVersionPathway = null;

/*=================================================================================================
 * this is used to keep track which pathway was chosen on homepage in myGRaCE version of the tool
 =================================================================================================*/
GlobalVariables.mygraceVersionPathways = {
    MY_LIFE : 1,
    MY_WELLBEING : 2,
    MY_SAFETY : 3 ,
    MY_LIFE_NO_PADLOCK: 4,
    MY_LIFE_SILVER_PADLOCK: 5,
    MY_LIFE_GOLD_PADLOCK: 6};
GlobalVariables.currentMygraceVersionPathways = null;

//=================================================================================================
//					RAPID-REPEAT AND INTERIM FEATURE
//=================================================================================================
/*	this can be used to switch rapidrepat/interim feature on or off. setting this to false will remove all rapid-repeat/iterim etc from the interface
*	if set to false, MAKE SURE GlobalVariables.currentMindMapMode is set to FULL
*/
GlobalVariables.useMindMapModes = true;
GlobalVariables.MindMapModes = {
    FULL : "Full",
    RAPID_REPEAT : "Rapid Repeat",
    INTERIM : "Interim",
    ONLY_SILVER_PADLOCK : "Only silver padlocks",
    ONLY_GOLD_PADLOCK : "Only gold padlocks"
};
GlobalVariables.currentMindMapMode = GlobalVariables.MindMapModes.FULL; //default to mode FULL
//================================================================================================= 


GlobalVariables.overallRiskFormulationDefaultTitle = null; //initialised from cat
GlobalVariables.overallRiskFormulationDefaultText = null; //initialised from cat.		 OLD value: "-------------------------------------------------------\nPast factors (Historical, Pre-existing or Predisposing)\n-------------------------------------------------------\n\n\n-------------------------------------\nRisk triggers (Precipitating factors)\n-------------------------------------\n\n\n-------------------------------------------\nPersistent contextual factors(Perpetuating)\n-------------------------------------------\n\n";
GlobalVariables.overallManagementPlanDefaultTitle = null; //initialised from cat.
GlobalVariables.overallManagementPlanDefaultText = null; //initialised from cat.

GlobalVariables.overallRiskFormulationText = null;
GlobalVariables.overallRiskFormulationTextPrevious = null;
GlobalVariables.overallManagementPlanText = null;
GlobalVariables.overallManagementPlanTextPrevious = null;

/*
 * warning for risk assessment before submission
 */
GlobalVariables.riskAssessmentWarningData = new Array();
GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,suic,sui-specific", riskJudgementPath:"mental-health-risk,suic"});
GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,sh,sh-specific", riskJudgementPath:"mental-health-risk,sh"});
GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,hto,hto-specific", riskJudgementPath:"mental-health-risk,hto"});
GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,risk-dep,dependents-specific", riskJudgementPath:"mental-health-risk,risk-dep"});
GlobalVariables.riskAssessmentWarningData.push({specificNodePath:"mental-health-risk,vuln-su,vuln-specific", riskJudgementPath:"mental-health-risk,vuln-su"});




//=========================================================================================================
//					Server Launch config
//=========================================================================================================
GlobalVariables.serverLaunch = {};
GlobalVariables.serverLaunch.completeUrls = function(launchParams, gristORadvance) {
	GlobalVariables.serverLaunch.actionsDataUrl = 'load-actions-data.php';
	GlobalVariables.serverLaunch.catUrl = 'load-knowledge.php?SID='+launchParams.sid;
	GlobalVariables.serverLaunch.qtUrl = 'question-data.php?SID='+launchParams.sid;
	GlobalVariables.serverLaunch.atUrl = 'answer-data.php?SID='+launchParams.sid;
	GlobalVariables.serverLaunch.atOutputUrl = 'dss-run.php?SID='+launchParams.sid+"&noCAT=1";
	GlobalVariables.serverLaunch.plpUrl = 'plp-data.php?SID='+launchParams.sid;
	GlobalVariables.serverLaunch.appStringsUrl = 'strings.js.php';
	//GlobalVariables.serverLaunch.consensusResponseUrl = 'post-verification-submission.php?SID='+launchParams.sid;
	GlobalVariables.serverLaunch.actionAlertSendEmail = 'action-alert-send-email.php?SID='+launchParams.sid;
	
	if(GlobalVariables.isMHA == true) {
		console.log("MHA parameter passes. adding parameter to all links");
		GlobalVariables.serverLaunch.catUrl += '&altAssMode='+GlobalVariables.MHAParamData;
		GlobalVariables.serverLaunch.qtUrl += '&altAssMode='+GlobalVariables.MHAParamData;
		GlobalVariables.serverLaunch.atUrl += '&altAssMode='+GlobalVariables.MHAParamData; 
		GlobalVariables.serverLaunch.atOutputUrl += '&altAssMode='+GlobalVariables.MHAParamData;
		GlobalVariables.serverLaunch.consensusResponseUrl += '&altAssMode='+GlobalVariables.MHAParamData;
		GlobalVariables.serverLaunch.actionAlertSendEmail += '&altAssMode='+GlobalVariables.MHAParamData;
	}
	
	if(GlobalVariables.language != null) {
		console.log("language parameter passes. adding parameter to all links "+GlobalVariables.language);
		GlobalVariables.serverLaunch.catUrl += '&language='+GlobalVariables.language;
		GlobalVariables.serverLaunch.qtUrl += '&language='+GlobalVariables.language;
		GlobalVariables.serverLaunch.atUrl += '&language='+GlobalVariables.language; 
		GlobalVariables.serverLaunch.atOutputUrl += '&language='+GlobalVariables.language;
		GlobalVariables.serverLaunch.consensusResponseUrl += '&language='+GlobalVariables.language;
		GlobalVariables.serverLaunch.actionAlertSendEmail += '&language='+GlobalVariables.language;
		GlobalVariables.serverLaunch.plpUrl += '&language='+GlobalVariables.language;
	}
	
	
	if(gristORadvance == 'grist') {
		GlobalVariables.serverLaunch.mindMapUrl = null; //will be set later
		GlobalVariables.serverLaunch.mindMapImage = null;
		GlobalVariables.serverLaunch.mindMapMappingUrl= 'grist/mindmaps/population-mindmap-mapping.xml';
		
		
		GlobalVariables.serverLaunch.configXMLforHTMLfiles = 'grist/html/help-files/population-helpfile-mapping.xml';
		GlobalVariables.serverLaunch.configXMLforRiskSpecificfiles = 'grist/xml/risk-specific-questions-mapping.xml';
		//GlobalVariables.serverLaunch.screeningFinishMessageUrl = 'grist/html/screeningFinishMessage.html';
		
		
		GlobalVariables.serverLaunch.quickHelpUrl = null; //will be set later
		
		//GlobalVariables.serverLaunch.supportAndAdviceUrl = null;
	}
	else if(gristORadvance == 'advance') {
		
		GlobalVariables.serverLaunch.mindMapUrl = 'advance/xml/mindmap.xml';
		GlobalVariables.serverLaunch.mindMapImage = 'advance/images/mindmap-advance.png';
		GlobalVariables.serverLaunch.logo = 'advance/images/advance-logo.png';

	}
	
	GlobalVariables.serverLaunch.ClientOrPatient = '';
	if(gristORadvance == 'grist')
		GlobalVariables.serverLaunch.ClientOrPatient = 'patient-id';
	else
		GlobalVariables.serverLaunch.ClientOrPatient = 'client-id';
	
	
	
	if(launchParams.assessmentType == null || launchParams.assessmentType == '') {
		console.log('load configuration used: Fresh Assessment');
		GlobalVariables.serverLaunchType = 'new';
		GlobalVariables.serverLaunch.catUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId;		
		GlobalVariables.serverLaunch.atOutputUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId; //will need &resume=1|0.
		//GlobalVariables.serverLaunch.consensusResponseUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId; //will need &resume=1|0.
		GlobalVariables.serverLaunch.atUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId;
	}
	else if(launchParams.assessmentType == 'resume') {
		console.log('load configuration used: Resume Assessment');
		GlobalVariables.serverLaunchType = 'resume';
		GlobalVariables.serverLaunch.catUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=1';
		GlobalVariables.serverLaunch.qtUrl += '&assessment-id='+launchParams.assessmentId;
		GlobalVariables.serverLaunch.atUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=1';
		if(launchParams.warned != '')
			GlobalVariables.serverLaunch.catUrl += '&warned='+launchParams.warned;
		
		GlobalVariables.serverLaunch.atOutputUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=1';
		//GlobalVariables.serverLaunch.consensusResponseUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=1';
		GlobalVariables.serverLaunch.plpUrl += '&assessment-id='+launchParams.assessmentId;
	}
	else if(launchParams.assessmentType == 'repeat') {
		console.log('load configuration used: Repeat Assessment');
		GlobalVariables.serverLaunchType = 'repeat';
		GlobalVariables.serverLaunch.catUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&repeat=1';
		GlobalVariables.serverLaunch.atUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=0';
		GlobalVariables.serverLaunch.atOutputUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=0'; //will need &subsequent=1
		//GlobalVariables.serverLaunch.consensusResponseUrl += '&'+GlobalVariables.serverLaunch.ClientOrPatient+'='+launchParams.patientId+'&assessment-id='+launchParams.assessmentId+'&resume=0'; //will need &subsequent=1
	}
	else
		console.error("Incorrect assessment type;");
		
	//actions-triggered reporting url
	GlobalVariables.serverLaunch.screeningXmlUrl = 'grist/xml/screening.xml';
};



//=========================================================================================================
//					LOCAL Launch config
//=========================================================================================================
GlobalVariables.localLaunchGrist = {};
GlobalVariables.localLaunchGrist.actionsDataUrl = 'grist/actionsCache.txt';
GlobalVariables.localLaunchGrist.catUrl = 'grist/xml/cat.xml';
GlobalVariables.localLaunchGrist.qtUrl = 'grist/xml/qt.xml';
GlobalVariables.localLaunchGrist.atUrl = 'grist/xml/at.xml';
GlobalVariables.localLaunchGrist.plpUrl = 'grist/xml/plp.xml';
GlobalVariables.localLaunchGrist.appStringsUrl = 'grist/app-strings.js';
GlobalVariables.localLaunchGrist.screeningXmlUrl = 'grist/xml/screening.xml';

GlobalVariables.localLaunchGrist.mindMapUrl = null; //will be set later
GlobalVariables.localLaunchGrist.mindMapImage = null;
GlobalVariables.localLaunchGrist.mindMapMappingUrl= 'grist/mindmaps/population-mindmap-mapping.xml';



GlobalVariables.localLaunchGrist.configXMLforHTMLfiles = 'grist/html/help-files/population-helpfile-mapping.xml';
GlobalVariables.localLaunchGrist.configXMLforRiskSpecificfiles = 'grist/xml/risk-specific-questions-mapping.xml';
GlobalVariables.localLaunchGrist.quickHelpUrl = null; //will be set later

//GlobalVariables.localLaunchGrist.supportAndAdviceUrl = null;



//GlobalVariables.localLaunchGrist.screeningFinishMessageUrl = 'grist/html/screeningFinishMessage.html';


GlobalVariables.localLaunchAdvance= {};
GlobalVariables.localLaunchAdvance.catUrl = 'advance/xml/cat.xml';
GlobalVariables.localLaunchAdvance.qtUrl = 'advance/xml/qt.xml';
GlobalVariables.localLaunchAdvance.atUrl = 'advance/xml/at.xml';
GlobalVariables.localLaunchAdvance.mindMapUrl = 'advance/xml/mindmap.xml';
GlobalVariables.localLaunchAdvance.mindMapImage = 'advance/images/mindmap-advance.png';
GlobalVariables.localLaunchAdvance.logo = 'advance/images/advance-logo.png';




GlobalVariables.riskBackgroungColorsHexVIOLET = new Array("#22fd1c","#9bfd10","#e0f627","#c2eb4f","#95dc85","#5dc9c6","#3bb8ef","#4382fa","#595cf0","#6f39e5","#8416db",null);
GlobalVariables.riskBackgroungColorsHexRED = new Array('#00FF00','#80FF00','#CCFF00','#E5FF00','#FFD000','#FFBB00','#FF9D00','#FF7B00','#FF5D00','#FF4100','#FF0000',null);
GlobalVariables.riskBackgroungColorsHexREDreversed = new Array('#FF0000', '#FF4100', '#FF5D00','#FF7B00', '#FF9D00', '#FFBB00', '#FFD000', '#E5FF00', '#CCFF00', '#80FF00', '#00FF00', null);
//green-red
GlobalVariables.riskBackgroungColorsHex = GlobalVariables.riskBackgroungColorsHexRED; //default
GlobalVariables.riskForegroundColorsHex = new Array("#000000","#000000","#000000","#000000","#000000","#000000","#363736","#ededed","#ededed","#ededed","#ffffff","#000000");
GlobalVariables.riskForegroundColorsHexReversed = new Array("#ffffff","#ededed","#ededed","#ededed","#363736","#000000","#000000","#000000","#000000","#000000","#000000","#000000");



GlobalVariables.images = {};
GlobalVariables.images.commentEmpty = "images/balloon-white.png";
GlobalVariables.images.commentFull = "images/balloon-red.png";
GlobalVariables.images.commentPrevious = "images/balloon-yellow.png";

GlobalVariables.images.mgmtCommentEmpty = "images/document-white.png";
GlobalVariables.images.mgmtcommentFull = "images/document-red.png";
GlobalVariables.images.mgmtcommentPrevious = "images/document-yellow.png";
GlobalVariables.images.help = "images/information-frame.png";

//GlobalVariables.images.persistentHard = "images/pin-red.png";
//GlobalVariables.images.persistentSoft = "images/pin-orange.png";
GlobalVariables.images.persistentHard = "images/lock-yellow.png";
GlobalVariables.images.persistentSoft = "images/lock-bw.png";

GlobalVariables.images.linkBackIcon = "images/node-select.png";

