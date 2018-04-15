//*****************************************************************************************
//					QUESTIONNAIR LAYOUT
//*****************************************************************************************
LayoutManager.QuestionnaireLayout = {};
LayoutManager.QuestionnaireLayout._jsCATSelectedFromMindmap = null;
LayoutManager.QuestionnaireLayout._jsCATCurrentlySelected = null;
LayoutManager.QuestionnaireLayout._xmlNodeSelectedFromMindmap = null;
LayoutManager.QuestionnaireLayout._xmlNodeCurrentlySelected = null;
//changes everytime a node is clicked in the tree

LayoutManager.QuestionnaireLayout.isSearchSetup = false;

LayoutManager.QuestionnaireLayout.resizeListenerSetOnce = false;
//so we don't register listener multiple times
LayoutManager.QuestionnaireLayout.screeningFinishMsgGiven = false;
// we only want to show this message once.
LayoutManager.QuestionnaireLayout.showScreeningMarker = false;

LayoutManager.QuestionnaireLayout.timeStampId = null;

LayoutManager.QuestionnaireLayout.errosOnPage = new Array();

LayoutManager.setQuestionnaireLayout = function(inputObj) {
	//console.log(inputObj);

	var jsCat = inputObj.jsCat;
	GlobalVariables.previousLayout = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT;

	LayoutManager.QuestionnaireLayout.showScreeningMarker = false;
	var nonDefaultjsCatNodeKeyToSelectInTree = null;
	//null means select the root of jsCAT, which is the defualt behaviour

	if (inputObj.hasOwnProperty('showScreeningMarker')) {
		LayoutManager.QuestionnaireLayout.showScreeningMarker = inputObj.showScreeningMarker;
	}
	if (inputObj.hasOwnProperty('lastSelectedjsCatNodeKey')) {
		nonDefaultjsCatNodeKeyToSelectInTree = inputObj.lastSelectedjsCatNodeKey;
		//console.log(nonDefaultjsCatNodeKeyToSelectInTree);
	}

	if (inputObj !== undefined && inputObj.currentQuestionnairMode !== undefined)
		GlobalVariables.currentQuestionnairMode = inputObj.currentQuestionnairMode;

	if (GlobalVariables.previousLayout != GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {
		if (inputObj !== undefined && inputObj.registerNewNavigation == false) {
			LayoutNavigator.addNewLayoutToHistoryOnly((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT, inputObj);
			LayoutManager.QuestionnaireLayout.timeStampId = inputObj.timeStampID;
		} else
			LayoutManager.QuestionnaireLayout.timeStampId = LayoutNavigator.addNewLayout((GlobalVariables.currentClinicianVersionPathway || GlobalVariables.currentMygraceVersionPathways), GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT, inputObj);
	}

	console.log('starting questionnair mode with showScreeningMarker=' + LayoutManager.QuestionnaireLayout.showScreeningMarker);

	LayoutManager.QuestionnaireLayout._jsCATSelectedFromMindmap = jsCat;
	LayoutManager.QuestionnaireLayout._xmlNodeSelectedFromMindmap = jsCat.xmlNode;
	LayoutManager.QuestionnaireLayout._xmlNodeCurrentlySelected = jsCat.xmlNode;
	// this changes everytime a node in the tree is clicked
	LayoutManager.QuestionnaireLayout._jsCATCurrentlySelected = jsCat;
	//this is updated as well, everytime a node is clicked in the tree.

	LayoutManager.QuestionnaireLayout.isSearchSetup = false;

	//SET THIS TO HIDE OR SHOW TREE. do not make changes inside the function.
	LayoutManager.QuestionnaireLayout.showTree = true;

	//TODO: this should be in global settings
	var questionnaireLayoutTemplate = '<div id="top-header"></div>' + '<div id="left-sidebar">' + '<div id="tree-buttons"><a id="tree-button-collapse">' + GlobalVariables.strings['galassify-menu-extra1'] + '</a><a id="tree-search">' + GlobalVariables.strings['galassify-questionLayout-12'] + '</a></div><div id="tree"></div>' + '</div>' + '<div id="searchHeaderPanel">TEST</div><div id="right-questionPanelWrapper">' +
	//'<div id="right-statusBar"></div>'+
	'<div id="right-questionPanel"></div>' + '</div>';
	$('body').removeClass();
	$('body').addClass("bodyBackground");

	$('body').html(questionnaireLayoutTemplate);

	if (LayoutManager.QuestionnaireLayout.showTree == false) {
		$("#left-sidebar").hide(0);
		$("#right-questionPanelWrapper").css("margin-left", "5px").css("margin-top", GlobalVariables.headerHeight + 'px');
	}
	$('#tree-button-collapse').button().click(function() {
		var rootNode = $("#tree").dynatree("getRoot");
		rootNode.visit(function(n) {
			n.expand(false);
		}, true);
		$('#left-sidebar').scrollTop(0);
	});
	$('#tree-search').button().click(function() {
		LayoutManager.QuestionnaireLayout._searchMenuButtonClicked();
	});
	$('#tree-button-collapse .ui-button-text, #tree-search .ui-button-text').css({
		"font-size" : "small",
		'padding-bottom' : '0.1em',
		'padding-top' : '0.1em'
	});

	LayoutManager.QuestionnaireLayout._addTree(jsCat);
	LayoutManager.setupHeader();

	LayoutManager._addMenuButtons();
	LayoutManager.QuestionnaireLayout._addSearchPanelContents();

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.NORMAL)
			LayoutManager.mygraceMyLifeLastLayoutMindMapORquestionnair = GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT;

	} else if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {

	} else {
		console.error('error: unknown mode. this should not have happened!');
	}

	if (LayoutManager.QuestionnaireLayout.resizeListenerSetOnce == false) {
		$(window).resize(LayoutManager.QuestionnaireLayout._treeResizeHandler);
		LayoutManager.QuestionnaireLayout.resizeListenerSetOnce = true;
	}

	LayoutManager.QuestionnaireLayout._treeResizeHandler();
	//for first run

	$("#left-sidebar").resizable({
		minWidth : 50,
		ghost : true,
		handles : 'e',
		stop : function(event, ui) {
			GlobalVariables.treeWidth = ui.size.width;
			$("#right-questionPanelWrapper").css("margin-left", ui.size.width);
			$("#searchHeaderPanel").css("margin-left", ui.size.width);
		}
	});

	//this is required because otherwise, the handler gets repositioned when the tree panel is scrolled. this corrects the position of the handler everytime the tree is scrolled
	$('#left-sidebar').scroll(function() {
		var position = $('#left-sidebar').scrollLeft();
		var positionVertical = $('#left-sidebar').scrollTop();
		$(".ui-resizable-e").css('right', (position * -1) + 'px');
		$(".ui-resizable-e").css('top', (positionVertical) + 'px');
		//console.log(position);
	});

	$('.ui-resizable-e').css({
		'background-image' : 'url("images/resize-handle.gif")',
		'background-repeat' : 'no-repeat',
		'background-position' : 'center',
		'width' : '17px',
		'right' : '0px',
		'border-right' : '1px solid #8e8d8d'
	}).attr('title', GlobalVariables.strings['galassify-questionLayout-1']);

	//COLOURING OF NODES DISABLED FOR NOW.
	/*
	 if(LayoutManager.classificationRunAtleastOnce == true) {
	 var rootNode = $("#tree").dynatree("getRoot");
	 LayoutManager._redrawTree(rootNode.getChildren()[0]);
	 }
	 */

	$("#tree").dynatree("getTree").activateKey();
	// needed, otherwise the next statement does not work if the node is already selected and tree remembers that using cookies.
	if (nonDefaultjsCatNodeKeyToSelectInTree == null)
		$("#tree").dynatree("getTree").activateKey(jsCat.key);
	else
		$("#tree").dynatree("getTree").activateKey(nonDefaultjsCatNodeKeyToSelectInTree);

	LayoutManager.QuestionnaireLayout._updateProgressBar();
	LayoutManager.dealWithAvatar();
};

LayoutManager.QuestionnaireLayout._addSearchPanelContents = function() {
	//var footerDataCenter = '<a id="search-button" class="footer-button">' + GlobalVariables.strings['galassify-menu-footer-search'] + '</a>';
	var footerDataCenter = '<div id="progressbar" class="footer-button"><div class="progress-label"></div></div>';
	footerDataCenter += '<a id="show-unanswered-button" class="footer-button" title="' + GlobalVariables.strings['galassify-menu-footer-highlight-tooltip'] + '">' + GlobalVariables.strings['galassify-menu-footer-highlight'] + '</a>';

	$('#searchHeaderPanel').html(footerDataCenter);

	/*
	 $('#search-button').button().click(function() {
	 LayoutManager.QuestionnaireLayout._searchMenuButtonClicked();
	 });
	 $('#search-button .ui-button-text').css({
	 "font-size" : "small",
	 'padding-bottom' : '0.1em',
	 'padding-top' : '0.1em'
	 });
	 */

	$('#show-unanswered-button').button().click(function() {
		LayoutManager.QuestionnaireLayout._hightlightUnansweredQuestions();
	});

	$('#show-unanswered-button .ui-button-text').css({
		"font-size" : "small",
		'padding-bottom' : '0.1em',
		'padding-top' : '0.1em'
	});

	var progressLabel$ = $(".progress-label");
	var progressbar$ = $("#progressbar");
	progressbar$.progressbar({
		value : false,
		change : function() {
			var text = (GlobalVariables.strings['galassify-menu-footer-progress']).replace('######', progressbar$.progressbar("value"));
			progressLabel$.text(text);
			if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING) {
				$('#forward-button').button({
					disabled : true
				});
			}
		},
		complete : function() {
			progressLabel$.text(GlobalVariables.strings['galassify-menu-footer-progress-all']);
			if (GlobalVariables.currentQuestionnairMode == GlobalVariables.QuestionnairModes.SCREENING) {
				$('#forward-button').button("enable");
			}
		}
	});
	progressbar$.click(function() {
		LayoutManager.QuestionnaireLayout._hightlightUnansweredQuestions();
	});
};

/**
 * takes in answerCount as a structure {answeredQuestion: xxx, totalQuestions:xxx}
 */
LayoutManager.QuestionnaireLayout._updateProgressBar = function() {
	if (GlobalVariables.currentLayout != GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT)
		return;

	var answerCount = Utilities.countAnswers(LayoutManager.QuestionnaireLayout._jsCATCurrentlySelected, GlobalVariables.qt);
	//console.log(answerCount);
	var progressLabel$ = $(".progress-label");
	var progressbar$ = $("#progressbar");

	var percentage = Math.round((answerCount.answeredQuestion * 100.0) / (answerCount.totalQuestions));
	//console.log(percentage);
	if (isNaN(percentage))
		percentage = 100.0;

	progressbar$.progressbar("value", percentage);
	var connector;

	//TODO: finish this
	//var endTitle = "\n test";
	var endTitle = "";

	if (percentage == 100 && answerCount.answeredQuestion == 0)
		progressbar$.attr('title', GlobalVariables.strings['galassify-questionLayout-2']);
	else if (answerCount.answeredQuestion == 0)
		progressbar$.attr('title', GlobalVariables.strings['galassify-questionLayout-3'] + endTitle);
	else {
		var tempTitle = GlobalVariables.strings['galassify-questionLayout-4'];
		tempTitle = tempTitle.replace("####1#", answerCount.answeredQuestion);
		tempTitle = tempTitle.replace("####2#", answerCount.totalQuestions);
		progressbar$.attr('title', tempTitle + endTitle);
	}
};

LayoutManager.QuestionnaireLayout._hightlightErrors = function() {
	var errors$ = $('div.validationErrorBox:visible');
	if(errors$.size() > 0) {
		
		$('html,body').animate({
			scrollTop : errors$.first().parent().offset().top - $('#right-questionPanel').offset().top + $('#right-questionPanel').scrollTop() - 10
		}, 'fast');
		errors$.effect("highlight", {}, 2000);	
	}
};
LayoutManager.QuestionnaireLayout._hightlightUnansweredQuestions = function() {

	var answerCount = Utilities.countAnswers(LayoutManager.QuestionnaireLayout._jsCATCurrentlySelected, GlobalVariables.qt);

	var unansweredQuestionsList = answerCount.unansweredQuestionsList;

	if (unansweredQuestionsList.length != 0) {
		var firstUnanswered = unansweredQuestionsList[0];
		var firstTargetDiv$ = $('div[code="' + firstUnanswered + '"]');

		$('html,body').animate({
			scrollTop : firstTargetDiv$.offset().top - $('#right-questionPanel').offset().top + $('#right-questionPanel').scrollTop() - 10
		}, 'fast');

		for (var i = 0; i < unansweredQuestionsList.length; i++)
			$('div[code="' + unansweredQuestionsList[i] + '"]').effect("highlight", {}, 2000);
	}
};

LayoutManager.QuestionnaireLayout._addTree = function(jsCat) {
	var mainTreeClass = (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? "tree-first-person" : "tree-third-person";
	$("#tree").addClass(mainTreeClass).dynatree({
		imagePath : "images/tree-icons/",
		onClick: function(node, event) {
			
			var errors$ = $('div.validationErrorBox:visible');
			if(errors$.size() > 0) {
				LayoutManager.QuestionnaireLayout._hightlightErrors();
				return false;
			}
		    
		},
		onActivate : function(node) {
			var requestedPaths = Utilities.getPathAsCodes(node.data.xmlNode);
			//console.log(requestedPaths);
			var accessiblePathArray = Utilities.getPathArrayThatisAccessible(requestedPaths);
			//console.log(accessiblePathArray);
			var renderParams = {};
			if (requestedPaths.length != accessiblePathArray.length) {
				var pathJoinedByHash = accessiblePathArray.join("#");
				var node = $("#tree").dynatree("getTree").getNodeByKey(pathJoinedByHash);
				//$(node.span).effect("highlight", {}, 2000);
				$('a.dynatree-title', node.span).addClass('red-border');
				node.forcedRedirectDueToClosedChild = true;
				node.activate();
				setTimeout(function() {
					/*
					 var code = accessiblePathArray[(accessiblePathArray.length) - 1];
					 var question = GlobalVariables.qt[code];
					 var answer = question.getAnswer();
					 var finalDialogString = (GlobalVariables.strings['galassify-questionLayout-5a']).replace("######", node.data.title);
					 LayoutManager._genericShowDialogBoxAlertReplacement(finalDialogString);
					 */
					$('a.dynatree-title', node.span).removeClass('red-border');
				}, 1000);
				return;
			}

			if (node.forcedRedirectDueToClosedChild == true) {
				node.forcedRedirectDueToClosedChild = false;
				//reset the flag
				renderParams.showWarningAfterRender = {
					message : GlobalVariables.strings["galassify-questionLayout-43"]
				};
				node.data.xmlNode.setAttribute("hideWarningOnResponse", "true");
				//this allows filter or layer to remove warning when user responds the question.
			}

			$('#loadingMessage').show(0);
			$('#right-questionPanel').hide(0);

			//this is necessary in case a new tree node was clicked before the previous one had finished loading.
			clearTimeout(window.timer1);
			for (var i = 0; i < GlobalVariables.timerQueueArray.length; i++) {
				clearTimeout(GlobalVariables.timerQueueArray[i]);
			}

			setTimeout(function() {
				$('#right-questionPanel').html('');
				$('#right-questionPanel').show(0);
				window.startTime = new Date().getTime();
				LayoutManager.QuestionnaireLayout._xmlNodeCurrentlySelected = node.data.xmlNode;
				LayoutManager.QuestionnaireLayout._jsCATCurrentlySelected = node.data;
				if (LayoutManager.QuestionnaireLayout.timeStampId != null) {
					LayoutNavigator.updateSlectedTreeNodeInQuestionnair(LayoutManager.QuestionnaireLayout.timeStampId, node.data.key);
				}
				//console.log("here");
				//console.log(renderParams);
				QuestionRenderer.traverseTree(node.data.xmlNode, $('div#right-questionPanel'), true, renderParams);

				//var endTime = new Date().getTime();
				//console.log("Time taken to finish: "+(endTime-startTime)+" ms");
			}, 1);
		},
		children : jsCat,
		debugLevel : 0,
		minExpandLevel : 2, //so that root node is always expanded.
		clickFolderMode: 1,
		persist : true,
		cookieId : "dynatree-cookie-custom",
		cookie : {
			expires : null // Days or Date; null: session cookie
		},
		classNames : {
			active : (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) ? "dynatree-active-first-person" : "dynatree-active-third-person"
		}

	});

	$.contextMenu('destroy');
	$.contextMenu({
		selector : '.dynatree-folder',
		callback : function(key, options) {
			//console.log(this);
			var node = $.ui.dynatree.getNode(this);
			if (key == 'expandAll') {
				node.visit(function(n) {
					n.expand(true);
				}, true);
			} else if (key == 'colapseAll') {
				node.visit(function(n) {
					n.expand(false);
				}, true);
			}

		},
		items : {
			"expandAll" : {
				name : "Expand All",
				icon : "expand"
			},
			"sep1" : "---------",
			"colapseAll" : {
				name : "Collapse All",
				icon : "collapse"
			}
		}
	});
	//console.log(document.cookie);
	if(GlobalVariables.hideClosedNodesInTree) {
		var rootNode = $("#tree").dynatree("getRoot");
		LayoutManager.QuestionnaireLayout.removeAllClosedFiltersInTree(rootNode);
	}
};

/**
 * this is called when filter or layer question is answered yes and we need to show its children nodes in tree
 * @param {Object} jsCat
 */
LayoutManager.QuestionnaireLayout.addFilterLayerChildrenNodeInTree = function(xmlNode) {
	var path = (Utilities.getPathAsCodes(xmlNode)).join("#");
	var treeNode = $("#tree").dynatree("getTree").getNodeByKey(path);
	if (treeNode.hasChildren() == false) {
		//var jsNode = Utilities.xmlToJson(xmlNode);
		var jsNode = Utilities.findCatjsNodeByConcatenatedCodeKey(path,LayoutManager.QuestionnaireLayout._jsCATSelectedFromMindmap);
		
		
		for (var i = 0; i < jsNode.children.length; i++) {
			treeNode.addChild(jsNode.children[i]);
		}
		LayoutManager.QuestionnaireLayout.removeAllClosedFiltersInTree(treeNode);
		treeNode.expand(true);
	}

};
LayoutManager.QuestionnaireLayout.removeFilterLayerChildrenNodeInTree = function(xmlNode) {
	var path = (Utilities.getPathAsCodes(xmlNode)).join("#");
	var treeNode = $("#tree").dynatree("getTree").getNodeByKey(path);
	treeNode.expand(false);
	treeNode.removeChildren();
};

/**
 * should be called just after the tree has been rendered. we are not changing the original jsCat
 */
LayoutManager.QuestionnaireLayout.removeAllClosedFiltersInTree = function(treeNode) {
	var isExpanded = treeNode.isExpanded();
	treeNode.expand(true);
	var q = GlobalVariables.qt[treeNode.data.code];
	if (q != null && q.isClosedFilterOrLayer()) {
		treeNode.removeChildren();
	} else {
		if (treeNode.hasChildren()) {
			var children = treeNode.getChildren();
			for (var i = 0; i < children.length; i++) {
				LayoutManager.QuestionnaireLayout.removeAllClosedFiltersInTree(children[i]);
			}
		}
	}
	treeNode.expand(isExpanded);
};

LayoutManager.QuestionnaireLayout._treeResizeHandler = function() {
	if (GlobalVariables.currentLayout != GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT)
		return;

	if (LayoutManager.QuestionnaireLayout.showTree == false)
		return;
	//console.log("called from questionair layout");
	var ht = ($(window).height());

	//var width = ($(window).width());
	//var extraWidth = width - (900 + GlobalVariables.treeWidth);

	$('#left-sidebar').height(ht - (GlobalVariables.headerHeight)).width(GlobalVariables.treeWidth).css('top', ((GlobalVariables.headerHeight + 1) + 'px'));
	$("#right-questionPanelWrapper").css("margin-left", (GlobalVariables.treeWidth + 35) + 'px').css("margin-top", (GlobalVariables.headerHeight + GlobalVariables.searchHeaderPanelHeight + 3) + 'px');
	$("#searchHeaderPanel").css("margin-left", (GlobalVariables.treeWidth + 35) + 'px').css("top", GlobalVariables.headerHeight + 'px').css("height", (GlobalVariables.searchHeaderPanelHeight - 10) + 'px');
};

LayoutManager.QuestionnaireLayout._setupSearch = function() {
	console.log("builing search dialog");

	//#CHANGE
	GlobalVariables.strings['galassify-questionLayout-31'] = 'My Action';
	
	LayoutManager.QuestionnaireLayout.isSearchSetup = true;
	var mgmtStr = GlobalVariables.strings['galassify-questionLayout-30'];
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		mgmtStr = GlobalVariables.strings['galassify-questionLayout-31'];
	if (GlobalVariables.catPopulation == 'friends-supporters')
		mgmtStr = GlobalVariables.strings['galassify-questionLayout-30'];

	var htmlData = '<div id="dialog-search" title="' + GlobalVariables.strings["galassify-questionLayout-12"] + '">' + '<div id="searchOptions"><div id="searchTextFieldDiv"><input type="text" id="searchTextField"/>&nbsp;&nbsp;<a id="searchStartButton" >' + GlobalVariables.strings["galassify-questionLayout-12"] + '</a></div>';
	htmlData += '<div id="searchAttributesDiv"> Search in: ' + '<label class="searchOptionlabel"><span class="noWrap"><input type="checkbox" id="searchAttributeLabel" checked>' + GlobalVariables.strings["galassify-questionLayout-7"] + '</span></label>&nbsp;&nbsp;' + '<label class="searchOptionquestion"><span class="noWrap"><input type="checkbox" id="searchAttributeQuestion" checked>' + GlobalVariables.strings["galassify-questionLayout-8"] + '</span></label>&nbsp;&nbsp;' + '<label class="searchOptioncomment"><span class="noWrap"><input type="checkbox" id="searchAttributeComment" checked>' + GlobalVariables.strings["galassify-questionLayout-9"] + '</span></label>&nbsp;&nbsp;' + '<label class="searchOptionmgmtComment"><span class="noWrap"><input type="checkbox" id="searchAttributeMgmtComment" checked>' + mgmtStr + '</span></label>&nbsp;&nbsp;' + '<label class="searchOptionHelpText"><span class="noWrap"><input type="checkbox" id="searchAttributeHelpText" checked>' + GlobalVariables.strings["galassify-questionLayout-11"] + '</span></label>&nbsp;&nbsp;';

	htmlData += '</div>' + '</div>' + '<div id="searchResults"></div>' + '</div>';
	$('#search-dialog-container').html(htmlData);

	$('#searchStartButton').button().click(function() {
		LayoutManager.QuestionnaireLayout._searchClicked();
	});

	$('#searchTextField').keypress(function(event) {
		if (event.keyCode == 13) {
			LayoutManager.QuestionnaireLayout._searchClicked();
		}
	});

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.8);
	$("#dialog-search").dialog({
		resizable : true,
		autoOpen : false,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			//$(this).dialog("destroy");
			//$('#dialog-container').html('');
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

};
LayoutManager.QuestionnaireLayout._searchClicked = function() {
	var searchString = $.trim($('#searchTextField').val());
	var splitStringRaw = searchString.split(' ');
	var splitString = new Array();
	for (var i = 0; i < splitStringRaw.length; i++) {
		var token = $.trim(splitStringRaw[i]);
		if (token != null && token != '')
			splitString.push(token.toLowerCase());
	}
	var searchAttributes = new Array();
	if ($('#searchAttributeLabel').is(':checked'))
		searchAttributes.push('label');

	if ($('#searchAttributeQuestion').is(':checked'))
		searchAttributes.push('question');

	if ($('#searchAttributeComment').is(':checked'))
		searchAttributes.push('comment');

	if ($('#searchAttributeMgmtComment').is(':checked'))
		searchAttributes.push('mgmtComment');
	if ($('#searchAttributeHelpText').is(':checked'))
		searchAttributes.push('helpText');

	//console.log(splitString);

	if (splitString.length == 0) {
		$("#searchResults").html(GlobalVariables.strings['galassify-questionLayout-13']);
	} else if (searchAttributes.length == 0) {
		$("#searchResults").html(GlobalVariables.strings['galassify-questionLayout-14']);
	} else {
		var resultTree = Utilities.search({
			keywords : splitString,
			searchAttributes : searchAttributes,
			//searchXMLTree: LayoutManager.QuestionnaireLayout._xmlNodeSelectedFromMindmap
			searchJSTree : LayoutManager.QuestionnaireLayout._jsCATSelectedFromMindmap
		});
		if (jQuery.isEmptyObject(resultTree)) {
			var msg = "&nbsp;" + GlobalVariables.strings['galassify-questionLayout-15'] + ": ";
			for (var i = 0; i < splitString.length; i++) {
				msg += splitString[i];
				if (splitString.length > 1 && i < splitString.length - 1)
					msg += ", ";
			}
			$("#searchResults").html(msg);
		} else {
			LayoutManager.QuestionnaireLayout._updateSearchResults(resultTree);
		}
	}

	$('#searchResults').show(0);
	$('#searchResults').scrollTop(0);
	//console.log("scrolled to top");

};

LayoutManager.QuestionnaireLayout._searchMenuButtonClicked = function() {
	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');

	if (LayoutManager.QuestionnaireLayout.isSearchSetup == false || $("#searchResults").has('ul.dynatree-container').length == 0) {
		LayoutManager.QuestionnaireLayout._setupSearch();
	} else {
		// search is already setup. clear last selected node, otherwise clicking on it again has no effect
		$("#searchResults").dynatree("getRoot").visit(function(node) {
			node.deactivate();
		});
	}
	$("#dialog-search").dialog("open");
	LayoutManager._freezeScrollBarInBackground();

};

LayoutManager.QuestionnaireLayout._updateSearchResults = function(resultTree) {
	$("#searchResults").dynatree({
		imagePath : "images/tree-icons/",
		onActivate : function(node) {
			console.log(node.data);
			var requestedPaths = Utilities.getPathAsCodes(node.data.xmlNode);
			var pathJoinedByHash = requestedPaths.join("#");
			console.log(pathJoinedByHash);

			$("#dialog-search").dialog("close");

			var node = $("#tree").dynatree("getTree").getNodeByKey(pathJoinedByHash);
			//node.activateSilently();
			console.log(node);
			node.activate();
			var activeLi = node.li;
			//console.log(activeLi);
			var calculated = ($(activeLi).offset().top - $('#left-sidebar').offset().top);

			//console.log("zzz: "+$('#left-sidebar').offset().top);
			if (calculated < 0 || calculated > $('#left-sidebar').height()) {
				$('#left-sidebar').animate({
					scrollTop : $(activeLi).offset().top - $('#left-sidebar').offset().top + $('#left-sidebar').scrollTop() - 10
				}, 'fast');
			}

		},
		children : resultTree,
		debugLevel : 0,
		minExpandLevel : 2 //so that root node is always expanded.
	});
};
