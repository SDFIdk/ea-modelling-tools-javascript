!INC eamt-utilities._logging-utils
!INC eamt-utilities._constants
!INC eamt-utilities._messages
!INC eamt-utilities._tagged-values-utils

/**
*Validate if the selected model has stereotype following the basic data model rules version 2.
*@summary test
 */
 
var LOGLEVEL = LOGLEVEL_INFO;
const allowedstereotypesmodel = ["Grunddata2::DKDomænemodel", "Grunddata2::DKKlassifikationsmodel"];
const allowedstereotypeselement = ["Grunddata2::DKObjekttype", "Grunddata2::DKDatatype","Grunddata2::DKEnumeration", "Grunddata2::DKKodeliste"];
const allowedstereotypesattributerole = ["Grunddata2::DKEgenskab"];

function main(){
	// Show the script output window
	Repository.EnsureOutputVisible("Script");

	// Get the currently selected package in the tree to work on
	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();
	
	LOGInfo("============ START: stereotype ============");

	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		LOGInfo("Working on package '" + selectedPackage.Name + "' (ID=" + selectedPackage.PackageID + ")");
		
		j = checkStereotypemodel(selectedPackage);	
		if (j==1){
			LOGInfo("Stereotype OK");
		} else if (j>1){
			LOGError("Too many stereotypes on model. Only one is allowed.");
		} else {
			LOGError("Stereotype not on allowed list or no stereotype given.");
		}
	}
	else {
		LOGInfo(MESSAGE_PACKAGE_REQUIRED);
	}
	LOGInfo( "=============== DONE! ================" );
}


function checkStereotypemodel(package){
	// Check if the selected package has the correct stereotype, and only one stereotype
	var j=0;
	for (var i = 0; i < allowedstereotypesmodel.length; i++){
		if (package.Element.HasStereotype(allowedstereotypesmodel[i])) {
			j+=1;
		} else {
			//do nothing
			continue;
		}
	}
	return j;
}


main();