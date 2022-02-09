!INC eamt-utilities._logging-utils
!INC eamt-utilities._shell-application-utils
!INC eamt-utilities._command-line-utils

var LOGLEVEL = LOGLEVEL_INFO;

/**
 * Exports the scripts in one or more scripts groups as
 *
 * 1. a EA reference data file for import in another EA instance 
 * 2. seperate script files
 * 3. a separate README.md file, containing the documentation extracted from the scripts
 *
 * An asterisk (*) in a regex must be escaped with a backslash, see also Java class
 * `dk.gov.data.modellingtools.app.ExportScripts`.
 *
 * So use `xyz\*` instead of `xyz*` to export all script groups that have a name starting with xyz.
 *
 * The name/regex is used in a LIKE expression in the database of the .eapx file.
 * See [The LIKE operator in Microsoft Jet SQL](https://docs.microsoft.com/en-us/previous-versions/office/developer/office2000/aa140015(v=office.10)#the-like-operator)
 * and below for the syntax.
 *
 *  - asterisk (`*`): matches any number of characters and can be used anywhere in the pattern string.
 *  - question mark (`?`) matches any single character and can be used anywhere in the pattern string.
 *  - number sign (`#`): matches any single digit and can be used anywhere in the pattern string.
 *  - square brackets (`[]`): matches any single character within the list that is enclosed within brackets, and can be used anywhere in the pattern string.
 *  - exclamation mark (`!`): matches any single character not in the list that is enclosed within the square brackets.
 *  - hyphen (`-`): matches any one of a range of characters that is enclosed within the square brackets.
 */
function main() {
	Repository.EnsureOutputVisible("Script");
	
	// a backslash must be escaped in Javascript, therefore two backslashes
	var scriptGroupNameOrRegex = Session.Input("Script group name or regex for a collection of scripts groups");
	if (scriptGroupNameOrRegex.length == 0) {
		LOGError("No script group given");
		return;
	}
	
	var scriptFolderPath = chooseFolderWithUI("Folder in which the script files should be saved");
	if (scriptFolderPath.length == 0) {
		LOGError("No folder path given");
		return;
	}
	
	runBatFileInDefaultWorkingDirectory("export-scripts.bat", '-sg "' + scriptGroupNameOrRegex + '" -o ' + scriptFolderPath + " -p 5");
	
	openFolderInWindowsExplorer(scriptFolderPath);
}

main();