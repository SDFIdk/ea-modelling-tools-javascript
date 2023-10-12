!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._constants

/**
 * Exports a data model to a CSV file.
 * The package containing the data model must be selected in the Project Browser.
 *
 * Only the language-independent and the Danish tags are exported. If one of those tags is missing in
 * the model, the called application will fail (check the log file!).
 *
 * Use script export-data-model-configurable for more options.
 * 
 * This script uses one of the templates data_model_profile_csv.ftl in %EAMT_HOME%/config/templates.
 *
 * @summary Exports a data model with the default settings.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	verifyEaModellingToolsJavaInstallation();
	
	// Get the currently selected package in the tree to work on
	var package as EA.Package;
	package = Repository.GetTreeSelectedPackage();
	if (package != null && package.ParentID != 0) {
	
		var outputFolder = chooseFolderWithUI("Folder in which the exported data model should be saved");
		if (outputFolder.length == 0) {
			LOGError("No folder path given");
			return;
		}
		
		// cvs format; in Danish; strict mode
		var options = '-o "' + outputFolder + '" -pkg ' + package.PackageGUID + ' -t csv -l da -m strict';
		
		runBatFileInDefaultWorkingDirectory("export-data-model.bat", options);
		
		openFolderInWindowsExplorer(outputFolder);
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();