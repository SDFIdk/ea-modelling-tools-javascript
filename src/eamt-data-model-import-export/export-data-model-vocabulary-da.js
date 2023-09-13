!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._constants

/**
 * Exports a data model to a Danish data vocabulary in the CSV format.
 * The package containing the concept model must be selected in the Project Browser.
 * If a URL is available for the dataset that is described by the data model, it can be provided and will be added to the data model.
 * 
 * This script uses template vocabulary_csv.ftl in %EAMT_HOME%/config/templates.
 *
 * @summary Exports a data model to a data vocabulary.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	verifyEaModellingToolsJavaInstallation();
	
	// Get the currently selected package in the tree to work on
	var package as EA.Package;
	package = Repository.GetTreeSelectedPackage();
	if (package != null && package.ParentID != 0) {
	
		var outputFolder = chooseFolderWithUI("Folder in which the exported data vocabulary should be saved");
		if (outputFolder.length == 0) {
			LOGError("No folder path given");
			return;
		}
		
		var answer = Session.Prompt("Should the output file have a header?", promptYESNO);
		var hasHeader;
		if (answer == resultYes) {
			hasHeader = true;
		} else if (answer == resultNo) {
			hasHeader = false;
		}
		
		var answer = Session.Prompt("Is a link to metadata available for the data?", promptYESNO);
		var hasMetadata;
		var metadataUrl;
		if (answer == resultYes) {
			hasMetadata = true;
			metadataUrl = Session.Input("Metadata URL: ");
			if (metadataUrl.length == 0) {
				LOGInfo("No metadata URL given");
				return;
			}
		} else if (answer == resultNo) {
			hasMetadata = false;
		} else {
			LOGError("Unexpected answer");
			return;
		}
		
		// cvs format; in Danish
		var options = '-o "' + outputFolder + '" -pkg ' + package.PackageGUID + ' -t csv -l da -p 10 ';
		if (hasHeader) {
			options = options + " -h ";
		}
		if (hasMetadata) {
			options = options + " -m " + metadataUrl;
		}
		
		runBatFileInDefaultWorkingDirectory("export-data-model-vocabulary.bat", options);
		
		openFolderInWindowsExplorer(outputFolder);
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();