!INC eamt-utilities._logging-utils
!INC eamt-utilities._constants
!INC eamt-utilities._messages
!INC eamt-utilities._tagged-values-utils

 
/**
*Script to validate whether or not a given model comply with the basic data model rules version 2.
*
* @summary Validate if the tags versionInfo, approvalStatus and modified on the model follow the model rules.
*
*/

var LOGLEVEL = LOGLEVEL_INFO;
var stereotype = "Grunddata2::DKDomænemodel"


function main(){
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();
	
	LOGInfo("=========== START: version-status-modified ===========");

	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		LOGInfo("Working on package '" + selectedPackage.Name + "' (ID=" + selectedPackage.PackageID + ")");
		
		checkStatusVersionModified(selectedPackage);		
	}
	else {
		LOGInfo(MESSAGE_PACKAGE_REQUIRED);
	}
	LOGInfo( "================== DONE! ===================" );
}

function checkStatusVersionModified(package){
	//LOGInfo("=============== STATUS =================");
	var result=checkStatus(package);
	if (result==false){
		return false;
	} else {LOGInfo("Status OK");}
	
	//LOGInfo("=============== VERSION ================");
	var result=checkVersion(package);
	if (result==false){
		return false;
	} else {LOGInfo("Version OK");}
	
	//LOGInfo("=========== OPDATERINGSDATO =============");
	var result=checkModified(package);
	if (result==false){
		return false;
	} else {LOGInfo("Modified OK");}	
}

function checkStatus(package) {
	if (package.Element.HasStereotype(stereotype)) {
		var result=getTaggedValueElement(package.Element, "approvalStatus", "noTag");
		if (result=="noTag"){
			LOGError("No tag called 'approvalStatus' on package  " + package.Name);
			return false;
		} else if (result != 'approved') {
			LOGError("Value given on tagged value 'approvalStatus' on package  " + package.Name + " is not 'approved'!");
			return false;
		} else { 
			LOGTrace("Version on tagged value 'approvalStatus' on package " + package.Name +": " + result);
			return true;
		}
	} else {
		LOGError("Steoreotype of model is not " +stereotype);
		return false;}
}

function checkVersion(package) {
	if (package.Element.HasStereotype(stereotype)) {
		var result=getTaggedValueElement(package.Element, "versionInfo", "noTag");
		//LOGInfo("test: " +/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/.test(result)); Hvis det kun er major.minor.patch og ikke noget med build, preview osv, så skal denne regex bruges/
		if (result=="noTag"){
			LOGError("No tag called 'versionInfo' on package  " + package.Name);
			return false;
		} else if (result == null || result == "") {
			LOGError("No value given on tagged value 'versionInfo' on package  " + package.Name);
			return false;
		} else { 
			LOGTrace("Version on tagged value 'versionInfo' on package " + package.Name +": " + result);
			if (/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(result)){
				return true;
			} else {
				return false}
		}
	} else {
		LOGError("Steoreotype of model is not " + stereotype);
		return false;}
}

function checkModified(package) {
	if (package.Element.HasStereotype(stereotype)) {
		var result=getTaggedValueElement(package.Element, "modified", "noTag");
		if (result=="noTag"){
			LOGError("No tag called 'modified' on package  " + package.Name);
			return false;
		} else if (result == null || result == "") {
			LOGError("No value given on tagged value 'modified' on package  " + package.Name);
			return false;
		} else { 
			LOGTrace("Date on tagged value 'modified' on package " + package.Name +": " + result);
			if (/20[0-9][0-9]-[0-1][0-9]-[0-3][0-9]/.test(result)){
				return true;
			} else {
				return false}
		}
	} else {
		LOGError("Steoreotype of model is not " +stereotype);
		return false;}
}

main();