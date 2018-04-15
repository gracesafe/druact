//*****************************************************************************************
//					ASSESSMENT FINISHED LAYOUT
//*****************************************************************************************
LayoutManager.FinishedLayout = {};
LayoutManager.setupFinishedLayout = function(status) {

	if (GlobalVariables.lightLaunchStatus == true) {
		window.onbeforeunload = "";
		//window.location = "../../mh-dss-assess-java-light-launch.php?clinclientid=" + GlobalVariables.clinicianClientID;
		window.location = "../../mh-dss-assess-light-launch.php?clinclientid=" + GlobalVariables.clinicianClientID;

	} else {
		GlobalVariables.previousLayout = GlobalVariables.currentLayout;
		GlobalVariables.currentLayout = GlobalVariables.Layouts.FINISHED_LAYOUT;

		var finishedLayoutTemplate = '<div id="top-header"></div>' +
		//'<div id="left-sidebar">'+
		//'<div id="tree"></div>'+
		//'</div>'+
		'<div id="center-finishedLayoutPanel">' +
		//'<div id="right-statusBar"></div>'+
		//'<div id="right-questionPanel"></div>'+
		'</div>';
		$('body').html(finishedLayoutTemplate);

		LayoutManager.setupHeader();
		LayoutManager.FinishedLayout._addMenuButtonsToFinishedLayout();
		$('#footer').html('');
		//$('#nav-bar-advice').prop("checked", true);$('#nav-bar').buttonset('refresh');
		$('#center-finishedLayoutPanel').css('margin-top', (GlobalVariables.headerHeight + 10) + 'px');

		var msg;
		var msg2;
		if (GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
			msg = GlobalVariables.strings['galassify-finishedLayout-1'];
			msg2 = GlobalVariables.strings['galassify-finishedLayout-2'];
		} else {
			msg = GlobalVariables.strings['galassify-finishedLayout-3'];
			msg2 = GlobalVariables.strings['galassify-finishedLayout-4'];
		}

		$('#center-finishedLayoutPanel').append('<h3 id="finish-msg">' + msg + '</h3>');
		$('#center-finishedLayoutPanel').append('<br/><h4>' + msg2 + '</h4>');
	}
};

LayoutManager.FinishedLayout._addMenuButtonsToFinishedLayout = function() {
	var data = '<div id=menuButtons style="text-align: center;">';
	data += '<a id="close-window">Close this<br/>window</a>';
	data += '</div>';

	$('#top-header').append(data);

	$('#close-window').button().click(function() {
		window.close();
	});
};