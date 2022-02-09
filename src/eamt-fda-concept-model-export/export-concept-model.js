!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._shell-application-utils

/**
 * Exports a concept model to a specific format. The package containing the concept model must be selected in the Project Browser.
 *
 * This script uses templates concept_model_rdf.ftlx and concept_model_asciidoc.ftl in %EAMT_HOME%/config/templates.
 *
 * @summary Exports a concept model.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	// Get the currently selected package in the tree to work on
	var package as EA.Package;
	package = Repository.GetTreeSelectedPackage();
	if (package != null && package.ParentID != 0) {
	
		var outputFolder = chooseFolderWithUI("Folder in which the exported concept model should be saved");
		if (outputFolder.length == 0) {
			LOGError("No folder path given");
			return;
		}
		
		outputFormat = Session.Input("Output format: ");
		if (outputFormat.length == 0) {
			LOGError("No output format given");
			return;
		}
		
		runBatFileInDefaultWorkingDirectory("export-concept-model.bat", "-o " + outputFolder + " -pkg " + package.PackageGUID + " -t " + outputFormat + " -p 10");
		
		openFolderInWindowsExplorer(outputFolder);
	} else {
		LOGError(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();