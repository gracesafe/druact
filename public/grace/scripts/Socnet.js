function Socnet() {
}
Socnet.serverToken = null; // so if this is still null later, we know it wasn't initialised
Socnet.exitMethod = null; //call this when switching back to normal mode

//Socnet.serverToken = 'a4a79f1b0977d62d0937542a173ba2aa';
Socnet.selfSerialID = null;
Socnet.userDetails = null;
Socnet.privacyLevels = null;

Socnet.Urls = {};
//Socnet.Urls.baseUrl = "http://localhost/socnet-backend/index.php/";
/*
Socnet.Urls.baseUrl = "http://advance.galassify.org/socnet-backend/index.php/";
Socnet.Urls.applyForToken = Socnet.Urls.baseUrl + "token/applyForToken";
Socnet.Urls.getComments = Socnet.Urls.baseUrl + "api/getCommentsForANodeCodeVisibleToUser";
Socnet.Urls.bootStrap = Socnet.Urls.baseUrl + "api/bootStrap";
Socnet.Urls.postComments = Socnet.Urls.baseUrl + "api/postComment";
Socnet.Urls.deleteComment = Socnet.Urls.baseUrl + "api/deleteComment";
Socnet.Urls.getPrivacyLevelOfComment = Socnet.Urls.baseUrl + "api/getPrivacyLevelOfComment";
Socnet.Urls.updateCommentsPrivacyLevel = Socnet.Urls.baseUrl + "api/updateCommentPrivacyLevel";
Socnet.Urls.getUserDetails = Socnet.Urls.baseUrl + "api/getUserDetails";
Socnet.Urls.getContacts = Socnet.Urls.baseUrl + "api/getPeopleInMyConnectionList";
Socnet.Urls.updateConnectionPrivacyLevel = Socnet.Urls.baseUrl + "api/updateUserConnectionPrivacyLevel";
*/

Socnet.Urls.applyForToken = "socnet-interface/applyForToken.php";
Socnet.Urls.getComments = "socnet-interface/getCommentsForANodeCodeVisibleToUser.php";
Socnet.Urls.bootStrap =  "socnet-interface/bootStrap.php";
Socnet.Urls.postComments =  "socnet-interface/postComment.php";
Socnet.Urls.deleteComment = "socnet-interface/deleteComment.php";
Socnet.Urls.getPrivacyLevelOfComment =  "socnet-interface/getPrivacyLevelOfComment.php";
Socnet.Urls.updateCommentsPrivacyLevel =  "socnet-interface/updateCommentPrivacyLevel.php";
Socnet.Urls.getUserDetails =  "socnet-interface/getUserDetails.php";
Socnet.Urls.getContacts =  "socnet-interface/getPeopleInMyConnectionList.php";
Socnet.Urls.updateConnectionPrivacyLevel =  "socnet-interface/updateUserConnectionPrivacyLevel.php";




Socnet.Images = {};
Socnet.Images.deleteIcon = "images/socnet/delete.png";
Socnet.Images.editIcon = "images/socnet/edit.png";

Socnet.SocnetLayout = {};
Socnet.SocnetLayout.nodeShowingNow = null;
Socnet.SocnetLayout.resizeListenerSetOnce = false;
//updated when a node is clicked in the tree

Socnet.switchToSocnetMode = function(previousModeCallBack) {
	Socnet.exitMethod = previousModeCallBack;
	if (Socnet.privacyLevels == null) {
		var response = Socnet.getBootStrapInfoFromServer(Socnet.serverToken);
		if (response == null) {
			alert("Could not connect to server. \nPlease check your internet connection and try again");
			return null;
		} else if (response.status == "OK") {
			Socnet.privacyLevels = response.privacyLevels;
			Socnet.selfSerialID = response.serialID;
			Socnet.userDetails = response.userDetails;

		} else if (response.status == "ERROR") {
			alert("Server sent the following error message:\n" + response.errorMsg);
			return null;
		} else {
			alert("Server sent an unexpected result!");
			return null;
		}
	}
	
	LayoutManager.layoutJustBeforeSocnet = GlobalVariables.currentLayout;
	GlobalVariables.currentLayout = GlobalVariables.Layouts.SOCNET_LAYOUT;
	
	Socnet.setSocnetLayout(GlobalVariables.jsCat);
	return true;
}

Socnet.switchToNormalMode = function() {
	Socnet.exitMethod();
}

Socnet.setupHeader = function() {
	$('#top-header').append('<div id="dialog-container"></div><div id="search-dialog-container"></div>').css('background-image', 'url(' + GlobalVariables.launchMethod.logo + ')').css('background-repeat', 'no-repeat').css('background-position', 'left center').height(GlobalVariables.headerHeight);
	document.title = GlobalVariables.title;
}

Socnet._addMenuButtons = function() {
	var data = '<div id=menuButtons>';

	data += '<a id="switch-mode" title="Click here to go back to home screen">Switch Back to<br/>Normal Mode</a>';
	data += '<a id="socnet-my-network-button" title="Click here to see people in your network">My<br/>Network</a>';
	data += '<a id="socnet-post-comment-button" title="Click here to post a comment">Post<br/>Comment</a>';

	data += '</div>';

	data += '<div id="second-menu-row">';
	data += '<div id="socnet-welcome">You are logged in as: ' + Socnet.userDetails.screen_name + '</div>';
	//data += '<div id="loadingMessage">Loading, please wait...  <img src="images/loader2.gif"></img></div>';
	//data += '<div id="savingAnswers">Saving answers, please wait...  <img src="images/loader2.gif"></img></div>';

	data += '</div>';

	$('#top-header').append(data);
	$('#loadingMessage, #savingAnswers').hide(0);

	$('#switch-mode').button().click(function() {
		Socnet.switchToNormalMode();
	});

	$('#socnet-post-comment-button').button({
		disabled : true
	}).click(function() {
		Socnet.SocnetLayout.postComment(Socnet.SocnetLayout.nodeShowingNow);
	});

	$('#socnet-my-network-button').button().click(function() {
		Socnet.showMyNetwork();
	});

}

Socnet.setSocnetLayout = function(jsCat) {
	var socnetLayoutTemplate = '<div id="top-header"></div><div id="footer"></div>' + '<div id="left-sidebar">' + '<div id="tree"></div>' + '</div>' + '<div id="right-questionPanelWrapper">' +
	//'<div id="right-statusBar"></div>'+
	'<div id="right-questionPanel"></div>' + '</div>';
	$('body').removeClass();
	$('body').addClass("greyBackground");
	$('body').html(socnetLayoutTemplate);

	Socnet.SocnetLayout._addTree(jsCat);
	Socnet.setupHeader();
	Socnet._addMenuButtons();

	if(Socnet.SocnetLayout.resizeListenerSetOnce == false) {
		$(window).resize(Socnet.SocnetLayout._treeResizeHandler);
		Socnet.SocnetLayout.resizeListenerSetOnce = true;
	}
	Socnet.SocnetLayout._treeResizeHandler();
	//for first run

	$("#left-sidebar").resizable({
		minWidth : 50,
		ghost : true,
		handles : 'e',
		stop : function(event, ui) {
			GlobalVariables.treeWidth = ui.size.width;
			$("#right-questionPanelWrapper").css("margin-left", ui.size.width);
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
		'right' : '0px'
	}).attr('title', 'Drag this left or right to resize the tree');

	//$("#tree").dynatree("getTree").activateKey();
	// needed, otherwise the next statement does not work if the node is already selected and tree remembers that using cookies.
	//$("#tree").dynatree("getTree").activateKey(jsCat.key);

}

Socnet.SocnetLayout._addTree = function(jsCat) {
	//Socnet.deleteSocnetTreeCookies(); dont need it as the cookie are erased from main
	$("#tree").dynatree({
		imagePath : "images/tree-icons/",
		onActivate : function(node) {
			//console.log("node clicked");
			Socnet.SocnetLayout.nodeShowingNow = node.data.xmlNode;
			Socnet.SocnetLayout.treeNodeClicked(node.data.xmlNode, $('div#right-questionPanel'));
		},
		children : jsCat,
		debugLevel : 0,
		minExpandLevel : 2, //so that root node is always expanded.

		persist : true,
		cookieId : "dynatree-cookie-custom-socnet",
		cookie : {
			expires : null // Days or Date; null: session cookie
		}

	});

	$.contextMenu('destroy');
	$.contextMenu({
		selector : '.dynatree-node',
		callback : function(key, options) {
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
				name : "Colapse All",
				icon : "collapse"
			}
		}
	});
	//console.log(document.cookie);
}

Socnet.SocnetLayout._treeResizeHandler = function() {
	
	if(GlobalVariables.currentLayout != GlobalVariables.Layouts.SOCNET_LAYOUT)
		return;
	//console.log("called from socnet layout");
	var ht = ($(window).height());
	$('#left-sidebar').height(ht - GlobalVariables.headerHeight).width(GlobalVariables.treeWidth).css('top', ((GlobalVariables.headerHeight + 1) + 'px'));
	$("#right-questionPanelWrapper").css("margin-left", GlobalVariables.treeWidth + 'px').css("margin-top", GlobalVariables.headerHeight + 'px');
}

Socnet.SocnetLayout.treeNodeClicked = function(xmlnode, container$) {
	var signPostNodeCode = xmlnode.getAttribute("code");
	Socnet.getCommentsFromServer(Socnet.serverToken, signPostNodeCode, Socnet.SocnetLayout.showCommentsinRHS, container$);
	container$.html("Please wait, fetching comments...");
}

Socnet.SocnetLayout.showCommentsinRHS = function(data, container$) {
	//console.log(data);
	if (data == null) {
		container$.html("ajax failed. Please check your internet connection and try again");
	} else {
		//container$.html("done");
		//console.log(data);
		if (data.status == "OK") {
			container$.html("");

			$('#socnet-post-comment-button').button({
				disabled : false
			});

			if (data.comments.length == 0)
				container$.append("No comment found for this node.");

			container$.append("<div>&nbsp;</div>");
			for (var i = 0; i < data.comments.length; i++) {
				var comment = data.comments[i];
				//console.log(comment);
				Socnet.SocnetLayout.renderComment(comment, container$);
			}
		} else if (data.status == "ERROR") {
			$('#socnet-post-comment-button').button({
				disabled : true
			});
			container$.html("Something went wrong. Server send the following message: " + data.errorMsg);
		} else {
			$('#socnet-post-comment-button').button({
				disabled : true
			});
			container$.html("Something went wrong.");
		}

	}

}

Socnet.SocnetLayout.renderComment = function(comment, container$) {
	var innerContainer = '<div></div>';

	var headerTemplate = '<div id="commentContainer-' + comment.commentID + '" class="socnet-comment"></div>';
	var commentDiv$ = $(headerTemplate).appendTo(container$);
	var timestampText = Socnet.formatTimeFromEpoch(comment.created);
	var options = '';
	if (comment.owner_serialID == Socnet.selfSerialID) {
		var deletePostIconHtml = '<img class="deleteIcon commentButtonIcon" src="' + Socnet.Images.deleteIcon + '" title="Delete this comment"/>';
		var editPostIconHtml = '<img class="editIcon commentButtonIcon" src="' + Socnet.Images.editIcon + '" title="Change privacy level of this comment"/>';
		options += editPostIconHtml + deletePostIconHtml;
	}

	var headerText = "By <b>" + comment.screen_name + "</b> on <i>" + timestampText + '</i><span class="comment-options">' + options + '</span>';
	var contents = comment.text;
	var template = '<div class="socnet-comment-header">' + headerText + '</div><div class="socnet-comment-contents">' + contents + '</div>';
	commentDiv$.append(template);

	var dataPackage = {
		commentID : comment.commentID
	};
	commentDiv$.find('img.commentButtonIcon').click(dataPackage, Socnet.SocnetLayout.buttonListener);
}

Socnet.SocnetLayout.buttonListener = function(evt) {
	var commentID = evt.data.commentID;
	if ($(this).hasClass('deleteIcon')) {
		//console.log(commentID);
		//console.log("delete");
		var sure = confirm('Are you sure you want to delete this comment?');
		if (sure == true) {
			var response = Socnet.deleteCommentsFromServer(Socnet.serverToken, commentID);
			if (response == null) {
				alert("Could not connect to server. Please check your internet connection and try again");
			} else {
				if (response.status == 'OK') {
					$('#commentContainer-' + commentID).remove();

				} else if (response.status == 'ERROR') {
					alert("Something went wrong at server end. The server returned the following message:\n" + response.errorMsg);
				}
			}
		}

	} else if ($(this).hasClass('editIcon')) {
		//console.log(commentID);
		Socnet.SocnetLayout.changePrivacyLevelOfComment(commentID);
	}
}

Socnet.SocnetLayout.changePrivacyLevelOfComment = function(commentID) {
	var existingPrivacyLevel;
	var result = Socnet.getPrivacyLevelOfComment(Socnet.serverToken, commentID);
	if (result == null) {
		alert("Could not connect to server. Please check your internet connection and try again");
		return;
	} else {
		if (result.status == 'OK') {
			existingPrivacyLevel = result.privacy_level;

		} else if (result.status == 'ERROR') {
			alert("Something went wrong at server end. The server returned the following message:\n" + result.errorMsg);
			return;
		}
	}
	//console.log(existingPrivacyLevel);
	var contents = "";

	var privacyLevelComboBox = '<select id="post-comment-privacy-options">';
	for (var i = 0; i < Socnet.privacyLevels.length; i++) {
		var level = Socnet.privacyLevels[i].privacy_level;
		if (level == 0)
			continue;
		var label = Socnet.privacyLevels[i].label;
		var selected = '';
		if (level == existingPrivacyLevel)
			selected = 'SELECTED';
		privacyLevelComboBox += '<option value="' + level + '" ' + selected + '>' + label + '</option>';
	}
	privacyLevelComboBox += '</select>';

	contents += '<br/><div>Share with: ' + privacyLevelComboBox + ' </div>';

	$('#dialog-container').html('<div id="dialog-edit-comment" title="Edit Comment Privacy Level">' + contents + '</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.8);
	$("#dialog-edit-comment").dialog({
		resizable : true,
		/*height : ht,
		 width : width,*/
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			Socnet._unfreezeScrollBarInBackground();
		},
		buttons : {
			update : {
				text : 'Update',
				click : function() {
					var privacyLevel = $('#post-comment-privacy-options option:selected').val();
					//var textContent = $('textarea.socnet-post-comment-textbox').val();
					//textContent = $.trim(textContent);
					if (privacyLevel != existingPrivacyLevel) {
						$(".ui-dialog-buttonpane button:contains('Update')").button("disable");
						var result = Socnet.updateCommentPrivacyLevel(Socnet.serverToken, commentID, privacyLevel);

						if (result == null) {
							$(".ui-dialog-buttonpane button:contains('Update')").button("enable");
							//$(".ui-dialog-buttonpane button:contains('Post') span").text("Try Again");
							alert("Could not connect to server. Please check your internet connection and try again");
						} else {
							if (result.status == 'OK') {
								$(this).dialog("close");
								Socnet.SocnetLayout.treeNodeClicked(Socnet.SocnetLayout.nodeShowingNow, $('div#right-questionPanel'));
							} else if (result.status == 'ERROR') {
								$(".ui-dialog-buttonpane button:contains('Post')").button("enable");
								//$(".ui-dialog-buttonpane button:contains('Post') span").text("Try Again");
								alert("Something went wrong at server end. The server returned the following message:\n" + result.errorMsg);
							}
						}
					} else {
						$(this).dialog("close");
					}
				}
			},
			cancel : {
				text : 'Close',
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	Socnet._freezeScrollBarInBackground();

}

Socnet.SocnetLayout.postComment = function(xmlNode) {
	var signPostNodeCode = xmlNode.getAttribute("code");
	var signPostNodeLable = xmlNode.getAttribute("label");
	var contents = "<div>Topic: " + signPostNodeLable + "</div>";

	var privacyLevelComboBox = '<select id="post-comment-privacy-options">';
	for (var i = 0; i < Socnet.privacyLevels.length; i++) {
		var level = Socnet.privacyLevels[i].privacy_level;
		if (level == 0)
			continue;
		var label = Socnet.privacyLevels[i].label;
		privacyLevelComboBox += '<option value="' + level + '">' + label + '</option>';
	}
	privacyLevelComboBox += '</select>';

	contents += '<br/><div>Share with: ' + privacyLevelComboBox + ' </div>';
	contents += '<br/><div>Comment</div>';
	contents += '<div><textarea class="socnet-post-comment-textbox"></textarea></div>';

	$('#dialog-container').html('<div id="dialog-post-comment" title="Post a comment">' + contents + '</div>');

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-post-comment").dialog({
		resizable : true,
		/*height : ht,*/
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			Socnet._unfreezeScrollBarInBackground();
		},
		buttons : {
			post : {
				text : 'Post',
				click : function() {
					var privacyLevel = $('#post-comment-privacy-options option:selected').val();
					var textContent = $('textarea.socnet-post-comment-textbox').val();
					textContent = $.trim(textContent);
					if (textContent != '') {
						$(".ui-dialog-buttonpane button:contains('Post')").button("disable");
						var result = Socnet.postCommentsToServer(Socnet.serverToken, signPostNodeCode, privacyLevel, textContent);
						if (result == null) {
							$(".ui-dialog-buttonpane button:contains('Post')").button("enable");
							//$(".ui-dialog-buttonpane button:contains('Post') span").text("Try Again");
							alert("Could not connect to server. Please check your internet connection and try again");
						} else {
							if (result.status == 'OK') {
								$(this).dialog("close");
								Socnet.SocnetLayout.treeNodeClicked(Socnet.SocnetLayout.nodeShowingNow, $('div#right-questionPanel'));
							} else if (result.status == 'ERROR') {
								$(".ui-dialog-buttonpane button:contains('Post')").button("enable");
								//$(".ui-dialog-buttonpane button:contains('Post') span").text("Try Again");
								alert("Something went wrong at server end. The server returned the following message:\n" + result.errorMsg);
							}
						}
					} else {
						alert("Please enter some comment first!");
					}

				}
			},
			cancel : {
				text : 'Close',
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	Socnet._freezeScrollBarInBackground();

}

Socnet.showMyNetwork = function() {

	var rawData;
	var result = Socnet.getMyContacts(Socnet.serverToken);
	if (result == null) {
		alert("Could not connect to server. Please check your internet connection and try again");
		return;
	} else {
		if (result.status == 'OK') {
			rawData = result.connections;

		} else if (result.status == 'ERROR') {
			alert("Something went wrong at server end. The server returned the following message:\n" + result.errorMsg);
			return;
		}
	}

	var contents = "<div>People in my network:</div>";
	var tableOfConnections = '<table id="my-network-table"><tr class = "topRow"><td>Screen name</td><td>Privacy level</td><td>Added on</td><td>&nbsp;</td></tr>';

	//check if no contacts

	for (var i = 0; i < rawData.length; i++) {
		var isOddClass = '';
		if (i % 2 == 1)
			isOddClass = 'class="odd"';

		var privacyLevelComboBox = '<select otherPersonID="' + rawData[i].otherPersons_serialID + '" class="my-connection-privacy-options">';
		for (var j = 0; j < Socnet.privacyLevels.length; j++) {
			var level = Socnet.privacyLevels[j].privacy_level;
			if (level == 0)
				continue;
			var label = Socnet.privacyLevels[j].label;
			var selected = '';
			if (level == rawData[i].privacy_level)
				selected = 'SELECTED';
			privacyLevelComboBox += '<option value="' + level + '" ' + selected + '>' + label + '</option>';
		}
		privacyLevelComboBox += '</select><div id="status-privacyLevel-'+rawData[i].otherPersons_serialID+'"></div>';

		var timestamp = Socnet.formatTimeFromEpoch(rawData[i].added_on);
		var operations = '<img class="deleteIcon myNetworkButtonIcon" src="' + Socnet.Images.deleteIcon + '" title="Delete this contact [function disabled for now]"/>';
		
		tableOfConnections += '<tr ' + isOddClass + '><td>' + rawData[i].screen_name + '</td><td>' + privacyLevelComboBox + '</td><td>' + timestamp + '</td><td>'+operations+'</td></tr>';
	}
	tableOfConnections += '</table>';
	contents += tableOfConnections;
	
	if(rawData.length == 0)
		contents += "You do not have anyone in your network!";

	$('#dialog-container').html('<div id="dialog-my-network" title="My Network">' + contents + '</div>');
	$('select.my-connection-privacy-options').change(function() {
		var newPrivacyLevel = this.value;
		var otherPersonID = $(this).attr("otherPersonID");
		
		$('#status-privacyLevel-'+otherPersonID).html("saving...");
		
		$.ajax({
			url : Socnet.Urls.updateConnectionPrivacyLevel,
			type : 'POST',
			data : {
				tokenID : Socnet.serverToken,
				otherPersonSerialID: otherPersonID,
				newPrivacyLevel: newPrivacyLevel
			},
			cache : false,
			dataType : "json",
			success : function(data) {
				if(data.status == 'OK') {
					$('#status-privacyLevel-'+otherPersonID).html("");	
				}
				else if(data.status == 'ERROR') {
					$('#status-privacyLevel-'+otherPersonID).html("New value could not be saved.");
					alert("Something went wrong at server end. The server returned the following message:\n" + data.errorMsg);
				}
				else {
					$('#status-privacyLevel-'+otherPersonID).html("New value could not be saved.");
					alert("Something went wrong. Server returned an unexpected response.");
				}
			},
			error : function(xhr, status, error) {
				$('#status-privacyLevel-'+otherPersonID).html("New value could not be saved.");
				alert("Could not connect to server. Please check your internet connection and try again");
			}
		});
	});

	var ht = ($(window).height() * 0.8);
	var width = ($(window).width() * 0.7);
	$("#dialog-my-network").dialog({
		resizable : true,
		height : ht,
		width : width,
		modal : true,
		close : function(event, ui) {
			$(this).dialog("destroy");
			$('#dialog-container').html('');
			Socnet._unfreezeScrollBarInBackground();
		},
		buttons : {
			ok : {
				text : 'OK',
				click : function() {
					$(this).dialog("close");
				}
			}
		}
	});
	Socnet._freezeScrollBarInBackground();

}

Socnet.getBootStrapInfoFromServer = function(token) {
	var response;
	$.ajax({
		url : Socnet.Urls.bootStrap,
		type : 'POST',
		data : {
			tokenID : token
		},
		cache : false,
		async : false,
		dataType : "json",
		success : function(data) {
			response = data;
		},
		error : function(xhr, status, error) {
			response = null;
		}
	});
	return response;

}

Socnet.getPrivacyLevelOfComment = function(token, commentID) {
	var response;
	$.ajax({
		url : Socnet.Urls.getPrivacyLevelOfComment,
		type : 'POST',
		data : {
			tokenID : token,
			commentID : commentID
		},
		cache : false,
		async : false,
		dataType : "json",
		success : function(data) {
			response = data;
		},
		error : function(xhr, status, error) {
			response = null;
		}
	});
	return response;

}

Socnet.postCommentsToServer = function(token, signPostNodeCode, privacyLevel, text) {

	var result;
	$.ajax({
		url : Socnet.Urls.postComments,
		type : 'POST',
		data : {
			tokenID : token,
			nodeCode : signPostNodeCode,
			privacyLevel : privacyLevel,
			text : text
		},
		cache : false,
		async : false,
		dataType : "json",
		success : function(data) {
			result = data;
		},
		error : function(xhr, status, error) {
			result = null;
		}
	});
	return result;
}

Socnet.updateCommentPrivacyLevel = function(token, commentID, privacyLevel) {

	var result;
	$.ajax({
		url : Socnet.Urls.updateCommentsPrivacyLevel,
		type : 'POST',
		data : {
			tokenID : token,
			commentID : commentID,
			newPrivacyLevel : privacyLevel

		},
		cache : false,
		async : false,
		dataType : "json",
		success : function(data) {
			result = data;
		},
		error : function(xhr, status, error) {
			result = null;
		}
	});
	return result;
}

Socnet.getCommentsFromServer = function(token, signPostNodeCode, callBackFunction, container$) {
	$.ajax({
		url : Socnet.Urls.getComments,
		type : 'POST',
		data : {
			tokenID : token,
			nodeCode : signPostNodeCode
		},
		cache : false,
		dataType : "json",
		success : function(data) {
			callBackFunction(data, container$);
		},
		error : function(xhr, status, error) {
			callBackFunction(null, container$);
		}
	});
}

Socnet.deleteCommentsFromServer = function(token, commentID) {

	var result;
	$.ajax({
		url : Socnet.Urls.deleteComment,
		type : 'POST',
		data : {
			tokenID : token,
			commentID : commentID
		},
		cache : false,
		async : false,
		dataType : "json",
		success : function(data) {
			result = data;
		},
		error : function(xhr, status, error) {
			result = null;
		}
	});
	return result;
}

Socnet.getMyContacts = function(token) {

	var result;
	$.ajax({
		url : Socnet.Urls.getContacts,
		type : 'POST',
		data : {
			tokenID : token
		},
		cache : false,
		async : false,
		dataType : "json",
		success : function(data) {
			result = data;
		},
		error : function(xhr, status, error) {
			result = null;
		}
	});
	return result;
}

Socnet._freezeScrollBarInBackground = function() {
	$('body').css('overflow', 'hidden');
}

Socnet._unfreezeScrollBarInBackground = function() {
	$('body').css('overflow', '');
}

Socnet.deleteSocnetTreeCookies = function() {
	var pairs = document.cookie.split(";");
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split("=");
		var name = $.trim(pair[0]);
		console.log(name);
		if (name.match("^dynatree-cookie-custom-socnet")) {
			$.cookie(name, null);
		}
	}
}
Socnet.formatTimeFromEpoch = function(epoch) {
	var timestamp = new Date(epoch * 1000);
	var month = timestamp.getMonth() + 1;
	if (month < 10)
		month = "0" + month;
	var date = timestamp.getDate();
	if (date < 10)
		date = "0" + date;
	var timestampText = timestamp.getFullYear() + "-" + (month) + "-" + date + " " + timestamp.getHours() + ":" + timestamp.getMinutes();
	return timestampText;
}
