!INC eamt-utilities._constants
!INC eamt-utilities._logging-utils
!INC eamt-utilities._messages

/**
 * Certain older models were given stereotype Grunddata::DKDomænemodel, but for some
 * reason (a bug or shortcoming in older EA versions?), the fully-qualified stereotype was not saved
 * in the XMI-file.
 *
 * For newer models with stereotype Grunddata::DKDomænemodel, the XMI 1.1 file in SVN will contain
 * a tagged value with name $ea_xref_property and a value that contains FQName=Grunddata::DKDomænemodel,
 * for example:
 *
 * ```xml
 * <!-- … -->
 * <UML:TaggedValue tag="stereotype" value="DKDomænemodel"/>
 * <!-- … -->
 * <UML:TaggedValue tag="$ea_xref_property" value="…Name=DKDomænemodel;FQName=Grunddata::DKDomænemodel…"/>
 * <!-- … -->
 * ```
 * 
 * For older models, the tagged value with name $ea_xref_property is not present. This gives issues
 * when loading the model when the MDG containing the Grunddata2::DKDomænemodel stereotype is loaded, as
 * EA then possibly assumes that the stereotype of the model is Grunddata2::DKDomænemodel, not 
 * Grunddata::DKDomænemodel. You can see that this is the case when the stereotype in the docked
 * [Properties **Window**](https://sparxsystems.com/eahelp/proptab.html)
 * is shown as Grunddata2::DKDomænemodel, whereas the 
 * [Properties **Dialog**](https://sparxsystems.com/eahelp/objectproperties.html)
 * contains a tab "Grunddata", showing the tags defined for stereotype Grunddata::DKDomænemodel.
 *
 * This script sets the fully-qualified stereotype of the selected package to Grunddata::DKDomænemodel directly
 * in the EA project file. The package does not have to be checked out to be able to do this. This can be sufficient
 * when you only want to export the model in a certain format.
 *
 * Note: you need to select another package and then the updated package again
 * to see the change in the Properties Window.
 *
 * To set the correct fully-qualified stereotype in the XMI file as well, 
 * 
 * 1. make sure all the package's dependencies are present in the EA project file;
 * 2. check out the package;
 * 3. run this script;
 * 4. check in the package again.
 * 
 * @summary Sets the stereotype of a model to Grunddata::DKDomænemodel.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	LOGInfo("=======================================");
	
	if (!Repository.IsTechnologyEnabled("GD2MDG")) {
		throw new Error("The MDG with id GD2MDG, containing UML profile Grunddata2, is not enabled.");
	}
	if (!Repository.IsTechnologyEnabled("Geodata")) {
		throw new Error("The MDG with id Geodata, containing UML profile Geodata, is not enabled.");
	}
	if (!Repository.IsTechnologyEnabled("Grunddata")) {
		throw new Error("The MDG with id Geodata, containing UML profile Grunddata, is not enabled.");
	}
	
	var selectedPackage as EA.Package;
	selectedPackage = Repository.GetTreeSelectedPackage();
	if (selectedPackage != null && selectedPackage.ParentID != 0) {
		var promptResult = Session.Prompt("Set the stereotype to Grunddata::DKDomænemodel (instead of " + selectedPackage.Element.FQStereotype + ") in database " + Repository.ConnectionString + "?", promptYESNO);
		switch (promptResult) {
			case resultYes:
				var updateStatement = "UPDATE t_xref SET description = '@STEREO;Name=DKDomænemodel;FQName=Grunddata::DKDomænemodel;@ENDSTEREO;' WHERE client = '" + selectedPackage.Element.ElementGUID + "' AND name = 'Stereotypes';";
				Repository.Execute(updateStatement);
				LOGInfo("Executed " + updateStatement);
				LOGInfo("Select another package and then " + selectedPackage.Name + " again to see the change");
				LOGInfo("Done!");
				break;
			case resultNo:
				// do nothing
				break;
		}
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();