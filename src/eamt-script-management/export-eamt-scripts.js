!INC eamt-utilities._logging-utils
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._command-line-utils

var LOGLEVEL = LOGLEVEL_INFO;

/**
 * Exports the scripts in the EAMT scripts groups as
 *
 * 1. a EA reference data file for import in another EA instance 
 * 2. seperate script files
 * 3. a separate README.md file, containing the documentation extracted from the scripts
 * 
 * The scripts should be saved in folder `.../ea-modelling-tools-javascript/src`.
 *
 * @summary Exports the EAMT scripts
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	verifyEaModellingToolsJavaInstallation();
	
	/*
	 * A backslash must be escaped in Javascript, therefore two backslashes:
	 * - one because the asterisk must be escaped with a backslash when calling a Java program from the command line
	 * - one because the backslash to escape the asterisk must be escaped itself when the regex is constructed in a script
	 */
	var scriptGroupNameOrRegex = "eamt-%";
	
	var scriptFolderPath = chooseFolderWithUI("Folder in which the script files should be saved (ea-modelling-tools-javascript/src)");
	if (scriptFolderPath.length == 0) {
		LOGError("No folder path given");
		return;
	}
	
	runBatFileInDefaultWorkingDirectory("export-scripts.bat", '-sg "' + scriptGroupNameOrRegex + '" -o ' + scriptFolderPath + " -doc -p 5");
	
	openFolderInWindowsExplorer(scriptFolderPath);
}

main();