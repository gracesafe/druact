LayoutNavigator = {};
LayoutNavigator.stack = new Array();
LayoutNavigator.stackPointer = 0; // starts from 0. so first element in stack will be pointed to as 0
LayoutNavigator.history = new Array();

LayoutNavigator.addNewLayoutToHistoryOnly = function (journey, layout, layoutPamasObj) {
	var navElement = LayoutNavigator._createNewLayoutObj(journey, layout, layoutPamasObj);
	//LayoutNavigator.history.push(navElement);
	// TEMPORARILY DISABLED. ENABLE IT AGAIN WHEN WE NEED HISTORY
	// PROBLEM IS: this history will get very big very quickly!!!!!
	// maybe instead of storing entire tree objects, we should just store string or something and recreate object on the fly!
};

/**
 * 
 * @param {Object} journey
 * @param {Object} layout
 * @param {Object} layoutPamasObj
 * 
 * returns timestamp to identify this object. it is used later by questionnair layout to update last accessed node.
 */
LayoutNavigator.addNewLayout = function (journey, layout, layoutPamasObj) {
	var navElement = LayoutNavigator._createNewLayoutObj(journey, layout, layoutPamasObj);
	
	if(LayoutNavigator.stack.length == 0) {
		LayoutNavigator.stack.push(navElement);
	}
	else {
		LayoutNavigator.stack.splice(LayoutNavigator.stackPointer+1,LayoutNavigator.stack.length-LayoutNavigator.stackPointer-1, navElement);
	}
	LayoutNavigator.stackPointer = LayoutNavigator.stack.length - 1;
	//LayoutNavigator.history.push(navElement);
	return navElement.timeIn;
};

LayoutNavigator.isStackEmpty = function () {
	if(LayoutNavigator.stackPointer == 0)
		return true;
	else
		return false;
};

LayoutNavigator.goBack = function () {
	if(LayoutNavigator.stackPointer == 0)
		return;
		
	var elementToGo = LayoutNavigator.stack[LayoutNavigator.stackPointer - 1];
	LayoutNavigator.stackPointer--;
	LayoutNavigator._openLayout(elementToGo);
	
};

LayoutNavigator.goForward = function () {
	if(LayoutNavigator.stackPointer == LayoutNavigator.stack.length -1)
		return;
		
	var elementToGo = LayoutNavigator.stack[LayoutNavigator.stackPointer + 1];
	LayoutNavigator.stackPointer++;
	
	LayoutNavigator._openLayout(elementToGo);
	
};

LayoutNavigator.updateSlectedTreeNodeInQuestionnair = function (timestampID, currentKey) {
	for(var i=LayoutNavigator.stack.length-1; i >= 0 ; i--) {
		if(LayoutNavigator.stack[i].timeIn == timestampID) {
			LayoutNavigator.stack[i].layoutPramas.lastSelectedjsCatNodeKey = currentKey;
			//console.log("updated with "+currentKey);
			break;
		}
	}
};

//************************************************************************************
//				PRIVATE HELPER FUNCTIONS
//************************************************************************************

LayoutNavigator._createNewLayoutObj = function (journey, layout, layoutPramas) {
	return {timeIn: (new Date).getTime(), journey: journey, layout: layout, layoutPramas: layoutPramas};
};

LayoutNavigator._openLayout = function (elementToGo) {
	if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
		if(GlobalVariables.currentMygraceVersionPathways == null) {
			GlobalVariables.currentMygraceVersionPathways = elementToGo.journey;
		}
	}
	else if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.THIRD_PERSON) {
		if(GlobalVariables.currentClinicianVersionPathway == null) {
			GlobalVariables.currentClinicianVersionPathway = elementToGo.journey;
		}
	}
	 
	if(elementToGo.layout == GlobalVariables.Layouts.OPENING_PAGE_LAYOUT) {
		LayoutManager.setOpeningPageLayout({registerNewNavigation:false});
	}
	else if(elementToGo.layout == GlobalVariables.Layouts.MINDMAP_LAYOUT) {
		var params = elementToGo.layoutPramas;
		if(params == null)
			params = {};
		
		params.registerNewNavigation = false;
		LayoutManager.setMindMapLayout(params);
	}
	else if(elementToGo.layout == GlobalVariables.Layouts.RISK_OVERVIEW) {
		LayoutManager.setRiskOverviewLayout({registerNewNavigation:false});
	}
	else if(elementToGo.layout == GlobalVariables.Layouts.RISK_JUDGEMENT_LAYOUT) {
		LayoutManager.setRiskJudgementLayout({registerNewNavigation:false});
	}
	else if(elementToGo.layout == GlobalVariables.Layouts.ADVICE_LAYOUT) {
		LayoutManager.setAdviceLayout({registerNewNavigation:false});
	}
	
	else if(elementToGo.layout == GlobalVariables.Layouts.QUESTIONNAIRE_LAYOUT) {
		var params = elementToGo.layoutPramas;
		if(params == null)
			params = {};
		
		params.registerNewNavigation = false;
		params.timeStampID = elementToGo.timeIn;
		LayoutManager.setQuestionnaireLayout(params);
	}
	else if(elementToGo.layout == GlobalVariables.Layouts.STEPPED_SCREENING) {
		LayoutManager.setSteppedScreeningLayout({registerNewNavigation:false});
	}

};



