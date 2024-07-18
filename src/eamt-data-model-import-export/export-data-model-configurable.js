!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._constants

/**
 * Exports a data model to a CSV file.
 * The package containing the data model must be selected in the Project Browser.
 *
 * It is possible to choose the language:
 * choose between da (Danish), en (English) and und (all available languages).
 *
 * It is possible to choose the strictness mode: choose between strict (fail when a tag is
 * missing in the model), moderate (print _MISSING TAG_ in the output file when a tag is missing
 * in the model) and lenient (output an empty string in the output file when a tag is missing in
 * in the model. Use lenient when you are dealing with a model that you cannot change right now.
 * Use moderate to identify the missing tags, and them in the model, and run this script again,
 * now with strictness mode strict.
 * 
 * This script uses one of the templates data_model_profile_csv.ftl in %EAMT_HOME%/config/templates.
 *
 * @summary Exports a data model with the user-defined settings.
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
		
		var language = Session.Input("Language: da, en, und");
		if (language == null || language == "") {
			LOGError("No language given");
			return;
		}
		LOGInfo("Chosen language: " + language);
		
		var mode = Session.Input("Strictness mode: strict, moderate, lenient");
		if (mode == null || mode == "") {
			LOGError("No strictness mode given");
			return;
		}
		LOGInfo("Chosen mode: " + mode);
		
		// cvs format; in Danish; strict mode
		var options = '-o "' + outputFolder + '" -pkg ' + package.PackageGUID + ' -t csv -l ' + language + ' -m ' + mode;
		
		runBatFileInDefaultWorkingDirectory("export-data-model.bat", options);
		
		openFolderInWindowsExplorer(outputFolder);
		
		LOGInfo("Done!");
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();