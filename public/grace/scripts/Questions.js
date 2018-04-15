Question.setAnswerCount = 0; // used to auto trigger saving of answers.
Question.lastAutoSaveTime = 0;
 
function Question(code, questionText, type) {
	this._code = code;
	this._questionText = questionText;
	this._questionType = type;
	this._help = null;
	this._answer = null;
	this._previousAnswer = null;
	
	this._comment = null;
	this._previousComment = null;
	
	this._managementComment = null;
	this._previousManagementComment = null;
	
	this._persistent = null;
	this._autoAnswer = null;
	this._answerConstraint = null;	     
	
	this._scaleType = null; //this is specifically for scale type questions
	this._disabled = false;
}

Question.prototype.calculateValueMg = function(answer, valueMgMap) {
	if(answer == null) //also checks for 'undefined'
		return null;
	
	if(this._questionType == 'scale' || this._questionType == 'integer' || this._questionType == 'real')
		return this._calculateMgForScaleAndNumber(answer, valueMgMap);
	else if(this._questionType == 'nominal')
		return this._calculateMgForNominal(answer, valueMgMap);
	else if(this._questionType.substr(0,4) == 'date')
		return this._calculateMgForDate(answer, valueMgMap);
	else {
		console.error("i don't know how to calculate mg for this question type: "+this._questionType);
		
	}
			
};


/*
 * answer must be like:
 * 2013 yyyy
 * or 012013 mmyyyy
 * or 01012013 ddmmyyyy
 */
Question.prototype._calculateMgForDate = function(answer, valueMgMap) {
	answer = jQuery.trim(answer);
	if(isNaN(answer)) {
		if(answer != 'DK')
	 		console.error("function: _calculateMgForDate was passed an answer which is not a number");
	 	return null;
	}
	var fullAnswerDate;
	var daysDifference;
	var now =  GlobalVariables.CURRENT_DATE;
	var currentYear = GlobalVariables.CURRENT_DATE.getFullYear();
	if(answer.length == 4 && currentYear == parseInt(answer)) { //take middle of time elapsed since start of year
		var startOfYearDate = Utilities.StringToDate(answer+"-01-01");
		//console.log("answer assumed="+startOfYearDate);
		daysDifference = (this._days_between(now,startOfYearDate))/2; //we want the middle of time elapsed
	}
	else {
		if(answer.length == 4)
			fullAnswerDate = Utilities.StringToDate(answer+"-07-02");
		else if(answer.length == 6) {
			var temp_month = (answer.substr(0,2));
			var temp_year =  (answer.substr(2,4));
			fullAnswerDate = Utilities.StringToDate(temp_year+"-"+temp_month+"-15");
		}
		else if(answer.length == 8) {
			var temp_day = (answer.substr(0,2));
			var temp_month = (answer.substr(2,2));
			var temp_year = (answer.substr(4,4));
			fullAnswerDate = Utilities.StringToDate(temp_year+"-"+temp_month+"-"+temp_day);
		}
		else {
			console.error("date answer has incorrect length. can only be 4,6 or 8. Given="+answer);
			return null;
		}
		//console.log("answer assumed="+fullAnswerDate);
		daysDifference = this._days_between(now,fullAnswerDate);
	}
	
	var differenceInRequiredFormat;
	//console.log("days difference = "+daysDifference);
	if(this._questionType == 'date-day')
		differenceInRequiredFormat = daysDifference;
	else if(this._questionType == 'date-week')
		differenceInRequiredFormat = (daysDifference/7.0);
	else if(this._questionType == 'date-month')
		differenceInRequiredFormat = (daysDifference/365.0)*12.0;
	else if(this._questionType == 'date-year')
		differenceInRequiredFormat = (daysDifference/365.0);
	
	
	//console.log("difference in required scale = "+differenceInRequiredFormat);
	return this._calculateMgForScaleAndNumber(differenceInRequiredFormat, valueMgMap);
	
	
	 
};


/**
 * calcultates the difference between two given dates.
 * both parameters must be date objects.
 * private helper method
 */
Question.prototype._days_between = function(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY);

};




Question.prototype._calculateMgForNominal = function(answer, valueMgMap) {
	for (var i=0; i < valueMgMap.length; i++) {
		if(valueMgMap[i].value == answer)
			return parseFloat(valueMgMap[i].mg);
	}
	if(answer != 'DK')
		console.error("nominal answer not found in value-mg list");
	return null;
};

/**
 * takes in answer and valuemg array for number and scale questions and returns a mg
 */
Question.prototype._calculateMgForScaleAndNumber = function(answer, valueMgMap) {
	//confirm that answer is a number
	if(isNaN(answer)) {
		if(answer != 'DK')
	 		console.error("function: calculateMgForScaleAndNumber passes an answer which is not a number");
	 	return null;
	}
	else
	 	answer = parseFloat(answer);

	 
	//create array of values and mgs
	var values = new Array();
	var mgs = new Array();
	for (var i=0; i < valueMgMap.length; i++) {
	 	values[i] =  parseFloat(valueMgMap[i].value);
	 	mgs[i] = parseFloat(valueMgMap[i].mg);
	}
	 
	var mg = null;
	if(answer <= values[0]) //check if the values are outside the range.
	 	mg = mgs[0];
	else if(answer >= values[values.length - 1]) //check if the values are outside the range.
	 	mg = mgs[mgs.length -1];
	else { //values are within the range.
		
		//find the two values between which this answer lies. lets call them tail and head
		var tail=0; var head=0;
		for (var i=0; i < values.length-1; i++) {
			if(values[i]<=answer) {
					tail=i;head=i+1;
			}
				else
					break;
		}
		mg = mgs[tail] + ( ((mgs[head]-mgs[tail])/(values[head]-values[tail]))*(answer-values[tail]) ); 
	}
	
	return mg;
};

















//====================================================================
// 				setters and getters
//====================================================================
Question.prototype.isClosedFilterOrLayer = function() {
	if(this._questionType == 'filter-q' || this._questionType == 'layer') {
		if(this._answer != null && this._answer.toLowerCase() == 'yes')
			return false;
		else
			return true;
	}
	else
		return false;
};
Question.prototype.isDisabled = function() {
	return this._disabled;
};
Question.prototype.setDisabled = function(status) {
	this._disabled = status;
};

Question.prototype.getCode = function() {
	return this._code;
};
Question.prototype.getQuestionText = function() {
	return this._questionText;
};
Question.prototype.getQuestionType = function() {
	return this._questionType;
};
Question.prototype.getHelp = function() {
	return this._help;
};
Question.prototype.setHelp= function(help) {
	this._help = help;
};

Question.prototype.getAnswer = function() {
	return this._answer;
};
Question.prototype.setAnswer = function(answer, isUserEvent) {
	this._answer = answer;
	if (typeof isUserEvent !== "undefined") {
		Question.setAnswerCount++;
		//console.log(Question.setAnswerCount);
		var now = Math.floor(new Date() / 1000);
		if(Question.setAnswerCount >= GlobalVariables.autoSaveTrigger && (now - Question.lastAutoSaveTime) >= GlobalVariables.minTimeBeforeAutoSaveTrigger) {
			console.log("AUTO save triggered");
			Question.setAnswerCount = 0;
			Question.lastAutoSaveTime = now;
			LayoutManager._saveAssessment();
		}
	}
};

Question.prototype.getPreviousAnswer = function() {
	return this._previousAnswer;
};
Question.prototype.setPreviousAnswer = function(previousAnswer) {
	this._previousAnswer = previousAnswer;
};

Question.prototype.getComment = function() {
	return this._comment;
};
Question.prototype.setComment = function(comment) {
	this._comment = comment;
};

Question.prototype.getPreviousComment = function() {
	return this._previousComment;
};
Question.prototype.setPreviousComment = function(previousComment) {
	this._previousComment = previousComment;
};

Question.prototype.getManagementComment = function() {
	return this._managementComment;
};
Question.prototype.setManagementComment = function(managementComment) {
	this._managementComment = managementComment;
};

Question.prototype.getPreviousManagementComment = function() {
	return this._previousManagementComment;
};
Question.prototype.setPreviousManagementComment = function(previousManagementComment) {
	this._previousManagementComment = previousManagementComment;
};

Question.prototype.getPersistent = function() {
	return this._persistent;
};
Question.prototype.setPersistent = function(persistent) {
	this._persistent = persistent;
};

Question.prototype.getAutoAnswer = function() {
	return this._autoAnswer;
};
Question.prototype.setAutoAnswer = function(autoAnswer) {
	this._autoAnswer = autoAnswer;
};

Question.prototype.getAnswerConstraint = function() {
	return this._answerConstraint;
};
Question.prototype.setAnswerConstraint = function(answerConstraint) {
	this._answerConstraint = answerConstraint;
};

Question.prototype.getScaleType = function() {
	return this._scaleType;
};

Question.prototype.setScaleType = function(scaleType) {
	this._scaleType = scaleType;
};

