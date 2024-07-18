!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._file-utils
!INC eamt-utilities._constants

/**
 * Updates a data model by importing the tags specified in a CSV file.
 * Use this scripts for tags NOT defined by a UML profile. If the tag does not
 * exist yet, it will be created. If the specified value is empty, the tag
 * will be deleted.
 *
 * The output of query model_elements_tagged_value_export (EA Modellings Tools SQL)
 * can be used as a starting point for the file to import.
 *
 * @summary Updates a data model by importing the tags specified in a CSV file.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	verifyEaModellingToolsJavaInstallation();
	
	// Get the currently selected package in the tree to work on
	var package as EA.Package;
	package = Repository.GetTreeSelectedPackage();
	if (package != null && package.ParentID != 0) {
	
		var inputFile = openCSVFileDialog("CSV file containing the tags to be imported");
		if (inputFile.length == 0) {
			LOGError("No folder path given");
			return;
		}
		
		var options = '-i "' + inputFile + '" -pkg ' + package.PackageGUID + ' -tum update_add_delete';
		
		runBatFileInDefaultWorkingDirectory("update-data-model-tags.bat", options);
		
		LOGInfo("Done, refresh model view to reflect updates.");
		Repository.RefreshModelView(package.PackageID);
		
		// Log messages written after refreshing the model view do not show up in the output...
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();