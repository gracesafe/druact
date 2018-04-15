/**
 * 	AVATAR TEXTS
 * These are avatar messages that come up when "my guide" button is clicked.
 * you can use simple html elements in the string, eg <br/>, <b> ,<i> etc.
 */

if(GlobalVariables.currentPopulationBasedMode == GlobalVariables.PopulationBasedModes.FIRST_PERSON) {
	//avatar mesasge for home page.
	GlobalVariables.myGuideStrings['homepage-1st-message'] = "Hallo #name#,<br/><br/>Er zijn drie paden die u kan volgen doorheen myGRaCE, afhankelijk van wat vandaag voor u het belangrijkste is. Beweeg over het informatie pictogram naast elk pad om te zien wat dit doet.<br/><br/>U kan op elk moment kiezen om terug te keren naar deze pagina en een ander pad te kiezen.<br/><br/>Om hulp te krijgen, selecteer 'Mijn Gids' bovenaan links op elke pagina of de 'Volgende Stap?' knop.";
	//There are three pathways you can follow through myGRaCE, depending on what is most important to you today. Hover over the information icon beside each pathway to see what it does. You can come back to this page to choose a different pathway at any time if you wish. To get help, select My Guide on the top left hand side of each page or the Whats next? button.

	//avatar text for mindmap
	GlobalVariables.myGuideStrings['mylife-mindmap'] = "Selecteer een onderwerp, in een volgorde die u wenst, en u zal naar de pagina met de relevante vragen gebracht worden.<br/><br/>U hoeft niet alles te beantwoorden; kies gewoon de onderwerpen waarvan u denkt dat ze relevant zijn vandaag.<br/><br/>U kan op elk moment terugkeren naar deze pagina om een ander onderwerp te selecteren.<br/><br/>Vergeet niet om uw antwoorden regelmatig op te slaan.";
	//Select any topic in any order you like and you will be taken to a page with the relevant questions. There is no need to answer everything; just choose topics that you think are relevant today. You can return to this page to select a different topic at any time. Don't forget to save your answers regularly.

	// this is for all data collection mode. 
	GlobalVariables.myGuideStrings['mylife-questionnair'] = "U kan in het linkerpaneel selecteren welke vragen u wil beantwoorden.<ol><li>Selecteer het kleine '+' of '-' teken om enkel die sectie van de vragen te openen of te sluiten.</li><li>Klik met de rechtermuisknop op &eacute;&eacute;n van de tekstlabels om alle vragen te openen of te sluiten.</li></ol></li>Geselecteerde vragen, om te beantwoorden, zullen zichtbaar worden in het rechterpaneel.<ol><li>Beweeg de cursor over &eacute;&eacute;n van de kleine pictogrammen om extra hulp te krijgen.</li><li>Vragen met een 0 tot 10 schaal hebben een uitleg over wat elk einde betekent. Maak u geen zorgen over het exacte nummer dat u toewijst, kies alleen iets dat gepast lijkt op de gegeven schaal.</li></ol>";
	//You can select which set of questions you want to answer in the left-hand panel. Select the little '+' or '-' sign to open or close just that section of the questions. Right click on any of the text labels to open or close all the questions. Questions selected will be displayed for answering in the right-hand panel. Move the cursor over any of the little icons to get additional help. Questions with a 0 to 10 scale have an explanation of what each end means. Don't worry about the exact number you give, just choose one that feels in about the right place on the scale.
	
	// this appears when my profile is visited for the first time.
	GlobalVariables.myGuideStrings['myprofile-1st-message'] = "De 'Belichte Problemen' tonen de gebieden waar u zich tot nu toe het meeste zorgen over maakt en waar u in de toekomst extra informatie over zou kunnen verzamelen.<br/><br/>Selecteer 'Toon Rapport' om de informatie te tonen die u in deze fase reeds gegeven heeft.";
	//The 'Highlighted Issues' show the areas that are your main concerns so far and where you may need to collect further information. Select ’Show Report’ to display the information you have already given at this stage.

	// this appears when my profile is visited again.
	GlobalVariables.myGuideStrings['myprofile-2nd-message'] = "Nu dat u meerdere vragen beantwoord heeft kan de lijst met bezorgdheden, die verder moeten worden bekeken, gewijzigd zijn, dus bekijk deze nogmaals.<br/><br/>Voor het be&euml;indigen van de evaluatie, vergeet niet om de pagina 'GRaCE Advies en Mijn Plan' te bezoeken.";
	//Now that you have answered more questions, the list of concerns needing further consideration may have changed so take another look at them. Before finishing the assessment, don’t forget to check the 'GRaCE Advice and My Plan' page.

	//avatar for risk judgement page
	GlobalVariables.myGuideStrings['myassessment'] = "Elk van de schalen van de veiligheidsevaluatie gaan van 0 tot 10 en kunnen op dezelfde manier beantwoord worden als de andere vragen met schaalverdeling.<br/><br/>U hoeft niet elke vraag te beantwoorden. U zou zich alleen kunnen concentreren op de problemen die voor u op dit moment het meest relevant zijn.<br/><br/>Nadat u de vragen beantwoord heeft, zorg ervoor dat u naar het einde van de pagina scrolt en ons algemeen advies bekijkt. Meer specifieke hulp en ondersteuning kan worden verkregen via de 'GRaCE Advies en Mijn Plan' fase.";
	//Each of the safety assessment scales are from 0 to 10 and can be answered in the same way as any of the other scale questions. You do not need to answer every question. You may only want to concentrate on the issues most relevant to you right now. After you have answered the questions, make sure you scroll to the bottom of the page and have a look at our overall advice. More specific help and support can be obtained from the 'GRaCE Advice and My Plan' stage.

	//avatar for my grace advice and my plan
	GlobalVariables.myGuideStrings['grace-advice'] = "Op deze pagina kan u een overzicht zien van alle problemen die moeten worden aangepakt en de door GRaCE voorgestelde acties. Selecteer 'Mijn Actieplan' om een eigen plan op te stellen, gebaseerd op GRaCE's advies en uw gedachten en idee&euml;n die u reeds opgenomen heeft via zelfbeheer.<br/><br/>U bent natuurlijk de expert in uw eigen situatie, maar we hopen dat u een beter idee heeft over de hulp die u nodig heeft door uw problemen te beschouwen en de suggesties van GRaCE te bekijken.";
	//On this page you can see a list of any issues that need addressing and the associated actions suggested by GRaCE. Select \"My Action Plan\" to create your plan, based on GRaCE's advice and the self-management thoughts and ideas you have already recorded. You are the expert on your own situation, of course, but we hope that you will have a better idea of what help you need having considered the issues and seen GRaCE's suggestions.
	
	GlobalVariables.myGuideStrings['grace-finish-survey'] = "<b>Thank you for completing myGRaCE</b><br/>#name#<br/><br/><b>We would welcome some feedback</b> on how helpful and easy to use myGRaCE is for you. We are always trying to improve myGRaCE and your views are very important.<br/><br/><b>The link to the short feedback survey</b> is in the box where you close myGRaCE. <I>Don't worry if you would rather leave it for now, you can do it some other time</I>. You can also do it as many times as you like, whenever you have some new ideas.<br/><br/>Best wishes and see you again soon. ";
	/**
	 * The following are avatar tooltips that appear when mouse is hovered over buttons on the top.
	 */
	GlobalVariables.buttonToolTip['my-profile'] = "Selecteer nadat u wat informatie over uzelf heeft ingegeven. U kan een rapport zien van wat u verzamelt heeft tot nu toe en alle gebieden die mogelijks meer aandacht nodig hebben.";
	//Select after you have provided some information about yourself. You can see a report of what you have collected so far and any areas that may need more consideration.
	GlobalVariables.buttonToolTip['my-assessment'] = "Wanneer u klaar bent met het geven van informatie over uzelf en uw levensomstandigheden, wilt u misschien nadenken over hoe goed u voor uw eigen veiligheid en de veiligheid van anderen zorgt.<br/><br/>Als dat zo is, kies deze optie om een score tussen 0 (geen risico) en 10 (maximaal risico) te geven voor &eacute;&eacute;n of meerdere veiligheidsgebieden.";
	//When you have finished giving information about yourself and your life circumstances, you might want to think about how well you are looking after your own safety or the safety of others. If so, choose this option to provide a rating between 0 (no risk) and 10 (maximum risk) for one or more safety areas.
	GlobalVariables.buttonToolTip['my-advice'] = "Nadat u uw persoonlijke veiligheid en uw welzijn heeft beoordeeld, kies deze optie om te zien welk advies GRaCE u kan aanbieden om u te helpen met het aanpakken van uw bezorgdheden.";
	//After you have rated your personal safety and wellbeing, choose this option to see what advice GRaCE can provide to help you address issues of concern.
	GlobalVariables.buttonToolTip['homepage'] = "Klik hier om terug te gaan naar de startpagina.";
	//Click here to go back to homepage.
	
	/**
	 * text for where-to popup
	 */
	GlobalVariables.whereToText['openingPage'] = "Selecteer één van de myGRaCE paden om te beginnen.";
	GlobalVariables.whereToText['mindmap'] = "Ga naar ‘Toon rapport’ om te kijken naar hoe uw rapport er tot nu toe uitziet. Indien u alle informatie ingegeven heeft die u vandaag wou invullen kan u een beoordeling van uw eigen veiligheid en welzijn maken of eens kijken naar GRaCE Advies.";
	GlobalVariables.whereToText['questionnairNormal'] = "Ga terug naar het overzicht om een ander onderwerp te selecteren of om te controleren of alles wat u vandaag wou nagaan ingevuld is.";
	GlobalVariables.whereToText['riskOverview'] = "Ga naar ‘Mijn veiligheidsevaluatie’ om een globale waardering over uw persoonlijke veiligheid en uw welzijn te geven, of ga terug naar de vragen om meer informatie over uzelf in te vullen.";
	GlobalVariables.whereToText['riskJudgement'] = "Ga naar ‘GRaCE Advies en Mijn Plan’ om hulp te krijgen bij uw zorgen en om een actieplan op te stellen.";
	GlobalVariables.whereToText['adviceLayout'] = "Ga naar ‘Beëindigen’ om uw beoordeling af te ronden.";
	GlobalVariables.whereToText['commonToAll'] = "<br/><br/>Indien u een pauze wil nemen en uw beoordeling later wil beëindigen, selecteer dan ‘Afbreken’.";

}


/**
 * OTHER SETTINGS
 */
GlobalVariables.highMgThresholdToTriggerHighlightedNodes = 0.5; // this is used as threshold to trigger highlighted nodes in my profile page.
GlobalVariables.treeWidth = 300; //in pixels
