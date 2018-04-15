function ActionAlert() {
}

/**
 * takes in a map of actions and returns a flattened list of actions for displays.
 * also removes multiple opne-url acitions for same node - so they don't seem to be duplicated in displayed list
 */
ActionAlert.getActionsFlattenedForDisplay = function(actionsTriggered) {
	var actionsFlattened = new Array();
	var openUrlCodesSeen = new Array();
	for (var key in actionsTriggered) {
		for (var i = 0; i < actionsTriggered[key].length; i++) {
			if (actionsTriggered[key][i].action_type_table_name == 'galassify_action_open_url_templates') {
				if ($.inArray(actionsTriggered[key][i].node_code, openUrlCodesSeen) != -1)
					continue;
				else
					openUrlCodesSeen.push(actionsTriggered[key][i].node_code);
			}
			actionsFlattened.push(actionsTriggered[key][i]);
		}
	}
	return actionsFlattened;
};

ActionAlert.getTriggeredActions = function(catRoot, qt) {
	var actionsTriggered = {};
	var codesVisited = new Array();
	ActionAlert._traverseCATlookingForActions(catRoot, qt, actionsTriggered, codesVisited);
	//console.log(actionsTriggered);
	return actionsTriggered;
};

ActionAlert._getActionDataForNode = function(node, nodeCode, mg, population) {
	var actionsForThisNodeCode = new Array();
	var actions = GlobalVariables.actionsData.actions;
	for (var j = 0; j < actions.length; j++) {
		if (actions[j].node_code == nodeCode) {

			if (actions[j].populations_restricted_to != null && actions[j].populations_restricted_to.length != 0) {
				var restrictedToPops = $.map(actions[j].populations_restricted_to, $.trim);
				if ($.inArray(population, restrictedToPops) == -1)
					continue;
			}

			//now check if mg in range
			if (mg >= actions[j].mg_lower && mg <= actions[j].mg_higher) {
				actions[j].xmlNode = node;
				actionsForThisNodeCode.push(actions[j]);
			}
		}
	}
	return actionsForThisNodeCode;
};

ActionAlert._traverseCATlookingForActions = function(node, qt, actionsTriggered, codesVisited) {
	//console.log(node);
	var isClosedFilter = false;
	var isDemographicNode = false;
	if (node.attributes.length > 0) {
		var code = node.getAttribute("code");
		if (code == 'gen-demog')
			isDemographicNode = true;
		else {
			//console.log(code);
			if ((code != null) && ( code in qt)) {
				//console.log("checking "+code);
				var question = qt[code];
				var answer = question.getAnswer();
				var qType = question.getQuestionType();
				if (qType == 'filter-q' && (answer == null || answer.toLowerCase() != 'yes'))
					isClosedFilter = true;
			}

			//lets check for triggers

			if ($.inArray(code, codesVisited) == -1) {
				var mg = (node.getAttribute("mg"));
				if (mg != null) {
					mg = parseFloat(mg);
					var actionObjectsArray = ActionAlert._getActionDataForNode(node, code, mg, GlobalVariables.catPopulation);
					if (actionObjectsArray.length != 0) {
						actionsTriggered[code] = actionObjectsArray;
						codesVisited.push(code);
						console.log("we got action for " + code);
					}
					//console.log(actionObjectsArray);
				}
			}
		}
	}

	if (isClosedFilter == false && isDemographicNode == false) {
		for (var i = 0; i < node.childNodes.length; i++) {

			var childNode = node.childNodes[i];
			if (childNode.nodeType != 1)//only want element nodes
				continue;
			ActionAlert._traverseCATlookingForActions(node.childNodes[i], qt, actionsTriggered, codesVisited);
		}
	}
};

ActionAlert._isMgInRange = function(mg, actionObject) {
	//console.log(actionObject);
	if (mg >= actionObject.lowerRange && mg <= actionObject.upperRange)
		return true;
	else
		return false;

};

ActionAlert.executeActions = function(evt, exitCallback) {
	var actionData = evt.data.actionData;
	var actionsRaw = evt.data.actionsDataRAW;

	//console.log(actionsRaw);

	if (actionData.action_type_table_name == 'galassify_action_send_email_templates') {
		ActionAlert.executeActionsSendEmail(evt, exitCallback);
		/*
		 if(GlobalVariables.runningFromServer == true) {
		 var recipient = actionData.arguments[0];
		 var msgID = actionData.arguments[1];
		 $.ajax({
		 type: "POST",
		 cache: false,
		 url: GlobalVariables.serverLaunch.actionAlertSendEmail,
		 data: {recipient: recipient, msgID: msgID},
		 dataType: "text",
		 timeout:5000,
		 success: function(text) {
		 if(text == 'OK')
		 exitCallback(true);
		 else {
		 alert(text);
		 exitCallback(false);
		 }
		 },
		 error: function(xhr, status, error) {
		 if(status=="timeout") {
		 alert('The connection timed out while trying to save your answers. Our servers may be busy at the moment. Please try again after few seconds.');
		 }
		 else {
		 alert('Something went wrong while trying to save answers. Please check your internet connection and try again.');
		 }
		 exitCallback(false);
		 }
		 });

		 }
		 else {
		 alert("Sending email is available only when running from server. You are in standalone mode now.");
		 exitCallback(false);
		 }
		 */
	} else if (actionData.action_type_table_name == 'gist-post-function') {
		/*
		 if(GlobalVariables.runningFromServer == true) {
		 if(Socnet.serverToken != null) {
		 var signPostNodeCode = actionData.arguments[2];
		 var privacyLevel = actionData.arguments[1];
		 var textContent = actionData.arguments[0]; //message-id

		 //TODO: this should not be hard coded! put in a database or something
		 if(textContent == '1')
		 textContent = 'We need some pallets fetched from the hub so please get in touch if you have some spare delivery space.';
		 else if(textContent == '2')
		 textContent = 'We need some pallets taken to the hub so please get in touch if you have some spare collection space.';
		 else if(textContent == '3')
		 textContent = 'We need to transfer one or two consignments to the London hub from Fradley. Please attach a comment with the amount of spare space you have for deliveries from London.';
		 else if(textContent == '4')
		 textContent = 'We need you to bring some pallets back from the hub to our depot. Please ring for details.';
		 else if(textContent == '5')
		 textContent = 'We have some spare space on our delivery lorries so please leave a reply if you need some pallets delivered.';
		 else if(textContent == '6')
		 textContent = 'We have some spare space on our collection lorries so please leave a reply if you need some pallets taken to the hub.';
		 else
		 textContent = 'message id: '+textContent+" is not recognised. Please contact admin.";

		 var result = Socnet.postCommentsToServer(Socnet.serverToken, signPostNodeCode, privacyLevel, textContent);
		 if (result == null) {
		 alert('Something went wrong while trying to post comment. Please check your internet connection and try again.');
		 exitCallback(false);
		 } else {
		 if (result.status == 'OK') {
		 exitCallback(true);
		 }
		 }
		 }
		 else {
		 alert("Socnet session is not initialised! This should not have happened when running from server. Please contact admin.");
		 exitCallback(false);
		 }
		 }//server check
		 else {
		 alert("Posting to Socnet is available only when running from server. You are in standalone mode now.");
		 exitCallback(false);
		 }
		 */
	} else if (actionData.action_type_table_name == 'galassify_action_open_url_templates') {
		var allActionsForThisNode = actionsRaw[actionData.node_code];
		//console.log(allActionsForThisNode);
		
		//#CHANGE
		GlobalVariables.strings['galassify-actionAlert-1'] = 'GRaCE advice on';
		
		var openUrlHtml = "<h2>"+GlobalVariables.strings['galassify-actionAlert-1']+": " + actionData.xmlNode.getAttribute("label") + "</h2>";
		openUrlHtml += "<ul>";
		for (var i = 0; i < allActionsForThisNode.length; i++) {
			if (allActionsForThisNode[i].action_type_table_name != "galassify_action_open_url_templates")
				continue;

			//lets find this support id details
			var openUrlSupport = null;
			var now = Math.floor(Date.now() / 1000);
			GlobalVariables.allActionsTriggered.push({timestamp: now, action_id:allActionsForThisNode[i].id, meta_data:""});
			for (var j = 0; j < GlobalVariables.actionsData.template["galassify_action_open_url_templates"].length; j++) {
				if (GlobalVariables.actionsData.template["galassify_action_open_url_templates"][j].id == allActionsForThisNode[i].template_id) {
					openUrlSupport = GlobalVariables.actionsData.template["galassify_action_open_url_templates"][j];
					break;
				}
			}

			if (openUrlSupport == null)
				continue;

			openUrlHtml += '<li><b>' + openUrlSupport.text + '</b><br/>';
			if(openUrlSupport.url!=null)
				openUrlHtml += '<a style="color:#2784c6" target="_blank" href="' + openUrlSupport.url + '">' + openUrlSupport.url + '</a>';
			
			var overrideText = "";
			var overrideUrl = "";
			var isShowingCss = "display: none;";
			var showAddButtonCss = "";
			if(openUrlSupport.override != null && (openUrlSupport.override.text != "" || openUrlSupport.override.url != "")) {
				overrideText = openUrlSupport.override.text;
				overrideUrl = openUrlSupport.override.url;
				isShowingCss = "";
				showAddButtonCss = "display: none;";
			}
			
			openUrlHtml += '<br/><div style="'+isShowingCss+' border: 2px solid #79bd98;margin-top: 20px;padding: 10px;border-radius: 15px;" id="personalised-template-id-'+openUrlSupport.id+'"><h3 style="margin-top:0px">My Suggested Action</h3>';
			openUrlHtml += '<div id="personalised-action-wrapper-'+openUrlSupport.id+'" style="margin-left:20px;">';
			openUrlHtml += ActionAlert._renderPersonalisedUrlActionDetails(openUrlSupport.id, overrideText, overrideUrl);
			openUrlHtml += '</div><span id="action-edit-button-wrapper-'+openUrlSupport.id+'"><a template-id="'+openUrlSupport.id+'" id="edit-action-'+openUrlSupport.id+'" class="edit-action">Edit</a></span><span style="display:none;" id="action-save-button-wrapper-'+openUrlSupport.id+'"><a template-id="'+openUrlSupport.id+'" id="save-action-'+openUrlSupport.id+'" class="save-action">Save</a>&nbsp;&nbsp;&nbsp;<a template-id="'+openUrlSupport.id+'" id="remove-action-'+openUrlSupport.id+'" class="remove-action">Remove My Suggesstions</a></span></div>';
			openUrlHtml += '<span style="'+showAddButtonCss+'" id="action-add-button-wrapper-'+openUrlSupport.id+'"><br/><a template-id="'+openUrlSupport.id+'" id="add-action-'+openUrlSupport.id+'" class="add-action">Add My Suggesstions</a></span>';
			
			openUrlHtml += '</li><br/><br/>';
		}
		openUrlHtml += "</ul>";

		$('#dialog-container').html('<div id="dialog-open_url" title="'+GlobalVariables.strings['galassify-actionAlert-2']+'">' + openUrlHtml + '</div>');
		$('a.edit-action').button().click(function() {
			var templateId = ($(this).attr('template-id'));
			ActionAlert._personalisedUrlActionEditClicked(templateId);
			
		});
		$('a.remove-action').button().click(function() {
			var templateId = ($(this).attr('template-id'));
			$('textarea#personalised-url-action-template-title-'+templateId).val("");
			$('textarea#personalised-url-action-template-url-'+templateId).val("");
			ActionAlert._personalisedUrlActionSaveClicked(templateId);
			
			
		});
		$('a.save-action').button().click(function() {
			var templateId = ($(this).attr('template-id'));
			ActionAlert._personalisedUrlActionSaveClicked(templateId);
		});
		$('a.add-action').button().click(function() {
			var templateId = ($(this).attr('template-id'));
			var template = Utilities.getActionUrlTemplateById(templateId, GlobalVariables.actionsData);
			$('span#action-add-button-wrapper-'+templateId).hide();
			$('div#personalised-template-id-'+templateId).show();
			ActionAlert._personalisedUrlActionEditClicked(templateId);
			
		});
		
		var ht = ($(window).height() * 0.8);
		var width = ($(window).width() * 0.7);
		$("#dialog-open_url").dialog({
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
	}
};

ActionAlert._renderPersonalisedUrlActionDetails = function(id, text, url) {
	var html = '<div id="personalised-action-title-'+id+'"><p><b>' + text + '</b></p></div><div id="personalised-action-text-'+id+'">';
	url = linkifyStr(url, {nl2br: true, attributes: {style: 'color:#2784c6;'}});
	html += '<p>'+url+'</p>';
	
	html += '</div>';
	return html;
};
ActionAlert._personalisedUrlActionEditClicked = function(templateId) {
	var template = Utilities.getActionUrlTemplateById(templateId, GlobalVariables.actionsData);
	var overrideText = "";
	var overrideUrl = "";
	if(template.override != null) {
		overrideText = template.override.text;
		overrideUrl = template.override.url;
	}
	$('div#personalised-action-title-'+templateId).html('<h4 style="margin: 0;">Title</h4><textarea id="personalised-url-action-template-title-'+templateId+'" style="width: 90%;resize: none;height: 100px;">'+overrideText+'</textarea><br/>');
	$('div#personalised-action-text-'+templateId).html('<h4 style="margin-top: 10px; margin-bottom:0">URL</h4><textarea id="personalised-url-action-template-url-'+templateId+'" style="margin-bottom:20px;width: 90%;resize: none;height: 100px;">'+overrideUrl+'</textarea>');
	$('span#action-edit-button-wrapper-'+templateId).hide();
	$('span#action-save-button-wrapper-'+templateId).show();
	//$('a.save-action[template-id="'+templateId+'"]').show();
};

ActionAlert._personalisedUrlActionSaveClicked = function(templateId) {
	var template = Utilities.getActionUrlTemplateById(templateId, GlobalVariables.actionsData);
	if(template.override == null) {
		var overrideObj = {template_id: templateId, text: "", url: ""};
		GlobalVariables.personalisedActionsData.galassify_action_open_url_templates_overrides.push(overrideObj);
		template.override = overrideObj;
	}
	
	template.override.text = $.trim($('textarea#personalised-url-action-template-title-'+templateId).val());
	template.override.url = $.trim($('textarea#personalised-url-action-template-url-'+templateId).val());
	//console.log(template);
	if(template.override.text == "" && template.override.url == "") {
		$('div#personalised-template-id-'+templateId).hide();
		$('span#action-add-button-wrapper-'+templateId).show();
	}
	else {
		$('div#personalised-action-wrapper-'+templateId).html(ActionAlert._renderPersonalisedUrlActionDetails(template.id, template.override.text, template.override.url));
	}
	
	$('span#action-edit-button-wrapper-'+templateId).show();
	$('span#action-save-button-wrapper-'+templateId).hide();
};




ActionAlert.executeActionsSendEmail = function(evt, exitCallback) {
	var actionData = evt.data.actionData;

	var allEmailSupport = GlobalVariables.actionsData.template["galassify_action_send_email_templates"];
	var emailSupport = null;
	for (var i = 0; i < allEmailSupport.length; i++) {
		if (allEmailSupport[i].id == actionData.template_id) {
			emailSupport = allEmailSupport[i];
			break;
		}
	}
	if (emailSupport == null) {
		// this shouldn't have happened! something is wrong with database.
		console.error("ERROR!: send_email suppport not found:" + actionData.template_id);
		return;
	}

	//console.log(emailSupport);

	if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON)
		$('#top-header').webuiPopover('hide');

	var emailPageHtml = '<div id="email-dialog-contents"><div><p>Some introductory text here. Some introductory text here. Some introductory text here. Some introductory text here. Some introductory text here. Some introductory text here. Some introductory text here. </p></div>';
	emailPageHtml += '<b>Send Email To: </b> <span id="email-recipient"></span>';
	emailPageHtml += '<br/><br/><b>Subject:</b><br/><input style="width:90%;" type="text" id="email-subject">';
	emailPageHtml += '<br/><br/><b>Content:</b><br/><textarea style="width:90%; height: 200px" id="email-content"></textarea>';

	$('#dialog-container').html('<div id="dialog-send_email" title="Send Email">' + emailPageHtml + '</div>');
	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-send_email").dialog({
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
			send : {
				class1 : 'rightButton',
				id : 'send_email-dialog-send-button',
				text : 'Send Email',
				click : function() {
					console.log("TODO: send email");
					// TODO: implement sending email!
					$(this).dialog("close");
				}
			},
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
	var emailContent$ = $('div#email-dialog-contents');
	var subject = emailSupport.subject.replaceAll("#person#", GlobalVariables.patientName);
	var content = emailSupport.content.replaceAll("#person#", GlobalVariables.patientName);
	var recipient = $.trim(emailSupport.recipient);

	//recipient = "asd@Fadsf.adsf";
	//let's deal with recepient field
	if (recipient.charAt(0) == '#') {

		var tags = $.map(recipient.split(","), $.trim);

		var recipientArray = new Array();
		if (GlobalVariables.actionsData != null && GlobalVariables.personalData != null) {
			if (($.inArray("#personal-all#", tags) != -1 || $.inArray("#personal-friends#", tags) != -1) && GlobalVariables.personalData.friends != null) {
				for (var i = 0; i < GlobalVariables.personalData.friends.length; i++) {
					var friend = GlobalVariables.personalData.friends[i];
					if (friend.email != null && friend.email != "")
						recipientArray.push(friend);
				}
			}
			if (($.inArray("#personal-all#", tags) != -1 || $.inArray("#personal-carers#", tags) != -1) && GlobalVariables.personalData.carers != null) {
				for (var i = 0; i < GlobalVariables.personalData.carers.length; i++) {
					var carer = GlobalVariables.personalData.carers[i];
					if (carer.email != null && carer.email != "")
						recipientArray.push(carer);
				}
			}
			if (($.inArray("#personal-all#", tags) != -1 || $.inArray("#personal-gp#", tags) != -1) && GlobalVariables.personalData.GP != null) {
				var gp = GlobalVariables.personalData.GP;
				if (gp.email != null && gp.email != "")
					recipientArray.push(gp);
			}
		}

		if (recipientArray.length > 0) {
			var chooseRecipientHtml = '<select>';
			for (var i = 0; i < recipientArray.length; i++) {
				chooseRecipientHtml += '<option value="' + recipientArray[i].email + '">' + recipientArray[i].name + ' (' + recipientArray[i].email + ')</option>';
			}
			chooseRecipientHtml += '</select>';
			$('span#email-recipient', emailContent$).html(chooseRecipientHtml);
		} else {
			// no emails!
			$('span#email-recipient', emailContent$).html('<div style="color:red;border: 1px solid green; margin-top: 10px; padding: 5px;">No Email addresses found.</div>');
			$('#send_email-dialog-send-button').button("disable");
		}
	} else {
		$('span#email-recipient', emailContent$).html(recipient);
	}

	$('input#email-subject', emailContent$).val(subject);
	$('textarea#email-content', emailContent$).val(content);

};

