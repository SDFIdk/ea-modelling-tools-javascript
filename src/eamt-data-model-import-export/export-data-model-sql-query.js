!INC eamt-utilities._logging-utils
!INC eamt-utilities._command-line-utils
!INC eamt-utilities._messages
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._constants

/**
 * Exports a certain view of a data model, exposed via an SQL query, to a CSV file.
 *
 * The SQL query must not contain new lines or line breaks.
 * 
 * If one of the columns represent a Notes field, special handling is needed because
 * Notes can contain HTML tags and HTML character entities. Currently, all columns
 * are handled in the same way, there in other words no possibility to indicate per column
 * whether special handling is needed.
 *
 * An example is an export of the restrictions present in a model. The constraint
 * text is stored in a Notes field.
 * 
 * @summary Exports the result of an SQL query to a CSV file.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	verifyEaModellingToolsJavaInstallation();
	
	// Get the currently selected package in the tree to work on
	var package as EA.Package;
	package = Repository.GetTreeSelectedPackage();
	if (package != null && package.ParentID != 0) {
	
		var outputFolder = chooseFolderWithUI("Folder in which the CSV file should be saved");
		if (outputFolder.length == 0) {
			LOGError("No folder path given");
			return;
		}
		
		var sql = Session.Input("SQL query");
		if (sql.length == 0) {
			LOGError("No SQL query given");
			return;
		}
		
		var hasNotes = Session.Prompt("Does any of the columns represent a Notes field?", promptYESNO);
		var parseHtml;
		if (hasNotes == resultYes) {
			parseHtml = true;
		} else if (hasNotes == resultNo) {
			parseHtml = false;
		} else {
			LOGInfo("Script Cancelled");
			return;
		}
		
		var options = '-o "' + outputFolder + '" -pkg ' + package.PackageGUID + ' -sql "' + sql + '"';
		if (parseHtml) {
			options += ' -parsehtml';
		}
		
		runBatFileInDefaultWorkingDirectory("export-sqlquery-result-to-csv.bat", options);
		
		openFolderInWindowsExplorer(outputFolder);
	} else {
		throw new Error(MESSAGE_PACKAGE_REQUIRED);
	}
}

main();